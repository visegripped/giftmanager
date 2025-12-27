import { responseInterface as ApiResponse } from '../types/types';
import { getReportingUrl } from './urlHelper';

const reportingUrl = getReportingUrl();

// SANITY -> DO NOT THROW ERRORS FROM THIS FILE.
// There is a method listening for uncaught errors that uses this.
// if you throw an error, you could start a loop of error reporting.
// just log it to the console.

export interface ReportBodyContext {
  pageUrl: string;
  userAgent: string;
  cookieEnabled: boolean;
  viewport: string;
  platform: string;
  appName: string;
  localTime: string;
  viewportWidth: number;
  viewportHeight: number;
}

export interface ReportBody {
  stackTrace?: string;
  error?: string;
  email?: string | unknown;
  origin?:
    | 'apiResponse'
    | 'errorBoundary'
    | 'handledException'
    | 'performance'
    | 'interaction';
  file?: string;
  component?: string;
  [key: string]: unknown;
}

export type ReportType =
  | 'performance'
  | 'interaction'
  | 'error'
  | 'warning'
  | 'info'
  | 'debug';

type GraphQLReportType = Uppercase<ReportType>;

const toGraphQLReportType = (reportType: ReportType): GraphQLReportType =>
  reportType.toUpperCase() as GraphQLReportType;

export interface ReportInput {
  stid: string;
  userid?: number | string;
  report_type: ReportType;
  component?: string;
  message?: string;
  performance_metrics?: Record<string, unknown>;
  user_agent?: string;
  viewport_width?: number;
  viewport_height?: number;
  page_url?: string;
  referrer?: string;
  request_data?: Record<string, unknown>;
  response_data?: Record<string, unknown>;
  stack_trace?: string;
  metadata?: Record<string, unknown>;
}

export interface ReportData {
  report: string;
  type: ReportType;
  body: ReportBody;
}

/**
 * Gather standard browser/environment data
 */
export const gatherStandardBodyData = (
  win?: Window
): ReportBodyContext | undefined => {
  const date = new Date();
  if (!win) {
    return;
  }
  return {
    pageUrl: win.document.location.href,
    userAgent: win.navigator.userAgent,
    cookieEnabled: win.navigator.cookieEnabled,
    viewport: `${win.innerWidth}x${win.innerHeight}`,
    viewportWidth: win.innerWidth,
    viewportHeight: win.innerHeight,
    platform: win.navigator.platform,
    appName: win.navigator.appName,
    localTime: date.toISOString().slice(0, 19).replace('T', ' '),
  };
};

/**
 * Create a report using GraphQL mutation
 * This is the new reporting function that sends data to reporting.php
 */
export const reportCreate = async (
  reportInput: ReportInput
): Promise<ApiResponse | undefined> => {
  if (!reportingUrl) {
    console.log('ERROR IN REPORTING: VITE_REPORTING_API_URL not configured');
    return;
  }

  // Gather standard browser data if not provided
  const standardData = gatherStandardBodyData(window);

  const appVersion = import.meta.env.VITE_APP_VERSION;

  // Merge standard data into report input
  const fullReportInput: ReportInput = {
    ...reportInput,
    user_agent: reportInput.user_agent || standardData?.userAgent,
    viewport_width: reportInput.viewport_width ?? standardData?.viewportWidth,
    viewport_height:
      reportInput.viewport_height ?? standardData?.viewportHeight,
    page_url: reportInput.page_url || standardData?.pageUrl,
    referrer: reportInput.referrer || document.referrer || undefined,
    metadata: {
      ...(reportInput.metadata || {}),
      appVersion,
    },
  };

  // GraphQL mutation
  const mutation = `
    mutation CreateReport($input: ReportInput!) {
      createReport(input: $input) {
        id
        stid
        report_type
        component
        message
        timestamp
      }
    }
  `;

  const variables = {
    input: {
      ...fullReportInput,
      report_type: toGraphQLReportType(fullReportInput.report_type),
      // Convert objects to JSON strings for GraphQL
      performance_metrics: fullReportInput.performance_metrics
        ? JSON.stringify(fullReportInput.performance_metrics)
        : undefined,
      request_data: fullReportInput.request_data
        ? JSON.stringify(fullReportInput.request_data)
        : undefined,
      response_data: fullReportInput.response_data
        ? JSON.stringify(fullReportInput.response_data)
        : undefined,
      metadata: fullReportInput.metadata
        ? JSON.stringify(fullReportInput.metadata)
        : undefined,
    },
  };

  let jsonPayload: ApiResponse | undefined;

  try {
    const apiResponse = await fetch(reportingUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        query: mutation,
        variables,
      }),
    });

    if (apiResponse.status >= 200 && apiResponse.status < 300) {
      const responseText = await apiResponse.text();
      // Parse JSON response, handling empty responses
      if (responseText.trim() === '') {
        console.log('ERROR IN REPORTING: Empty response from server');
        jsonPayload = { err: 'Empty response from server' };
      } else {
        try {
          const result = JSON.parse(responseText);

          if (result.errors) {
            console.log('ERROR IN REPORTING: GraphQL errors:', result.errors);
            jsonPayload = { err: JSON.stringify(result.errors) };
          } else if (result.data?.createReport) {
            jsonPayload = { success: 'Report created successfully' };
          } else {
            console.log('ERROR IN REPORTING: Unexpected response format');
            jsonPayload = { err: 'Unexpected response format' };
          }
        } catch (parseError) {
          console.log(
            `ERROR IN REPORTING: Invalid JSON response: ${parseError}`
          );
          jsonPayload = {
            err: `Invalid JSON response: ${responseText.substring(0, 100)}`,
          };
        }
      }
    } else {
      console.log('ERROR IN REPORTING: response was non 20X');
      jsonPayload = { err: `API responded with status ${apiResponse.status}` };
    }
  } catch (error) {
    console.log(`ERROR IN REPORTING: ${error}`);
    jsonPayload = { err: `API Request Failure: ${error}` };
  }

  return jsonPayload;
};

/**
 * Legacy postReport function for backward compatibility
 * Converts old format to new reportCreate format
 */
export const postReport = async (
  theReport: ReportData
): Promise<ApiResponse | undefined> => {
  const { report, type, body } = theReport;
  const theReportBody = { ...body, ...gatherStandardBodyData(window) };

  // Get STID from sessionStorage
  const stid = sessionStorage.getItem('giftmanager_stid') || '';
  if (!stid) {
    console.log('ERROR IN REPORTING: No STID found');
  }

  // Get userid from localStorage or context if available
  const userid = body.email ? undefined : undefined; // TODO: Get from user context

  const reportInput: ReportInput = {
    stid,
    userid,
    report_type: type,
    component: body.component || body.file,
    message: report,
    stack_trace: body.stackTrace,
    metadata: {
      origin: body.origin,
      error: body.error,
      ...theReportBody,
    },
  };

  return reportCreate(reportInput);
};

export default reportCreate;
