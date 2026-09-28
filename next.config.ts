import type { NextConfig } from 'next';

// Set PAGES_BASE_PATH to /repository-name for a GitHub project site.
const nextConfig: NextConfig = {
  output: 'export',
  basePath: process.env.PAGES_BASE_PATH || '',
  images: { unoptimized: true },
};

export default nextConfig;
