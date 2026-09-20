import { describe, expect, it } from 'vitest';
import { castIsTransparent } from '@/components/cast/castAppearance';

describe('cast appearance', () => {
  it.each([
    { manual: false, presentation: false, expected: false },
    { manual: true, presentation: false, expected: true },
    { manual: false, presentation: true, expected: true },
    { manual: true, presentation: true, expected: true },
  ])(
    'resolves manual=$manual and presentation=$presentation',
    ({ manual, presentation, expected }) => {
      expect(castIsTransparent(manual, presentation)).toBe(expected);
    },
  );

  it('restores the manual choice after a presentation closes', () => {
    const manual = false;

    expect(castIsTransparent(manual, true)).toBe(true);
    expect(castIsTransparent(manual, false)).toBe(false);
  });

  it('keeps manual transparency after a presentation closes', () => {
    const manual = true;

    expect(castIsTransparent(manual, true)).toBe(true);
    expect(castIsTransparent(manual, false)).toBe(true);
  });
});
