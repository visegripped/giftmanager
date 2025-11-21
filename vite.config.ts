/// <reference types="vitest" />
/// <reference types="node" />
import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';
import svgr from 'vite-plugin-svgr';
import path from 'path';

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
  server: {
    proxy: {
      // Proxy API requests to PHP backend in Docker
      // Port is configurable via PHP_PORT env var (default 8081)
      '/api.php': {
        target: process.env.PHP_PORT
          ? `http://localhost:${process.env.PHP_PORT}`
          : 'http://localhost:8081',
        changeOrigin: true,
        rewrite: (path) => path,
      },
      '/reporting.php': {
        target: process.env.PHP_PORT
          ? `http://localhost:${process.env.PHP_PORT}`
          : 'http://localhost:8081',
        changeOrigin: true,
        rewrite: (path) => path,
      },
    },
  },
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: ['src/__tests__/setup.ts'],
  },
  optimizeDeps: {
    force: true,
    esbuildOptions: {
      loader: {
        '.js': 'jsx',
      },
    },
  },
});
