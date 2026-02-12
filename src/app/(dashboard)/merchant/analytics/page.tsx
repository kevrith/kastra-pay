export const dynamic = 'force-dynamic';

import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import { AnalyticsCharts } from "@/components/dashboard/analytics-charts";
import { PAYMENT_METHOD_LABELS } from "@/lib/constants";
import { format, subDays } from "date-fns";

export default async function AnalyticsPage() {
  const session = await auth();
  if (!session?.user?.merchantId) {
    redirect("/merchant/settings");
  }

  const merchantId = session.user.merchantId;

  // Get transactions from last 30 days
  const thirtyDaysAgo = subDays(new Date(), 30);

  const transactions = await prisma.transaction.findMany({
    where: {
      merchantId,
      createdAt: { gte: thirtyDaysAgo },
    },
    select: {
      amount: true,
      currency: true,
      status: true,
      paymentMethod: true,
      createdAt: true,
    },
    orderBy: { createdAt: "asc" },
  });

  // Revenue over time (group by day)
  const revenueByDay: Record<string, { revenue: number; count: number }> = {};
  for (const tx of transactions) {
    if (tx.status === "COMPLETED") {
      const day = format(tx.createdAt, "MMM d");
      if (!revenueByDay[day]) {
        revenueByDay[day] = { revenue: 0, count: 0 };
      }
      revenueByDay[day].revenue += Number(tx.amount);
      revenueByDay[day].count += 1;
    }
  }
  const revenueOverTime = Object.entries(revenueByDay).map(([date, data]) => ({
    date,
    revenue: Math.round(data.revenue * 100) / 100,
    count: data.count,
  }));

  // Payment method breakdown
  const methodMap: Record<string, { count: number; revenue: number }> = {};
  for (const tx of transactions) {
    const label = PAYMENT_METHOD_LABELS[tx.paymentMethod] || tx.paymentMethod;
    if (!methodMap[label]) {
      methodMap[label] = { count: 0, revenue: 0 };
    }
    methodMap[label].count += 1;
    if (tx.status === "COMPLETED") {
      methodMap[label].revenue += Number(tx.amount);
    }
  }
  const methodBreakdown = Object.entries(methodMap).map(([method, data]) => ({
    method,
    count: data.count,
    revenue: Math.round(data.revenue * 100) / 100,
  }));

  // Status breakdown
  const statusMap: Record<string, number> = {};
  for (const tx of transactions) {
    statusMap[tx.status] = (statusMap[tx.status] || 0) + 1;
  }
  const statusBreakdown = Object.entries(statusMap).map(([status, count]) => ({
    status,
    count,
  }));

  // Determine primary currency
  const currency = transactions[0]?.currency || "KES";

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Analytics</h1>
        <p className="text-muted-foreground">
          Payment activity insights for the last 30 days
        </p>
      </div>

      <AnalyticsCharts
        revenueOverTime={revenueOverTime}
        methodBreakdown={methodBreakdown}
        statusBreakdown={statusBreakdown}
        currency={currency}
      />
    </div>
  );
}
