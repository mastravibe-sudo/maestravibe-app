/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'uvnvwlmfbcgboppxdchf.supabase.co',
        pathname: '/storage/v1/object/public/**',
      },
      {
        protocol: 'https',
        hostname: 'images.unsplash.com',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'pub-3d52638c94c44015864af0236f150ab8.r2.dev',
        pathname: '/**',
      },
    ],
  },
};

module.exports = nextConfig;