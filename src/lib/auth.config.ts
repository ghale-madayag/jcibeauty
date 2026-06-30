import type { NextAuthConfig } from "next-auth";
import type { Role } from "@prisma/client";
import { canAccessPanel } from "@/lib/permissions";

/**
 * Edge-safe auth config (no Prisma / bcrypt imports) so it can run inside
 * middleware. Providers and the adapter are attached in `auth.ts`.
 */
export const authConfig = {
  pages: {
    signIn: "/login",
  },
  session: { strategy: "jwt" },
  callbacks: {
    authorized({ auth, request: { nextUrl } }) {
      const isLoggedIn = !!auth?.user;
      const role = auth?.user?.role;
      const path = nextUrl.pathname;

      if (path.startsWith("/admin")) {
        // Gate panel entry; per-section access is enforced server-side
        // (section layouts + guards) using the same capability map.
        return isLoggedIn && canAccessPanel(role);
      }
      return true;
    },
    jwt({ token, user }) {
      if (user) {
        token.id = user.id as string;
        token.role = (user as { role: Role }).role;
      }
      return token;
    },
    session({ session, token }) {
      if (session.user) {
        session.user.id = token.id as string;
        session.user.role = token.role as Role;
      }
      return session;
    },
  },
  providers: [],
} satisfies NextAuthConfig;
