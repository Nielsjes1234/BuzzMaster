<template>
  <q-resize-observer @resize="onCircleTimerResize" />

  <div class="column justify-center q-col-gutter-xs">
    <div
      ref="nameEl"
      :style="nameStyle"
    >
      {{ props.name }}
    </div>

    <div :style="slotStyle">
      <slot />
    </div>
  </div>
</template>

<script lang="ts" setup>
import { onMounted, ref, watchEffect } from 'vue';

interface Size {
  width: number;
  height: number;
}

type ElementStyle =
  | string
  | {
      fontSize: string;
    };

const props = withDefaults(
  defineProps<{
    name?: string;
    nameScale?: number;
    slotScale?: number;
    heightFactor?: number;
  }>(),
  {
    nameScale: 8.5,
    heightFactor: 3,
    slotScale: 0.75,
  },
);

const circleSize = ref<Size>();
const nameEl = ref<HTMLElement | null>(null);
const nameStyle = ref<ElementStyle>('');
const slotStyle = ref<ElementStyle>('');

/*
 * The measurement only ever produces a ratio, so the size below is arbitrary
 * and stays fixed. The typeface is not arbitrary: the app renders names in
 * Inter, and measuring them in Arial made every name come out at a constant
 * fraction of the size it should be — narrow faces read smaller, wide faces
 * overflow. Read the family off the element that will actually paint the text,
 * so the two can never drift apart again.
 */
const MEASURE_SIZE = '12pt';

function measurementFont(): string {
  const element = nameEl.value;
  if (element === null) {
    return `${MEASURE_SIZE} sans-serif`;
  }

  const { fontFamily, fontStyle, fontWeight } = getComputedStyle(element);

  return `${fontStyle} ${fontWeight} ${MEASURE_SIZE} ${fontFamily || 'sans-serif'}`;
}

// Measure normal text width
const canvas = document.createElement('canvas');
const textMetrics = (text: string) => {
  // Canvas is not present in testing environment.
  // This is a workaround until either canvas is added or a simple stub is found
  if (!('getContext' in canvas)) {
    return { width: 0, height: 0 };
  }
  const context = canvas.getContext('2d');
  if (context === null) {
    return { width: 0, height: 0 };
  }
  context.font = measurementFont();
  const metrics = context.measureText(text);
  const height =
    metrics.actualBoundingBoxAscent + metrics.actualBoundingBoxDescent;

  return {
    width: metrics.width,
    height,
  };
};

const onCircleTimerResize = (size?: { width: number; height: number }) => {
  size ??= circleSize.value ?? { width: 0, height: 0 };
  const elementWidth = size.width;
  const name = props.name;

  // Magical numbers so that the font size stays within the circle with padding

  const { width, height } = textMetrics(name ?? '');
  if (!elementWidth || !name) {
    return;
  }

  let scale = elementWidth / width;
  // Rescale for height if the height outgrows the circle
  if (height * props.heightFactor * scale > elementWidth) {
    scale = elementWidth / (height * props.heightFactor);
  }

  const fontSize = props.nameScale * scale;
  nameStyle.value = {
    fontSize: `${fontSize}pt`,
  };

  const countDownFontSize = fontSize * props.slotScale;
  slotStyle.value = {
    fontSize: `${countDownFontSize}pt`,
  };
};

watchEffect(() => {
  onCircleTimerResize();
});

onMounted(() => {
  // The variable font arrives after the first paint, so the first measurement
  // is taken in whatever fallback the browser had to hand. Redo it once the
  // real face is loaded; without this the very first name on screen keeps the
  // fallback's proportions until something else triggers a resize.
  const fonts: FontFaceSet | undefined = document.fonts;
  const ready: Promise<FontFaceSet> | undefined = fonts?.ready;
  if (ready === undefined) {
    return;
  }

  void ready.then(() => {
    onCircleTimerResize();
  });
});
</script>

<style scoped></style>
