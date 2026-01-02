import {
  itemStatusInterface,
  ItemRemovedType,
  responseInterface,
} from '../types/types';
import { startAPICall, endAPICall } from './performanceTracker';
import { getApiUrl } from './urlHelper';

// Support environment variable for API URL (for Docker/local development)
// URL is protocol-relative and will use current page's protocol (HTTP/HTTPS)
const apiUrl = getApiUrl();

type fetchInterface = {
  task: string;
  myuserid?: string | number;
  theiruserid?: string | number;
  itemid?: string | number;
  noteid?: string | number;
  userid?: string | number;
  name?: string;
  avatar?: string;
  description?: string;
  email_address?: string;
  link?: string;
  date_received?: string;
  removed?: ItemRemovedType;
  status?: itemStatusInterface;
  qty?: string;
  added_by_userid?: string;
  groupid?: string;
  archive?: string;
  note?: string;
};

export const formatDate = (date: Date) => {
  const monthAdjustedForJS = (date.getMonth() + 1).toString().padStart(2, '0');
  const dayPadded = date.getDate().toString().padStart(2, '0');
  return `${date.getFullYear()}${monthAdjustedForJS}${dayPadded}`;
};

export const fetchData = (config: fetchInterface) => {
  const configWhiteList = [
    'task',
    'myuserid',
    'theiruserid',
    'userid',
    'itemid',
    'noteid',
    'name',
    'avatar',
    'description',
    'link',
    'date_received',
    'email_address',
    'removed',
    'status',
    'qty',
    'added_by_userid',
    'groupid',
    'archive',
    'note',
  ];
  const accessToken = localStorage.getItem('access_token');
  const makeAsyncRequest =
    async (theFormData: {}): Promise<responseInterface> => {
      let jsonPayload: responseInterface = {};

      // Start tracking API call
      const callId = startAPICall(apiUrl, 'POST');

      // Extract request data for reporting
      const requestData: Record<string, unknown> = {};
      if (theFormData instanceof FormData) {
        // Convert FormData to object for reporting (exclude sensitive data)
        theFormData.forEach((value, key) => {
          if (key !== 'access_token') {
            requestData[key] = value;
          }
        });
      }

      try {
        const apiResponse = await fetch(apiUrl, {
          // @ts-ignore
          body: theFormData,
          method: 'POST',
        });

        let responseData: Record<string, unknown> | undefined;

        if (apiResponse.status >= 200 && apiResponse.status < 300) {
          const responseText = await apiResponse.text();
          // Parse JSON response, handling empty responses
          if (responseText.trim() === '') {
            jsonPayload = { error: 'Empty response from server' };
            responseData = jsonPayload;
          } else {
            try {
              jsonPayload = JSON.parse(responseText);
              responseData = jsonPayload;
            } catch (parseError) {
              jsonPayload = {
                error: `Invalid JSON response: ${responseText.substring(0, 100)}`,
              };
              responseData = jsonPayload;
            }
          }

          // End tracking with success
          endAPICall(
            callId,
            apiResponse.status,
            apiResponse.statusText,
            undefined,
            requestData,
            responseData
          );
        } else {
          jsonPayload.err = `API responded with a ${apiResponse.status}`;

          // End tracking with error
          endAPICall(
            callId,
            apiResponse.status,
            apiResponse.statusText,
            jsonPayload.err,
            requestData,
            undefined
          );

          throw new Error(`API responded with a ${apiResponse.status}`);
        }

        if (jsonPayload?.err) {
          jsonPayload.err = `API responded with a ${apiResponse.status}`;

          // End tracking with error
          endAPICall(
            callId,
            apiResponse.status,
            apiResponse.statusText,
            jsonPayload.err,
            requestData,
            responseData
          );

          throw new Error(jsonPayload.err);
        }
      } catch (error) {
        const errorMessage =
          error instanceof Error ? error.message : String(error);

        // Check if it's a JSON parse error
        if (error instanceof SyntaxError) {
          jsonPayload = {
            error: `Invalid JSON response from server: ${errorMessage}`,
          };
        } else {
          jsonPayload.err = `API Request Failure: ${errorMessage}`;
        }

        // End tracking with error
        endAPICall(
          callId,
          undefined,
          undefined,
          errorMessage,
          requestData,
          undefined
        );

        // Return error response instead of throwing to prevent unhandled promise rejection
        return jsonPayload;
      }
      return jsonPayload;
    };

  if (accessToken) {
    let formData = new FormData();
    formData.append('access_token', accessToken);
    const authProvider = localStorage.getItem('auth_provider') || 'google';
    formData.append('auth_provider', authProvider);
    for (let key of configWhiteList) {
      // @ts-ignore: todo - remove this and address TS issue.
      const value = config[key];
      // Only append fields that have actual values (not undefined or null)
      if (value !== undefined && value !== null && value !== '') {
        formData.append(key, String(value));
      }
    }

    return makeAsyncRequest(formData);
  }
};

export default fetchData;
