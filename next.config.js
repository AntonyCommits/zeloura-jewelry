/** @type {import('next').NextConfig} */
const path = require('path');
const isProd = process.env.NODE_ENV === 'production';

const nextConfig = {
  // Disable ESLint during build
  eslint: {
    ignoreDuringBuilds: true,
  },
  // Disable TypeScript type checking during build
  typescript: {
    ignoreBuildErrors: true,
  },
  // Configure base path for production
  basePath: isProd ? '' : undefined,
  // Configure asset prefix for production
  assetPrefix: isProd ? 'https://project-zeloura-9274d.web.app' : '',
  
  // Image optimization
  images: {
    domains: ['project-zeloura-9274d.web.app'],
  },
  
  // Ensure consistent URL structure
  trailingSlash: true,
  
  // Disable React StrictMode for static export
  reactStrictMode: false,
  
  // Fix for workspace root warning
  outputFileTracingRoot: path.join(__dirname, '../../'),
  
  // Enable webpack 5
  webpack: (config, { isServer }) => {
    if (!isServer) {
      config.resolve.fallback = {
        ...config.resolve.fallback,
        fs: false,
      };
    }
    return config;
  },
};

// Development-specific configuration
if (!isProd) {
  // Disable static export in development
  nextConfig.output = undefined;
  nextConfig.assetPrefix = '';
  
  // Enable experimental features in development only
  nextConfig.experimental = {
    turbo: {
      rules: {
        '*.svg': {
          loaders: ['@svgr/webpack'],
          as: '*.js',
        },
      },
    },
  };
}

module.exports = nextConfig;
