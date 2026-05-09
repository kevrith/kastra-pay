export const dynamic = 'force-dynamic';
export const runtime = 'edge';

import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  const authSecret = process.env.AUTH_SECRET;
  const nextAuthSecret = process.env.NEXTAUTH_SECRET;

  const encoder = new TextEncoder();
  const hashSecret = async (s?: string) => {
    if (!s) return "NOT_SET";
    const data = encoder.encode(s);
    const hashBuffer = await crypto.subtle.digest("SHA-256", data);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    return hashArray.map(b => b.toString(16).padStart(2, "0")).join("").slice(0, 16);
  };

  const sessionCookie =
    request.cookies.get("__Secure-authjs.session-token")?.value ||
    request.cookies.get("authjs.session-token")?.value || "NONE";

  let tokenKid = null;
  if (sessionCookie !== "NONE") {
    try {
      const headerB64 = sessionCookie.split(".")[0];
      const decoded = atob(headerB64.replace(/-/g, "+").replace(/_/g, "/"));
      tokenKid = JSON.parse(decoded).kid;
    } catch { tokenKid = "DECODE_ERROR"; }
  }

  return NextResponse.json({
    runtime: "edge",
    AUTH_SECRET_set: !!authSecret,
    AUTH_SECRET_length: authSecret?.length ?? 0,
    AUTH_SECRET_hash: await hashSecret(authSecret),
    NEXTAUTH_SECRET_hash: await hashSecret(nextAuthSecret),
    session_cookie: sessionCookie !== "NONE" ? "PRESENT" : "ABSENT",
    token_kid: tokenKid,
  });
}
