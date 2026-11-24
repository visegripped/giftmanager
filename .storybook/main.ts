import type { StorybookConfig } from '@storybook/nextjs-vite';
import { mergeConfig } from 'vite';
import svgr from 'vite-plugin-svgr';
import { getViteAliases } from '../lib/viteAliases';

const config: StorybookConfig = {
  stories: ['../src/**/*.mdx', '../src/**/*.stories.@(js|jsx|mjs|ts|tsx)'],
  addons: [
    '@storybook/addon-onboarding',
    '@storybook/addon-links',
    '@chromatic-com/storybook',
    '@storybook/addon-docs',
  ],
  framework: {
    name: '@storybook/nextjs-vite',
    options: {
      image: {
        excludeFiles: ['**/*.svg'],
      },
    },
  },
  async viteFinal(viteConfig) {
    return mergeConfig(viteConfig, {
      resolve: { alias: getViteAliases() },
      plugins: [
        svgr({
          svgrOptions: { exportType: 'default' },
          include: '**/*.svg',
        }),
      ],
    });
  },
};
export default config;
