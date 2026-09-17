<template>
  <div class="column col-11">
    <beep-timer
      :time="props.state.time"
      :precision="2"
      class="text-center bm-clock"
    />

    <q-separator />

    <div class="col-grow relative-position">
      <q-virtual-scroll
        :items="result"
        class="absolute fit"
        type="table"
        separator="none"
        dense
        flat
        style="background-color: transparent"
        v-slot="{ item, index }: { item: ResultItem; index: number }"
      >
        <tr
          :key="item.id"
          class="entry"
        >
          <td>
            <span
              class="rank"
              :class="{ 'rank--podium': item.time !== undefined && index < 3 }"
            >
              {{ item.time === undefined ? '–' : index + 1 }}
            </span>
          </td>

          <td class="full-width">
            {{ item.name }}
          </td>

          <td>
            <stopwatch-time :time="item.time" />
          </td>

          <td
            v-if="item.points !== undefined"
            :class="pointsClass(item.points)"
            class="text-right"
          >
            {{ n(item.points, { signDisplay: 'exceptZero' }) }}
          </td>
        </tr>
      </q-virtual-scroll>
    </div>
  </div>
</template>

<script lang="ts" setup>
import BeepTimer from '@/components/TimerAnimated.vue';
import type {
  StopwatchCompletedState,
  StopwatchPausedState,
  StopwatchRunningState,
} from '@/../common/gameState/StopwatchState';
import StopwatchTime from '@/components/gameModes/stopwatch/StopwatchTime.vue';
import { useCastStore } from '@/stores/cast-store';
import { storeToRefs } from 'pinia';
import { computed } from 'vue';
import { useI18n } from 'vue-i18n';

const { n } = useI18n();
const castStore = useCastStore();
const { controllers } = storeToRefs(castStore);

const props = defineProps<{
  state: StopwatchRunningState | StopwatchPausedState | StopwatchCompletedState;
}>();

interface ResultItem {
  id: string;
  name: string;
  time?: number | undefined;
  points?: number | undefined;
}

const result = computed<ResultItem[]>(() => {
  return Object.keys(props.state.result)
    .map((controllerId): ResultItem => {
      const points =
        props.state.name === 'completed' && props.state.points
          ? props.state.points[controllerId]
          : undefined;

      return {
        id: controllerId,
        name: controllers.value[controllerId] ?? 'Invalid Controller',
        time: props.state.result[controllerId] ?? undefined,
        points,
      };
    })
    .sort((a, b) => {
      if (a.time === undefined && b.time === undefined) {
        return 0;
      }

      if (a.time === undefined) {
        return 1;
      }

      if (b.time === undefined) {
        return -1;
      }

      return a.time - b.time;
    });
});

const pointsClass = (points: number | undefined): string => {
  if (points === undefined || points === 0) {
    return 'points--even';
  }

  if (points > 0) {
    return 'points--gain';
  }

  return 'points--loss';
};
</script>

<style scoped>
.entry td {
  font-size: clamp(14px, 2.4vmin, 34px);
  font-family: var(--bm-font-display);
  font-weight: 600;
  padding-block: clamp(4px, 0.8vmin, 12px);
  border-bottom: 1px solid var(--bm-line);
}

/*
 * The clock swells by a few percent on the whole second. Small enough that
 * nobody consciously notices it, large enough that a room can feel the
 * seconds passing without reading the digits.
 */
.bm-clock {
  font-family: var(--bm-font-display);
  font-weight: 800;
  font-size: clamp(36px, 11vmin, 170px);
  letter-spacing: -0.035em;
  font-variant-numeric: tabular-nums;
  animation: bm-tick 1s steps(60, end) infinite;
  transform-origin: center;
  padding-block: clamp(6px, 1.4vmin, 22px);
}

.rank {
  display: inline-grid;
  place-items: center;
  min-width: clamp(24px, 3.4vmin, 52px);
  font-weight: 800;
  font-variant-numeric: tabular-nums;
  color: var(--bm-faint);
}

.rank--podium {
  color: var(--q-primary);
}

.points--gain {
  color: var(--q-positive);
}

.points--loss {
  color: var(--q-negative);
}

.points--even {
  color: var(--bm-dim);
}

@media (prefers-reduced-motion: reduce) {
  .bm-clock {
    animation: none;
  }
}
</style>
