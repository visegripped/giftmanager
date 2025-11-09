import { describe, it, expect, beforeEach, vi } from 'vitest';
import {
  reportCreate,
  gatherStandardBodyData,
  ReportInput,
} from './reportCreate';

// Mock fetch
global.fetch = vi.fn();

describe('reportCreate', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    sessionStorage.clear();
    sessionStorage.setItem('giftmanager_stid', 'test-stid-123');
  });

  it('should send a report to the reporting API', async () => {
    const mockResponse = {
      data: {
        createReport: {
          id: 1,
          stid: 'test-stid-123',
          report_type: 'info',
        },
      },
    };

    (global.fetch as ReturnType<typeof vi.fn>).mockResolvedValueOnce({
      status: 200,
      json: async () => mockResponse,
    });

    const reportInput: ReportInput = {
      stid: 'test-stid-123',
      report_type: 'info',
      component: 'TestComponent',
      message: 'Test message',
    };

    const result = await reportCreate(reportInput);

    expect(global.fetch).toHaveBeenCalledTimes(1);
    expect(result).toEqual({ success: 'Report created successfully' });
  });

  it('should handle GraphQL errors', async () => {
    const mockResponse = {
      errors: [{ message: 'Test error' }],
    };

    (global.fetch as ReturnType<typeof vi.fn>).mockResolvedValueOnce({
      status: 200,
      json: async () => mockResponse,
    });

    const reportInput: ReportInput = {
      stid: 'test-stid-123',
      report_type: 'error',
      message: 'Test error message',
    };

    const result = await reportCreate(reportInput);

    expect(result?.err).toBeTruthy();
  });

  it('should handle network errors gracefully', async () => {
    (global.fetch as ReturnType<typeof vi.fn>).mockRejectedValueOnce(
      new Error('Network error')
    );

    const reportInput: ReportInput = {
      stid: 'test-stid-123',
      report_type: 'error',
      message: 'Test error message',
    };

    const result = await reportCreate(reportInput);

    expect(result?.err).toContain('Network error');
  });
});

describe('gatherStandardBodyData', () => {
  it('should gather browser data when window is provided', () => {
    const mockWindow = {
      document: {
        location: {
          href: 'http://localhost:3000/test',
        },
      },
      navigator: {
        userAgent: 'Mozilla/5.0 Test',
        cookieEnabled: true,
        platform: 'MacIntel',
        appName: 'Netscape',
      },
      innerWidth: 1920,
      innerHeight: 1080,
    } as unknown as Window;

    const data = gatherStandardBodyData(mockWindow);

    expect(data).toBeDefined();
    expect(data?.pageUrl).toBe('http://localhost:3000/test');
    expect(data?.userAgent).toBe('Mozilla/5.0 Test');
    expect(data?.cookieEnabled).toBe(true);
    expect(data?.viewport).toBe('1920x1080');
    expect(data?.viewportWidth).toBe(1920);
    expect(data?.viewportHeight).toBe(1080);
    expect(data?.platform).toBe('MacIntel');
    expect(data?.localTime).toBeTruthy();
  });

  it('should return undefined if window is not provided', () => {
    const data = gatherStandardBodyData();
    expect(data).toBeUndefined();
  });
});
