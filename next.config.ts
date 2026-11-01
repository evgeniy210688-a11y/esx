import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  async headers() {
    return ['/admin/:path*', '/account/:path*', '/chat/:path*', '/messages/:path*', '/connect/:path*', '/scan/:path*', '/services/register/:path*', '/design/:path*'].map(source => ({ source, headers: [{ key: 'X-Robots-Tag', value: 'noindex, nofollow' }] }));
  },
  allowedDevOrigins: [
    "192.168.219.102",
  ],
};

export default nextConfig;