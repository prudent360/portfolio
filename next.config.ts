import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  serverExternalPackages: ["@electric-sql/pglite"],
  // Fonts read at runtime by the generated link-preview images.
  outputFileTracingIncludes: {
    "/opengraph-image": ["./src/assets/fonts/**"],
    "/blog/[slug]/social-card": ["./src/assets/fonts/**"],
  },
  images: {
    remotePatterns: [{ protocol: "https", hostname: "*.public.blob.vercel-storage.com" }],
  },
  experimental: {
    // Uploads are capped at 4 MB in lib/storage.ts; leave room for multipart overhead.
    serverActions: { bodySizeLimit: "5mb" },
  },
};

export default nextConfig;
