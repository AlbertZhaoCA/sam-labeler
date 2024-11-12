import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  reactStrictMode: true,
  images: {
    domains: [
      'res.cloudinary.com',
      'cdn.pixabay.com',
      'localhost',
      '127.0.0.1',
    ],
    minimumCacheTTL: 10
  },
};

export default nextConfig;
