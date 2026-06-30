import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import { PrismaAdapter } from "@auth/prisma-adapter";
import bcrypt from "bcryptjs";

import { db } from "@/lib/db";
import { authConfig } from "@/lib/auth.config";
import { loginSchema } from "@/features/auth/auth.schema";
import * as otpService from "@/features/auth/otp.service";
import { TWO_FACTOR_ENABLED } from "@/features/auth/otp.service";

export const { handlers, auth, signIn, signOut } = NextAuth({
  ...authConfig,
  adapter: PrismaAdapter(db),
  providers: [
    Credentials({
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
        otp: { label: "Code", type: "text" },
      },
      async authorize(credentials) {
        const email =
          typeof credentials?.email === "string" ? credentials.email : "";
        const password =
          typeof credentials?.password === "string" ? credentials.password : "";
        const otp =
          typeof credentials?.otp === "string" ? credentials.otp : "";
        if (!email) return null;

        const user = await db.user.findUnique({ where: { email } });
        if (!user) return null;

        const userObject = {
          id: user.id,
          email: user.email,
          name: user.name,
          image: user.image,
          role: user.role,
        };

        // 2FA path: an emailed code is supplied. The password was already proven
        // in step 1 (requestLoginOtpAction) before the code was sent, so holding
        // a valid code implies both factors.
        if (otp) {
          if (!user.emailVerified) return null;
          const ok = await otpService.verify(user.id, "LOGIN_2FA", otp);
          return ok ? userObject : null;
        }

        // Password path — only used when 2FA is disabled.
        if (TWO_FACTOR_ENABLED) return null;
        const parsed = loginSchema.safeParse({ email, password });
        if (!parsed.success) return null;
        if (!user.passwordHash) return null;
        if (!(await bcrypt.compare(password, user.passwordHash))) return null;
        if (!user.emailVerified) return null;
        return userObject;
      },
    }),
  ],
});
