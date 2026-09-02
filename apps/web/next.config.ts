import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  transpilePackages: ["@crea8or/ui", "@crea8or/validators", "@crea8or/auth", "@crea8or/db"],
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "**.amazonaws.com" },
      { protocol: "https", hostname: "lh3.googleusercontent.com" },
      { protocol: "https", hostname: "res.cloudinary.com" },
    ],
  },
  serverExternalPackages: ["@node-rs/argon2", "better-auth", "pg"],
  typescript: {
    ignoreBuildErrors: false,
  },
};

export default nextConfig;
