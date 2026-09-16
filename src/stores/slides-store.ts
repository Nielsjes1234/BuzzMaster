import { acceptHMRUpdate, defineStore } from 'pinia';
import { computed, ref, watch } from 'vue';
import {
  emptySlidesState,
  type SlidesOpenResult,
  type SlidesState,
} from '@/../common/SlidesAPI';
import type { RemoteAction } from '@/../common/RemoteAPI';

/**
 * Host-side view of the Google Slides presentation shown on the cast screen.
 *
 * The main process owns the presentation itself; this store mirrors its state,
 * forwards it to the remote control and turns remote actions into calls.
 */
export const useSlidesStore = defineStore('slides', () => {
  const state = ref<SlidesState>(emptySlidesState());

  const active = computed<boolean>(() => state.value.active);
  const blackout = computed<boolean>(() => state.value.blackout);
  const fullscreen = computed<boolean>(() => state.value.fullscreen);
  const hasPresentation = computed<boolean>(
    () => state.value.presentationId !== null,
  );

  function setBlackout(value: boolean) {
    window.slidesAPI?.setBlackout(value);
  }

  function toggleBlackout() {
    window.slidesAPI?.toggleBlackout();
  }

  function setFullscreen(value: boolean) {
    window.slidesAPI?.setFullscreen(value);
  }

  function toggleFullscreen() {
    window.slidesAPI?.toggleFullscreen();
  }

  function next() {
    window.slidesAPI?.next();
  }

  function previous() {
    window.slidesAPI?.previous();
  }

  function close() {
    window.slidesAPI?.close();
  }

  async function open(url: string): Promise<SlidesOpenResult> {
    if (typeof window === 'undefined' || window.slidesAPI === undefined) {
      return { ok: false, error: 'invalidUrl' };
    }

    return window.slidesAPI.open(url);
  }

  async function toggle(): Promise<SlidesOpenResult> {
    if (typeof window === 'undefined' || window.slidesAPI === undefined) {
      return { ok: false, error: 'invalidUrl' };
    }

    if (state.value.active) {
      close();
      return { ok: true };
    }

    return window.slidesAPI.reopen();
  }

  const remoteActionListener = ((event: CustomEvent<RemoteAction>) => {
    switch (event.detail.action) {
      case 'slides:next':
        next();
        break;
      case 'slides:previous':
        previous();
        break;
      case 'slides:toggle':
        void toggle();
        break;
      case 'slides:blackout':
        toggleBlackout();
        break;
      case 'slides:fullscreen':
        toggleFullscreen();
        break;
    }
  }) as EventListener;

  // Keep the remote control in sync with what the audience is seeing.
  watch(
    state,
    (value) => {
      if (typeof window === 'undefined' || window.remoteAPI === undefined) {
        return;
      }

      window.remoteAPI.updateSlides(
        JSON.parse(JSON.stringify(value)) as SlidesState,
      );
    },
    { deep: true },
  );

  function initialize() {
    if (typeof window === 'undefined' || window.slidesAPI === undefined) {
      return;
    }

    window.slidesAPI.onStateChange((value) => {
      state.value = value;
    });

    window.slidesAPI
      .getState()
      .then((value) => {
        state.value = value;
      })
      .catch((reason: unknown) => {
        console.error(reason);
      });

    window.addEventListener('remote-action', remoteActionListener);
  }

  return {
    state,
    active,
    blackout,
    fullscreen,
    hasPresentation,

    initialize,
    open,
    close,
    toggle,
    next,
    previous,
    setBlackout,
    toggleBlackout,
    setFullscreen,
    toggleFullscreen,
  };
});

if (import.meta.hot) {
  import.meta.hot.accept(acceptHMRUpdate(useSlidesStore, import.meta.hot));
}
