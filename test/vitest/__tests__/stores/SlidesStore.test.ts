import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { createPinia, setActivePinia } from 'pinia';
import { nextTick } from 'vue';
import { useSlidesStore } from '@/stores/slides-store';
import {
  emptySlidesState,
  type SlidesAPI,
  type SlidesState,
} from '@/../common/SlidesAPI';

function createSlidesApi() {
  const listeners: ((state: SlidesState) => void)[] = [];

  const api = {
    open: vi.fn(async () => ({ ok: true })),
    reopen: vi.fn(async () => ({ ok: true })),
    close: vi.fn(),
    next: vi.fn(),
    previous: vi.fn(),
    setBlackout: vi.fn(),
    toggleBlackout: vi.fn(),
    setFullscreen: vi.fn(),
    toggleFullscreen: vi.fn(),
    getState: vi.fn(async () => emptySlidesState()),
    onStateChange: vi.fn((callback: (state: SlidesState) => void) => {
      listeners.push(callback);
    }),
  } satisfies SlidesAPI;

  return {
    api,
    emit(state: SlidesState) {
      listeners.forEach((listener) => {
        listener(state);
      });
    },
  };
}

function dispatchRemoteAction(action: string, payload?: unknown) {
  window.dispatchEvent(
    new CustomEvent('remote-action', { detail: { action, payload } }),
  );
}

describe('SlidesStore', () => {
  let slides: ReturnType<typeof createSlidesApi>;
  // Each store instance adds a window listener that it never removes, so they
  // are tracked here and torn down between tests to keep them isolated.
  const listeners: [string, EventListenerOrEventListenerObject][] = [];

  beforeEach(() => {
    setActivePinia(createPinia());
    vi.clearAllMocks();

    const addEventListener = window.addEventListener.bind(window);
    vi.spyOn(window, 'addEventListener').mockImplementation(
      (type, listener, options) => {
        listeners.push([type, listener]);
        addEventListener(type, listener, options);
      },
    );

    slides = createSlidesApi();
    window.slidesAPI = slides.api;
    window.remoteAPI = {
      updateSlides: vi.fn(),
    } as unknown as typeof window.remoteAPI;
  });

  afterEach(() => {
    listeners.splice(0).forEach(([type, listener]) => {
      window.removeEventListener(type, listener);
    });

    vi.restoreAllMocks();
    // @ts-expect-error -- cleaning up the stubbed bridges between tests
    delete window.slidesAPI;
    // @ts-expect-error -- cleaning up the stubbed bridges between tests
    delete window.remoteAPI;
  });

  it('starts inactive', () => {
    const store = useSlidesStore();

    expect(store.active).toBe(false);
    expect(store.blackout).toBe(false);
    expect(store.hasPresentation).toBe(false);
  });

  it('mirrors state pushed from the main process', async () => {
    const store = useSlidesStore();
    store.initialize();

    expect(slides.api.getState).toHaveBeenCalled();

    slides.emit({
      active: true,
      blackout: true,
      fullscreen: false,
      presentationId: 'deck-1',
      sourceUrl: 'https://docs.google.com/presentation/d/deck-1/edit',
    });
    await nextTick();

    expect(store.active).toBe(true);
    expect(store.blackout).toBe(true);
    expect(store.hasPresentation).toBe(true);
  });

  it('forwards state changes to the remote control', async () => {
    const store = useSlidesStore();
    store.initialize();

    const next: SlidesState = {
      ...emptySlidesState(),
      active: true,
      presentationId: 'deck-1',
    };

    slides.emit(next);
    await nextTick();

    expect(window.remoteAPI.updateSlides).toHaveBeenCalledWith(next);
  });

  it.each([
    ['slides:next', 'next'],
    ['slides:previous', 'previous'],
    ['slides:blackout', 'toggleBlackout'],
    ['slides:fullscreen', 'toggleFullscreen'],
  ] as const)('handles the %s remote action', (action, method) => {
    const store = useSlidesStore();
    store.initialize();

    dispatchRemoteAction(action);

    expect(slides.api[method]).toHaveBeenCalledOnce();
  });

  it('ignores unrelated remote actions', () => {
    const store = useSlidesStore();
    store.initialize();

    dispatchRemoteAction('buzzer:start');

    expect(slides.api.next).not.toHaveBeenCalled();
    expect(slides.api.toggleBlackout).not.toHaveBeenCalled();
  });

  it('closes the presentation when toggled while active', async () => {
    const store = useSlidesStore();
    store.initialize();

    slides.emit({ ...emptySlidesState(), active: true });
    await nextTick();

    await store.toggle();

    expect(slides.api.close).toHaveBeenCalledOnce();
    expect(slides.api.reopen).not.toHaveBeenCalled();
  });

  it('re-opens the last presentation when toggled while inactive', async () => {
    const store = useSlidesStore();
    store.initialize();

    await store.toggle();

    expect(slides.api.reopen).toHaveBeenCalledOnce();
    expect(slides.api.close).not.toHaveBeenCalled();
  });

  it('passes the pasted URL through to the main process', async () => {
    const store = useSlidesStore();
    store.initialize();

    const url = 'https://docs.google.com/presentation/d/deck-1/edit';
    await store.open(url);

    expect(slides.api.open).toHaveBeenCalledWith(url);
  });

  it('only registers its remote listener once', () => {
    const store = useSlidesStore();
    store.initialize();
    store.initialize();

    dispatchRemoteAction('slides:next');

    expect(slides.api.next).toHaveBeenCalledOnce();
  });

  it('does nothing when the bridge is missing', () => {
    // @ts-expect-error -- simulating the browser build, which has no slidesAPI
    delete window.slidesAPI;

    const store = useSlidesStore();

    expect(() => {
      store.initialize();
    }).not.toThrow();

    expect(() => {
      store.next();
    }).not.toThrow();
  });
});
