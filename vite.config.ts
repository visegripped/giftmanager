/// <reference types="vitest" />
/// <reference types="node" />
import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';
import svgr from 'vite-plugin-svgr';
import path from 'path';
import fs from 'fs';

// https://vitejs.dev/config/
export default defineConfig({
  resolve: {
    alias: {
      '@assets': '/src/assets',
      '@types': path.resolve(__dirname, './src/types/'),
      '@components': path.resolve(__dirname, './src/components/'),
      '@pages': path.resolve(__dirname, './src/pages/'),
      '@utilities': '/src/utilities',
      '@context': '/src/context',
      '@routes': '/src/routes',
    },
  },
  plugins: [
    react(),
    svgr({
      // svgr options: https://react-svgr.com/docs/options/
      svgrOptions: {
        exportType: 'default',
        ref: true,
        svgo: false,
        titleProp: true,
      },
      include: '**/*.svg',
    }),
  ],
  server: (() => {
    // Enable HTTPS if SSL certificates exist (for Facebook OAuth which requires HTTPS)
    const certPath = path.resolve(__dirname, 'docker/ssl/localhost.crt');
    const keyPath = path.resolve(__dirname, 'docker/ssl/localhost.key');

    const serverConfig: any = {
      proxy: {
        // Proxy API requests to PHP backend in Docker
        // In Docker Compose, use service name 'php' with internal port 80
        // The PHP_PORT env var is for external host mapping, not internal Docker networking
        '/api.php': {
          target: 'http://php:80',
          changeOrigin: true,
          rewrite: (path: string) => path,
        },
        '/reporting.php': {
          target: 'http://php:80',
          changeOrigin: true,
          rewrite: (path: string) => path,
        },
      },
    };

    if (fs.existsSync(certPath) && fs.existsSync(keyPath)) {
      serverConfig.https = {
        cert: fs.readFileSync(certPath),
        key: fs.readFileSync(keyPath),
      };
    }

    return serverConfig;
  })(),
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: ['src/__tests__/setup.ts'],
  },
  optimizeDeps: {
    force: true,
    include: ['react-facebook-login'],
    esbuildOptions: {
      loader: {
        '.js': 'jsx',
      },
    },
  },
});
