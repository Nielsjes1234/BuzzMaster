import { BrowserWindow, ipcMain, screen } from 'electron';
import log from 'electron-log';
import {
  emptySlidesState,
  type SlidesOpenResult,
  type SlidesState,
} from '@/../common/SlidesAPI';

type WindowAccessor = () => BrowserWindow | undefined;

interface PresentationTarget {
  id: string;
  /** True for "publish to web" links, which use a different URL shape. */
  published: boolean;
}

/**
 * Painted over the Google Slides page to blank it out. The presentation window
 * is separate from the cast window, so the curtain has to live inside the
 * presentation itself rather than in the overlay.
 */
const BLACKOUT_CSS = `
  html::after {
    content: '';
    position: fixed;
    top: 0;
    right: 0;
    bottom: 0;
    left: 0;
    background: #000;
    z-index: 2147483647;
    pointer-events: none;
  }
`;

/**
 * Accepts anything the user is likely to paste:
 *   https://docs.google.com/presentation/d/<id>/edit#slide=id.p
 *   https://docs.google.com/presentation/d/<id>/present
 *   https://docs.google.com/presentation/d/e/<id>/pub?start=false
 *   <id>
 */
export function parsePresentation(input: string): PresentationTarget | null {
  const value = input.trim();

  if (value.length === 0) {
    return null;
  }

  const published = /\/presentation\/d\/e\/([a-zA-Z0-9_-]+)/.exec(value);
  if (published?.[1]) {
    return { id: published[1], published: true };
  }

  const standard = /\/presentation\/d\/([a-zA-Z0-9_-]+)/.exec(value);
  if (standard?.[1]) {
    return { id: standard[1], published: false };
  }

  // A bare id pasted without the surrounding URL.
  if (/^[a-zA-Z0-9_-]{20,}$/.test(value)) {
    return { id: value, published: false };
  }

  return null;
}

export function presentationUrl(target: PresentationTarget): string {
  const params = 'start=false&loop=false&rm=minimal';

  return target.published
    ? `https://docs.google.com/presentation/d/e/${target.id}/pub?${params}`
    : `https://docs.google.com/presentation/d/${target.id}/present?${params}`;
}

