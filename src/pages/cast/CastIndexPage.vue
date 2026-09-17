<template>
  <q-page
    class="row justify-center"
    padding
  >
    <div class="standby column col-12 justify-center items-center">
      <!--
        Between rounds the cast window used to show nothing at all, because the
        standings are a game state of their own and the host is rarely standing
        on them. They arrive on their own channel now, so the screen can hold
        the one thing an audience wants during a lull: where everybody stands.
      -->
      <div
        v-if="hasScores"
        class="standby__board bm-cast-panel"
      >
        <div class="bm-cast-label standby__label">
          {{ t('cast.standby.title') }}
        </div>

        <cast-leaderboard-entry
          v-for="entry in entries"
          :key="entry.id"
          :entry="entry"
        />

        <div
          v-if="hidden > 0"
          class="standby__more"
        >
          {{ t('cast.standby.more', { n: hidden }) }}
        </div>
      </div>

      <!--
        Nothing scored yet. A logo is the honest thing to put on a projector
        that is on but idle — and it is hidden outright while a presentation is
        running, where an idle branding screen would only be something covering
        the slide.
      -->
      <div
        v-else
        class="standby__identity bm-cast-identity column items-center"
      >
        <img
          class="standby__logo"
          src="/logo-without-circle.svg"
          alt=""
        />

        <div class="standby__name bm-cast-display">
          {{ t('app_name') }}
        </div>

        <div class="bm-cast-label">
          {{ t('cast.standby.waiting') }}
        </div>
      </div>
    </div>
  </q-page>
</template>

<script lang="ts" setup>
import { computed, onMounted } from 'vue';
import { useI18n } from 'vue-i18n';
import { useCastStore } from '@/stores/cast-store';
import CastLeaderboardEntry from '@/components/cast/leaderboard/CastLeaderboardEntry.vue';
import type { LeaderboardEntry } from '@/../common/gameState/LeaderboardState';

const { t } = useI18n();
const castStore = useCastStore();

/**
 * Deliberately not paged the way the leaderboard cast page is. That page is
 * the main event and has the screen to itself; this one is a holding pattern,
 * and a board that silently rotates while nothing is happening invites the
 * room to watch it rather than the host.
 */
const MAX_ROWS = 8;

const leaderboard = computed<LeaderboardEntry[]>(() => castStore.leaderboard);

/* An all-zero board says nothing worth putting on a wall. */
const hasScores = computed<boolean>(() =>
  leaderboard.value.some((entry) => entry.value !== 0),
);

const entries = computed<LeaderboardEntry[]>(() =>
  leaderboard.value.slice(0, MAX_ROWS),
);

const hidden = computed<number>(() =>
  Math.max(0, leaderboard.value.length - MAX_ROWS),
);

onMounted(() => {
  window.castAPI.ready();
});
</script>

<style scoped>
.standby {
  padding: clamp(16px, 4vmin, 64px);
  width: 100%;
}

.standby__board {
  width: min(78vw, 1100px);
}

.standby__label {
  margin-bottom: clamp(6px, 1.2vmin, 18px);
}

.standby__more {
  padding-top: clamp(6px, 1.2vmin, 18px);
  font-size: clamp(13px, 1.8vmin, 26px);
  font-weight: 600;
  color: var(--bm-faint);
  font-variant-numeric: tabular-nums;
}

.standby__identity {
  gap: clamp(8px, 1.6vmin, 24px);
  animation: bm-rise-in 420ms var(--bm-ease) both;
}

.standby__logo {
  width: clamp(64px, 14vmin, 200px);
  height: auto;
  opacity: 0.9;
}

.standby__name {
  font-size: clamp(28px, 6vmin, 110px);
}

@media (prefers-reduced-motion: reduce) {
  .standby__identity {
    animation: none;
  }
}
</style>
