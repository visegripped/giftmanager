import type { NextConfig } from 'next';
import { getPackageVersion } from './lib/packageVersion';

const nextConfig: NextConfig = {
  env: {
    NEXT_PUBLIC_APP_VERSION: getPackageVersion(),
  },
  reactStrictMode: true,
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: false,
  },
  webpack(config) {
    config.module.rules.push({
      test: /\.svg$/,
      use: ['@svgr/webpack'],
    });
    return config;
  },
  turbopack: {
    rules: {
      '*.svg': {
        loaders: ['@svgr/webpack'],
        as: '*.js',
      },
    },
  },
};

export default nextConfig;
