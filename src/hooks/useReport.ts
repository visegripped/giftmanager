import { useCallback } from 'react';
import {
  reportCreate,
  ReportInput,
  ReportType,
} from '../utilities/reportCreate';
import { getSTID } from './useSessionTracking';

/**
 * Hook for creating reports from components
 */
export function useReport() {
  const createReport = useCallback(
    async (
      reportType: ReportType,
      message: string,
      options?: {
        component?: string;
        performance_metrics?: Record<string, unknown>;
        request_data?: Record<string, unknown>;
        response_data?: Record<string, unknown>;
        stack_trace?: string;
        metadata?: Record<string, unknown>;
        userid?: number | string;
      }
    ): Promise<void> => {
      const stid = getSTID();
      if (!stid) {
        console.error('Cannot create report: No STID available');
        return;
      }

      // Get component name from options or try to infer from stack
      let component = options?.component;
      if (!component && typeof Error !== 'undefined') {
        try {
          const stack = new Error().stack;
          if (stack) {
            // Try to extract component name from stack trace
            const match = stack.match(/at\s+(\w+)/);
            if (match) {
              component = match[1];
            }
          }
        } catch {
          // Ignore errors in component detection
        }
      }

      const reportInput: ReportInput = {
        stid,
        userid: options?.userid,
        report_type: reportType,
        component,
        message,
        performance_metrics: options?.performance_metrics,
        request_data: options?.request_data,
        response_data: options?.response_data,
        stack_trace: options?.stack_trace,
        metadata: options?.metadata,
      };

      await reportCreate(reportInput).catch((error) => {
        console.error('Failed to create report:', error);
      });
    },
    []
  );

  return {
    createReport,
    reportError: useCallback(
      (
        message: string,
        error?: Error,
        options?: Parameters<typeof createReport>[2]
      ) => {
        return createReport('error', message, {
          ...options,
          stack_trace: error?.stack,
          metadata: {
            ...options?.metadata,
            error: error?.message,
            errorName: error?.name,
          },
        });
      },
      [createReport]
    ),
    reportWarning: useCallback(
      (message: string, options?: Parameters<typeof createReport>[2]) => {
        return createReport('warning', message, options);
      },
      [createReport]
    ),
    reportInfo: useCallback(
      (message: string, options?: Parameters<typeof createReport>[2]) => {
        return createReport('info', message, options);
      },
      [createReport]
    ),
    reportDebug: useCallback(
      (message: string, options?: Parameters<typeof createReport>[2]) => {
        return createReport('debug', message, options);
      },
      [createReport]
    ),
    reportPerformance: useCallback(
      (
        message: string,
        performance_metrics: Record<string, unknown>,
        options?: Parameters<typeof createReport>[2]
      ) => {
        return createReport('performance', message, {
          ...options,
          performance_metrics,
        });
      },
      [createReport]
    ),
  };
}

export default useReport;
