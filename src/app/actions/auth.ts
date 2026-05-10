"use server";

import { signIn } from "@/lib/auth";
import { AuthError } from "next-auth";

export async function loginAction(
  _prevState: string | null,
  formData: FormData
): Promise<string | null> {
  try {
    await signIn("credentials", {
      email: formData.get("email") as string,
      password: formData.get("password") as string,
      redirectTo: "/dashboard",
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
