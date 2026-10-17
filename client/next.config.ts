import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  turbopack: {
    root: process.cwd(),
  },
  async rewrites() {
    const apiBaseUrl = process.env.API_BASE_URL ?? "http://localhost:5000";
    return [
      {
        source: "/api/:path*",
        destination: `${apiBaseUrl.replace(/\/+$/, "")}/api/:path*`,
      },
    ];
  },
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "res.cloudinary.com",
        pathname: "/**",
      },
    ],
  },
};

export default nextConfig;
