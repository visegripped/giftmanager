import { describe, it, expect } from 'vitest';
import { ADMIN_USER_ID, isAdminUser } from './admin';

describe('isAdminUser', () => {
  it('returns true for the admin userid', () => {
    expect(isAdminUser(58627)).toBe(true);
    expect(isAdminUser('58627')).toBe(true);
  });

  it('returns false for other userids', () => {
    expect(isAdminUser(1)).toBe(false);
    expect(isAdminUser('2')).toBe(false);
  });

  it('returns false for empty or missing userid', () => {
    expect(isAdminUser(undefined)).toBe(false);
    expect(isAdminUser(null)).toBe(false);
    expect(isAdminUser('')).toBe(false);
  });

  it('exports the expected admin userid', () => {
    expect(ADMIN_USER_ID).toBe('58627');
  });
});
