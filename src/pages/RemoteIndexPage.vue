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
        <!-- Loading State -->
        <div
          v-if="!remoteStore.isConnected"
          class="text-center"
        >
          <q-spinner-puff
            color="primary"
            size="3em"
          />
          <div class="text-grey-5 q-mt-md">
            {{ t('remote.status.waiting') }}
          </div>
        </div>

        <!-- Connected State -->
        <div
          v-else
          class="full-width"
          style="max-width: 500px"
        >
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

            <!-- Quiz Controls -->
            <div
              v-if="remoteStore.gameState.game === 'quiz'"
              class="q-gutter-y-md"
            >
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
              <template v-else-if="remoteStore.gameState.name === 'completed'">
                <q-btn
                  color="primary"
                  class="full-width q-py-md text-weight-bold"
                  size="lg"
                  push
                  icon="fast_forward"
                  :label="t('remote.action.quickPlay')"
                  @click="sendAction('quiz:quickPlay')"
                />
                <q-btn
                  color="secondary"
                  class="full-width q-py-md text-weight-bold"
                  size="lg"
                  push
                  icon="skip_next"
                  :label="t('remote.action.nextRound')"
                  @click="sendAction('quiz:nextRound')"
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

            <!-- Buzzer Controls -->
            <div
              v-if="remoteStore.gameState.game === 'buzzer'"
              class="q-gutter-y-md"
            >
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
              <template
                v-else-if="
                  ['running', 'answering', 'answered'].includes(
                    remoteStore.gameState.name,
                  )
                "
              >
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
import { onMounted } from 'vue';
import { useRemoteStore } from '@/stores/remote-store';
import { useI18n } from 'vue-i18n';

const { t } = useI18n();
const remoteStore = useRemoteStore();

onMounted(() => {
  remoteStore.connectToRemoteServer();
});

function startGame(gameType: string) {
  // We send a generic route action to the host so the Host can change the route
  // The host's game-store will initialize the game state automatically.
  remoteStore.sendRemoteAction('router:push', `/gameModes/${gameType}`);
}

function stopGame() {
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
