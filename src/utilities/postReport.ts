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
  origin: 'apiResponse' | 'errorBoundary' | 'handledException';
  file: string;
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

  const apiResponse = await fetch(reportingUrl, {
    body: formData,
    method: 'POST',
  });

  if (apiResponse.status >= 200 && apiResponse.status < 300) {
    jsonPayload = (await apiResponse.json()) as ApiResponse;
  } else {
    console.log('ERROR IN REPORTING: response was non 20X');
  }

  if (!jsonPayload) {
    console.log(`ERROR IN REPORTING: no json payload in response`);
  } else if (jsonPayload.err) {
    console.log(`ERROR IN REPORTING: ${jsonPayload.err}`);
  }

  return jsonPayload;
};

export default postReport;
