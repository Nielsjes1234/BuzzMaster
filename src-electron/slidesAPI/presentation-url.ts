/**
 * Pure helpers for turning whatever the user pastes into a Google Slides
 * presentation URL. Deliberately free of Electron imports so they can be unit
 * tested without a main-process environment.
 */

export interface PresentationTarget {
  id: string;
  /** True for "publish to web" links, which use a different URL shape. */
  published: boolean;
}

/**
 * Accepts anything the user is likely to paste:
 *   https://docs.google.com/presentation/d/<id>/edit#slide=id.p
 *   https://docs.google.com/presentation/d/<id>/present
 *   https://docs.google.com/presentation/d/e/<id>/pub?start=false
 *   <id>
 */
export function parsePresentation(input: string): PresentationTarget | null {
  const value = input.trim();

  if (value.length === 0) {
    return null;
  }

  const published = /\/presentation\/d\/e\/([a-zA-Z0-9_-]+)/.exec(value);
  if (published?.[1]) {
    return { id: published[1], published: true };
  }

  const standard = /\/presentation\/d\/([a-zA-Z0-9_-]+)/.exec(value);
  if (standard?.[1]) {
    return { id: standard[1], published: false };
  }

  // A bare id pasted without the surrounding URL.
  if (/^[a-zA-Z0-9_-]{20,}$/.test(value)) {
    return { id: value, published: false };
  }

  return null;
}

export function presentationUrl(target: PresentationTarget): string {
  const params = 'start=false&loop=false&rm=minimal';

  return target.published
    ? `https://docs.google.com/presentation/d/e/${target.id}/pub?${params}`
    : `https://docs.google.com/presentation/d/${target.id}/present?${params}`;
}

/**
 * Google redirects to the sign-in flow when a deck is not shared with "anyone
 * with the link". The load itself succeeds, so this is the only way to tell a
 * presentation apart from a login page.
 */
export function isSignInUrl(url: string): boolean {
  return /^https:\/\/accounts\.google\.com\//.test(url);
}
