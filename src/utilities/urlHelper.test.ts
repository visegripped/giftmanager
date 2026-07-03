import { describe, it, expect, vi, afterEach } from 'vitest';
import { getApiUrl, getReportingUrl } from './urlHelper';

describe('urlHelper', () => {
  afterEach(() => {
    vi.unstubAllEnvs();
  });

  describe('getApiUrl', () => {
    it('should return /api by default', () => {
      vi.stubEnv('NEXT_PUBLIC_API_URL', '');
      expect(getApiUrl()).toBe('/api');
    });

    it('should return env override when set', () => {
      vi.stubEnv('NEXT_PUBLIC_API_URL', '/custom-api');
      expect(getApiUrl()).toBe('/custom-api');
    });
  });

  describe('getReportingUrl', () => {
    it('should return /api/reporting by default', () => {
      vi.stubEnv('NEXT_PUBLIC_REPORTING_API_URL', '');
      expect(getReportingUrl()).toBe('/api/reporting');
    });

    it('should return env override when set', () => {
      vi.stubEnv('NEXT_PUBLIC_REPORTING_API_URL', '/custom-reporting');
      expect(getReportingUrl()).toBe('/custom-reporting');
    });
  });
});
