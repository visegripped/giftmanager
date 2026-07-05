import { describe, it, expect, beforeEach } from 'vitest';
import { getLocalStorageItem } from './browserStorage';

describe('getLocalStorageItem', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('returns stored values in the browser', () => {
    localStorage.setItem('access_token', 'stored-token');

    expect(getLocalStorageItem('access_token')).toBe('stored-token');
  });

  it('returns the default value when a key is missing', () => {
    expect(getLocalStorageItem('missing-key', 'fallback')).toBe('fallback');
  });
});
