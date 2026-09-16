<template>
  <q-layout view="lHh Lpr lFf">
    <!-- Header -->
    <q-header elevated>
      <q-toolbar class="bg-primary text-white">
        <q-avatar size="32px">
          <img
            src="/logo-without-circle.svg"
            alt="Logo"
          />
        </q-avatar>
        <q-toolbar-title class="text-weight-bold">
          BuzzMaster
          <span
            class="text-white text-weight-regular"
            style="opacity: 0.7"
            >Remote</span
          >
        </q-toolbar-title>

        <q-badge
          :color="remoteStore.isConnected ? 'positive' : 'negative'"
          rounded
          class="q-pa-sm text-weight-bold"
        >
          <q-icon
            :name="remoteStore.isConnected ? 'wifi' : 'wifi_off'"
            class="q-mr-xs"
          />
          {{
            remoteStore.isConnected
              ? t('remote.status.connected')
              : t('remote.status.offline')
          }}
        </q-badge>
      </q-toolbar>
    </q-header>

    <q-page-container>
      <q-page class="q-pa-md flex flex-center column">
        <!-- Loading / Login State -->
        <div
          v-if="!remoteStore.isConnected"
          class="text-center full-width"
          style="max-width: 400px"
        >
          <!-- Show loading if we are currently attempting to connect with a saved PIN -->
          <template v-if="isConnecting">
            <q-spinner-puff
              color="primary"
              size="3em"
            />
            <div class="text-grey-5 q-mt-md">
              {{ t('remote.auth.connecting') }}
            </div>
          </template>

          <!-- Otherwise show PIN input form -->
          <q-card
            v-else
            bordered
            class="q-pa-md bg-dark text-white"
          >
            <q-card-section>
              <div class="text-h6 q-mb-md">{{ t('remote.auth.title') }}</div>

              <q-input
                v-model="pinInput"
                outlined
                dark
                type="tel"
                :label="t('remote.auth.pinLabel')"
                :error="!!remoteStore.connectionError"
                :error-message="
                  remoteStore.connectionError === 'invalid_pin'
                    ? t('remote.auth.invalidPin')
                    : remoteStore.connectionError === 'rate_limited'
                      ? t('remote.auth.rateLimited')
                      : remoteStore.connectionError || undefined
                "
                mask="####"
                class="q-mb-md"
                @keyup.enter="connect"
              />

              <q-btn
                color="primary"
                class="full-width text-weight-bold"
                size="lg"
                :label="t('remote.auth.connect')"
                :disable="pinInput.length !== 4"
                @click="connect"
              />
            </q-card-section>
          </q-card>
        </div>

        <!-- Connected State -->
        <div
          v-else
          class="full-width"
          style="max-width: 500px"
        >
          <!-- ===== SLIDES Controls ===== -->
          <q-card
            v-if="remoteStore.slides.presentationId"
            class="rounded-borders q-mb-md"
            bordered
          >
            <q-card-section class="row items-center justify-between q-pb-none">
              <div class="text-subtitle1 text-weight-bold text-primary">
                {{ t('slides.title') }}
              </div>
              <q-btn
                :color="remoteStore.slides.active ? 'negative' : 'positive'"
                dense
                rounded
                no-caps
                :icon="remoteStore.slides.active ? 'stop_screen_share' : 'present_to_all'"
                :label="
                  remoteStore.slides.active
                    ? t('slides.action.hide')
                    : t('slides.action.show')
                "
                @click="sendAction('slides:toggle')"
              />
            </q-card-section>

            <q-card-section v-if="remoteStore.slides.active">
              <div class="row q-col-gutter-md">
                <div class="col-4">
                  <q-btn
                    color="grey-8"
                    class="full-width q-py-md"
                    push
                    icon="chevron_left"
                    :aria-label="t('slides.action.previous')"
                    @click="sendAction('slides:previous')"
                  />
                </div>
                <div class="col-8">
                  <q-btn
                    color="primary"
                    class="full-width q-py-md text-weight-bold"
                    push
                    icon="chevron_right"
                    :label="t('slides.action.next')"
                    @click="sendAction('slides:next')"
                  />
                </div>
              </div>

              <q-btn
                class="full-width q-py-md text-weight-bold q-mt-md"
                push
                :color="remoteStore.slides.blackout ? 'amber-8' : 'dark'"
                :icon="
                  remoteStore.slides.blackout ? 'visibility' : 'visibility_off'
                "
                :label="
                  remoteStore.slides.blackout
                    ? t('slides.action.unblackout')
                    : t('slides.action.blackout')
                "
                @click="sendAction('slides:blackout')"
              />
            </q-card-section>
          </q-card>

          <!-- No Game Active (Home Menu) -->
          <div v-if="!remoteStore.gameState">
            <q-card
              class="rounded-borders q-mb-md"
              bordered
            >
              <q-card-section>
                <div class="text-h6 text-center text-primary">
                  {{ t('remote.menu.noGame') }}
                </div>
                <div class="text-caption text-center text-grey-8">
                  {{ t('remote.menu.selectGame') }}
                </div>
              </q-card-section>
            </q-card>

            <div class="row q-col-gutter-md">
              <div class="col-6">
                <q-btn
                  color="primary"
                  class="full-width q-py-md text-weight-bold"
                  push
                  icon="school"
                  :label="t('remote.action.quiz')"
                  stack
                  @click="startGame('quiz')"
                />
              </div>
              <div class="col-6">
                <q-btn
                  color="secondary"
                  class="full-width q-py-md text-weight-bold"
                  push
                  icon="touch_app"
                  :label="t('remote.action.buzzer')"
                  stack
                  @click="startGame('buzzer')"
                />
              </div>
              <div class="col-6">
                <q-btn
                  color="accent"
                  class="full-width q-py-md text-weight-bold"
                  push
                  icon="timer"
                  :label="t('remote.action.stopwatch')"
                  stack
                  @click="startGame('stopwatch')"
                />
              </div>
              <div class="col-6">
                <q-btn
                  color="warning"
                  class="full-width q-py-md text-weight-bold"
                  push
                  icon="gamepad"
                  :label="t('remote.action.simon')"
                  stack
                  @click="startGame('simon')"
                />
              </div>
            </div>

            <q-separator
              dark
              class="q-my-lg"
            />

            <q-btn
              color="grey-8"
              class="full-width"
              icon="leaderboard"
              :label="t('remote.action.toggleLeaderboard')"
              @click="toggleLeaderboard"
            />
          </div>

          <!-- Active Game Controls -->
          <div v-else>
            <q-card
              class="rounded-borders q-mb-md"
              bordered
            >
              <q-card-section class="row items-center justify-between">
                <div class="text-h6 text-capitalize text-primary">
                  {{
                    t('remote.menu.activeMode', {
                      game: remoteStore.gameState.game,
                    })
                  }}
                </div>
                <q-badge
                  color="primary"
                  rounded
                  class="q-pa-sm text-weight-bold"
                  >{{ t('remote.menu.active') }}</q-badge
                >
              </q-card-section>
            </q-card>

            <!-- ===== QUIZ Controls ===== -->
            <div
              v-if="remoteStore.gameState.game === 'quiz'"
              class="q-gutter-y-md"
            >
              <!-- preparing -->
              <template v-if="remoteStore.gameState.name === 'preparing'">
                <q-btn
                  color="positive"
                  class="full-width q-py-md text-weight-bold"
                  size="lg"
                  push
                  icon="play_arrow"
                  :label="t('remote.action.startQuiz')"
                  @click="sendAction('quiz:start')"
                />
              </template>

              <!-- running -->
              <template v-else-if="remoteStore.gameState.name === 'running'">
                <q-btn
                  color="warning"
                  class="full-width q-py-md text-weight-bold"
                  size="lg"
                  push
                  icon="cancel"
                  :label="t('remote.action.cancelQuiz')"
                  @click="sendAction('quiz:cancel')"
                />
              </template>

              <!-- completed -->
              <template v-else-if="remoteStore.gameState.name === 'completed'">
                <!-- Answer selection label -->
                <div class="text-subtitle2 text-center text-grey-7 q-mb-xs">
                  {{ t('remote.action.quizSelectAnswer') }}
                </div>

                <!-- Colour buttons matching the PC's QuizLeaderboardButtons -->
                <div
                  v-if="quizActiveButtons.length > 0"
                  class="row justify-center q-gutter-md q-mb-sm"
                >
                  <q-btn
                    v-for="button in quizActiveButtons"
                    :key="button"
                    :color="buzzerButtonColors[button]"
                    round
                    size="xl"
                    :outline="!selectedAnswers.has(button)"
                    @click="toggleQuizAnswer(button)"
                  />
                </div>

                <q-separator class="q-my-sm" />

                <!-- Next Round (elimination mode) -->
                <q-btn
                  v-if="quizMode === 'elimination'"
                  color="primary"
                  class="full-width q-py-md text-weight-bold"
                  size="lg"
                  push
                  icon="fast_forward"
                  :label="t('remote.action.nextRound')"
                  @click="sendAction('quiz:nextRound')"
                />
                <!-- Quick Play (other modes) -->
                <q-btn
                  v-else
                  color="primary"
                  class="full-width q-py-md text-weight-bold"
                  size="lg"
                  push
                  icon="fast_forward"
                  :label="t('remote.action.quickPlay')"
                  @click="sendAction('quiz:quickPlay')"
                />

                <q-btn
                  color="grey-8"
                  class="full-width q-py-md text-weight-bold"
                  size="lg"
                  push
                  icon="replay"
                  :label="t('remote.action.restart')"
                  @click="sendAction('quiz:restart')"
                />
              </template>
            </div>

            <!-- ===== BUZZER Controls ===== -->
            <div
              v-if="remoteStore.gameState.game === 'buzzer'"
              class="q-gutter-y-md"
            >
              <!-- preparing -->
              <template v-if="remoteStore.gameState.name === 'preparing'">
                <q-btn
                  color="positive"
                  class="full-width q-py-md text-weight-bold"
                  size="lg"
                  push
                  icon="play_arrow"
                  :label="t('remote.action.startBuzzer')"
                  @click="sendAction('buzzer:start')"
                />
              </template>

              <!-- running -->
              <template v-else-if="remoteStore.gameState.name === 'running'">
                <q-btn
                  color="grey-8"
                  class="full-width q-py-md text-weight-bold"
                  size="lg"
                  push
                  icon="replay"
                  :label="t('remote.action.resetBuzzers')"
                  @click="sendAction('buzzer:restart')"
                />
              </template>

              <!-- answering / answered -->
              <template
                v-else-if="
                  ['answering', 'answered'].includes(remoteStore.gameState.name)
                "
              >
                <!-- Display who buzzed in -->
                <div
                  class="text-h4 text-center q-mb-md text-weight-bold text-primary"
                >
                  {{
                    'controllerName' in remoteStore.gameState
                      ? remoteStore.gameState.controllerName
                      : ''
                  }}
                </div>

                <!-- Correct / Wrong buttons (mirrors BuzzerLeaderboardButtons) -->
                <div class="row q-col-gutter-md justify-center">
                  <div class="col-6">
                    <q-btn
                      color="positive"
                      class="full-width q-py-lg text-weight-bold"
                      size="lg"
                      push
                      icon="check"
                      :label="t('remote.action.buzzerCorrect')"
                      :outline="buzzerAnswerState !== true"
                      @click="sendBuzzerAnswer(true)"
                    />
                  </div>
                  <div class="col-6">
                    <q-btn
                      color="negative"
                      class="full-width q-py-lg text-weight-bold"
                      size="lg"
                      push
                      icon="clear"
                      :label="t('remote.action.buzzerWrong')"
                      :outline="buzzerAnswerState !== false"
                      @click="sendBuzzerAnswer(false)"
                    />
                  </div>
                </div>

                <q-separator class="q-my-sm" />

                <!-- Re-open -->
                <q-btn
                  color="primary"
                  class="full-width q-py-md text-weight-bold"
                  push
                  icon="loop"
                  :label="t('remote.action.buzzerReOpen')"
                  @click="sendAction('buzzer:reOpen')"
                />

                <!-- Quick Play -->
                <q-btn
                  color="secondary"
                  class="full-width q-py-md text-weight-bold"
                  push
                  icon="fast_forward"
                  :label="t('remote.action.buzzerQuickPlay')"
                  @click="sendBuzzerQuickPlay"
                />

                <!-- Reset -->
                <q-btn
                  color="grey-8"
                  class="full-width q-py-md text-weight-bold"
                  push
                  icon="replay"
                  :label="t('remote.action.resetBuzzers')"
                  @click="sendAction('buzzer:restart')"
                />
              </template>
            </div>

            <!-- ===== STOPWATCH Controls ===== -->
            <div
              v-if="remoteStore.gameState.game === 'stopwatch'"
              class="q-gutter-y-md"
            >
              <!-- preparing -->
              <template v-if="remoteStore.gameState.name === 'preparing'">
                <q-btn
                  color="positive"
                  class="full-width q-py-md text-weight-bold"
                  size="lg"
                  push
                  icon="play_arrow"
                  :label="t('gameMode.stopwatch.action.start')"
                  @click="sendAction('stopwatch:start')"
                />
              </template>

              <!-- running -->
              <template v-else-if="remoteStore.gameState.name === 'running'">
                <q-btn
                  color="warning"
                  class="full-width q-py-md text-weight-bold"
                  size="lg"
                  push
                  icon="pause"
                  :label="t('remote.action.stopwatchPause')"
                  @click="sendAction('stopwatch:pause')"
                />
                <q-btn
                  color="grey-8"
                  class="full-width q-py-md text-weight-bold"
                  push
                  icon="cancel"
                  :label="t('remote.action.stopwatchCancel')"
                  @click="sendAction('stopwatch:cancel')"
                />
              </template>

              <!-- paused -->
              <template v-else-if="remoteStore.gameState.name === 'paused'">
                <div class="row q-col-gutter-md">
                  <div class="col-6">
                    <q-btn
                      color="positive"
                      class="full-width q-py-md text-weight-bold"
                      push
                      icon="play_arrow"
                      :label="t('remote.action.stopwatchResume')"
                      @click="sendAction('stopwatch:resume')"
                    />
                  </div>
                  <div class="col-6">
                    <q-btn
                      color="primary"
                      class="full-width q-py-md text-weight-bold"
                      push
                      icon="stop"
                      :label="t('remote.action.stopwatchStop')"
                      @click="sendAction('stopwatch:stop')"
                    />
                  </div>
                </div>
                <q-btn
                  color="grey-8"
                  class="full-width q-py-md text-weight-bold"
                  push
                  icon="cancel"
                  :label="t('remote.action.stopwatchCancel')"
                  @click="sendAction('stopwatch:cancel')"
                />
              </template>

              <!-- completed -->
              <template v-else-if="remoteStore.gameState.name === 'completed'">
                <q-btn
                  color="primary"
                  class="full-width q-py-md text-weight-bold"
                  size="lg"
                  push
                  icon="fast_forward"
                  :label="t('remote.action.stopwatchQuickPlay')"
                  @click="sendAction('stopwatch:quickPlay')"
                />
                <q-btn
                  color="grey-8"
                  class="full-width q-py-md text-weight-bold"
                  push
                  icon="replay"
                  :label="t('remote.action.stopwatchReset')"
                  @click="sendAction('stopwatch:reset')"
                />
              </template>
            </div>

            <!-- ===== SIMON Controls ===== -->
            <div
              v-if="remoteStore.gameState.game === 'simon'"
              class="q-gutter-y-md"
            >
              <!-- preparing -->
              <template v-if="remoteStore.gameState.name === 'preparing'">
                <q-btn
                  color="positive"
                  class="full-width q-py-md text-weight-bold"
                  size="lg"
                  push
                  icon="play_arrow"
                  :label="t('gameMode.simon.action.start')"
                  @click="sendAction('simon:start')"
                />
              </template>

              <!-- roundOver -->
              <template v-else-if="remoteStore.gameState.name === 'roundOver'">
                <q-btn
                  color="primary"
                  class="full-width q-py-md text-weight-bold"
                  size="lg"
                  push
                  icon="skip_next"
                  :label="t('remote.action.simonNextRound')"
                  @click="sendAction('simon:nextRound')"
                />
                <q-btn
                  color="grey-8"
                  class="full-width q-py-md text-weight-bold"
                  push
                  icon="replay"
                  :label="t('remote.action.simonRestart')"
                  @click="sendAction('simon:restart')"
                />
              </template>

              <!-- showing / input / gameOver: only restart available -->
              <template
                v-else-if="
                  ['showing', 'input', 'gameOver'].includes(
                    remoteStore.gameState.name,
                  )
                "
              >
                <q-btn
                  color="grey-8"
                  class="full-width q-py-md text-weight-bold"
                  push
                  icon="replay"
                  :label="t('remote.action.simonRestart')"
                  @click="sendAction('simon:restart')"
                />
              </template>
            </div>

            <!-- Generic Controls -->
            <q-separator
              dark
              class="q-my-lg"
            />
            <div class="row q-col-gutter-md">
              <div class="col-12">
                <q-btn
                  color="negative"
                  class="full-width text-weight-bold"
                  push
                  icon="stop"
                  :label="t('remote.action.stopGame')"
                  @click="stopGame"
                />
              </div>
            </div>
          </div>
        </div>
      </q-page>
    </q-page-container>
  </q-layout>
