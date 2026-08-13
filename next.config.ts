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
        // Ticketmaster Universe CDN - international events (UK, EU, etc.)
        protocol: "https",
        hostname: "*.universe.com",
      },
      {
        // Convex Storage CDN for uploaded images (news, insights, etc.)
        protocol: "https",
        hostname: "*.convex.cloud",
      },
      {
        // Convex Site URL (alternative storage endpoint)
        protocol: "https",
        hostname: "*.convex.site",
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
