import type { NextAuthConfig } from "next-auth";

export const authConfig: NextAuthConfig = {
  trustHost: true,
  secret: process.env.AUTH_SECRET ?? process.env.NEXTAUTH_SECRET,
  pages: {
    signIn: "/login",
    error: "/login",
  },
  providers: [],
  callbacks: {
    authorized({ auth, request }) {
      const isLoggedIn = !!auth?.user;
      const { pathname } = request.nextUrl;

      const isPublicRoute =
        ["/", "/login", "/register", "/forgot-password", "/reset-password", "/verify-email", "/faq", "/about", "/contact", "/terms", "/privacy", "/disputes", "/api-docs"].includes(pathname) ||
        pathname.startsWith("/checkout") ||
        pathname.startsWith("/pay/") ||
        pathname.startsWith("/api/webhooks") ||
        pathname.startsWith("/api/auth") ||
        pathname.startsWith("/api/v1/auth") ||
        pathname.startsWith("/api/v1/payments") ||
        pathname.startsWith("/api/health") ||
        pathname.startsWith("/api/debug-auth");

      if (isPublicRoute) return true;
      if (!isLoggedIn) return false;

      const role = auth?.user?.role as string;

      if (pathname.startsWith("/admin") || pathname.startsWith("/api/v1/admin")) {
        return role === "SUPER_ADMIN";
      }

      if (pathname.startsWith("/merchant") || pathname.startsWith("/api/v1/merchant")) {
        return role === "MERCHANT" || role === "SUPER_ADMIN";
      }

      return true;
    },
  },
};
