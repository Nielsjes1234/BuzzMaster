<template>
  <q-page
    class="row justify-center"
    padding
  >
    <div
      v-if="leaderboard.length === 0"
      class="text-center column self-center text-h5"
    >
      {{ t('leaderboard.noEntries') }}
    </div>

    <div
      v-else
      class="col-xs-12 col-sm-10 col-md-7 col-lg-4 col-xl-2 column justify-between no-wrap"
    >
      <q-list>
        <q-item
          v-for="entry in leaderboard"
          :key="entry.id"
          clickable
          v-ripple
          class="lb-row"
          :class="{ 'lb-row--lead': entry.position === 1 }"
          @click="showUpdatePoints(entry)"
        >
          <q-item-section
            avatar
            class="lb-pos"
          >
            {{ entry.position }}
          </q-item-section>

          <q-item-section class="ellipsis lb-name">
            {{ entry.name }}
          </q-item-section>

          <q-item-section
            side
            class="lb-value"
          >
            {{ entry.value }}
          </q-item-section>
        </q-item>
      </q-list>

      <div
        class="col-grow column justify-around"
        style="max-height: 300px"
      >
        <div class="row justify-center q-gutter-sm">
          <!--
            Undo sits next to reset because they are the two ways out of a
            mistake, but it is the quiet one: it is reached for far more often
            and costs nothing, so it gets no colour and no alarm.
          -->
          <q-btn
            :label="t('leaderboard.action.undo')"
            icon="undo"
            flat
            no-caps
            :disable="!leaderboardStore.canUndo"
            class="lb-undo"
            @click="leaderboardStore.undo()"
          />

          <q-btn
            :label="t('leaderboard.action.reset')"
            flat
            no-caps
            color="negative"
            class="lb-reset"
            @click="showResetPoints()"
          />
        </div>
      </div>
    </div>
  </q-page>
</template>

<script lang="ts" setup>
import { useLeaderboardStore } from '@/stores/leaderboard-store';
import { storeToRefs } from 'pinia';
import { useLeaderboardDialogs } from '@/composables/leaderboard';
import { useI18n } from 'vue-i18n';
import { watch } from 'vue';
import { useGameState } from '@/composables/gameState';

const { t } = useI18n();
const leaderboardStore = useLeaderboardStore();
const { leaderboard } = storeToRefs(leaderboardStore);
const { showUpdatePoints, showResetPoints } = useLeaderboardDialogs();

const { transition } = useGameState({
  game: 'leaderboard',
  name: 'default',
  entries: leaderboard.value,
});

watch(
  leaderboard,
  transition('default', (state, value) => {
    return {
      game: 'leaderboard',
      name: 'default',
      entries: value,
    };
  }),
);
</script>

<style scoped>
/*
 * Echoes the cast leaderboard so the host recognises the same object in both
 * places, at desk scale rather than room scale.
 */
.lb-row {
  border-radius: var(--bm-radius-sm);
  min-height: 52px;
}

.lb-pos {
  min-width: 34px;
  font-family: var(--bm-font-display);
  font-weight: 700;
  font-size: var(--bm-text-sm);
  color: var(--bm-faint);
  font-variant-numeric: tabular-nums;
}

.lb-name {
  font-size: var(--bm-text-md);
  font-weight: 500;
}

.lb-value {
  font-family: var(--bm-font-display);
  font-weight: 800;
  font-size: var(--bm-text-lg);
  font-variant-numeric: tabular-nums;
}

.lb-row--lead .lb-pos {
  color: var(--q-primary);
}

.lb-row--lead .lb-name {
  font-weight: 700;
}

.lb-reset,
.lb-undo {
  font-weight: 600;
}
</style>
