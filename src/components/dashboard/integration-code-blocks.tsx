"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Check, Copy } from "lucide-react";

function CodeBlock({ code, language }: { code: string; language: string }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="relative group">
      <Button
        variant="ghost"
        size="sm"
        className="absolute top-2 right-2 h-8 w-8 p-0 opacity-0 group-hover:opacity-100 transition-opacity"
        onClick={handleCopy}
      >
        {copied ? <Check className="h-4 w-4 text-green-500" /> : <Copy className="h-4 w-4" />}
      </Button>
      <pre className="bg-gray-950 text-gray-100 rounded-lg p-4 overflow-x-auto text-sm">
        <code className={`language-${language}`}>{code}</code>
      </pre>
    </div>
  );
}

export default function IntegrationCodeBlocks({ baseUrl }: { baseUrl: string }) {
  const [tab, setTab] = useState<"popup" | "redirect" | "api">("popup");

  const popupCode = `<!-- Add the KastraPay SDK -->
<script src="${baseUrl}/sdk/kastrapay.js"></script>

<button id="pay-btn">Pay Now</button>

<script>
  document.getElementById('pay-btn').addEventListener('click', function() {
    const handler = KastraPay.setup({
      key: "kp_live_YOUR_API_KEY",    // Your API key from Settings
      amount: 1500,                    // Amount in KES
      currency: "KES",
      email: "customer@example.com",
      phone: "+254712345678",
      name: "John Doe",
      description: "Order #12345",
      methods: ["MPESA_STK", "FLUTTERWAVE_CARD", "PAYSTACK_CARD"],
      metadata: {
        orderId: "12345",
        productName: "Premium Plan"
      },
      onSuccess: function(response) {
        console.log("Payment successful!", response);
        // response.transactionId - KastraPay transaction ID
        // response.reference     - Your idempotency key
        // response.status        - "COMPLETED"
        // response.amount        - Amount paid
        // Verify on your server before fulfilling the order
      },
      onClose: function() {
        console.log("Checkout closed");
      },
      onError: function(error) {
        console.error("Payment failed:", error.message);
      }
    });
    handler.open();
  });
</script>`;

  const redirectCode = `<!-- Add the KastraPay SDK -->
<script src="${baseUrl}/sdk/kastrapay.js"></script>

<button id="pay-btn">Pay Now</button>

<script>
  document.getElementById('pay-btn').addEventListener('click', function() {
    KastraPay.redirect({
      key: "kp_live_YOUR_API_KEY",
      amount: 1500,
      currency: "KES",
      email: "customer@example.com",
      phone: "+254712345678",
      name: "John Doe",
      description: "Order #12345",
      methods: ["MPESA_STK", "FLUTTERWAVE_CARD"],
      callbackUrl: "https://your-site.com/payment/callback",
      metadata: { orderId: "12345" }
    });
    // User is redirected to KastraPay checkout page
    // After payment, redirected to callbackUrl with:
    //   ?reference=xxx&status=success&transactionId=xxx
  });
</script>`;

  const apiCode = `// Server-to-server payment initiation (Node.js example)

const response = await fetch("${baseUrl}/api/v1/payments/initiate", {
  method: "POST",
  headers: {
    "Content-Type": "application/json",
    "Authorization": "Bearer kp_live_YOUR_API_KEY"
  },
  body: JSON.stringify({
    method: "MPESA_STK",
    amount: 1500,
    currency: "KES",
    merchantId: "YOUR_MERCHANT_ID",
    idempotencyKey: "unique-order-" + Date.now(),
    customerPhone: "+254712345678",
    customerEmail: "customer@example.com",
    customerName: "John Doe",
    description: "Order #12345",
    metadata: { orderId: "12345" }
  })
});

const data = await response.json();

if (data.success) {
  console.log("Transaction ID:", data.data.transactionId);
  console.log("Status:", data.data.status);
  // For card payments, redirect user to:
  console.log("Redirect URL:", data.data.redirectUrl);
  // For M-Pesa, STK push was sent to phone
  console.log("Checkout Request:", data.data.checkoutRequestId);
}`;

  return (
    <Card>
      <CardHeader>
        <CardTitle>Code Examples</CardTitle>
        <div className="flex gap-2 mt-2">
          <Button
            variant={tab === "popup" ? "default" : "outline"}
            size="sm"
            onClick={() => setTab("popup")}
          >
            Popup Checkout
          </Button>
          <Button
            variant={tab === "redirect" ? "default" : "outline"}
            size="sm"
            onClick={() => setTab("redirect")}
          >
            Redirect
          </Button>
          <Button
            variant={tab === "api" ? "default" : "outline"}
            size="sm"
            onClick={() => setTab("api")}
          >
            REST API
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        {tab === "popup" && <CodeBlock code={popupCode} language="html" />}
        {tab === "redirect" && <CodeBlock code={redirectCode} language="html" />}
        {tab === "api" && <CodeBlock code={apiCode} language="javascript" />}
      </CardContent>
    </Card>
  );
}
