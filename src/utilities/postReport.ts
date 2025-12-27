import { responseInterface as ApiResponse } from '../types/types';
import { getReportingUrl } from './urlHelper';

const reportingUrl = getReportingUrl();

// SANITY -> DO NOT THROW ERRORS FROM THIS FILE.
// There is a method listening for uncaught errors that uses this.
// if you throw an error, you could start a loop of error reporting.
// just log it to the console.

export interface WindowData {
  document: Document;
  navigator: Navigator;
}

export interface ReportBodyContext {
  pageUrl: string;
  userAgent: string;
  cookieEnabled: boolean;
  viewport: string;
  platform: string;
  appName: string;
  localTime: string;
}

export interface ReportBody {
  stackTrace?: string;
  error?: string;
  email?: string | unknown;
  // Optional warning message for non-fatal issues
  warn?: string;
  origin: 'apiResponse' | 'errorBoundary' | 'handledException';
  file: string;
  // Allow additional metadata without type errors
  [key: string]: unknown;
}

export interface ReportData {
  report: string;
  type: 'warn' | 'info' | 'success' | 'error';
  body: ReportBody;
}

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
    platform: win.navigator.platform,
    appName: win.navigator.appName,
    localTime: date.toISOString().slice(0, 19).replace('T', ' '),
  };
};

// TODO - need a generic postReport, which should be the default. allows for other types and if error is set, can go through postReport instead.

export const postReport = async (
  theReport: ReportData
): Promise<ApiResponse | undefined> => {
  const { report, type, body } = theReport;
  const theReportBody = { ...body, ...gatherStandardBodyData(window) };
  let jsonPayload: ApiResponse | undefined;

  const formData = new FormData();
  formData.append('report', report); // api hasn't been updated yet to use access_token.
  formData.append('body', JSON.stringify(theReportBody));
  formData.append('type', type);
  formData.append('task', 'addReport');

  try {
    const apiResponse = await fetch(reportingUrl, {
      body: formData,
      method: 'POST',
    });

    if (apiResponse.status >= 200 && apiResponse.status < 300) {
      const responseText = await apiResponse.text();
      // Parse JSON response, handling empty responses
      if (responseText.trim() === '') {
        console.log('ERROR IN REPORTING: Empty response from server');
        jsonPayload = { err: 'Empty response from server' };
      } else {
        try {
          jsonPayload = JSON.parse(responseText) as ApiResponse;
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
    }
  } catch (error) {
    console.log(`ERROR IN REPORTING: ${error}`);
    jsonPayload = { err: `API Request Failure: ${error}` };
  }

  if (!jsonPayload) {
    console.log(`ERROR IN REPORTING: no json payload in response`);
  } else if (jsonPayload.err) {
    console.log(`ERROR IN REPORTING: ${jsonPayload.err}`);
  }

  return jsonPayload;
};

export default postReport;
