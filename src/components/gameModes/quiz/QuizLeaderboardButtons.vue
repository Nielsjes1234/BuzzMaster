<template>
  <div class="row justify-center q-gutter-md">
    <q-btn
      v-for="button in quizSettings.activeButtons"
      :key="button"
      :color="buzzerButtonColor[button]"
      round
      unelevated
      class="quiz-answer"
      :class="{ 'quiz-answer--on': correctAnswers.has(button) }"
      :aria-pressed="correctAnswers.has(button)"
      @click="updateButtonPoints(button)"
    >
      <q-icon
        v-if="correctAnswers.has(button)"
        name="check"
        class="quiz-answer__check"
      />
    </q-btn>
  </div>
</template>

<script lang="ts" setup>
import { buzzerButtonColor } from '@/components/buttonColors';
import type { BuzzerButton } from '@/plugins/buzzer/types';
import { onBeforeMount, onUnmounted, ref, watch } from 'vue';
import { useLeaderboardStore } from '@/stores/leaderboard-store';
import { useGameSettingsStore } from '@/stores/game-settings-store';
import { useAudio } from '@/composables/audio';
import { findFastestControllers } from '@/components/gameModes/quiz/fastestBonus';

const leaderboardStore = useLeaderboardStore();
const { quizSettings } = useGameSettingsStore();
const { createAudio } = useAudio();

const correctAnswers = ref<Set<BuzzerButton>>(new Set());
const props = defineProps<{
  answers: Record<string, BuzzerButton>;
  answerTimes: Record<string, number>;
}>();

// Points granted for the current selection. Kept to revert them when the selection changes.
const grantedPoints = ref<Record<string, number>>({});

const emit = defineEmits<{
  (e: 'update', correct: BuzzerButton[] | undefined): void;
}>();

let audioPlayed = false;
const audioCorrect = createAudio('sounds/answer-correct.mp3');

onBeforeMount(() => {
  audioCorrect.load();
  window.addEventListener('remote-action', onRemoteAction as EventListener);
});

onUnmounted(() => {
  window.removeEventListener('remote-action', onRemoteAction as EventListener);
});

function onRemoteAction(e: CustomEvent) {
  const { action, payload } = e.detail;
  if (action === 'quiz:answer' && payload !== undefined) {
    void updateButtonPoints(payload as BuzzerButton);
  }
}

/*
 * The host undid the award this component made. Those points are already off
 * the board, so the refund record above now describes money that no longer
 * exists; keeping it would subtract it a second time on the next toggle. The
 * selection goes with it, because a colour still ringed as correct while its
 * points are gone is a screen that contradicts the scoreboard.
 *
 * Undoing anything else — a manual correction, a reset — restores a board on
 * which this record is still true, so it is left alone.
 */
watch(
  () => leaderboardStore.undoCount,
  () => {
    if (leaderboardStore.undoneOrigin !== 'quiz') {
      return;
    }

    grantedPoints.value = {};
    correctAnswers.value = new Set();
    audioPlayed = false;
    emit('update', undefined);
  },
);

const updateButtonPoints = async (button: BuzzerButton): Promise<void> => {
  // Revert the points of the previous selection
  Object.entries(grantedPoints.value).forEach(([controllerId, points]) => {
    leaderboardStore.addPoints(controllerId, -points, 'quiz');
  });

  // Toggle the button
  if (correctAnswers.value.has(button)) {
    correctAnswers.value.delete(button);
  } else {
    correctAnswers.value.add(button);
  }

  const correct = [...correctAnswers.value];
  const points: Record<string, number> = {};

  // If all buzzers are unselected, no points are granted
  if (correct.length > 0) {
    const fastest =
      quizSettings.pointsFastestBonus === 0
        ? []
        : findFastestControllers(props.answers, props.answerTimes, correct);

    Object.entries(props.answers).forEach(([controllerId, answer]) => {
      if (!correctAnswers.value.has(answer)) {
        points[controllerId] = quizSettings.pointsWrong;
        return;
      }

      // The bonus is granted on top of the points for a correct answer
      points[controllerId] = fastest.includes(controllerId)
        ? quizSettings.pointsCorrect + quizSettings.pointsFastestBonus
        : quizSettings.pointsCorrect;
    });
  }

  Object.entries(points).forEach(([controllerId, value]) => {
    leaderboardStore.addPoints(controllerId, value, 'quiz');
  });

  grantedPoints.value = points;

  emit('update', correct.length === 0 ? undefined : correct);

  await playAudio();
};

const playAudio = async () => {
  // Only play sound once as multiple answers can be selected
  if (audioPlayed) {
    return;
  }

  audioPlayed = true;
  await audioCorrect.play();
};
</script>

<style scoped>
/*
 * These were outlined rings until the colours moved to tokens, and outlines
 * turned out to be the wrong shape for the job: a thin circle of colour is
 * hard to identify at a glance and nearly invisible on a light background.
 * The answer is a solid swatch throughout, with the unselected ones dimmed,
 * so the button always reads as the colour it represents.
 */
.quiz-answer {
  width: 56px;
  height: 56px;
  opacity: 0.38;
  transform: scale(0.92);
  transition:
    opacity var(--bm-duration) var(--bm-ease),
    transform var(--bm-duration) var(--bm-ease),
    box-shadow var(--bm-duration) var(--bm-ease);
}

.quiz-answer--on {
  opacity: 1;
  transform: scale(1);
  box-shadow:
    0 0 0 3px var(--bm-ground),
    0 0 0 5px var(--bm-ink);
}

.quiz-answer__check {
  font-size: 28px;
}

@media (prefers-reduced-motion: reduce) {
  .quiz-answer {
    transition: none;
  }
}
</style>
