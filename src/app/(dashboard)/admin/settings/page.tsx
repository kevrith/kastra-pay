export const dynamic = 'force-dynamic';

import { prisma } from "@/lib/prisma";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
  ShieldCheck,
  CreditCard,
  Smartphone,
  Users,
  Receipt,
  Activity,
} from "lucide-react";

export default async function AdminSettingsPage() {
  // Gather platform stats
  const [
    merchantCount,
    userCount,
    transactionCount,
    webhookCount,
  ] = await Promise.all([
    prisma.merchant.count(),
    prisma.user.count(),
    prisma.transaction.count(),
    prisma.webhookEvent.count(),
  ]);

  const envStatus = {
    mpesa: !!process.env.MPESA_CONSUMER_KEY && !!process.env.MPESA_CONSUMER_SECRET,
    flutterwave: !!process.env.FLUTTERWAVE_SECRET_KEY,
    paystack: !!process.env.PAYSTACK_SECRET_KEY,
    resend: !!process.env.RESEND_API_KEY,
    database: !!process.env.DATABASE_URL,
    nextauth: !!process.env.NEXTAUTH_SECRET,
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Platform Settings</h1>
        <p className="text-muted-foreground">
          Platform configuration and service health
        </p>
      </div>

      {/* Platform Overview */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <Users className="h-8 w-8 text-blue-500" />
              <div>
                <p className="text-2xl font-bold">{userCount}</p>
                <p className="text-sm text-muted-foreground">Total Users</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <ShieldCheck className="h-8 w-8 text-green-500" />
              <div>
                <p className="text-2xl font-bold">{merchantCount}</p>
                <p className="text-sm text-muted-foreground">Merchants</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <Receipt className="h-8 w-8 text-purple-500" />
              <div>
                <p className="text-2xl font-bold">{transactionCount}</p>
                <p className="text-sm text-muted-foreground">Transactions</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <Activity className="h-8 w-8 text-orange-500" />
              <div>
                <p className="text-2xl font-bold">{webhookCount}</p>
                <p className="text-sm text-muted-foreground">Webhook Events</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Payment Provider Status */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CreditCard className="h-5 w-5" />
            Payment Providers
          </CardTitle>
          <CardDescription>
            Status of configured payment gateways
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Smartphone className="h-5 w-5 text-green-600" />
              <div>
                <p className="font-medium">M-Pesa (Safaricom Daraja)</p>
                <p className="text-sm text-muted-foreground">STK Push, C2B, Reversal</p>
              </div>
            </div>
            <Badge variant={envStatus.mpesa ? "default" : "destructive"}>
              {envStatus.mpesa ? "Configured" : "Not Configured"}
            </Badge>
          </div>
          <Separator />
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <CreditCard className="h-5 w-5 text-yellow-600" />
              <div>
                <p className="font-medium">Flutterwave</p>
                <p className="text-sm text-muted-foreground">Card payments, Mobile Money</p>
              </div>
            </div>
            <Badge variant={envStatus.flutterwave ? "default" : "destructive"}>
              {envStatus.flutterwave ? "Configured" : "Not Configured"}
            </Badge>
          </div>
          <Separator />
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <CreditCard className="h-5 w-5 text-blue-600" />
              <div>
                <p className="font-medium">Paystack</p>
                <p className="text-sm text-muted-foreground">Card payments, Mobile Money</p>
              </div>
            </div>
            <Badge variant={envStatus.paystack ? "default" : "destructive"}>
              {envStatus.paystack ? "Configured" : "Not Configured"}
            </Badge>
          </div>
        </CardContent>
      </Card>

      {/* Services Status */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Activity className="h-5 w-5" />
            Services
          </CardTitle>
          <CardDescription>
            Platform service configuration status
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium">Database (Neon PostgreSQL)</p>
              <p className="text-sm text-muted-foreground">Primary data store</p>
            </div>
            <Badge variant={envStatus.database ? "default" : "destructive"}>
              {envStatus.database ? "Connected" : "Not Configured"}
            </Badge>
          </div>
          <Separator />
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium">Authentication (NextAuth)</p>
              <p className="text-sm text-muted-foreground">JWT session management</p>
            </div>
            <Badge variant={envStatus.nextauth ? "default" : "destructive"}>
              {envStatus.nextauth ? "Configured" : "Not Configured"}
            </Badge>
          </div>
          <Separator />
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium">Email (Resend)</p>
              <p className="text-sm text-muted-foreground">Password reset, payment receipts</p>
            </div>
            <Badge variant={envStatus.resend ? "default" : "destructive"}>
              {envStatus.resend ? "Configured" : "Not Configured"}
            </Badge>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
