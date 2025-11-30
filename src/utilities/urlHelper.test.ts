import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { normalizeUrl, getApiUrl, getReportingUrl } from './urlHelper';

describe('urlHelper', () => {
  let originalWindow: Window | undefined;
  let mockWindow: Partial<Window>;

  beforeEach(() => {
    // Save original window
    originalWindow = global.window;

    // Create mock window with location
    mockWindow = {
      location: {
        protocol: 'https:',
        href: 'https://localhost:5174',
      } as Location,
    };

    // Mock window object
    global.window = mockWindow as Window;
  });

  afterEach(() => {
    // Restore original window
    if (originalWindow) {
      global.window = originalWindow;
    } else {
      delete (global as any).window;
    }
  });

  describe('normalizeUrl', () => {
    it('should return relative path for localhost URLs (uses Vite proxy)', () => {
      const result = normalizeUrl('http://localhost:8081/api.php');
      expect(result).toBe('/api.php');
    });

    it('should return relative path for localhost HTTPS URLs', () => {
      const result = normalizeUrl('https://localhost:8081/api.php');
      expect(result).toBe('/api.php');
    });

    it('should return relative path for protocol-relative localhost URLs', () => {
      const result = normalizeUrl('//localhost:8081/api.php');
      expect(result).toBe('/api.php');
    });

    it('should return relative path for localhost without protocol', () => {
      const result = normalizeUrl('localhost:8081/api.php');
      expect(result).toBe('/api.php');
    });

    it('should return relative path for 127.0.0.1 URLs', () => {
      const result = normalizeUrl('http://127.0.0.1:8081/api.php');
      expect(result).toBe('/api.php');
    });

    it('should use protocol-relative URL for non-localhost URLs', () => {
      const result = normalizeUrl('//gm.visegripped.com/api.php');
      expect(result).toBe('https://gm.visegripped.com/api.php');
    });

    it('should handle empty string', () => {
      const result = normalizeUrl('');
      expect(result).toBe('');
    });

    it('should handle URLs without path (returns original URL as fallback)', () => {
      // URLs without a path component return original URL as fallback
      const result = normalizeUrl('//localhost:8081');
      expect(result).toBe('//localhost:8081');
    });
  });

  describe('getApiUrl', () => {
    it('should return relative path for localhost URLs (uses Vite proxy)', () => {
      vi.stubEnv('VITE_API_URL', '//localhost:8081/api.php');
      const result = getApiUrl();
      expect(result).toBe('/api.php');
      vi.unstubAllEnvs();
    });

    it('should fallback to production URL when env var is not set', () => {
      vi.stubEnv('VITE_API_URL', undefined);
      const result = getApiUrl();
      expect(result).toBe('https://gm.visegripped.com/api.php');
      vi.unstubAllEnvs();
    });

    it('should return relative path for localhost http:// URLs', () => {
      vi.stubEnv('VITE_API_URL', 'http://localhost:8081/api.php');
      const result = getApiUrl();
      expect(result).toBe('/api.php');
      vi.unstubAllEnvs();
    });
  });

  describe('getReportingUrl', () => {
    it('should return relative path for localhost URLs (uses Vite proxy)', () => {
      vi.stubEnv('VITE_REPORTING_API_URL', '//localhost:8081/reporting.php');
      const result = getReportingUrl();
      expect(result).toBe('/reporting.php');
      vi.unstubAllEnvs();
    });

    it('should return empty string when env var is not set', () => {
      vi.stubEnv('VITE_REPORTING_API_URL', undefined);
      const result = getReportingUrl();
      expect(result).toBe('');
      vi.unstubAllEnvs();
    });

    it('should return relative path for localhost http:// URLs', () => {
      vi.stubEnv(
        'VITE_REPORTING_API_URL',
        'http://localhost:8081/reporting.php'
      );
      const result = getReportingUrl();
      expect(result).toBe('/reporting.php');
      vi.unstubAllEnvs();
    });
  });
});
