import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Allow Ngrok / reverse proxy host for development
  allowedDevOrigins: ['100.115.19.117'],
};

export default nextConfig;
