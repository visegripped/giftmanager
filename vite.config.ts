/// <reference types="vitest" />
/// <reference types="node" />
import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';
import svgr from 'vite-plugin-svgr';
import path from 'path';
import fs from 'fs';

const buildVersion =
  process.env.BUILD_VERSION || process.env.npm_package_version || 'dev';

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
  build: {
    rollupOptions: {
      output: {
        // Use the build version in filenames instead of content hashes
        entryFileNames: `assets/[name]-${buildVersion}.js`,
        chunkFileNames: `assets/[name]-${buildVersion}.js`,
        assetFileNames: (chunkInfo) => {
          const ext = path.extname(chunkInfo.name || '').slice(1);
          const base = path.basename(
            chunkInfo.name || '',
            path.extname(chunkInfo.name || '')
          );
          if (!ext) {
            return `assets/[name]-${buildVersion}`;
          }
          return `assets/${base}-${buildVersion}.${ext}`;
        },
      },
    },
  },
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

    // Only try to load SSL certs if they exist and are readable (skip in test environment)
    if (
      !process.env.VITEST &&
      fs.existsSync(certPath) &&
      fs.existsSync(keyPath)
    ) {
      try {
        serverConfig.https = {
          cert: fs.readFileSync(certPath),
          key: fs.readFileSync(keyPath),
        };
      } catch (error) {
        // Silently ignore SSL cert read errors (e.g., permission issues in test environment)
        // HTTP will be used instead
      }
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
