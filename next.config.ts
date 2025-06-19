import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'utfs.io',
        port: '',
        pathname: '/f/**',
      },
    ],
  },
  rewrites: async () => {
    return [
      {
        source: '/((?!api/).*)',
        destination: '/static',
      },
    ];
  },
};

export default nextConfig;
