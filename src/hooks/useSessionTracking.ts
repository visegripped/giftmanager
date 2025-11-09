import { useState, useEffect } from 'react';

const STID_KEY = 'giftmanager_stid';

/**
 * Generate a UUID v4
 */
function generateUUID(): string {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
    const r = (Math.random() * 16) | 0;
    const v = c === 'x' ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
}

/**
 * Get or create Session Transaction ID (STID)
 * STID persists across page refreshes but resets on browser close (sessionStorage)
 */
export function getSTID(): string {
  if (typeof window === 'undefined') {
    return '';
  }

  let stid = sessionStorage.getItem(STID_KEY);

  if (!stid) {
    stid = generateUUID();
    sessionStorage.setItem(STID_KEY, stid);
  }

  return stid;
}

/**
 * Hook to get the current STID
 * STID is generated on first use and persists in sessionStorage
 */
export function useSessionTracking(): string {
  const [stid, setStid] = useState<string>('');

  useEffect(() => {
    setStid(getSTID());
  }, []);

  return stid;
}

export default useSessionTracking;