</template>

<script setup lang="ts">
import { computed, onMounted, ref, watch } from 'vue';
import { useRemoteStore } from '@/stores/remote-store';
import { useI18n } from 'vue-i18n';
import type { BuzzerButton } from '@/plugins/buzzer/types';

const { t, locale } = useI18n();
const remoteStore = useRemoteStore();

watch(
  () => remoteStore.locale,
  (newLocale) => {
    locale.value = newLocale;
  },
  { immediate: true },
);

// -- Buzzer answer state (mirrors BuzzerLeaderboardButtons.answerCorrect) --
// Reset whenever we enter a fresh answering state so the outline toggles correctly.
const buzzerAnswerState = ref<boolean | undefined>(undefined);

const pinInput = ref('');
const isConnecting = ref(false);

onMounted(() => {
  const savedPin = sessionStorage.getItem('remotePin');
  if (savedPin) {
    pinInput.value = savedPin;
    connect();
  }
});

function connect() {
  if (pinInput.value.length === 4) {
    isConnecting.value = true;
    sessionStorage.setItem('remotePin', pinInput.value);
    remoteStore.connectToRemoteServer(pinInput.value);

    // Stop loading animation after a short delay so error can be shown
    setTimeout(() => {
      isConnecting.value = false;
      if (remoteStore.connectionError) {
        sessionStorage.removeItem('remotePin');
      }
    }, 1000);
  }
}

