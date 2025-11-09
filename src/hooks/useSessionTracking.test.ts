import { describe, it, expect, beforeEach, vi } from 'vitest';
import { renderHook } from '@testing-library/react';
import { useSessionTracking, getSTID } from './useSessionTracking';

describe('useSessionTracking', () => {
  beforeEach(() => {
    sessionStorage.clear();
  });

  describe('getSTID', () => {
    it('should generate a new STID if none exists', () => {
      const stid = getSTID();
      expect(stid).toBeTruthy();
      expect(stid).toMatch(
        /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i
      );
    });

    it('should return the same STID on subsequent calls', () => {
      const stid1 = getSTID();
      const stid2 = getSTID();
      expect(stid1).toBe(stid2);
    });

    it('should persist STID in sessionStorage', () => {
      const stid = getSTID();
      const stored = sessionStorage.getItem('giftmanager_stid');
      expect(stored).toBe(stid);
    });

    it('should use existing STID from sessionStorage', () => {
      const existingSTID = 'existing-stid-12345';
      sessionStorage.setItem('giftmanager_stid', existingSTID);
      const stid = getSTID();
      expect(stid).toBe(existingSTID);
    });
  });

  describe('useSessionTracking hook', () => {
    it('should return a valid STID', () => {
      const { result } = renderHook(() => useSessionTracking());
      expect(result.current).toBeTruthy();
      expect(typeof result.current).toBe('string');
    });

    it('should return the same STID across multiple renders', () => {
      const { result, rerender } = renderHook(() => useSessionTracking());
      const firstSTID = result.current;
      rerender();
      expect(result.current).toBe(firstSTID);
    });
  });
});
