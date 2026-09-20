import { describe, it, expect } from 'vitest';
import {
  currentlyViewingShare,
  isViewing,
  totalViewingRate,
  viewingRate,
} from '@/components/gameModes/viewingRate/viewingRate';

describe('isViewing', () => {
  it('starts on when the round opens with everyone watching', () => {
    expect(isViewing([], true)).toBe(true);
    expect(isViewing([], false)).toBe(false);
  });

  it('flips with every press of the red button', () => {
    expect(isViewing([4], true)).toBe(false);
    expect(isViewing([4, 9], true)).toBe(true);

    expect(isViewing([4], false)).toBe(true);
    expect(isViewing([4, 9], false)).toBe(false);
  });
});

describe('viewingRate', () => {
  it('counts the whole round for someone who never looked away', () => {
    expect(viewingRate([], 60, true)).toBe(1);
  });

  it('counts nothing for someone who never looked at all', () => {
    expect(viewingRate([], 60, false)).toBe(0);
  });

  it('closes the final stretch at the current time', () => {
    // Watching from 0, away at 30, back at 45, still watching at 60.
    expect(viewingRate([30, 45], 60, true)).toBeCloseTo(45 / 60);
  });

  it('counts a stretch that is still open when the round ends', () => {
    // Away from 0, watching from 20 onwards.
    expect(viewingRate([20], 60, false)).toBeCloseTo(40 / 60);
  });

  it('does not divide by a round that has not started', () => {
    expect(viewingRate([], 0, true)).toBe(0);
  });
});

describe('currentlyViewingShare', () => {
  it('is the fraction of controllers watching right now', () => {
    const changeTimes = {
      a: [],
      b: [10],
      c: [10, 20],
      d: [10],
    };

    // Started watching: a and c are on, b and d are off.
    expect(currentlyViewingShare(changeTimes, true)).toBe(0.5);
    expect(currentlyViewingShare(changeTimes, false)).toBe(0.5);
  });

  it('is zero rather than NaN with nobody in the round', () => {
    expect(currentlyViewingShare({}, true)).toBe(0);
  });
});

describe('totalViewingRate', () => {
  it('averages the rate across every controller', () => {
    const changeTimes = {
      a: [], // watched all 60
      b: [30], // watched the first 30
    };

    expect(totalViewingRate(changeTimes, 60, true)).toBeCloseTo(0.75);
  });

  it('is zero rather than NaN with nobody in the round', () => {
    expect(totalViewingRate({}, 60, true)).toBe(0);
  });
});
