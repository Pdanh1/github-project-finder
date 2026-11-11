import type { NextConfig } from 'next';

const config: NextConfig = {
  output: 'export',
  basePath: process.env.SITE_BASE_PATH || '',
};

export default config;
