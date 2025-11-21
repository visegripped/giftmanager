import { describe, it, expect, beforeEach, vi } from 'vitest';
import { graphqlRequest, getReports, getReportStats } from './graphqlClient';

// Mock fetch
global.fetch = vi.fn();

describe('graphqlClient', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('graphqlRequest', () => {
    it('should make a GraphQL request', async () => {
      const mockResponse = {
        data: { test: 'value' },
      };

      (global.fetch as ReturnType<typeof vi.fn>).mockResolvedValueOnce({
        ok: true,
        status: 200,
        json: async () => mockResponse,
      });

      const result = await graphqlRequest('query { test }');

      expect(global.fetch).toHaveBeenCalledTimes(1);
      expect(result.data).toEqual({ test: 'value' });
    });

    it('should handle GraphQL errors', async () => {
      const mockResponse = {
        errors: [{ message: 'Test error' }],
      };

      (global.fetch as ReturnType<typeof vi.fn>).mockResolvedValueOnce({
        ok: true,
        status: 200,
        json: async () => mockResponse,
      });

      const result = await graphqlRequest('query { test }');

      expect(result.errors).toBeDefined();
      expect(result.errors?.[0].message).toBe('Test error');
    });

    it('should handle network errors', async () => {
      (global.fetch as ReturnType<typeof vi.fn>).mockRejectedValueOnce(
        new Error('Network error')
      );

      await expect(graphqlRequest('query { test }')).rejects.toThrow(
        'Network error'
      );
    });

    it('should handle HTTP errors', async () => {
      (global.fetch as ReturnType<typeof vi.fn>).mockResolvedValueOnce({
        ok: false,
        status: 500,
      });

      await expect(graphqlRequest('query { test }')).rejects.toThrow(
        'HTTP error'
      );
    });
  });

  describe('getReports', () => {
    it('should query reports with filters', async () => {
      const mockResponse = {
        data: {
          getReports: {
            reports: [{ id: 1, message: 'Test report' }],
            count: 1,
          },
        },
      };

      (global.fetch as ReturnType<typeof vi.fn>).mockResolvedValueOnce({
        ok: true,
        status: 200,
        json: async () => mockResponse,
      });

      const result = await getReports(
        { userid: 1, report_type: 'error' },
        { limit: 10, offset: 0 }
      );

      expect(result.data?.getReports.reports).toHaveLength(1);
      expect(result.data?.getReports.count).toBe(1);
    });
  });

  describe('getReportStats', () => {
    it('should query report statistics', async () => {
      const mockResponse = {
        data: {
          getReportStats: [
            {
              report_type: 'error',
              count: 5,
              unique_users: 2,
              unique_sessions: 3,
            },
          ],
        },
      };

      (global.fetch as ReturnType<typeof vi.fn>).mockResolvedValueOnce({
        ok: true,
        status: 200,
        json: async () => mockResponse,
      });

      const result = await getReportStats({ userid: 1 });

      expect(result.data?.getReportStats).toHaveLength(1);
      expect(result.data?.getReportStats[0].count).toBe(5);
    });
  });
});
