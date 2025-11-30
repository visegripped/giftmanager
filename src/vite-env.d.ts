/// <reference types="vite/client" />

declare global {
  interface Window {
    FB?: {
      logout: (callback: () => void) => void;
      [key: string]: any;
    };
  }
}

export {};
