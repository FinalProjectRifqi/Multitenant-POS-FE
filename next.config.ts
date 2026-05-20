import type { NextConfig } from "next";

// Root path redirect is handled by proxy.ts (edge middleware) so it can be
// role-aware. Static next.config.ts redirects cannot read the session and
// therefore cannot redirect users to their role-appropriate dashboard.
const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "yftrnebyjqxohepbzgkq.supabase.co",
        port: "",
        pathname: "/**",
      },
      {
        protocol: "https",
        hostname: "api.sandbox.midtrans.com",
        port: "",
        pathname: "/**",
      },
      {
        protocol: "https",
        hostname: "api.midtrans.com",
        port: "",
        pathname: "/**",
      },
    ],
  },
};

export default nextConfig;
