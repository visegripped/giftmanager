/**
 * Performance Tracker
 * Tracks performance metrics for API calls and page load
 */

import { reportCreate, ReportInput } from './reportCreate';
import { getSTID } from '../hooks/useSessionTracking';

interface PerformanceMetric {
  name: string;
  value: number;
  unit: string;
}

interface APICallMetrics {
  url: string;
  method: string;
  startTime: number;
  endTime?: number;
  duration?: number;
  status?: number;
  statusText?: string;
  error?: string;
}

const apiCallMetrics: Map<string, APICallMetrics> = new Map();
let pageLoadTracked = false;

/**
 * Track page load performance
 */
export function trackPageLoad(): void {
  if (pageLoadTracked || typeof window === 'undefined' || !window.performance) {
    return;
  }

  const stid = getSTID();
  if (!stid) {
    return;
  }

  try {
    const perfData = window.performance.timing;
    const navigation = window.performance.navigation;

    const metrics: Record<string, unknown> = {
      // Navigation timing
      domContentLoaded:
        perfData.domContentLoadedEventEnd - perfData.navigationStart,
      loadComplete: perfData.loadEventEnd - perfData.navigationStart,
      domInteractive: perfData.domInteractive - perfData.navigationStart,
      domLoading: perfData.domLoading - perfData.navigationStart,

      // Resource timing
      dns: perfData.domainLookupEnd - perfData.domainLookupStart,
      tcp: perfData.connectEnd - perfData.connectStart,
      request: perfData.responseStart - perfData.requestStart,
      response: perfData.responseEnd - perfData.responseStart,
      processing: perfData.domComplete - perfData.domInteractive,

      // Navigation type
      navigationType: navigation.type,
      redirectCount: navigation.redirectCount,
    };

    // Get resource timing if available
    if (window.performance.getEntriesByType) {
      const resources = window.performance.getEntriesByType(
        'resource'
      ) as PerformanceResourceTiming[];
      const resourceMetrics = resources.map((resource) => ({
        name: resource.name,
        duration: resource.duration,
        transferSize: resource.transferSize,
        initiatorType: resource.initiatorType,
      }));
      metrics.resources = resourceMetrics;
    }

    const reportInput: ReportInput = {
      stid,
      report_type: 'performance',
      component: 'PageLoad',
      message: 'Page load performance metrics',
      performance_metrics: metrics,
    };

    reportCreate(reportInput).catch((error) => {
      console.error('Failed to report page load performance:', error);
    });

    pageLoadTracked = true;
  } catch (error) {
    console.error('Error tracking page load:', error);
  }
}

/**
 * Start tracking an API call
 */
export function startAPICall(url: string, method: string = 'GET'): string {
  const callId = `${Date.now()}-${Math.random().toString(36).substring(7)}`;

  apiCallMetrics.set(callId, {
    url,
    method,
    startTime: performance.now(),
  });

  return callId;
}

/**
 * End tracking an API call and report it
 */
export function endAPICall(
  callId: string,
  status?: number,
  statusText?: string,
  error?: string,
  requestData?: Record<string, unknown>,
  responseData?: Record<string, unknown>
): void {
  const metrics = apiCallMetrics.get(callId);
  if (!metrics) {
    return;
  }

  const stid = getSTID();
  if (!stid) {
    return;
  }

  const endTime = performance.now();
  const duration = endTime - metrics.startTime;

  metrics.endTime = endTime;
  metrics.duration = duration;
  metrics.status = status;
  metrics.statusText = statusText;
  metrics.error = error;

  // Extract component name from URL if possible
  let component = 'API';
  try {
    const urlObj = new URL(metrics.url);
    const pathname = urlObj.pathname;
    // Extract meaningful component name from path
    if (pathname.includes('/api.php')) {
      component = 'API';
    } else if (pathname.includes('/reporting.php')) {
      component = 'ReportingAPI';
    }
  } catch {
    // Invalid URL, use default
  }

  const performanceMetrics: Record<string, unknown> = {
    duration,
    status,
    statusText,
    method: metrics.method,
    url: metrics.url,
  };

  if (error) {
    performanceMetrics.error = error;
  }

  const reportInput: ReportInput = {
    stid,
    report_type: error ? 'error' : 'performance',
    component,
    message: error
      ? `API call failed: ${metrics.method} ${metrics.url}`
      : `API call completed: ${metrics.method} ${metrics.url}`,
    performance_metrics: performanceMetrics,
    request_data: requestData,
    response_data: responseData,
  };

  reportCreate(reportInput).catch((reportError) => {
    console.error('Failed to report API call performance:', reportError);
  });

  // Clean up
  apiCallMetrics.delete(callId);
}

/**
 * Wrap fetch to automatically track API calls
 */
export function createTrackedFetch(originalFetch: typeof fetch): typeof fetch {
  return async function trackedFetch(
    input: RequestInfo | URL,
    init?: RequestInit
  ): Promise<Response> {
    const url =
      typeof input === 'string'
        ? input
        : input instanceof URL
          ? input.toString()
          : input.url;
    const method = init?.method || 'GET';

    const callId = startAPICall(url, method);

    try {
      const response = await originalFetch(input, init);

      // Clone response to read body without consuming it
      const clonedResponse = response.clone();
      let responseData: Record<string, unknown> | undefined;

      try {
        const contentType = response.headers.get('content-type');
        if (contentType && contentType.includes('application/json')) {
          responseData = await clonedResponse.json();
        } else {
          const text = await clonedResponse.text();
          responseData = { text: text.substring(0, 1000) }; // Limit size
        }
      } catch {
        // Couldn't parse response, that's ok
      }

      endAPICall(
        callId,
        response.status,
        response.statusText,
        undefined,
        init?.body
          ? typeof init.body === 'string'
            ? JSON.parse(init.body)
            : {}
          : undefined,
        responseData
      );

      return response;
    } catch (error) {
      endAPICall(
        callId,
        undefined,
        undefined,
        error instanceof Error ? error.message : String(error),
        init?.body
          ? typeof init.body === 'string'
            ? JSON.parse(init.body)
            : {}
          : undefined,
        undefined
      );

      throw error;
    }
  };
}

export default {
  trackPageLoad,
  startAPICall,
  endAPICall,
  createTrackedFetch,
};
