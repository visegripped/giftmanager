import { describe, it, beforeEach, vi, expect } from 'vitest';
import { gatherStandardBodyData, postReport } from './postReport';
import { getReportingUrl } from './urlHelper';

const reportingUrl = getReportingUrl();

describe('gatherStandardBodyData', () => {
  it('should gather standard body data correctly', () => {
    const mockWindow = {
      document: { location: { href: 'https://example.com' } },
      navigator: {
        userAgent: 'Mozilla/5.0',
        cookieEnabled: true,
        platform: 'Win32',
        appName: 'Netscape',
      },
      innerWidth: 1024,
      innerHeight: 768,
    };

    const bodyData = gatherStandardBodyData(mockWindow);
    expect(bodyData).toEqual({
      pageUrl: 'https://example.com',
      userAgent: 'Mozilla/5.0',
      cookieEnabled: true,
      viewport: '1024x768',
      platform: 'Win32',
      appName: 'Netscape',
      localTime: expect.any(String), // As the time will be dynamic
    });
  });

  it('should return undefined if win is not provided', () => {
    const bodyData = gatherStandardBodyData(undefined);
    expect(bodyData).toBeUndefined();
  });
});

describe('postReport', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it('should send a report successfully', async () => {
    const mockResponse = { json: vi.fn().mockResolvedValue({ err: null }) };
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue({
        ...mockResponse,
        status: 200,
      })
    );

    const reportData = {
      report: 'Sample Report',
      type: 'error',
      body: { additionalInfo: 'Some info' },
    };

    const result = await postReport(reportData);

    expect(fetch).toHaveBeenCalledWith(reportingUrl, expect.any(Object));
    expect(mockResponse.json).toHaveBeenCalled();
    expect(result).toEqual({ err: null });
  });

  it('should log an error for non-20X responses', async () => {
    const consoleSpy = vi.spyOn(console, 'log').mockImplementation(() => {});
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue({ status: 500 }));

    const reportData = {
      report: 'Sample Report',
      type: 'error',
      body: { additionalInfo: 'Some info' },
    };

    const result = await postReport(reportData);

    expect(consoleSpy).toHaveBeenCalledWith(
      'ERROR IN REPORTING: response was non 20X'
    );
    expect(result).toBeUndefined(); // Expecting jsonPayload to be undefined due to the early return
  });

  it('should log an error when jsonPayload contains an error', async () => {
    const consoleSpy = vi.spyOn(console, 'log').mockImplementation(() => {});
    const mockResponse = {
      json: vi.fn().mockResolvedValue({ err: 'Some error' }),
    };
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue({
        ...mockResponse,
        status: 200,
      })
    );

    const reportData = {
      report: 'Sample Report',
      type: 'error',
      body: { additionalInfo: 'Some info' },
    };

    const result = await postReport(reportData);

    expect(consoleSpy).toHaveBeenCalledWith('ERROR IN REPORTING: Some error');
    expect(result).toEqual({ err: 'Some error' });
  });

  it('should log an error when no jsonPayload is present', async () => {
    const consoleSpy = vi.spyOn(console, 'log').mockImplementation(() => {});
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue({ status: 204, json: () => {} })
    );

    const reportData = {
      report: 'Sample Report',
      type: 'error',
      body: { additionalInfo: 'Some info' },
    };

    const result = await postReport(reportData);

    expect(consoleSpy).toHaveBeenCalledWith(
      'ERROR IN REPORTING: no json payload in response'
    );
    expect(result).toBeUndefined();
  });
});
