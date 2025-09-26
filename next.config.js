/** @type {import('next').NextConfig} */
const isProd = process.env.NODE_ENV === 'production';

const nextConfig = {
  // Enable static export
  output: 'export',
  // Configure base path for production
  basePath: isProd ? '' : undefined,
  // Configure asset prefix for production
  assetPrefix: isProd ? 'https://project-zeloura-9274d.web.app' : '',
  
  // Image optimization
  images: {
    unoptimized: true, // Required for static export
    domains: ['project-zeloura-9274d.web.app'],
  },
  
  // Ensure consistent URL structure
  trailingSlash: true,
  
  // Disable React StrictMode for static export
  reactStrictMode: false,
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
