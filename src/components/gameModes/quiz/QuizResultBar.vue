<template>
  <div class="column justify-between no-wrap text-center">
    <div
      class="q-pb-sm bar-value"
      :style="animationDurationStyle"
    >
      {{ props.percentage }} %
    </div>

    <div class="col-grow column justify-end">
      <div
        class="bar text-center"
        :style="barStyle"
      >
        <div
          class="inner"
          :class="colorClass"
          :style="animationDurationStyle"
        />
      </div>
    </div>
    <div
      class="bar-value"
      :style="animationDurationStyle"
    >
      {{ props.total }}
    </div>
  </div>
</template>

<script lang="ts" setup>
import { BuzzerButton } from '@/plugins/buzzer/types';
import { computed, type StyleValue } from 'vue';

const props = defineProps<{
  button: BuzzerButton;
  percentage: number;
  total: number;
  animated?: boolean;
}>();

const MAX_ANIMATION_DURATION = 2;

const animationDurationStyle = computed<StyleValue>(() => {
  const duration = props.animated
    ? (props.percentage / 100) * MAX_ANIMATION_DURATION
    : 0;

  return {
    animationDuration: `${duration}s`,
  };
});

const barStyle = computed<StyleValue>(() => {
  const height = props.total > 0 ? props.percentage : 0.1;

  return {
    height: `${height}%`,
  };
});

const colorClass = computed<string>(() => {
  return buzzerButtonBgColor[props.button];
});

// Shared with every other place a buzzer colour appears; see
// src/css/tokens.scss. Red stands for "did not answer" in the results, which
// is why it maps to the neutral rather than to the red button's own colour.
const buzzerButtonBgColor = {
  [BuzzerButton.BLUE]: 'bg-buzz-blue',
  [BuzzerButton.ORANGE]: 'bg-buzz-orange',
  [BuzzerButton.GREEN]: 'bg-buzz-green',
  [BuzzerButton.YELLOW]: 'bg-buzz-yellow',
  [BuzzerButton.RED]: 'bg-buzz-none',
};
</script>

<style scoped>
.bar {
  width: 50px;
  margin: 0 10px;
  position: relative;
}

.bar .inner {
  width: 100%;
  height: 100%;
  border-radius: var(--bm-radius-xs) var(--bm-radius-xs) 2px 2px;
  animation-name: growBar;
  animation-timing-function: linear;
  position: absolute;
  bottom: 0;
}

.bar-value {
  opacity: 1;
  animation-name: fadeIn;
  animation-timing-function: linear;
  font-family: var(--bm-font-display);
  font-weight: 700;
  font-variant-numeric: tabular-nums;
}

@keyframes growBar {
  from {
    height: 0;
  }

  to {
    height: 100%;
  }
}

@keyframes fadeIn {
  from {
    opacity: 0;
  }

  0% {
    opacity: 0;
  }

  99% {
    opacity: 0;
  }

  to {
    opacity: 1;
  }
}
</style>
