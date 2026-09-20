<template>
  <div
    class="bm-lb-row"
    :class="{ 'bm-lb-row--lead': props.entry.position === 1 }"
  >
    <div class="bm-lb-pos bm-cast-display">
      {{ props.entry.position }}
    </div>

    <div class="bm-lb-name bm-cast-display">
      {{ props.entry.name }}
    </div>

    <div class="bm-lb-value bm-cast-display">
      {{ props.entry.value }}
    </div>
  </div>
</template>

<script lang="ts" setup>
import type { LeaderboardEntry } from '@/../common/gameState/LeaderboardState';

const props = defineProps<{
  entry: LeaderboardEntry;
}>();
</script>

<style scoped>
/*
 * Sized in viewport units rather than pixels: the same markup has to hold up
 * on a laptop panel while it is being set up and on a projector once the room
 * fills. The clamps keep it sane at both ends.
 */
.bm-lb-row {
  animation: bm-rise-in 380ms var(--bm-ease) both;
  display: flex;
  align-items: baseline;
  gap: clamp(10px, 1.6vmin, 28px);
  padding: clamp(6px, 1.1vmin, 18px) 0;
  border-bottom: 1px solid var(--bm-line);
}

.bm-lb-row:last-child {
  border-bottom: 0;
}

/* Rows land one after another rather than all at once, which reads as a board
   being filled in instead of a page appearing. */
.bm-lb-row:nth-child(1) {
  animation-delay: 0ms;
}
.bm-lb-row:nth-child(2) {
  animation-delay: 60ms;
}
.bm-lb-row:nth-child(3) {
  animation-delay: 120ms;
}
.bm-lb-row:nth-child(4) {
  animation-delay: 180ms;
}
.bm-lb-row:nth-child(5) {
  animation-delay: 240ms;
}
.bm-lb-row:nth-child(6) {
  animation-delay: 300ms;
}
.bm-lb-row:nth-child(n + 7) {
  animation-delay: 360ms;
}

@media (prefers-reduced-motion: reduce) {
  .bm-lb-row {
    animation: none;
  }
}

.bm-lb-pos {
  flex: none;
  width: clamp(28px, 4vmin, 72px);
  font-size: clamp(14px, 2vmin, 34px);
  font-weight: 700;
  color: var(--bm-faint);
  font-variant-numeric: tabular-nums;
}

.bm-lb-name {
  flex: 1;
  min-width: 0;
  font-size: clamp(20px, 3.6vmin, 64px);
  font-weight: 600;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.bm-lb-value {
  flex: none;
  font-size: clamp(22px, 4.2vmin, 76px);
  font-weight: 800;
  font-variant-numeric: tabular-nums;
}

/* The leader is the one fact the room is looking for, so it is the only row
   that gets extra weight and the accent. Everything else stays quiet. */
.bm-lb-row--lead .bm-lb-pos {
  color: var(--q-primary);
}

.bm-lb-row--lead .bm-lb-name,
.bm-lb-row--lead .bm-lb-value {
  font-weight: 800;
}
</style>
