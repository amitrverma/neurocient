import { describe, expect, it } from 'vitest';
import { slugifyTag, unslugifyTag } from '../src/app/utils/slug';

describe('slug utilities', () => {
  it('slugifyTag converts to kebab-case', () => {
    expect(slugifyTag('The Modern Caveman')).toBe('the-modern-caveman');
  });

  it('unslugifyTag reverses slugifyTag', () => {
    const original = 'The Modern Caveman';
    expect(unslugifyTag(slugifyTag(original))).toBe('the modern caveman');
  });
});
