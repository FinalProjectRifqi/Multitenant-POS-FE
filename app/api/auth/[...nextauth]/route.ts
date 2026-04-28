import { handlers } from "@/lib/nextauth/auth";

// NextAuth handles GET /api/auth/* and POST /api/auth/* routes
export const { GET, POST } = handlers;
