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
      const { pathname } = request.nextUrl;

      // Always allow public routes and API routes
      const isPublicRoute =
        ["/", "/login", "/register", "/forgot-password", "/reset-password", "/verify-email", "/faq", "/about", "/contact", "/terms", "/privacy", "/disputes", "/api-docs"].includes(pathname) ||
        pathname.startsWith("/checkout") ||
        pathname.startsWith("/pay/") ||
        pathname.startsWith("/api/") ||
        pathname.startsWith("/_next/");

      if (isPublicRoute) return true;

      // For protected routes, only block if clearly not logged in
      const isLoggedIn = !!auth?.user;
      if (!isLoggedIn) return false;

      return true;
    },
  },
};
