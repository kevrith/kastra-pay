export const dynamic = 'force-dynamic';

import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";

export default async function CustomerTransactionsPage() {
  const session = await auth();
  if (!session?.user?.id) {
    redirect("/login");
  }

  // Redirect to dashboard which already shows transactions
  redirect("/customer");
}
