/**
 * URL Helper Utility
 * Makes URLs protocol-relative to work with both HTTP and HTTPS
 */

/**
 * Extracts the path from a URL, making it relative if it's a localhost URL
 * This allows Vite's proxy to handle requests in development
 *
 * @param url - The URL to convert (can include or omit protocol)
 * @returns Relative URL path if localhost, otherwise protocol-relative URL
 *
 * @example
 * // In development (localhost)
 * normalizeUrl('//localhost:8081/api.php') // => '/api.php' (uses Vite proxy)
 * normalizeUrl('http://localhost:8081/api.php') // => '/api.php'
 *
 * // In production
 * normalizeUrl('//gm.visegripped.com/api.php') // => 'https://gm.visegripped.com/api.php'
 */
export function normalizeUrl(url: string): string {
  if (!url) {
    return url;
  }

  // Remove protocol if present
  const urlWithoutProtocol = url
    .replace(/^https?:\/\//, '')
    .replace(/^\/\//, '');

  // Check if this is a localhost URL (development)
  // Extract hostname and path
  const match = urlWithoutProtocol.match(/^(?:([^:/]+)(?::(\d+))?)?(\/.*)?$/);

  if (!match) {
    return url;
  }

  const [, hostname, , path = ''] = match;

  // If it's localhost, return just the path (Vite will proxy it)
  // This works because Vite's proxy is configured for /api.php and /reporting.php
  if (hostname === 'localhost' || hostname === '127.0.0.1') {
    // If there's a path, return it (relative URL for Vite proxy)
    // If no path, return the original URL as fallback
    return path || url;
  }

  // For non-localhost URLs, use protocol-relative URL with current page's protocol
  const protocol =
    typeof window !== 'undefined' ? window.location.protocol : 'https:';
  return `${protocol}//${urlWithoutProtocol}`;
}

/**
 * Gets the API URL from environment variable and normalizes it
 * Falls back to production URL if not set
 */
export function getApiUrl(): string {
  const envUrl = import.meta.env.VITE_API_URL;
  const defaultUrl = '//gm.visegripped.com/api.php';
  const url = envUrl || defaultUrl;
  return normalizeUrl(url);
}

/**
 * Gets the Reporting API URL from environment variable and normalizes it
 * Returns normalized URL or empty string if not configured
 */
export function getReportingUrl(): string {
  const envUrl = import.meta.env.VITE_REPORTING_API_URL as string;
  if (!envUrl) {
    return '';
  }
  return normalizeUrl(envUrl);
}
