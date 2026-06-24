import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  // JIT-transpile the workspace package (it ships raw TS via its `exports`).
  transpilePackages: ['@planit/shared'],
};

export default nextConfig;
