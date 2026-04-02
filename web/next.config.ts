import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  poweredByHeader: false,
  async redirects() {
    return [
      { source: "/notes", destination: "/", permanent: false },
      { source: "/decode-test", destination: "/", permanent: false },
    ];
  },
};

export default nextConfig;
