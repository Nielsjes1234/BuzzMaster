import { describe, it, expect } from 'vitest';
import {
  isSignInUrl,
  parsePresentation,
  presentationUrl,
} from '@/../src-electron/slidesAPI/presentation-url';

const ID = '1AbC_defGHIjklmnopQRstuvWXyz0123456789';
const PUBLISHED_ID = '2PACX-1vABCdefGHIjklMNOpqrSTU';

describe('parsePresentation', () => {
  it('reads the id from an edit link', () => {
    expect(
      parsePresentation(
        `https://docs.google.com/presentation/d/${ID}/edit#slide=id.p1`,
      ),
    ).toEqual({ id: ID, published: false });
  });

  it('reads the id from a present link', () => {
    expect(
      parsePresentation(`https://docs.google.com/presentation/d/${ID}/present`),
    ).toEqual({ id: ID, published: false });
  });

  it('recognises a published-to-web link', () => {
    expect(
      parsePresentation(
        `https://docs.google.com/presentation/d/e/${PUBLISHED_ID}/pub?start=false&loop=false`,
      ),
    ).toEqual({ id: PUBLISHED_ID, published: true });
  });

  it('accepts a bare id and trims surrounding whitespace', () => {
    expect(parsePresentation(`  ${ID}  `)).toEqual({
      id: ID,
      published: false,
    });
  });

  it.each([
    ['an empty string', ''],
    ['whitespace only', '   '],
    ['an unrelated URL', 'https://example.com/presentation'],
    ['free text', 'my quiz deck'],
    ['a too-short id', 'abc123'],
  ])('returns null for %s', (_label, input) => {
    expect(parsePresentation(input)).toBeNull();
  });
});

describe('presentationUrl', () => {
  it('builds a present URL for a normal deck', () => {
    expect(presentationUrl({ id: ID, published: false })).toBe(
      `https://docs.google.com/presentation/d/${ID}/present?start=false&loop=false&rm=minimal`,
    );
  });

  it('builds a pub URL for a published deck', () => {
    expect(presentationUrl({ id: PUBLISHED_ID, published: true })).toBe(
      `https://docs.google.com/presentation/d/e/${PUBLISHED_ID}/pub?start=false&loop=false&rm=minimal`,
    );
  });

  it('round-trips a pasted link', () => {
    const target = parsePresentation(
      `https://docs.google.com/presentation/d/${ID}/edit`,
    );

    expect(target).not.toBeNull();
    expect(presentationUrl(target!)).toContain(`/presentation/d/${ID}/present`);
  });
});

describe('isSignInUrl', () => {
  it('detects the Google sign-in redirect', () => {
    expect(
      isSignInUrl('https://accounts.google.com/ServiceLogin?continue=...'),
    ).toBe(true);
  });

  it('leaves a presentation URL alone', () => {
    expect(
      isSignInUrl(`https://docs.google.com/presentation/d/${ID}/present`),
    ).toBe(false);
  });

  it('does not match a look-alike host', () => {
    expect(isSignInUrl('https://accounts.google.com.evil.test/')).toBe(false);
  });
});
