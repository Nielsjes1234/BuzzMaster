<template>
  <q-page class="column justify-between bm-home">
    <div class="col-grow column items-center justify-center q-gutter-y-lg">
      <div class="column items-center">
        <q-img
          src="logo.png"
          alt="logo"
          class="bm-home__logo"
        />
        <h1 class="bm-home__title">
          {{ t('app_name') }}
        </h1>
      </div>

      <nav class="bm-home__actions">
        <q-btn
          :label="t('action.start')"
          icon="play_arrow"
          to="gameModes"
          color="primary"
          unelevated
          no-caps
          class="bm-home__action bm-home__action--primary"
        />

        <q-btn
          :label="t('action.leaderboard')"
          icon="emoji_events"
          to="leaderboard"
          flat
          no-caps
          class="bm-home__action"
        />

        <q-btn
          :label="t('action.devices')"
          icon="sports_esports"
          to="devices"
          flat
          no-caps
          class="bm-home__action"
        />
      </nav>
    </div>

    <div
      v-if="quasar.platform.is.electron"
      class="self-center q-pa-sm bm-home__version"
    >
      v{{ version }}
    </div>
  </q-page>
</template>

<script setup lang="ts">
import { useI18n } from 'vue-i18n';
import { useUpdaterStore } from '@/stores/updater-store';
import { storeToRefs } from 'pinia';
import { useQuasar } from 'quasar';

const quasar = useQuasar();
const { t } = useI18n();
const updaterStore = useUpdaterStore();
const { version } = storeToRefs(updaterStore);
</script>

<style scoped>
/*
 * One clear way in, two quieter ones beneath it. The host opens this screen
 * while a room waits, so the primary action carries all the weight and nothing
 * else competes for it.
 */
.bm-home {
  padding: var(--bm-space-5) var(--bm-space-4);
}

.bm-home__logo {
  width: 168px;
  max-width: 55%;
}

.bm-home__title {
  font-family: var(--bm-font-display);
  font-size: clamp(30px, 8vw, 44px);
  font-weight: 800;
  letter-spacing: -0.035em;
  line-height: 1;
  margin: var(--bm-space-4) 0 0;
  text-align: center;
}

.bm-home__actions {
  display: flex;
  flex-direction: column;
  gap: var(--bm-space-2);
  width: 100%;
  max-width: 340px;
}

.bm-home__action {
  width: 100%;
  padding: var(--bm-space-3) var(--bm-space-4);
  border-radius: var(--bm-radius-sm);
  font-weight: 600;
  font-size: var(--bm-text-md);
}

.bm-home__action--primary {
  font-weight: 700;
  box-shadow: var(--bm-shadow-2);
}

.bm-home__version {
  font-size: var(--bm-text-xs);
  color: var(--bm-faint);
  font-variant-numeric: tabular-nums;
}
</style>
