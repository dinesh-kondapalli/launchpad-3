import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  transpilePackages: ["@bwick-chain/sdk"],
  async rewrites() {
    const RPC_DEST = process.env.NEXT_PUBLIC_RPC_ENDPOINT ?? "http://167.99.147.85/rpc";
    const REST_DEST = process.env.NEXT_PUBLIC_REST_ENDPOINT ?? "http://167.99.147.85/rest";
    return [
      { source: "/rpc", destination: RPC_DEST },
      { source: "/rpc/:path*", destination: `${RPC_DEST}/:path*` },
      { source: "/rest", destination: REST_DEST },
      { source: "/rest/:path*", destination: `${REST_DEST}/:path*` },
    ];
  },
};

export default nextConfig;
