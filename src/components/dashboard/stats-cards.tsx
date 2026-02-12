"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { DollarSign, CreditCard, TrendingUp, Clock } from "lucide-react";

interface StatsCardsProps {
  totalRevenue: number;
  totalTransactions: number;
  successRate: number;
  pendingCount: number;
  currency?: string;
}

export function StatsCards({
  totalRevenue,
  totalTransactions,
  successRate,
  pendingCount,
  currency = "KES",
}: StatsCardsProps) {
  const stats = [
    {
      title: "Total Revenue",
      value: `${currency} ${totalRevenue.toLocaleString()}`,
      icon: DollarSign,
      description: "All time revenue",
    },
    {
      title: "Transactions",
      value: totalTransactions.toLocaleString(),
      icon: CreditCard,
      description: "Total transactions",
    },
    {
      title: "Success Rate",
      value: `${successRate.toFixed(1)}%`,
      icon: TrendingUp,
      description: "Payment success rate",
    },
    {
      title: "Pending",
      value: pendingCount.toLocaleString(),
      icon: Clock,
      description: "Awaiting completion",
    },
  ];

  return (
    <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
      {stats.map((stat) => (
        <Card key={stat.title}>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{stat.title}</CardTitle>
            <stat.icon className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stat.value}</div>
            <p className="text-xs text-muted-foreground">{stat.description}</p>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
