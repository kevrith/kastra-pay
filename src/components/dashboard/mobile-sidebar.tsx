"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { useSession } from "next-auth/react";
import { cn } from "@/lib/utils";
import {
  LayoutDashboard,
  Receipt,
  RefreshCcw,
  Link2,
  Settings,
  BarChart3,
  Users,
  ScrollText,
  ShieldCheck,
} from "lucide-react";

const merchantLinks = [
  { href: "/merchant", label: "Dashboard", icon: LayoutDashboard },
  { href: "/merchant/transactions", label: "Transactions", icon: Receipt },
  { href: "/merchant/refunds", label: "Refunds", icon: RefreshCcw },
  { href: "/merchant/payment-links", label: "Payment Links", icon: Link2 },
  { href: "/merchant/analytics", label: "Analytics", icon: BarChart3 },
  { href: "/merchant/settings", label: "Settings", icon: Settings },
];

const adminLinks = [
  { href: "/admin", label: "Dashboard", icon: LayoutDashboard },
  { href: "/admin/merchants", label: "Merchants", icon: Users },
  { href: "/admin/transactions", label: "Transactions", icon: Receipt },
  { href: "/admin/audit-logs", label: "Audit Logs", icon: ScrollText },
  { href: "/admin/settings", label: "Settings", icon: ShieldCheck },
];

const customerLinks = [
  { href: "/customer", label: "Dashboard", icon: LayoutDashboard },
  { href: "/customer/transactions", label: "My Transactions", icon: Receipt },
];

export function MobileSidebar() {
  const pathname = usePathname();
  const { data: session } = useSession();
  const role = session?.user?.role;

  const links =
    role === "SUPER_ADMIN"
      ? adminLinks
      : role === "MERCHANT"
        ? merchantLinks
        : customerLinks;

  return (
    <div className="flex flex-col h-full bg-card pt-5">
      <div className="flex items-center gap-2 px-6 mb-8">
        <Image src="/k-pay.png" alt="Kastra Pay" width={32} height={32} className="rounded-lg" />
        <span className="font-bold text-lg">Kastra Pay</span>
      </div>
      <nav className="flex-1 px-3 space-y-1">
        {links.map((link) => {
          const isActive =
            pathname === link.href ||
            (link.href !== "/merchant" &&
              link.href !== "/admin" &&
              link.href !== "/customer" &&
              pathname.startsWith(link.href));

          return (
            <Link
              key={link.href}
              href={link.href}
              className={cn(
                "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
                isActive
                  ? "bg-primary/10 text-primary"
                  : "text-muted-foreground hover:bg-muted hover:text-foreground"
              )}
            >
              <link.icon className="h-4 w-4" />
              {link.label}
            </Link>
          );
        })}
      </nav>
    </div>
  );
}
