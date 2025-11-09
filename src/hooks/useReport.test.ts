import { describe, it, expect, beforeEach, vi } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useReport } from './useReport';
import * as reportCreateModule from '../utilities/reportCreate';

// Mock reportCreate
vi.mock('../utilities/reportCreate', () => ({
  reportCreate: vi.fn().mockResolvedValue({ success: true }),
}));

// Mock getSTID
vi.mock('./useSessionTracking', () => ({
  getSTID: vi.fn().mockReturnValue('test-stid-123'),
}));

describe('useReport', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should provide createReport function', () => {
    const { result } = renderHook(() => useReport());
    expect(result.current.createReport).toBeDefined();
    expect(typeof result.current.createReport).toBe('function');
  });

  it('should create a report with the correct parameters', async () => {
    const { result } = renderHook(() => useReport());

    await act(async () => {
      await result.current.createReport('info', 'Test message', {
        component: 'TestComponent',
      });
    });

    expect(reportCreateModule.reportCreate).toHaveBeenCalledWith(
      expect.objectContaining({
        stid: 'test-stid-123',
        report_type: 'info',
        message: 'Test message',
        component: 'TestComponent',
      })
    );
  });

  it('should provide convenience methods for different report types', () => {
    const { result } = renderHook(() => useReport());

    expect(result.current.reportError).toBeDefined();
    expect(result.current.reportWarning).toBeDefined();
    expect(result.current.reportInfo).toBeDefined();
    expect(result.current.reportDebug).toBeDefined();
    expect(result.current.reportPerformance).toBeDefined();
  });

  it('should use reportError to create error reports', async () => {
    const { result } = renderHook(() => useReport());
    const testError = new Error('Test error');

    await act(async () => {
      await result.current.reportError('Error occurred', testError, {
        component: 'TestComponent',
      });
    });

    expect(reportCreateModule.reportCreate).toHaveBeenCalledWith(
      expect.objectContaining({
        report_type: 'error',
        message: 'Error occurred',
        stack_trace: testError.stack,
      })
    );
  });

  it('should use reportPerformance to create performance reports', async () => {
    const { result } = renderHook(() => useReport());
    const metrics = { loadTime: 123, renderTime: 45 };

    await act(async () => {
      await result.current.reportPerformance('Performance metrics', metrics, {
        component: 'TestComponent',
      });
    });

    expect(reportCreateModule.reportCreate).toHaveBeenCalledWith(
      expect.objectContaining({
        report_type: 'performance',
        message: 'Performance metrics',
        performance_metrics: metrics,
      })
    );
  });
});
