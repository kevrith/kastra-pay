export const dynamic = 'force-dynamic';

import { NextRequest, NextResponse } from "next/server";
import { createHash } from "crypto";

export async function GET(request: NextRequest) {
  const authSecret = process.env.AUTH_SECRET;
  const nextAuthSecret = process.env.NEXTAUTH_SECRET;

  // Hash the secrets so we don't expose them but can compare
  const hashSecret = (s?: string) =>
    s ? createHash("sha256").update(s).digest("hex").slice(0, 16) : "NOT_SET";

  // Get the session cookie
  const sessionCookie =
    request.cookies.get("__Secure-authjs.session-token")?.value ||
    request.cookies.get("authjs.session-token")?.value ||
    "NO_SESSION_COOKIE";

  // Decode the JWE header (first part before first dot)
  let tokenHeader = null;
  if (sessionCookie !== "NO_SESSION_COOKIE") {
    try {
      const headerB64 = sessionCookie.split(".")[0];
      tokenHeader = JSON.parse(Buffer.from(headerB64, "base64url").toString());
    } catch {
      tokenHeader = "DECODE_ERROR";
    }
  }

  return NextResponse.json({
    AUTH_SECRET_hash: hashSecret(authSecret),
    NEXTAUTH_SECRET_hash: hashSecret(nextAuthSecret),
    AUTH_SECRET_set: !!authSecret,
    NEXTAUTH_SECRET_set: !!nextAuthSecret,
    AUTH_SECRET_length: authSecret?.length ?? 0,
    NEXTAUTH_SECRET_length: nextAuthSecret?.length ?? 0,
    session_cookie_present: sessionCookie !== "NO_SESSION_COOKIE",
    token_header: tokenHeader,
    node_env: process.env.NODE_ENV,
  });
}
