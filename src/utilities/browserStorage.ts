export function getLocalStorageItem(key: string, defaultValue = ''): string {
  if (typeof window === 'undefined') {
    return defaultValue;
  }

  return localStorage.getItem(key) ?? defaultValue;
}
