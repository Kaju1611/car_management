import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  // Required for the optimized Docker build below — produces a minimal
  // standalone server bundle instead of needing the full node_modules tree
  // at runtime.
  output: 'standalone',

  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'res.cloudinary.com',
      },
    ],
  },
};

export default nextConfig;