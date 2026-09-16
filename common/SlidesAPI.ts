/**
 * Google Slides presentation on the cast screen.
 *
 * The presentation lives in its own window, which can be moved and resized
 * independently of the cast window. The cast window is always on top and paints
 * a transparent background while a presentation runs, so wherever the two
 * overlap the leaderboard and game views float over the slides.
 *
 * Slides are advanced by injecting arrow key events into the presentation
 * window, so animations and transitions behave exactly as they do in Google.
 */

export interface SlidesState {
  /** True while the presentation window is open. */
  active: boolean;
  /** True while the presentation is covered by a black curtain. */
  blackout: boolean;
  /** True while the presentation window fills its screen. */
  fullscreen: boolean;
  /** Google presentation id, kept even while the presentation is closed. */
  presentationId: string | null;
  /** The URL the user pasted, so it can be shown back to them. */
  sourceUrl: string | null;
}

export interface SlidesOpenResult {
  ok: boolean;
  /** Translation key under `slides.error`, set when `ok` is false. */
  error?: 'invalidUrl' | 'noCastWindow' | 'loadFailed';
}

export const emptySlidesState = (): SlidesState => ({
  active: false,
  blackout: false,
  fullscreen: false,
  presentationId: null,
  sourceUrl: null,
});

export type SlidesAPI = {
  /** Open a presentation behind the cast window. Accepts any Google Slides link. */
  open: (url: string) => Promise<SlidesOpenResult>;
  /** Close the presentation. The pasted URL is remembered for a later re-open. */
  close: () => void;
  /** Re-open the presentation that was closed last. */
  reopen: () => Promise<SlidesOpenResult>;

  next: () => void;
  previous: () => void;

  /** Hide the slides behind a black screen without losing the current slide. */
  setBlackout: (value: boolean) => void;
  toggleBlackout: () => void;

  /** Fill the screen the presentation window is on, hiding its frame. */
  setFullscreen: (value: boolean) => void;
  toggleFullscreen: () => void;

  getState: () => Promise<SlidesState>;
  onStateChange: (callback: (state: SlidesState) => void) => void;
};