// Automatically reset local answer selections when a new round starts (e.g., via PC or phone)
watch(
  () => remoteStore.gameState?.name,
  (newName) => {
    if (newName === 'preparing' || newName === 'running') {
      selectedAnswers.value = new Set();
      buzzerAnswerState.value = undefined;
    }
  },
);

// -- Quiz answer-button state --
// Tracks which colour buttons the remote host has toggled as correct answers.
const selectedAnswers = ref<Set<BuzzerButton>>(new Set());

/**
 * Map of BuzzerButton enum values to Quasar colour names.
 * Mirrors src/components/buttonColors.ts (cannot import from remote context).
 */
const buzzerButtonColors: Record<number, string> = {
  0: 'red', // BuzzerButton.RED
  1: 'blue', // BuzzerButton.BLUE
  2: 'orange', // BuzzerButton.ORANGE
  3: 'green', // BuzzerButton.GREEN
  4: 'yellow', // BuzzerButton.YELLOW
};

/** Active buttons sent from host via gameSettings. Falls back to empty array. */
const quizActiveButtons = computed<number[]>(() => {
  return remoteStore.gameSettings?.quiz?.activeButtons ?? [];
});

/** Current quiz mode (normal / survey / elimination). */
const quizMode = computed<string>(() => {
  if (
    remoteStore.gameState?.game === 'quiz' &&
    remoteStore.gameState.name === 'completed'
  ) {
    return remoteStore.gameState.mode;
  }
  return 'normal';
});

