<template>
  <q-dialog
    ref="dialogRef"
    @hide="onDialogHide"
  >
    <q-card
      class="q-dialog-plugin"
      style="min-width: 340px"
    >
      <q-card-section>
        <div class="text-h6">{{ t('slides.setup.title') }}</div>
      </q-card-section>

      <q-card-section class="q-pt-none">
        <p class="text-body2">
          {{ t('slides.setup.description') }}
        </p>

        <q-input
          v-model="url"
          outlined
          clearable
          autofocus
          type="url"
          :label="t('slides.setup.urlLabel')"
          :hint="t('slides.setup.urlHint')"
          :error="error !== null"
          :error-message="errorMessage"
          @keyup.enter="onShow"
        />

        <div
          v-if="slidesStore.active"
          class="q-mt-md"
        >
          <q-banner
            dense
            rounded
            class="bg-green-1 text-green-10"
          >
            <template #avatar>
              <q-icon name="cast_connected" />
            </template>
            {{ t('slides.setup.showing') }}
          </q-banner>

          <div class="row justify-center items-center q-gutter-sm q-mt-md">
            <q-btn
              :aria-label="t('slides.action.previous')"
              icon="chevron_left"
              color="primary"
              outline
              round
              @click="slidesStore.previous()"
            />
            <q-btn
              :aria-label="t('slides.action.next')"
              icon="chevron_right"
              color="primary"
              outline
              round
              @click="slidesStore.next()"
            />
            <q-btn
              :aria-label="
                slidesStore.blackout
                  ? t('slides.action.unblackout')
                  : t('slides.action.blackout')
              "
              :icon="slidesStore.blackout ? 'visibility' : 'visibility_off'"
              :color="slidesStore.blackout ? 'amber-8' : 'grey-8'"
              :outline="!slidesStore.blackout"
              round
              @click="slidesStore.toggleBlackout()"
            >
              <q-tooltip>
                {{
                  slidesStore.blackout
                    ? t('slides.action.unblackout')
                    : t('slides.action.blackout')
                }}
              </q-tooltip>
            </q-btn>

            <q-btn
              :aria-label="
                slidesStore.fullscreen
                  ? t('slides.action.exitFullscreen')
                  : t('slides.action.fullscreen')
              "
              :icon="
                slidesStore.fullscreen ? 'fullscreen_exit' : 'fullscreen'
              "
              color="primary"
              :outline="!slidesStore.fullscreen"
              round
              @click="slidesStore.toggleFullscreen()"
            >
              <q-tooltip>
                {{
                  slidesStore.fullscreen
                    ? t('slides.action.exitFullscreen')
                    : t('slides.action.fullscreen')
                }}
              </q-tooltip>
            </q-btn>
          </div>

          <p class="text-caption text-grey-7 q-mt-md q-mb-none">
            {{ t('slides.setup.placement') }}
          </p>
        </div>
      </q-card-section>

      <q-card-actions align="right">
        <q-btn
          v-if="slidesStore.active"
          flat
          rounded
          color="negative"
          :label="t('slides.action.hide')"
          @click="hide"
        />
        <q-btn
          flat
          rounded
          :label="t('slides.action.close')"
          @click="onDialogOK"
        />
        <q-btn
          color="primary"
          rounded
          :loading="busy"
          :disable="(url ?? '').trim().length === 0"
          :label="t('slides.action.show')"
          @click="onShow"
        />
      </q-card-actions>
    </q-card>
  </q-dialog>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue';
import { useDialogPluginComponent } from 'quasar';
import { useI18n } from 'vue-i18n';
import { useSlidesStore } from '@/stores/slides-store';
import type { SlidesOpenResult } from '@/../common/SlidesAPI';

const { t } = useI18n();
const { dialogRef, onDialogHide, onDialogOK } = useDialogPluginComponent();
const slidesStore = useSlidesStore();

const url = ref<string | null>(slidesStore.state.sourceUrl);
const error = ref<SlidesOpenResult['error'] | null>(null);
const busy = ref<boolean>(false);

const errorMessage = computed<string | undefined>(() => {
  switch (error.value) {
    case 'invalidUrl':
      return t('slides.error.invalidUrl');
    case 'noCastWindow':
      return t('slides.error.noCastWindow');
    case 'notShared':
      return t('slides.error.notShared');
    case 'loadFailed':
      return t('slides.error.loadFailed');
    default:
      return undefined;
  }
});

function onShow() {
  void show();
}

async function show() {
  const value = (url.value ?? '').trim();

  if (value.length === 0) {
    return;
  }

  busy.value = true;
  error.value = null;

  try {
    const result = await slidesStore.open(value);
    error.value = result.ok ? null : (result.error ?? 'loadFailed');
  } finally {
    busy.value = false;
  }
}

function hide() {
  slidesStore.close();
}
</script>
