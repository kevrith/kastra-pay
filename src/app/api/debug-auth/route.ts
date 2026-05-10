export const dynamic = 'force-dynamic';

import { NextRequest, NextResponse } from "next/server";
import { createHash } from "crypto";
import { auth } from "@/lib/auth";

export async function GET(request: NextRequest) {
  const authSecret = process.env.AUTH_SECRET;
  const nextAuthSecret = process.env.NEXTAUTH_SECRET;
  const nextAuthUrl = process.env.NEXTAUTH_URL;

  const hashSecret = (s?: string) =>
    s ? createHash("sha256").update(s).digest("hex").slice(0, 16) : "NOT_SET";

  // Check which exact cookie name is present
  const secureToken = request.cookies.get("__Secure-authjs.session-token")?.value;
  const insecureToken = request.cookies.get("authjs.session-token")?.value;
  const sessionCookie = secureToken || insecureToken || "NO_SESSION_COOKIE";

  let tokenHeader = null;
  if (sessionCookie !== "NO_SESSION_COOKIE") {
    try {
      const headerB64 = sessionCookie.split(".")[0];
      tokenHeader = JSON.parse(Buffer.from(headerB64, "base64url").toString());
    } catch {
      tokenHeader = "DECODE_ERROR";
    }
  }

  // Try to read the session server-side (the same call the customer page makes)
  let serverSession = null;
  let serverSessionError = null;
  try {
    const session = await auth();
    serverSession = session
      ? { userId: session.user?.id, role: session.user?.role, email: session.user?.email }
      : null;
  } catch (e) {
    serverSessionError = e instanceof Error ? e.message : String(e);
  }

  return NextResponse.json({
    AUTH_SECRET_hash: hashSecret(authSecret),
    NEXTAUTH_SECRET_hash: hashSecret(nextAuthSecret),
    AUTH_SECRET_set: !!authSecret,
    NEXTAUTH_SECRET_set: !!nextAuthSecret,
    AUTH_SECRET_length: authSecret?.length ?? 0,
    NEXTAUTH_SECRET_length: nextAuthSecret?.length ?? 0,
    NEXTAUTH_URL: nextAuthUrl ?? "NOT_SET",
    secure_cookie_present: !!secureToken,
    insecure_cookie_present: !!insecureToken,
    session_cookie_present: sessionCookie !== "NO_SESSION_COOKIE",
    token_header: tokenHeader,
    server_session: serverSession,
    server_session_error: serverSessionError,
    node_env: process.env.NODE_ENV,
    request_url: request.url,
  });
}
