import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";

export default async function DashboardRedirectPage() {
  const session = await auth();

  if (!session?.user) {
    redirect("/login");
  }

  switch (session.user.role) {
    case "SUPER_ADMIN":
      redirect("/admin");
    case "MERCHANT":
      redirect("/merchant");
    default:
      redirect("/customer");
  }
}
