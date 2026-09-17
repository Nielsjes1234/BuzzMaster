<template>
  <div class="column justify-around">
    <transition-group name="slide">
      <cross-check
        key="cross-check"
        class="check-cross"
        :style="{ width: checkWidth + '%' }"
        :symbol="symbol"
      />
      <div
        v-if="showPoints"
        key="check"
        class="points-info column"
      >
        <div class="text-center q-py-md controller-name bm-cast-display">
          {{ controllers[props.state.controller] }}
        </div>
        <q-separator />
        <div
          class="text-center points q-py-md bm-cast-display"
          :class="pointsClass"
        >
          {{ n(props.state.points, { signDisplay: 'exceptZero' }) }}
          {{ t('cast.buzzer.answered.points') }}
        </div>
      </div>
    </transition-group>
  </div>
</template>

<script lang="ts" setup>
import type { BuzzerAnsweredState } from '@/../common/gameState/BuzzerState';
import CrossCheck from '@/components/CrossCheck.vue';
import { computed, ref } from 'vue';
import { useCastStore } from '@/stores/cast-store';
import { storeToRefs } from 'pinia';
import { useI18n } from 'vue-i18n';

const { t, n } = useI18n();
const castStore = useCastStore();
const { controllers } = storeToRefs(castStore);

const props = defineProps<{
  state: BuzzerAnsweredState;
}>();

const showPoints = ref<boolean>(false);
const checkWidth = ref<number>(100);

const pointsClass = computed<string>(() => {
  if (props.state.points > 0) {
    return 'points--gain';
  }

  if (props.state.points < 0) {
    return 'points--loss';
  }

  return 'points--even';
});

const symbol = computed<'check' | 'cross'>(() => {
  return props.state.correct ? 'check' : 'cross';
});

setTimeout(() => {
  showPoints.value = true;
  checkWidth.value = 75;
}, 2000);
</script>

<style scoped>
.controller-name {
  animation: bm-pop-in 420ms var(--bm-ease) both;
  font-family: var(--bm-font-display);
  word-break: break-word;
  font-size: clamp(28px, 7vmin, 120px);
  font-weight: 800;
  line-height: 0.96;
}

.points {
  font-family: var(--bm-font-display);
  font-size: clamp(22px, 4.5vmin, 76px);
  font-weight: 800;
  font-variant-numeric: tabular-nums;
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
  .controller-name {
    animation: none;
  }
}

.check-cross,
.points-info {
  transition:
    width 0.5s ease-in-out,
    transform 0.5s ease-in-out;
}

.slide-enter-active,
.slide-leave-active {
  transition: transform 0.5s ease-in-out;
}

.slide-enter,
.slide-leave-to {
  transform: translateY(100%);
}

.slide-leave-active {
  position: absolute;
}
</style>
