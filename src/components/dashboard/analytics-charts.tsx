"use client";

import {
  AreaChart,
  Area,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface RevenueDataPoint {
  date: string;
  revenue: number;
  count: number;
}

interface MethodBreakdown {
  method: string;
  count: number;
  revenue: number;
}

interface StatusBreakdown {
  status: string;
  count: number;
}

interface AnalyticsChartsProps {
  revenueOverTime: RevenueDataPoint[];
  methodBreakdown: MethodBreakdown[];
  statusBreakdown: StatusBreakdown[];
  currency: string;
}

const COLORS = [
  "hsl(var(--chart-1, 220 70% 50%))",
  "hsl(var(--chart-2, 160 60% 45%))",
  "hsl(var(--chart-3, 30 80% 55%))",
  "hsl(var(--chart-4, 280 65% 60%))",
  "hsl(var(--chart-5, 340 75% 55%))",
  "hsl(var(--chart-6, 200 70% 50%))",
];

const PIE_COLORS = ["#22c55e", "#3b82f6", "#f59e0b", "#ef4444", "#8b5cf6", "#6b7280"];

export function AnalyticsCharts({
  revenueOverTime,
  methodBreakdown,
  statusBreakdown,
  currency,
}: AnalyticsChartsProps) {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* Revenue Over Time */}
      <Card className="lg:col-span-2">
        <CardHeader>
          <CardTitle>Revenue Over Time</CardTitle>
        </CardHeader>
        <CardContent>
          {revenueOverTime.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              No revenue data yet
            </div>
          ) : (
            <ResponsiveContainer width="100%" height={300}>
              <AreaChart data={revenueOverTime}>
                <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                <XAxis dataKey="date" className="text-xs" />
                <YAxis className="text-xs" />
                <Tooltip
                  formatter={(value: number) => [`${currency} ${value.toLocaleString()}`, "Revenue"]}
                  labelFormatter={(label) => `Date: ${label}`}
                />
                <Area
                  type="monotone"
                  dataKey="revenue"
                  stroke={COLORS[0]}
                  fill={COLORS[0]}
                  fillOpacity={0.2}
                  strokeWidth={2}
                />
              </AreaChart>
            </ResponsiveContainer>
          )}
        </CardContent>
      </Card>

      {/* Payment Method Breakdown */}
      <Card>
        <CardHeader>
          <CardTitle>By Payment Method</CardTitle>
        </CardHeader>
        <CardContent>
          {methodBreakdown.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              No data yet
            </div>
          ) : (
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={methodBreakdown}>
                <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                <XAxis dataKey="method" className="text-xs" />
                <YAxis className="text-xs" />
                <Tooltip
                  formatter={(value: number, name: string) => [
                    name === "revenue" ? `${currency} ${value.toLocaleString()}` : value,
                    name === "revenue" ? "Revenue" : "Transactions",
                  ]}
                />
                <Legend />
                <Bar dataKey="count" name="Transactions" fill={PIE_COLORS[1]} radius={[4, 4, 0, 0]} />
                <Bar dataKey="revenue" name="Revenue" fill={PIE_COLORS[0]} radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          )}
        </CardContent>
      </Card>

      {/* Transaction Status */}
      <Card>
        <CardHeader>
          <CardTitle>Transaction Status</CardTitle>
        </CardHeader>
        <CardContent>
          {statusBreakdown.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              No data yet
            </div>
          ) : (
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={statusBreakdown}
                  cx="50%"
                  cy="50%"
                  outerRadius={100}
                  dataKey="count"
                  nameKey="status"
                  label={({ status, count }) => `${status}: ${count}`}
                >
                  {statusBreakdown.map((_, index) => (
                    <Cell key={`cell-${index}`} fill={PIE_COLORS[index % PIE_COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
