/** @type {import('next').NextConfig} */
const isProd = process.env.NODE_ENV === 'production';

const nextConfig = {
  // ESLint configuration
  eslint: {
    ignoreDuringBuilds: true,
  },
  // TypeScript configuration
  typescript: {
    ignoreBuildErrors: true,
  },

  // Image optimization - allow all domains for Vercel
  images: {
    domains: [],
    unoptimized: false,
  },

  // Output configuration for Vercel
  output: 'standalone',

  // Enable React StrictMode
  reactStrictMode: true,

  // Experimental features
  experimental: {
    // Add any experimental features here if needed
  },
};

module.exports = nextConfig;
