/**
 * The arithmetic behind the viewing-rate game, kept free of Vue and of the
 * settings store so that the host's page and the cast screen compute the same
 * numbers from the same code. The alternative — each screen deriving it from
 * `changeTimes` on its own — is how four separate copies of the buzzer colour
 * table came to disagree with each other.
 *
 * A controller's red button toggles "watching". `changeTimes` records the
 * moment of every toggle, so whether someone is watching right now is a
 * question of how many times they have toggled and what they were doing at the
 * start of the round.
 */

/** Is this controller watching at the moment, given its toggle history? */
export function isViewing(changes: number[], startViewing: boolean): boolean {
  const viewingMod = startViewing ? 0 : 1;

  return changes.length % 2 === viewingMod;
}

/**
 * The fraction of the round so far that this controller spent watching, as a
 * number between 0 and 1. Walks the toggles in order, adding up the stretches
 * that fell on the watching side, and closes the final stretch at `time`.
 */
export function viewingRate(
  changes: number[],
  time: number,
  startViewing: boolean,
): number {
  if (time <= 0) {
    return 0;
  }

  let totalWatchTime = 0;
  let watching = startViewing;
  let prevTime = 0;

  for (const changeTime of changes) {
    if (watching) {
      totalWatchTime += changeTime - prevTime;
    }

    watching = !watching;
    prevTime = changeTime;
  }

  if (watching) {
    totalWatchTime += time - prevTime;
  }

  return totalWatchTime / time;
}

/** The share of controllers watching right now, as a number between 0 and 1. */
export function currentlyViewingShare(
  changeTimes: Record<string, number[]>,
  startViewing: boolean,
): number {
  const values = Object.values(changeTimes);

  if (values.length === 0) {
    return 0;
  }

  return (
    values.filter((changes) => isViewing(changes, startViewing)).length /
    values.length
  );
}

/** The average viewing rate across every controller in the round. */
export function totalViewingRate(
  changeTimes: Record<string, number[]>,
  time: number,
  startViewing: boolean,
): number {
  const values = Object.values(changeTimes);

  if (values.length === 0) {
    return 0;
  }

  return (
    values
      .map((changes) => viewingRate(changes, time, startViewing))
      .reduce((total, rate) => total + rate, 0) / values.length
  );
}
