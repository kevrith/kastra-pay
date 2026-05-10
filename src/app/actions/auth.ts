"use server";

import { signIn } from "@/lib/auth";
import { AuthError } from "next-auth";
import { headers } from "next/headers";

export async function loginAction(
  _prevState: string | null,
  formData: FormData
): Promise<string | null> {
  const hdrs = await headers();
  const host = hdrs.get("host") ?? "localhost:3003";
  const proto = hdrs.get("x-forwarded-proto") ?? "http";
  const origin = `${proto}://${host}`;

  try {
    await signIn("credentials", {
      email: formData.get("email") as string,
      password: formData.get("password") as string,
      redirectTo: `${origin}/dashboard`,
    });
  } catch (error) {
    if (error instanceof AuthError) {
      return "Invalid email or password";
    }
    // NEXT_REDIRECT — re-throw so Next.js handles the navigation
    throw error;
  }
  return null;
}
