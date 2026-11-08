import path from "node:path";
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  // Pin the workspace root to this project. Without it Next picks up the stray
  // lockfile in the home directory and treats ~ as the root (slow file watching,
  // wrong module paths in traces).
  turbopack: {
    root: path.resolve(__dirname),
  },
  reactCompiler: true,
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'lh3.googleusercontent.com',
        pathname: '**',
      },
      {
        protocol: 'https',
        hostname: 'images.unsplash.com',
        pathname: '**',
      },
      {
        // Backend-hosted uploads (dev). Update for production host as needed.
        protocol: 'http',
        hostname: 'localhost',
        port: '8000',
        pathname: '/uploads/**',
      },
    ],
  },
};

export default nextConfig;
