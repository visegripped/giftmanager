/// <reference types="vite/client" />

declare global {
  interface Window {
    FB?: {
      logout: (callback: () => void) => void;
      getAuthResponse: () => {
        accessToken: string;
        userID: string;
      } | null;
      api: (
        path: string,
        callback: (response: any) => void,
        params?: Record<string, any>
      ) => void;
      [key: string]: any;
    };
  }
}

export {};
