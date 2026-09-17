import { acceptHMRUpdate, defineStore } from 'pinia';
import { computed, ref } from 'vue';
import { useBuzzer } from '@/plugins/buzzer';
import type { LeaderboardEntry } from '@/../common/gameState/LeaderboardState';
import type { RemoteAction } from '@/../common/RemoteAPI';

export type Leaderboard = LeaderboardEntry[];

/** The raw score table, as it stands or as it stood. */
type PointsSnapshot = Record<string, number>;

/**
 * Who moved the points. The game-mode buttons each keep a private record of
 * what they last granted so they can refund it when the host changes their
 * mind, and an undo can invalidate that record — but only if the undo took
 * back that component's own grant. Undoing a manual correction, or a reset,
 * leaves every other component's bookkeeping perfectly valid, so the origin
 * has to travel with the change.
 */
export type PointsOrigin = 'quiz' | 'buzzer' | 'stopwatch' | 'manual' | 'reset';

export const useLeaderboardStore = defineStore('leaderboard', () => {
  const { controllers } = useBuzzer();

  const controllerPoints = ref<PointsSnapshot>({});

  const leaderboard = computed<LeaderboardEntry[]>(() => {
    const entries = controllers.value
      .map((controller) => ({
        id: controller.id,
        name: controller.name,
        value: controllerPoints.value[controller.id] ?? 0,
        position: 0,
      }))
      .sort((a, b) => b.value - a.value);

    // Set the position for each element
    entries.forEach((entry, index) => {
      // Same position for entries with same value
      entry.position =
        index === 0 || entry.value !== entries[index - 1]!.value
          ? index + 1
          : entries[index - 1]!.position;
    });

    return entries;
  });

  /* -------------------------------------------------------------------------
   * Undo
   * -------------------------------------------------------------------------
   * One step back, and deliberately only one. A host who has just awarded the
   * wrong answer needs the board put back where it was a second ago; a host
   * who needs to walk back through five rounds has a bigger problem than a
   * button can solve, and a growing stack of half-remembered states is harder
   * to reason about under stage pressure than no stack at all.
   *
   * The snapshot lives here rather than at the call sites because there are
   * six of them — three game modes, two dialogs and the phone — and every one
   * of them would otherwise need its own copy of this logic, which is how the
   * colour tables ended up duplicated four times.
   * ---------------------------------------------------------------------- */

  const previousPoints = ref<PointsSnapshot | undefined>(undefined);
  const previousOrigin = ref<PointsOrigin | undefined>(undefined);

  /**
   * Awarding points is rarely a single write. The quiz and stopwatch buttons
   * refund everything they granted for the previous selection and then grant
   * the new amounts, so one press of one button can be a dozen calls to
   * `addPoints`. Treating each of those as a step would mean twelve presses of
   * undo to walk back one press of a colour.
   *
   * Everything that happens before control returns to the event loop is
   * therefore one action. All five call sites do their refund-and-regrant
   * synchronously, so this holds without any of them knowing about it.
   */
  let pendingSnapshot: PointsSnapshot | undefined;
  let pendingOrigin: PointsOrigin = 'manual';

  function rememberForUndo(origin: PointsOrigin): void {
    if (pendingSnapshot !== undefined) {
      return;
    }

    pendingSnapshot = { ...controllerPoints.value };
    pendingOrigin = origin;

    queueMicrotask(() => {
      const before = pendingSnapshot;
      const committedOrigin = pendingOrigin;
      pendingSnapshot = undefined;

      if (before === undefined || sameScores(before, controllerPoints.value)) {
        // Nothing actually moved. A round played for zero points still runs
        // the whole refund-and-regrant dance, and offering to undo it would be
        // offering to undo nothing.
        return;
      }

      previousPoints.value = before;
      previousOrigin.value = committedOrigin;
    });
  }

  function sameScores(a: PointsSnapshot, b: PointsSnapshot): boolean {
    const ids = new Set([...Object.keys(a), ...Object.keys(b)]);

    for (const id of ids) {
      if ((a[id] ?? 0) !== (b[id] ?? 0)) {
        return false;
      }
    }

    return true;
  }

  const canUndo = computed<boolean>(() => previousPoints.value !== undefined);

  /**
   * Bumped by every undo, and paired with the origin of the change that was
   * taken back. The game-mode buttons watch the counter and forget their own
   * refund record when the origin is theirs: after an undo that record
   * describes points which are no longer on the board, and refunding them a
   * second time would quietly take them off twice.
   */
  const undoCount = ref<number>(0);
  const undoneOrigin = ref<PointsOrigin | undefined>(undefined);

  function undo(): void {
    const snapshot = previousPoints.value;
    if (snapshot === undefined) {
      return;
    }

    // The current values are deliberately not kept. With a single step of
    // history, an undoable undo is a flip-flop rather than a second step back,
    // and a button that alternates between two boards is worse than one that
    // greys out once it has nothing left to do.
    undoneOrigin.value = previousOrigin.value;
    previousPoints.value = undefined;
    previousOrigin.value = undefined;
    controllerPoints.value = { ...snapshot };
    undoCount.value += 1;
  }

  /* ---------------------------------------------------------------------- */

  const addPoints = (
    controllerId: string,
    points: number,
    origin: PointsOrigin = 'manual',
  ) => {
    rememberForUndo(origin);
    controllerPoints.value[controllerId] ??= 0;
    controllerPoints.value[controllerId] += points;
  };

  const updatePoints = (
    controllerId: string,
    points: number,
    origin: PointsOrigin = 'manual',
  ) => {
    rememberForUndo(origin);
    controllerPoints.value[controllerId] = points;
  };

  const resetPoints = () => {
    rememberForUndo('reset');
    controllerPoints.value = {};
  };

  // Handle incoming remote actions
  if (typeof window !== 'undefined') {
    window.addEventListener('remote-action', ((
      e: CustomEvent<RemoteAction>,
    ) => {
      const { action, payload } = e.detail;
      if (action === 'leaderboardStore:addPoints') {
        const { controllerId, points } = payload as {
          controllerId: string;
          points: number;
        };
        addPoints(controllerId, points);
      } else if (action === 'leaderboardStore:updatePoints') {
        const { controllerId, points } = payload as {
          controllerId: string;
          points: number;
        };
        updatePoints(controllerId, points);
      } else if (action === 'leaderboardStore:resetPoints') {
        resetPoints();
      } else if (action === 'leaderboardStore:undo') {
        undo();
      }
    }) as EventListener);
  }

  return {
    leaderboard,
    canUndo,
    undoCount,
    undoneOrigin,

    addPoints,
    updatePoints,
    resetPoints,
    undo,
  };
});

if (import.meta.hot) {
  import.meta.hot.accept(acceptHMRUpdate(useLeaderboardStore, import.meta.hot));
}
