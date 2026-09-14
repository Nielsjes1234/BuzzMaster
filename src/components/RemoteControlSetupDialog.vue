<template>
  <q-dialog
    ref="dialogRef"
    @hide="onDialogHide"
  >
    <q-card class="q-dialog-plugin">
      <q-card-section>
        <div class="text-h6">{{ t('remote.setup.title') }}</div>
      </q-card-section>

      <q-card-section class="q-pt-none column items-center">
        <div
          v-if="!serverInfo"
          class="row justify-center q-pa-md"
        >
          <q-spinner
            color="primary"
            size="3em"
          />
        </div>

        <template v-else>
          <p class="text-body2 text-center q-mb-md">
            {{ t('remote.setup.description') }}
          </p>

          <img
            v-if="qrCodeDataUrl"
            :src="qrCodeDataUrl"
            alt="QR Code"
            style="width: 250px; height: 250px"
          />

          <div class="text-caption q-mt-md text-weight-bold">
            {{ serverInfo.url }}
          </div>

          <div class="text-h4 q-mt-md text-weight-bold text-primary">
            {{ t('remote.setup.pin', { pin: serverInfo.pin }) }}
          </div>
        </template>
      </q-card-section>

      <q-card-actions align="right">
        <q-btn
          color="primary"
          :label="t('remote.setup.close')"
          @click="onDialogOK"
        />
      </q-card-actions>
    </q-card>
  </q-dialog>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue';
import { useDialogPluginComponent } from 'quasar';
import QRCode from 'qrcode';
import { useI18n } from 'vue-i18n';
import type { RemoteServerInfo, RemoteAction } from '@/../common/RemoteAPI';

const { t } = useI18n();
const { dialogRef, onDialogHide, onDialogOK } = useDialogPluginComponent();

const serverInfo = ref<RemoteServerInfo | null>(null);
const qrCodeDataUrl = ref<string>('');

onMounted(async () => {
  if (typeof window.remoteAPI !== 'undefined') {
    const info = await window.remoteAPI.getServerInfo();
    if (info) {
      serverInfo.value = info;
      qrCodeDataUrl.value = await QRCode.toDataURL(info.url, {
        width: 250,
        margin: 1,
        color: {
          dark: '#000000ff',
          light: '#ffffffff',
        },
      });
    }
  }
  if (typeof window !== 'undefined') {
    window.addEventListener('remote-action', onRemoteAction as EventListener);
  }
});

onUnmounted(() => {
  if (typeof window !== 'undefined') {
    window.removeEventListener(
      'remote-action',
      onRemoteAction as EventListener,
    );
  }
});

function onRemoteAction(e: CustomEvent<RemoteAction>) {
  if (e.detail?.action === 'remote:connected') {
    onDialogOK();
  }
}
</script>
