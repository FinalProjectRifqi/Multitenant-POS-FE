import type { NextConfig } from "next";

// Root path redirect is handled by proxy.ts (edge middleware) so it can be
// role-aware. Static next.config.ts redirects cannot read the session and
// therefore cannot redirect users to their role-appropriate dashboard.
const nextConfig: NextConfig = {};

export default nextConfig;
