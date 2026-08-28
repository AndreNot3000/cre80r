import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  transpilePackages: ["@crea8or/ui", "@crea8or/validators", "@crea8or/auth"],
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "**.amazonaws.com" },
      { protocol: "https", hostname: "lh3.googleusercontent.com" },
    ],
  },
  serverExternalPackages: ["@node-rs/argon2", "better-auth"],
};

export default nextConfig;
