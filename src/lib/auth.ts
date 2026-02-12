import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import { PrismaAdapter } from "@auth/prisma-adapter";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";
import type { UserRole } from "@prisma/client";

declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      email: string;
      name: string | null;
      role: UserRole;
      merchantId?: string;
      image?: string | null;
    };
  }

  interface User {
    role: UserRole;
    merchantId?: string;
  }
}

declare module "@auth/core/jwt" {
  interface JWT {
    id: string;
    role: UserRole;
    merchantId?: string;
  }
}

export const { handlers, signIn, signOut, auth } = NextAuth({
  adapter: PrismaAdapter(prisma) as never,
  session: { strategy: "jwt" },
  pages: {
    signIn: "/login",
    error: "/login",
  },
  providers: [
    Credentials({
      name: "credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          return null;
        }

        const user = await prisma.user.findUnique({
          where: { email: credentials.email as string },
          include: { merchant: { select: { id: true } } },
        });

        if (!user || !user.passwordHash || !user.isActive) {
          return null;
        }

        const isPasswordValid = await bcrypt.compare(
          credentials.password as string,
          user.passwordHash
        );

        if (!isPasswordValid) {
          return null;
        }

        return {
          id: user.id,
          email: user.email,
          name: user.name,
          role: user.role,
          merchantId: user.merchant?.id,
        };
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id as string;
        token.role = user.role;
        token.merchantId = user.merchantId;
      }
      return token;
    },
    async session({ session, token }) {
      session.user.id = token.id as string;
      session.user.role = token.role as UserRole;
      session.user.merchantId = token.merchantId as string | undefined;
      return session;
    },
    async authorized({ auth, request }) {
      const isLoggedIn = !!auth?.user;
      const { pathname } = request.nextUrl;

      // Public routes
      const publicRoutes = [
        "/",
        "/login",
        "/register",
        "/forgot-password",
        "/reset-password",
        "/verify-email",
        "/faq",
        "/about",
        "/contact",
        "/terms",
        "/privacy",
        "/disputes",
      ];

      const isPublicRoute =
        publicRoutes.some((route) => pathname === route) ||
        pathname.startsWith("/checkout") ||
        pathname.startsWith("/pay/") ||
        pathname.startsWith("/api/webhooks") ||
        pathname.startsWith("/api/auth") ||
        pathname.startsWith("/api/v1/auth");

      if (isPublicRoute) return true;

      if (!isLoggedIn) return false;

      // Role-based access
      if (pathname.startsWith("/admin") || pathname.startsWith("/api/v1/admin")) {
        return auth?.user?.role === "SUPER_ADMIN";
      }

      if (pathname.startsWith("/merchant") || pathname.startsWith("/api/v1/merchant")) {
        return auth?.user?.role === "MERCHANT" || auth?.user?.role === "SUPER_ADMIN";
      }

      return true;
    },
  },
});
