<template>
  <q-page
    class="row justify-center content-center"
    padding
  >
    <div
      class="col-xs-10 col-sm-8 col-md-6 col-lg-4 col-xl-3 column q-gutter-y-md"
    >
      <div
        v-for="section in sections"
        :key="section.key"
      >
        <div class="section-header full-width bm-label">
          {{ section.label }}
        </div>
        <div class="row q-gutter-sm">
          <div
            v-for="item in section.items"
            :key="item.routeName"
            class="col-xs-12 col-sm-5 col-md-4 column q-gutter-col-md"
          >
            <q-btn
              :to="{ name: item.routeName }"
              :label="item.label"
              :icon="item.icon"
              unelevated
              no-caps
              stack
              class="mode-tile"
            />
          </div>
          <div
            v-if="section.items.length === 0"
            class="text-subtitle2 text-italic"
          >
            {{ t('gameMode.noEntries') }}
          </div>
        </div>
      </div>
    </div>
  </q-page>
</template>

<script lang="ts" setup>
import { useI18n } from 'vue-i18n';
import { computed } from 'vue';

const { t } = useI18n();

interface MenuSection {
  label: string;
  key: string;
  icon?: string;
  items: MenuItem[];
}

interface MenuItem {
  routeName: string;
  label: string;
  icon?: string;
}

const sections = computed<MenuSection[]>(() => [
  {
    label: t('gameMode.section.show'),
    key: 'show',
    items: [
      {
        routeName: 'buzzer-game',
        label: t('gameMode.action.buzzer'),
        icon: 'sym_o_radio_button_checked',
      },
      {
        routeName: 'quiz-game',
        label: t('gameMode.action.quiz'),
        icon: 'sym_o_format_list_numbered',
      },
    ],
  },
  {
    label: t('gameMode.section.games'),
    key: 'games',
    items: [
      {
        routeName: 'simon-game',
        label: t('gameMode.action.simon'),
        icon: 'grid_view',
      },
      {
        routeName: 'pong-game',
        label: t('gameMode.action.pong'),
        icon: 'sym_o_sports_tennis',
      },
    ],
  },
  {
    label: t('gameMode.section.utilities'),
    key: 'utility',
    items: [
      {
        routeName: 'stopwatch-game',
        label: t('gameMode.action.stopwatch'),
        icon: 'sym_o_timer',
      },
      {
        routeName: 'viewing-rate-game',
        label: t('gameMode.action.viewingRate'),
        icon: 'sym_o_trending_up',
      },
    ],
  },
]);
</script>

<style scoped>
/*
 * Sections are separated by a label and space rather than by a rule across the
 * whole width: at this window size a horizontal line reads as a divider
 * between unrelated things, which these are not.
 */
.section-header {
  margin-bottom: var(--bm-space-3);
}

.mode-tile {
  width: 100%;
  padding: var(--bm-space-4) var(--bm-space-2);
  border-radius: var(--bm-radius-md);
  background: var(--bm-surface);
  border: 1px solid var(--bm-line);
  color: var(--bm-ink);
  font-weight: 600;
  transition:
    border-color var(--bm-duration) var(--bm-ease),
    transform var(--bm-duration-fast) var(--bm-ease),
    box-shadow var(--bm-duration) var(--bm-ease);
}

.mode-tile:hover {
  border-color: var(--q-primary);
  box-shadow: var(--bm-shadow-2);
}

.mode-tile:active {
  transform: translateY(1px);
}

.mode-tile :deep(.q-icon) {
  font-size: 26px;
  color: var(--q-primary);
  margin-bottom: var(--bm-space-1);
}
</style>
