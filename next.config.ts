import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  serverExternalPackages: [
    "@prisma/adapter-mariadb",
    "mariadb",
    "@prisma/client",
  ],
  images: {
    remotePatterns: [],
    localPatterns: [
      {
        pathname: '/**',
      },
    ],
  },
};

export default nextConfig;
