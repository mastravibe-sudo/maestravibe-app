/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'uvnvwlmfbcgboppxdchf.supabase.co',
        pathname: '/storage/v1/object/public/**',
      },
      // keep any other remotePatterns / domains you already had here
    ],
  },
  // ...rest of your existing config
};

module.exports = nextConfig;