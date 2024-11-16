import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  reactStrictMode: true,
  images: {
    domains: ['res.cloudinary.com', 'cdn.pixabay.com', 'localhost'],
    minimumCacheTTL: 10,
  },
};

export default nextConfig;
