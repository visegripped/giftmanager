/**
 * URL Helper Utility
 */

export function getApiUrl(): string {
  return process.env.NEXT_PUBLIC_API_URL || '/api';
}

export function getReportingUrl(): string {
  return process.env.NEXT_PUBLIC_REPORTING_API_URL || '/api/reporting';
}
