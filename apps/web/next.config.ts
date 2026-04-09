import { config as loadEnv } from 'dotenv';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import type { NextConfig } from 'next';

const currentDir = dirname(fileURLToPath(import.meta.url));
const workspaceRoot = resolve(currentDir, '../..');

loadEnv({ path: resolve(workspaceRoot, '.env.local'), quiet: true });
loadEnv({ path: resolve(workspaceRoot, '.env'), quiet: true });

const nextConfig: NextConfig = {
  transpilePackages: [
    '@devagentshub/config',
    '@devagentshub/types',
    '@devagentshub/ui',
    '@devagentshub/utils',
    '@devagentshub/validation',
  ],
  env: {
    NEXT_PUBLIC_API_URL: process.env.NEXT_PUBLIC_API_URL,
  },
};

export default nextConfig;
