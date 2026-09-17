<template>
  <q-btn
    :label="props.label"
    icon="grade"
    color="grey"
    class="self-center"
    rounded
    @click="updatePoints()"
  />
</template>

<script lang="ts" setup>
import StopwatchPointsDialog from '@/components/gameModes/stopwatch/StopwatchPointsDialog.vue';
import { useQuasar } from 'quasar';
import { useLeaderboardStore } from '@/stores/leaderboard-store';
import type { StopwatchEntry } from '@/components/gameModes/stopwatch/StopwatchEntry';
import { watch } from 'vue';

const quasar = useQuasar();
const leaderboardStore = useLeaderboardStore();

type PointRecord = Record<string, number | undefined>;

let grantedPoints: PointRecord = {};

const props = defineProps<{
  label: string | undefined;
  result: StopwatchEntry[];
}>();

const emit = defineEmits<{
  (e: 'update', points: PointRecord): void;
}>();

/*
 * The host undid this award. `grantedPoints` is the refund the next dialog
 * would hand back, and those points are already off the board, so it is
 * cleared — and the dialog reopens empty, which is the state the scores are
 * now in. Undoing anything else leaves the record valid and is ignored.
 */
watch(
  () => leaderboardStore.undoCount,
  () => {
    if (leaderboardStore.undoneOrigin !== 'stopwatch') {
      return;
    }

    grantedPoints = {};
    emit('update', {});
  },
);

const updatePoints = () => {
  quasar
    .dialog({
      component: StopwatchPointsDialog,
      componentProps: {
        result: props.result,
        points: grantedPoints,
      },
    })
    .onOk((updatedPoints: PointRecord) => {
      // Refund previous points
      for (const controllerId in grantedPoints) {
        const points = grantedPoints[controllerId];
        if (points === undefined) {
          continue;
        }

        leaderboardStore.addPoints(controllerId, points * -1, 'stopwatch');
      }

      // Update points
      for (const controllerId in updatedPoints) {
        const points = updatedPoints[controllerId];
        if (points === undefined) {
          continue;
        }

        leaderboardStore.addPoints(controllerId, points, 'stopwatch');
      }

      emit('update', updatedPoints);

      grantedPoints = updatedPoints;
    });
};
</script>

<style scoped></style>