/** Toggle a colour button and immediately send the action to the host. */
function toggleQuizAnswer(button: BuzzerButton) {
  if (selectedAnswers.value.has(button)) {
    selectedAnswers.value.delete(button);
  } else {
    selectedAnswers.value.add(button);
  }
  // Force reactivity on the Set
  selectedAnswers.value = new Set(selectedAnswers.value);

  // Emit the toggle to the host so QuizLeaderboardButtons processes it
  sendAction('quiz:answer', button);
}

// -- Buzzer helpers --

function sendBuzzerAnswer(correct: boolean) {
  // Toggle behaviour: clicking the same button again resets the selection
  if (buzzerAnswerState.value === correct) {
    buzzerAnswerState.value = undefined;
    sendAction('buzzer:answer', undefined);
  } else {
    buzzerAnswerState.value = correct;
    sendAction('buzzer:answer', correct);
  }
}

function sendBuzzerQuickPlay() {
  // Quick Play = restart + start -- reset local state too
  buzzerAnswerState.value = undefined;
  sendAction('buzzer:quickPlay');
}

// -- Generic helpers --

function startGame(gameType: string) {
  // Reset per-game local state on navigation
  selectedAnswers.value = new Set();
  buzzerAnswerState.value = undefined;
  remoteStore.sendRemoteAction('router:push', `/gameModes/${gameType}`);
}

function stopGame() {
  selectedAnswers.value = new Set();
  buzzerAnswerState.value = undefined;
  remoteStore.sendRemoteAction('gameStore:reset');
  remoteStore.sendRemoteAction('router:push', '/');
}

function toggleLeaderboard() {
  remoteStore.sendRemoteAction('router:push', '/leaderboard');
}

function sendAction(action: string, payload?: unknown) {
  remoteStore.sendRemoteAction(action, payload);
}
</script>

<style scoped>
.rounded-borders {
  border-radius: 12px;
}
</style>
