/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  images: {
    domains: ['localhost'],
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**.ipfs.io',
      },
      {
        protocol: 'https',
        hostname: 'ipfs.io',
      },
    ],
  },
  async rewrites() {
    return [
      {
        source: '/api/v1/:path*',
        destination: 'http://localhost:3200/api/v1/:path*',
      },
    ];
  },
};

module.exports = nextConfig;
