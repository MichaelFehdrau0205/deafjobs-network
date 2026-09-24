import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */

  // pdf-parse pulls in pdfjs-dist, which expects to load its worker file
  // from disk at runtime. Bundling it breaks that lookup, so it (and
  // mammoth, for the same reason) run as plain Node requires instead.
  serverExternalPackages: ["pdf-parse", "pdfjs-dist", "mammoth"],
};

export default nextConfig;
