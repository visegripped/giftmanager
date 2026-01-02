/**
 * GraphQL Client Utility
 * Simple GraphQL client for querying the reporting API
 */

import { getReportingUrl } from './urlHelper';

const reportingUrl = getReportingUrl();

function resolveReportingUrl(url: string): string {
  if (!url) return url;
  // In dev, normalizeUrl can return a relative path like "/reporting.php" for Vite proxy.
  // Node's fetch (used by Vitest) requires an absolute URL, so resolve against window origin.
  if (url.startsWith('/') && typeof window !== 'undefined' && window.location) {
    return `${window.location.origin}${url}`;
  }
  return url;
}

export interface GraphQLResponse<T = unknown> {
  data?: T;
  errors?: Array<{
    message: string;
    locations?: Array<{ line: number; column: number }>;
    path?: Array<string | number>;
  }>;
}

export interface GraphQLRequest {
  query: string;
  variables?: Record<string, unknown>;
  operationName?: string;
}

/**
 * Execute a GraphQL query or mutation
 */
export async function graphqlRequest<T = unknown>(
  query: string,
  variables?: Record<string, unknown>,
  operationName?: string
): Promise<GraphQLResponse<T>> {
  if (!reportingUrl) {
    throw new Error('VITE_REPORTING_API_URL not configured');
  }

  const url = resolveReportingUrl(reportingUrl);

  const request: GraphQLRequest = {
    query,
    variables,
    operationName,
  };

  let timeoutId: ReturnType<typeof setTimeout> | undefined;
  const controller =
    typeof AbortController !== 'undefined' ? new AbortController() : undefined;

  try {
    if (controller) {
      timeoutId = setTimeout(() => controller.abort(), 15000);
    }

    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(request),
      signal: controller?.signal,
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const responseText = await response.text();
    if (!responseText.trim()) {
      throw new Error('Empty response from GraphQL server');
    }
    const result: GraphQLResponse<T> = JSON.parse(responseText);

    if (result.errors && result.errors.length > 0) {
      console.error('GraphQL errors:', result.errors);
    }

    return result;
  } catch (error) {
    console.error('GraphQL request failed:', error);
    throw error;
  } finally {
    // Clear timeout if set
    if (timeoutId) {
      clearTimeout(timeoutId);
    }
  }
}

/**
 * Get reports with filtering and pagination
 */
export async function getReports(
  filter?: {
    userid?: number;
    report_type?: string;
    component?: string;
    stid?: string;
    start_date?: string;
    end_date?: string;
  },
  pagination?: {
    limit?: number;
    offset?: number;
  }
) {
  const query = `
    query GetReports($filter: ReportFilter, $pagination: Pagination) {
      getReports(filter: $filter, pagination: $pagination) {
        reports {
          id
          stid
          userid
          report_type
          component
          message
          timestamp
          performance_metrics
          user_agent
          viewport_width
          viewport_height
          page_url
          referrer
          request_data
          response_data
          stack_trace
          metadata
        }
        count
      }
    }
  `;

  return graphqlRequest<{
    getReports: {
      reports: Array<Record<string, unknown>>;
      count: number;
    };
  }>(query, { filter, pagination });
}

/**
 * Get report statistics
 */
export async function getReportStats(filter?: {
  userid?: number;
  report_type?: string;
  component?: string;
  stid?: string;
  start_date?: string;
  end_date?: string;
}) {
  const query = `
    query GetReportStats($filter: ReportFilter) {
      getReportStats(filter: $filter) {
        report_type
        count
        unique_users
        unique_sessions
      }
    }
  `;

  return graphqlRequest<{
    getReportStats: Array<{
      report_type: string;
      count: number;
      unique_users: number;
      unique_sessions: number;
    }>;
  }>(query, { filter });
}

export default graphqlRequest;
