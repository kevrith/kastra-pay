export const dynamic = 'force-dynamic';

import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Code, Globe, Smartphone, CreditCard, Webhook, ShieldCheck } from "lucide-react";
import IntegrationCodeBlocks from "@/components/dashboard/integration-code-blocks";

export default async function IntegrationPage() {
  const session = await auth();
  if (!session?.user?.merchantId) redirect("/merchant");

  const baseUrl = process.env.NEXTAUTH_URL || "https://your-domain.com";

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Integration Guide</h1>
        <p className="text-muted-foreground">
          Integrate KastraPay checkout into your website or application
        </p>
      </div>

      {/* Quick Start */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Code className="h-5 w-5" />
            Quick Start
          </CardTitle>
          <CardDescription>
            Add KastraPay checkout to your website in under 5 minutes
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <h3 className="font-semibold">Step 1: Include the SDK</h3>
            <p className="text-sm text-muted-foreground">
              Add the KastraPay SDK script to your HTML page
            </p>
          </div>
          <div className="space-y-2">
            <h3 className="font-semibold">Step 2: Initialize checkout</h3>
            <p className="text-sm text-muted-foreground">
              Configure and open the checkout popup with your API key
            </p>
          </div>
          <div className="space-y-2">
            <h3 className="font-semibold">Step 3: Handle the response</h3>
            <p className="text-sm text-muted-foreground">
              Process the payment result in your callback functions
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Code Examples */}
      <IntegrationCodeBlocks baseUrl={baseUrl} />

      {/* Integration Methods */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <Globe className="h-5 w-5" />
              Popup Checkout
              <Badge>Recommended</Badge>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              Opens a secure checkout popup on your page. The customer never leaves
              your website. Best for web applications and e-commerce sites.
            </p>
            <ul className="mt-3 space-y-1 text-sm text-muted-foreground">
              <li>- No page redirect required</li>
              <li>- Customer stays on your site</li>
              <li>- Real-time payment status</li>
              <li>- Callback functions for success/error</li>
            </ul>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <CreditCard className="h-5 w-5" />
              Redirect Checkout
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              Redirects the customer to a hosted KastraPay checkout page.
              Best for mobile apps or when you prefer a full-page experience.
            </p>
            <ul className="mt-3 space-y-1 text-sm text-muted-foreground">
              <li>- Full-page checkout experience</li>
              <li>- Callback URL on completion</li>
              <li>- Works on any platform</li>
              <li>- No JavaScript required</li>
            </ul>
          </CardContent>
        </Card>
      </div>

      {/* Payment Methods */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Smartphone className="h-5 w-5" />
            Supported Payment Methods
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium">MPESA_STK</p>
              <p className="text-sm text-muted-foreground">M-Pesa STK Push (Kenya)</p>
            </div>
            <Badge variant="default">Available</Badge>
          </div>
          <Separator />
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium">FLUTTERWAVE_CARD</p>
              <p className="text-sm text-muted-foreground">Card payments via Flutterwave</p>
            </div>
            <Badge variant="default">Available</Badge>
          </div>
          <Separator />
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium">PAYSTACK_CARD</p>
              <p className="text-sm text-muted-foreground">Card payments via Paystack</p>
            </div>
            <Badge variant="default">Available</Badge>
          </div>
          <Separator />
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium">FLUTTERWAVE_MOBILE_MONEY</p>
              <p className="text-sm text-muted-foreground">Mobile money via Flutterwave</p>
            </div>
            <Badge variant="default">Available</Badge>
          </div>
          <Separator />
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium">PAYSTACK_MOBILE_MONEY</p>
              <p className="text-sm text-muted-foreground">Mobile money via Paystack</p>
            </div>
            <Badge variant="default">Available</Badge>
          </div>
        </CardContent>
      </Card>

      {/* Webhooks */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Webhook className="h-5 w-5" />
            Webhook Notifications
          </CardTitle>
          <CardDescription>
            Receive real-time payment status updates on your server
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          <p className="text-sm text-muted-foreground">
            Configure your webhook URL in Merchant Settings to receive server-to-server
            notifications for payment events. All webhook deliveries include HMAC-SHA256
            signatures for verification.
          </p>
          <div className="space-y-2">
            <p className="font-medium text-sm">Webhook Events:</p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              <code className="text-xs bg-muted px-2 py-1 rounded">payment.completed</code>
              <code className="text-xs bg-muted px-2 py-1 rounded">payment.failed</code>
              <code className="text-xs bg-muted px-2 py-1 rounded">refund.completed</code>
              <code className="text-xs bg-muted px-2 py-1 rounded">refund.failed</code>
            </div>
          </div>
          <div className="space-y-2">
            <p className="font-medium text-sm">Webhook Headers:</p>
            <div className="space-y-1">
              <code className="text-xs bg-muted px-2 py-1 rounded block">X-KastraPay-Signature: sha256=...</code>
              <code className="text-xs bg-muted px-2 py-1 rounded block">X-KastraPay-Delivery: uuid</code>
              <code className="text-xs bg-muted px-2 py-1 rounded block">X-KastraPay-Retry: 0</code>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Security */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <ShieldCheck className="h-5 w-5" />
            Security Best Practices
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ul className="space-y-2 text-sm text-muted-foreground">
            <li><strong>Never expose your API key on the client-side</strong> in places where it can be extracted. The SDK handles secure transmission.</li>
            <li><strong>Always verify webhook signatures</strong> using the HMAC-SHA256 signature in the X-KastraPay-Signature header.</li>
            <li><strong>Use idempotency keys</strong> for every payment to prevent duplicate charges.</li>
            <li><strong>Validate payment amounts</strong> on your server before fulfilling orders.</li>
            <li><strong>Use HTTPS</strong> for all callback URLs and webhook endpoints.</li>
          </ul>
        </CardContent>
      </Card>

      {/* API Reference */}
      <Card>
        <CardHeader>
          <CardTitle>REST API Reference</CardTitle>
          <CardDescription>
            For server-to-server integrations without the SDK
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <Badge variant="default">POST</Badge>
              <code className="text-sm">/api/v1/payments/initiate</code>
            </div>
            <p className="text-sm text-muted-foreground">
              Initiate a new payment. Requires Bearer token authentication with your API key.
            </p>
          </div>
          <Separator />
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <Badge variant="secondary">POST</Badge>
              <code className="text-sm">/api/v1/payments/verify</code>
            </div>
            <p className="text-sm text-muted-foreground">
              Verify payment status by transaction ID or provider reference.
            </p>
          </div>
          <Separator />
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <Badge variant="destructive">POST</Badge>
              <code className="text-sm">/api/v1/payments/refund</code>
            </div>
            <p className="text-sm text-muted-foreground">
              Initiate a full or partial refund. Requires merchant authentication.
            </p>
          </div>
          <Separator />
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <Badge variant="outline">GET</Badge>
              <code className="text-sm">/api/health</code>
            </div>
            <p className="text-sm text-muted-foreground">
              Health check endpoint. Returns service status and provider availability.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
