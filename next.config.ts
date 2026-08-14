import type { NextConfig } from "next";

const isDev = process.env.NODE_ENV !== "production";

const nextConfig: NextConfig = {
  images: {
    dangerouslyAllowLocalIP: isDev,
    remotePatterns: [
      {
        protocol: "https",
        hostname: "images.unsplash.com",
      },
      {
        protocol: "https",
        hostname: "picsum.photos",
      },
      {
        protocol: "https",
        hostname: "s1.ticketm.net",
      },
      {
        protocol: "https",
        hostname: "*.ticketm.net",
      },
      {
        protocol: "https",
        hostname: "*.ticketweb.com",
      },
      {
        protocol: "https",
        hostname: "*.universe.com",
      },
      {
        // Supabase Storage for user-uploaded images
        protocol: "https",
        hostname: "uudhjhioxukvthmlcrpm.supabase.co",
      },
      {
        protocol: "http",
        hostname: "127.0.0.1",
        port: "3210",
      },
      {
        protocol: "http",
        hostname: "localhost",
        port: "3210",
      },
    ],
  },
};

export default nextConfig;

import('@opennextjs/cloudflare').then(m => m.initOpenNextCloudflareForDev());
