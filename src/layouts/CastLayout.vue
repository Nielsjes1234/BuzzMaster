<template>
  <q-layout
    @focus="onFocus"
    @blur="onBlur"
    view="hHh Lpr fFf"
    :class="[layoutClass, slidesActive ? 'cast-over-slides' : undefined]"
  >
    <q-header
      v-if="showAppBar"
      :class="darkMode ? 'bg-grey-10' : 'bg-grey-2'"
      elevated
      @mouseenter="onMouseEnter"
      @mouseleave="onMouseLeave"
    >
      <q-bar class="q-electron-drag">
        {{ t('cast.title') }}

        <q-space />

        <!-- Dark mode -->
        <q-btn
          :aria-label="t('cast.toolbar.darkMode')"
          dense
          flat
          round
          :icon="darkMode ? 'light_mode' : 'dark_mode'"
          @click="toggleDarkMode"
        >
          <q-tooltip :delay="1000">
            {{ t('cast.toolbar.darkMode') }}
          </q-tooltip>
        </q-btn>

        <q-btn
          :aria-label="t('cast.toolbar.transparent')"
          dense
          flat
          round
          icon="visibility_off"
          @click.stop="setTransparent"
        >
          <q-tooltip :delay="1000">
            {{ t('cast.toolbar.transparent') }}
          </q-tooltip>
        </q-btn>

        <q-btn
          :aria-label="t('cast.toolbar.close')"
          dense
          flat
          round
          icon="close"
          @click="closeWindow"
        >
          <q-tooltip :delay="1000">
            {{ t('cast.toolbar.close') }}
          </q-tooltip>
        </q-btn>
      </q-bar>
    </q-header>

    <q-page-container>
      <router-view v-slot="{ Component }">
        <transition
          name="bm-cast"
          mode="out-in"
        >
          <component :is="Component" />
        </transition>
      </router-view>
    </q-page-container>
  </q-layout>
</template>

<script lang="ts" setup>
import { useCastStore } from '@/stores/cast-store';
import { useQuasar } from 'quasar';
import { computed, ref } from 'vue';
import { useI18n } from 'vue-i18n';
import type { SlidesState } from '@/../common/SlidesAPI';

const castStore = useCastStore();
const quasar = useQuasar();
const { t } = useI18n();

quasar.dark.set(true);
const toggleDarkMode = quasar.dark.toggle;

window.castAPI.onGameStateUpdate(castStore.updateGameState);
window.castAPI.onGameSettingsUpdate(castStore.updateGameSettings);
window.castAPI.onLocaleUpdate(castStore.updateLocale);
window.castAPI.onControllerUpdate(castStore.updateControllers);
window.castAPI.onLeaderboardUpdate(castStore.updateLeaderboard);

const showAppBar = ref<boolean>(true);
const transparent = ref<boolean>(false);
const mouseOverMenu = ref<boolean>(false);

/* -------------------------------------------------------------------------
 * Google Slides presentation
 * ---------------------------------------------------------------------- */

const slidesActive = ref<boolean>(false);

if (window.slidesAPI !== undefined) {
  window.slidesAPI.onStateChange(applySlidesState);
  window.slidesAPI
    .getState()
    .then(applySlidesState)
    .catch((reason: unknown) => {
      console.error(reason);
    });
}

function applySlidesState(state: SlidesState) {
  slidesActive.value = state.active;
}

/* ---------------------------------------------------------------------- */

const layoutClass = computed<string | undefined>(() => {
  // While a presentation is running the window has to stay see-through, so the
  // slides underneath remain visible behind the leaderboard.
  if (transparent.value || slidesActive.value) {
    return undefined;
  }

  return 'layout';
});

const darkMode = computed<boolean>(() => {
  return quasar.dark.isActive;
});

function onFocus() {
  showAppBar.value = true;

  if (!slidesActive.value) {
    transparent.value = false;
  }
}

function onBlur() {
  if (mouseOverMenu.value) {
    return;
  }
  showAppBar.value = false;
}

function onMouseEnter() {
  mouseOverMenu.value = true;
}

function onMouseLeave() {
  mouseOverMenu.value = false;
}

function closeWindow() {
  window.windowAPI.close();
}

function setTransparent() {
  transparent.value = true;
  showAppBar.value = false;
}
</script>

<style>
* {
  font-family: var(--bm-font-ui);
}

body.body--dark {
  background: transparent !important;
}

body.body--light .layout {
  background: var(--bm-ground);
}

body.body--dark .layout {
  background: var(--bm-ground) !important;
}

.layout:focus {
  box-shadow: inset 0 0 0 1px var(--bm-line-strong);
}

/* ---------------------------------------------------------------------------
   Reading from across the room
   ---------------------------------------------------------------------------
   Everything here is sized for a projector, not a desk. Names and numbers use
   the display face at weights that survive being thrown against a wall.
   -------------------------------------------------------------------------- */

.q-layout .bm-cast-display {
  font-family: var(--bm-font-display);
  font-weight: 800;
  letter-spacing: -0.03em;
  line-height: 0.98;
}

.q-layout .bm-cast-label {
  font-size: clamp(11px, 1.4vmin, 18px);
  font-weight: 700;
  letter-spacing: 0.22em;
  text-transform: uppercase;
  color: var(--bm-faint);
}

/* ---------------------------------------------------------------------------
   Over a presentation
   ---------------------------------------------------------------------------
   With a slide behind it the background is no longer ours to choose: it can be
   a white title card one moment and a dark photo the next. An earlier attempt
   gave every glyph a drop shadow, which smudges badly against a light slide.
   Instead, blocks of text sit on their own panel and become a known quantity
   again, while the rest of the slide stays untouched.
   -------------------------------------------------------------------------- */

.cast-over-slides .bm-cast-panel {
  background: rgb(10 12 16 / 0.72);
  border: 1px solid rgb(255 255 255 / 0.1);
  border-radius: var(--bm-radius-lg);
  padding: clamp(12px, 2.2vmin, 32px);
  color: #fff;
}

.cast-over-slides .bm-cast-panel .bm-cast-label {
  color: rgb(255 255 255 / 0.66);
}

.cast-over-slides .bm-cast-panel :is(.bm-lb-row, .q-item) {
  border-color: rgb(255 255 255 / 0.14);
}

/* An idle branding screen has a place on a projector showing nothing. It has
   none on top of somebody's slide, where it is simply in the way. */
.cast-over-slides .bm-cast-identity {
  display: none;
}

/* ---------------------------------------------------------------------------
   Between views
   ---------------------------------------------------------------------------
   Slower than a control would be, because the audience is watching the screen
   change rather than causing it, but still short enough not to delay the game.
   -------------------------------------------------------------------------- */

.bm-cast-enter-active {
  transition:
    opacity 260ms var(--bm-ease),
    transform 260ms var(--bm-ease);
}

.bm-cast-leave-active {
  transition:
    opacity 160ms var(--bm-ease),
    transform 160ms var(--bm-ease);
}

.bm-cast-enter-from {
  opacity: 0;
  transform: translateY(16px);
}

.bm-cast-leave-to {
  opacity: 0;
  transform: translateY(-10px);
}

@media (prefers-reduced-motion: reduce) {
  .bm-cast-enter-active,
  .bm-cast-leave-active {
    transition: none;
  }

  .bm-cast-enter-from,
  .bm-cast-leave-to {
    opacity: 1;
    transform: none;
  }
}
</style>
