import { describe, it, expect, beforeEach, vi } from 'vitest';
import { startAPICall, endAPICall, trackPageLoad } from './performanceTracker';
import * as reportCreateModule from './reportCreate';

// Mock reportCreate
vi.mock('./reportCreate', () => ({
  reportCreate: vi.fn().mockResolvedValue({ success: true }),
}));

// Mock getSTID
vi.mock('../hooks/useSessionTracking', () => ({
  getSTID: vi.fn().mockReturnValue('test-stid-123'),
}));

describe('performanceTracker', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('startAPICall', () => {
    it('should return a unique call ID', () => {
      const callId1 = startAPICall('/api/test', 'GET');
      const callId2 = startAPICall('/api/test2', 'POST');

      expect(callId1).toBeTruthy();
      expect(callId2).toBeTruthy();
      expect(callId1).not.toBe(callId2);
    });
  });

  describe('endAPICall', () => {
    it('should track successful API calls', async () => {
      const callId = startAPICall('/api/test', 'GET');

      // Wait a bit to simulate API call duration
      await new Promise((resolve) => setTimeout(resolve, 10));

      endAPICall(
        callId,
        200,
        'OK',
        undefined,
        { param: 'value' },
        { result: 'success' }
      );

      expect(reportCreateModule.reportCreate).toHaveBeenCalledWith(
        expect.objectContaining({
          stid: 'test-stid-123',
          report_type: 'performance',
          message: expect.stringContaining('GET /api/test'),
          performance_metrics: expect.objectContaining({
            status: 200,
            statusText: 'OK',
            method: 'GET',
            url: '/api/test',
          }),
          request_data: { param: 'value' },
          response_data: { result: 'success' },
        })
      );
    });

    it('should track failed API calls as errors', () => {
      const callId = startAPICall('/api/test', 'POST');

      endAPICall(
        callId,
        500,
        'Internal Server Error',
        'API failed',
        {},
        undefined
      );

      expect(reportCreateModule.reportCreate).toHaveBeenCalledWith(
        expect.objectContaining({
          report_type: 'error',
          message: expect.stringContaining('failed'),
          performance_metrics: expect.objectContaining({
            error: 'API failed',
          }),
        })
      );
    });

    it('should handle invalid call IDs gracefully', () => {
      endAPICall('invalid-call-id', 200, 'OK');

      // Should not throw or call reportCreate
      expect(reportCreateModule.reportCreate).not.toHaveBeenCalled();
    });
  });

  describe('trackPageLoad', () => {
    it('should track page load performance metrics', () => {
      // Mock performance API
      const mockPerformance = {
        timing: {
          navigationStart: 0,
          domContentLoadedEventEnd: 1000,
          loadEventEnd: 2000,
          domInteractive: 800,
          domLoading: 500,
          domainLookupEnd: 100,
          domainLookupStart: 50,
          connectEnd: 200,
          connectStart: 150,
          requestStart: 250,
          responseStart: 300,
          responseEnd: 600,
          domComplete: 1500,
        },
        navigation: {
          type: 0,
          redirectCount: 0,
        },
        getEntriesByType: vi.fn().mockReturnValue([]),
      };

      global.performance = mockPerformance as unknown as Performance;

      trackPageLoad();

      expect(reportCreateModule.reportCreate).toHaveBeenCalledWith(
        expect.objectContaining({
          report_type: 'performance',
          component: 'PageLoad',
          message: 'Page load performance metrics',
          performance_metrics: expect.objectContaining({
            domContentLoaded: expect.any(Number),
            loadComplete: expect.any(Number),
          }),
        })
      );
    });
  });
});
