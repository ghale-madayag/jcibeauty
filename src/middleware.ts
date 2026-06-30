import NextAuth from "next-auth";
import { authConfig } from "@/lib/auth.config";

// Edge-compatible middleware that enforces the `authorized` callback.
const { auth } = NextAuth(authConfig);

export default auth;

export const config = {
  matcher: ["/admin/:path*"],
};
