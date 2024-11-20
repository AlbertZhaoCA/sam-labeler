import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  reactStrictMode: true,
  images: {
    domains: [
      'res.cloudinary.com',
      'cdn.pixabay.com',
      'localhost',
      '127.0.0.1',
      '3d34-65-175-57-118.ngrok-free.app',
    ],
    minimumCacheTTL: 10,
  },
};

export default nextConfig;
