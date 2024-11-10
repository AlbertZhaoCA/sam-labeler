import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactStrictMode: true,
  images: {
    domains: ["res.cloudinary.com", "cdn.pixabay.com", "localhost", "127.0.0.1"],
  },
};

export default nextConfig;