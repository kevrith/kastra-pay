export const dynamic = 'force-dynamic';

import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { BarChart3 } from "lucide-react";

export default async function AnalyticsPage() {
  const session = await auth();
  if (!session?.user?.merchantId) {
    redirect("/merchant/settings");
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Analytics</h1>
        <p className="text-muted-foreground">
          Detailed insights into your payment activity
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Revenue Analytics</CardTitle>
          <CardDescription>
            Charts and detailed analytics coming soon
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col items-center justify-center py-16 text-muted-foreground">
            <BarChart3 className="h-12 w-12 mb-4" />
            <p className="text-lg font-medium">Analytics Dashboard</p>
            <p className="text-sm">
              Revenue charts, payment method breakdown, and trend analysis will
              appear here once you have transaction data.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
