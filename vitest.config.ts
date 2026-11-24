import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';
import svgr from 'vite-plugin-svgr';
import { getPackageVersion } from './lib/packageVersion';
import { getViteAliases } from './lib/viteAliases';

export default defineConfig({
  plugins: [
    react(),
    svgr({
      svgrOptions: { exportType: 'default' },
      include: '**/*.svg',
    }),
  ],
  resolve: {
    alias: getViteAliases(__dirname),
  },
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: ['src/__tests__/setup.ts'],
    env: {
      NEXT_PUBLIC_APP_VERSION: getPackageVersion(),
    },
  },
});
