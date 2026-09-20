<template>
  <div class="vote column col-12 justify-center items-center">
    <div class="bm-cast-label vote__label">
      {{ t('cast.quiz.running.title') }}
    </div>

    <template v-if="hasDeadline">
      <div
        class="vote__clock bm-cast-display"
        :class="`vote__clock--${urgency}`"
      >
        {{ secondsLeft }}
      </div>

      <div
        class="vote__track"
        role="progressbar"
        :aria-valuenow="secondsLeft"
        :aria-valuemin="0"
        :aria-valuemax="Math.round(settings.answerTime)"
      >
        <div
          class="vote__fill"
          :class="`vote__fill--${urgency}`"
          :style="{ transform: `scaleX(${remaining})` }"
        />
      </div>
    </template>

    <!--
      One mark per player. It fills the moment someone answers, but never says
      which button they pressed: that would give the room the answer while the
      vote is still open.
    -->
    <div class="vote__players">
      <span
        v-for="controller in state.controllers"
        :key="controller"
        class="vote__player"
        :class="`vote__player--${statusOf(controller)}`"
      />
    </div>

    <div class="vote__count bm-cast-display">
      {{ answeredCount }} / {{ state.controllers.length }}
    </div>
  </div>
</template>

<script lang="ts" setup>
import { useCastStore } from '@/stores/cast-store';
import type { QuizRunningState } from '@/../common/gameState/QuizState';
import type { QuizSettings } from '@/../common/gameSettings/QuizSettings';
import { computed } from 'vue';
import { useI18n } from 'vue-i18n';

const { t } = useI18n();
const castStore = useCastStore();

const settings = computed<QuizSettings>(() => {
  return castStore.gameSettings.quiz;
});

const props = defineProps<{
  state: QuizRunningState;
}>();

/** Without an answer time the round runs until the host stops it. */
const hasDeadline = computed<boolean>(() => settings.value.answerTime > 0);

const secondsLeft = computed<number>(() => Math.max(0, Math.ceil(props.state.time)));

/** 1 at the start of the round, 0 when the time is up. */
const remaining = computed<number>(() => {
  if (!hasDeadline.value) {
    return 1;
  }

  return Math.min(1, Math.max(0, props.state.time / settings.value.answerTime));
});

type Urgency = 'calm' | 'warning' | 'alert';

const urgency = computed<Urgency>(() => {
  if (!hasDeadline.value) {
    return 'calm';
  }

  if (props.state.time <= 3) {
    return 'alert';
  }

  if (props.state.time <= 5) {
    return 'warning';
  }

  return 'calm';
});

type PlayerStatus = 'waiting' | 'provisional' | 'answered';

function statusOf(controller: string): PlayerStatus {
  if (props.state.result[controller] !== undefined) {
    return 'answered';
  }

  // In confirm mode a player can have picked an answer without locking it in.
  if (
    props.state.answerChangeAllowed === 'confirm' &&
    props.state.unconfirmed[controller] !== undefined
  ) {
    return 'provisional';
  }

  return 'waiting';
}

const answeredCount = computed<number>(
  () => Object.keys(props.state.result).length,
);
</script>

<style scoped>
.vote {
  gap: clamp(10px, 2vmin, 34px);
  width: 100%;
  padding: clamp(16px, 4vmin, 64px);
}

.vote__label {
  margin-bottom: clamp(-6px, -0.6vmin, 0px);
}

/*
 * The clock replaces a circular progress ring. A ring reads as decoration from
 * a distance — the eye cannot judge a small angular difference across a room —
 * while a number and a draining bar both answer "how long left" instantly.
 */
.vote__clock {
  font-size: clamp(56px, 22vmin, 340px);
  font-weight: 800;
  line-height: 0.86;
  font-variant-numeric: tabular-nums;
  transition: color var(--bm-duration) var(--bm-ease);
}

.vote__clock--calm {
  color: var(--bm-ink);
}

.vote__clock--warning {
  color: var(--q-warning);
}

.vote__clock--alert {
  color: var(--q-negative);
  animation: bm-tick 1s steps(60, end) infinite;
}

.vote__track {
  width: min(78vw, 1100px);
  height: clamp(8px, 1.4vmin, 22px);
  border-radius: 999px;
  background: var(--bm-line);
  overflow: hidden;
}

/*
 * Scaled rather than resized: transform is cheap enough to update many times a
 * second without the browser re-laying out the page behind it.
 */
.vote__fill {
  height: 100%;
  border-radius: inherit;
  transform-origin: left center;
  background: var(--q-primary);
  transition:
    transform 120ms linear,
    background-color var(--bm-duration) var(--bm-ease);
}

.vote__fill--warning {
  background: var(--q-warning);
}

.vote__fill--alert {
  background: var(--q-negative);
}

.vote__players {
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
  gap: clamp(8px, 1.4vmin, 22px);
  margin-top: clamp(4px, 1vmin, 16px);
}

.vote__player {
  width: clamp(14px, 2.2vmin, 34px);
  aspect-ratio: 1;
  border-radius: 50%;
  box-shadow: inset 0 0 0 2px var(--bm-line-strong);
  background: transparent;
  transition:
    background-color var(--bm-duration) var(--bm-ease),
    box-shadow var(--bm-duration) var(--bm-ease),
    transform var(--bm-duration) var(--bm-ease);
}

.vote__player--provisional {
  box-shadow: inset 0 0 0 2px var(--q-primary);
}

.vote__player--answered {
  background: var(--q-primary);
  box-shadow: inset 0 0 0 2px var(--q-primary);
  animation: bm-pop-in 320ms var(--bm-ease);
}

.vote__count {
  font-size: clamp(16px, 2.6vmin, 42px);
  font-weight: 700;
  font-variant-numeric: tabular-nums;
  color: var(--bm-dim);
}

@media (prefers-reduced-motion: reduce) {
  .vote__clock--alert,
  .vote__player--answered {
    animation: none;
  }

  .vote__fill {
    transition: none;
  }
}
</style>
