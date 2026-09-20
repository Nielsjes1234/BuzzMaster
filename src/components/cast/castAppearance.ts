/**
 * A presentation needs the cast surface to be transparent, but it must not
 * overwrite the user's own transparency preference. Closing the presentation
 * can then restore exactly the mode that was active before it opened.
 */
export function castIsTransparent(
  manuallyTransparent: boolean,
  presentationActive: boolean,
): boolean {
  return manuallyTransparent || presentationActive;
}
