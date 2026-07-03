import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';
import svgr from 'vite-plugin-svgr';
import path from 'path';

export default defineConfig({
  plugins: [
    react(),
    svgr({
      svgrOptions: { exportType: 'default' },
      include: '**/*.svg',
    }),
  ],
  resolve: {
    alias: [
      { find: '@', replacement: path.resolve(__dirname, '.') },
      { find: '@assets', replacement: path.resolve(__dirname, './src/assets') },
      { find: '@types', replacement: path.resolve(__dirname, './src/types') },
      {
        find: '@components',
        replacement: path.resolve(__dirname, './src/components'),
      },
      { find: '@views', replacement: path.resolve(__dirname, './src/views') },
      {
        find: '@utilities',
        replacement: path.resolve(__dirname, './src/utilities'),
      },
      {
        find: '@context',
        replacement: path.resolve(__dirname, './src/context'),
      },
      { find: '@routes', replacement: path.resolve(__dirname, './src/routes') },
    ],
  },
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: ['src/__tests__/setup.ts'],
  },
});
