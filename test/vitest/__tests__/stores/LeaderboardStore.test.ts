import { describe, it, expect, vi, beforeEach } from 'vitest';
import { createPinia, setActivePinia } from 'pinia';
import { nextTick } from 'vue';

/*
 * A stand-in for the buzzer plugin's reactive controller list. It is a plain
 * box rather than a `ref` because `vi.hoisted` runs before the module imports
 * it would need, and the leaderboard is recomputed by its points anyway: the
 * controllers are set once per test and then left alone.
 */
const { controllers } = vi.hoisted(() => ({
  controllers: { value: [] as { id: string; name: string }[] },
}));

vi.mock('@/plugins/buzzer', () => ({
  useBuzzer: () => ({ controllers }),
}));

import { useLeaderboardStore } from '@/stores/leaderboard-store';

/**
 * The undo snapshot is committed in a microtask, so that everything one button
 * press does counts as a single step. Tests have to let that microtask run
 * before asking whether there is anything to undo.
 */
async function settle(): Promise<void> {
  await nextTick();
}

function scores(store: ReturnType<typeof useLeaderboardStore>) {
  return Object.fromEntries(
    store.leaderboard.map((entry) => [entry.id, entry.value]),
  );
}

function dispatchRemoteAction(action: string, payload?: unknown) {
  window.dispatchEvent(
    new CustomEvent('remote-action', { detail: { action, payload } }),
  );
}

describe('leaderboard store', () => {
  beforeEach(() => {
    setActivePinia(createPinia());
    controllers.value = [
      { id: 'a', name: 'Anna' },
      { id: 'b', name: 'Bram' },
      { id: 'c', name: 'Cas' },
    ];
  });

  it('ranks by points and shares a position on a tie', () => {
    const store = useLeaderboardStore();

    store.addPoints('a', 5);
    store.addPoints('b', 5);
    store.addPoints('c', 1);

    expect(store.leaderboard.map((entry) => entry.position)).toEqual([1, 1, 3]);
  });

  it('has nothing to undo before anything has been scored', () => {
    const store = useLeaderboardStore();

    expect(store.canUndo).toBe(false);
  });

  it('puts the scores back to before the last award', async () => {
    const store = useLeaderboardStore();

    store.addPoints('a', 3);
    await settle();

    store.addPoints('a', 10);
    await settle();

    expect(store.canUndo).toBe(true);

    store.undo();

    expect(scores(store)).toMatchObject({ a: 3 });
  });

  it('treats everything one button press does as a single step', async () => {
    const store = useLeaderboardStore();

    store.addPoints('a', 4);
    store.addPoints('b', 4);
    await settle();

    // A refund-and-regrant, exactly as the quiz and stopwatch buttons do it:
    // several writes, no await between them.
    store.addPoints('a', -4);
    store.addPoints('b', -4);
    store.addPoints('a', 10);
    store.addPoints('c', 10);
    await settle();

    store.undo();

    expect(scores(store)).toMatchObject({ a: 4, b: 4, c: 0 });
    expect(store.canUndo).toBe(false);
  });

  it('does not offer to undo a change that moved nothing', async () => {
    const store = useLeaderboardStore();

    // A round played for zero points still runs the whole refund-and-regrant
    // dance; there is nothing there to take back.
    store.addPoints('a', 0);
    store.addPoints('b', 0);
    await settle();

    expect(store.canUndo).toBe(false);
  });

  it('restores every score when a reset is undone', async () => {
    const store = useLeaderboardStore();

    store.addPoints('a', 7);
    store.addPoints('b', 2);
    await settle();

    store.resetPoints();
    await settle();

    expect(scores(store)).toMatchObject({ a: 0, b: 0 });

    store.undo();

    expect(scores(store)).toMatchObject({ a: 7, b: 2 });
  });

  it('goes back one step and no further', async () => {
    const store = useLeaderboardStore();

    store.addPoints('a', 1);
    await settle();
    store.addPoints('a', 1);
    await settle();
    store.addPoints('a', 1);
    await settle();

    store.undo();
    expect(scores(store)).toMatchObject({ a: 2 });

    // The undo itself is not a step: a single-step history that can undo its
    // own undo is a flip-flop between two boards.
    expect(store.canUndo).toBe(false);
    store.undo();
    expect(scores(store)).toMatchObject({ a: 2 });
  });

  it('reports which kind of change was taken back', async () => {
    const store = useLeaderboardStore();

    store.addPoints('a', 5, 'quiz');
    await settle();

    store.undo();

    expect(store.undoneOrigin).toBe('quiz');
    expect(store.undoCount).toBe(1);
  });

  it('reports a manual correction as manual, not as the game that scored it', async () => {
    const store = useLeaderboardStore();

    store.addPoints('a', 5, 'quiz');
    await settle();

    store.updatePoints('a', 99);
    await settle();

    store.undo();

    // The buttons that keep their own refund record use this to decide whether
    // that record survived the undo. Here the quiz award is still on the board,
    // so it must not be reported as the thing undone.
    expect(store.undoneOrigin).toBe('manual');
    expect(scores(store)).toMatchObject({ a: 5 });
  });

  it('undoes from the phone', async () => {
    const store = useLeaderboardStore();

    store.addPoints('a', 8);
    await settle();

    dispatchRemoteAction('leaderboardStore:undo');

    expect(scores(store)).toMatchObject({ a: 0 });
  });
});