export default (getMainWindow: WindowAccessor) => {
  let castWindow: BrowserWindow | undefined;
  let presentationWindow: BrowserWindow | undefined;
  let target: PresentationTarget | null = null;
  let state: SlidesState = emptySlidesState();
  let blackoutKey: string | undefined;
  // Set when a presentation was requested while no cast window was open, so it
  // can be shown as soon as one appears.
  let pending = false;

  ipcMain.handle('slides:open', (_event, url: string) => open(url));
  ipcMain.handle('slides:reopen', () => reopen());
  ipcMain.handle('slides:getState', () => state);
  ipcMain.on('slides:close', () => {
    close();
  });
  ipcMain.on('slides:next', () => {
    sendKey('Right');
  });
  ipcMain.on('slides:previous', () => {
    sendKey('Left');
  });
  ipcMain.on('slides:setBlackout', (_event, value: boolean) => {
    setBlackout(value);
  });
  ipcMain.on('slides:toggleBlackout', () => {
    setBlackout(!state.blackout);
  });
  ipcMain.on('slides:setFullscreen', (_event, value: boolean) => {
    setFullscreen(value);
  });
  ipcMain.on('slides:toggleFullscreen', () => {
    setFullscreen(!state.fullscreen);
  });

  /**
   * Called by the cast API whenever the cast window opens or closes. The
   * presentation window lives and dies with it, but is positioned and sized
   * independently so both can be placed by hand.
   */
  function setCastWindow(window: BrowserWindow | undefined) {
    castWindow = window;

    if (window === undefined) {
      pending = state.active;
      closePresentationWindow();
      publish({ ...state, active: false, blackout: false, fullscreen: false });
      return;
    }

    if (target !== null && pending) {
      void openPresentationWindow(target);
    }
  }

  async function open(url: string): Promise<SlidesOpenResult> {
    const parsed = parsePresentation(url);

    if (parsed === null) {
      return { ok: false, error: 'invalidUrl' };
    }

    target = parsed;
    state = { ...state, presentationId: parsed.id, sourceUrl: url.trim() };

    return openPresentationWindow(parsed);
  }

  async function reopen(): Promise<SlidesOpenResult> {
    if (target === null) {
      return { ok: false, error: 'invalidUrl' };
    }

    return openPresentationWindow(target);
  }

  /** A 16:9 window centred on whichever screen the cast window is on. */
  function defaultBounds() {
    const reference = castWindow?.getBounds();
    const display =
      reference === undefined
        ? screen.getPrimaryDisplay()
        : screen.getDisplayMatching(reference);

    const area = display.workArea;
    const width = Math.min(1280, Math.round(area.width * 0.75));
    const height = Math.round((width * 9) / 16);

    return {
      width,
      height,
      x: area.x + Math.round((area.width - width) / 2),
      y: area.y + Math.round((area.height - height) / 2),
    };
  }

  async function openPresentationWindow(
    presentation: PresentationTarget,
  ): Promise<SlidesOpenResult> {
    if (castWindow === undefined || castWindow.isDestroyed()) {
      // Remember the choice so it appears as soon as the cast window opens.
      pending = true;
      publish({ ...state, active: false });
      return { ok: false, error: 'noCastWindow' };
    }

    closePresentationWindow();

    // `parent` may not be passed as undefined under exactOptionalPropertyTypes,
    // so it is only added to the options when there actually is a main window.
    const parent = getMainWindow();

    const window = new BrowserWindow({
      ...(parent === undefined ? {} : { parent }),
      ...defaultBounds(),
      // A normal frame, so the presentation can be dragged to another screen
      // and resized by hand. Going full screen hides it again.
      frame: true,
      resizable: true,
      show: false,
      title: 'BuzzMaster — Presentation',
      backgroundColor: '#000000',
      webPreferences: {
        // No preload and no node access: this renders a third-party page.
        contextIsolation: true,
        sandbox: true,
        backgroundThrottling: false,
      },
    });

    presentationWindow = window;
    blackoutKey = undefined;

    // The cast window floats over this one wherever the two overlap.
    window.setAlwaysOnTop(false);
    window.on('closed', () => {
      if (presentationWindow === window) {
        presentationWindow = undefined;
        blackoutKey = undefined;
      }
    });

    try {
      await window.loadURL(presentationUrl(presentation));
    } catch (reason: unknown) {
      log.error(`Failed to load presentation: ${String(reason)}`);
      closePresentationWindow();
      pending = false;
      publish({ ...state, active: false });
      return { ok: false, error: 'loadFailed' };
    }

    if (window.isDestroyed()) {
      return { ok: false, error: 'loadFailed' };
    }

    // Show without stealing focus from the host window, then raise the cast
    // window again so the overlay is never covered.
    window.showInactive();
    raiseCastWindow();

    pending = false;
    publish({ ...state, active: true, blackout: false, fullscreen: false });
    return { ok: true };
  }

  function close() {
    closePresentationWindow();
    pending = false;
    publish({ ...state, active: false, blackout: false, fullscreen: false });
  }

  function closePresentationWindow() {
    if (presentationWindow === undefined) {
      return;
    }

    const window = presentationWindow;
    presentationWindow = undefined;
    blackoutKey = undefined;

    try {
      if (!window.isDestroyed()) {
        window.destroy();
      }
    } catch (reason: unknown) {
      log.error(`Failed to close presentation window: ${String(reason)}`);
    }
  }

  function livePresentation(): BrowserWindow | undefined {
    if (presentationWindow === undefined || presentationWindow.isDestroyed()) {
      return undefined;
    }

    return presentationWindow;
  }

  function raiseCastWindow() {
    if (castWindow === undefined || castWindow.isDestroyed()) {
      return;
    }

    // setAlwaysOnTop already covers this on most systems, but re-asserting it
    // keeps the overlay above a presentation window that was just shown.
    castWindow.setAlwaysOnTop(true, 'pop-up-menu', 1);
    castWindow.moveTop();
  }

  function setFullscreen(value: boolean) {
    const window = livePresentation();

    if (window === undefined || state.fullscreen === value) {
      return;
    }

    window.setFullScreen(value);
    raiseCastWindow();
    publish({ ...state, fullscreen: value });
  }

  function setBlackout(value: boolean) {
    if (state.blackout === value) {
      return;
    }

    const window = livePresentation();

    if (window === undefined) {
      return;
    }

    const contents = window.webContents;

    if (value) {
      contents
        .insertCSS(BLACKOUT_CSS)
        .then((key) => {
          blackoutKey = key;
        })
        .catch((reason: unknown) => {
          log.error(`Failed to black out presentation: ${String(reason)}`);
        });
    } else if (blackoutKey !== undefined) {
      const key = blackoutKey;
      blackoutKey = undefined;
      contents.removeInsertedCSS(key).catch((reason: unknown) => {
        log.error(`Failed to restore presentation: ${String(reason)}`);
      });
    }

    publish({ ...state, blackout: value });
  }

  function sendKey(keyCode: 'Right' | 'Left') {
    const window = livePresentation();

    if (window === undefined) {
      return;
    }

    const contents = window.webContents;

    // Google Slides listens for key events on the focused document, so the
    // presentation has to hold focus before the key arrives. Raising the cast
    // window afterwards keeps the overlay visible.
    contents.focus();
    contents.sendInputEvent({ type: 'keyDown', keyCode });
    contents.sendInputEvent({ type: 'keyUp', keyCode });
    raiseCastWindow();
  }

  function publish(next: SlidesState) {
    state = next;

    for (const window of [getMainWindow(), castWindow]) {
      if (window === undefined || window.isDestroyed()) {
        continue;
      }

      window.webContents.send('slides:onStateChange', state);
    }
  }

  return { setCastWindow };
};
