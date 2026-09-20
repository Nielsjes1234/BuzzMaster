<template>
  <q-page
    v-if="state"
    class="row justify-center"
    padding
  >
    <div class="rate column col-12 justify-center items-center">
      <div class="bm-cast-label rate__label">
        {{ headline }}
      </div>

      <!--
        One number, as big as the screen allows. An audience vote is read from
        the back of a room, and a percentage is the only thing back there that
        carries: names and bars are detail for the host's screen.
      -->
      <div class="rate__value bm-cast-display">
        {{ percentage }}<span class="rate__unit">%</span>
      </div>

      <div
        class="rate__track"
        role="progressbar"
        :aria-valuenow="percentage"
        :aria-valuemin="0"
        :aria-valuemax="100"
      >
        <div
          class="rate__fill"
          :style="{ transform: `scaleX(${share})` }"
        />
      </div>

      <div
        v-if="isLive"
        class="rate__count bm-cast-display"
      >
        {{ viewingCount }} / {{ totalCount }}
      </div>
    </div>
  </q-page>
</template>

<script lang="ts" setup>
import { computed } from 'vue';
import { useI18n } from 'vue-i18n';
import { useCastStore } from '@/stores/cast-store';
import type { ViewingRateState } from '@/../common/gameState/ViewingRateState';
import {
  currentlyViewingShare,
  isViewing,
  totalViewingRate,
} from '@/components/gameModes/viewingRate/viewingRate';

const { t } = useI18n();
const castStore = useCastStore();

const state = computed<ViewingRateState>(
  () => castStore.gameState as ViewingRateState,
);

/**
 * Whether a controller counts as watching depends on what everyone was doing
 * when the round opened, which is a setting rather than part of the state. The
 * cast window receives the whole settings object, so it can answer the same
 * question the host's page answers, with the same code.
 */
const startViewing = computed<boolean>(
  () => castStore.gameSettings.viewingRate?.startViewing ?? false,
);

const changeTimes = computed<Record<string, number[]>>(() =>
  state.value.name === 'preparing' ? {} : state.value.changeTimes,
);

/**
 * While the round runs, the live count is the interesting number: it moves,
 * and the room can see itself moving it. Once it is over, the thing worth
 * putting on the wall is how much of the round people actually watched, which
 * is a different measurement entirely.
 */
const isLive = computed<boolean>(
  () => state.value.name === 'running' || state.value.name === 'paused',
);

const share = computed<number>(() => {
  if (state.value.name === 'preparing') {
    return 0;
  }

  if (isLive.value) {
    return currentlyViewingShare(changeTimes.value, startViewing.value);
  }

  return totalViewingRate(
    changeTimes.value,
    state.value.time,
    startViewing.value,
  );
});

const percentage = computed<number>(() => Math.round(share.value * 100));

const headline = computed<string>(() => {
  if (state.value.name === 'preparing') {
    return t('cast.viewingRate.waiting');
  }

  return isLive.value
    ? t('cast.viewingRate.currentlyViewing')
    : t('cast.viewingRate.totalWatchRate');
});

const totalCount = computed<number>(
  () => Object.keys(changeTimes.value).length,
);

const viewingCount = computed<number>(
  () =>
    Object.values(changeTimes.value).filter((changes) =>
      isViewing(changes, startViewing.value),
    ).length,
);
</script>

<style scoped>
.rate {
  gap: clamp(10px, 2vmin, 34px);
  width: 100%;
  padding: clamp(16px, 4vmin, 64px);
}

.rate__label {
  margin-bottom: clamp(-6px, -0.6vmin, 0px);
}

.rate__value {
  font-size: clamp(56px, 22vmin, 340px);
  font-weight: 800;
  line-height: 0.86;
  font-variant-numeric: tabular-nums;
}

/* The sign is not the number: at this size a full-height % competes with the
   digits for the eye instead of labelling them. */
.rate__unit {
  font-size: 0.42em;
  margin-left: 0.06em;
  color: var(--bm-dim);
}

.rate__track {
  width: min(78vw, 1100px);
  height: clamp(8px, 1.4vmin, 22px);
  border-radius: 999px;
  background: var(--bm-line);
  overflow: hidden;
}

/*
 * Scaled rather than resized, so a bar that follows a room pressing buttons
 * does not force a layout pass every time somebody changes their mind.
 */
.rate__fill {
  height: 100%;
  border-radius: inherit;
  transform-origin: left center;
  background: var(--q-primary);
  transition: transform 220ms var(--bm-ease);
}

.rate__count {
  font-size: clamp(16px, 2.6vmin, 42px);
  font-weight: 700;
  font-variant-numeric: tabular-nums;
  color: var(--bm-dim);
}

@media (prefers-reduced-motion: reduce) {
  .rate__fill {
    transition: none;
  }
}
</style>
