"use client";

import Link from "next/link";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { ThemeToggle } from "@/components/shared/theme-toggle";
import { Copy, Check } from "lucide-react";
import { useState } from "react";

export default function APIDocsPage() {
  return (
    <div className="min-h-screen flex flex-col">
      <header className="border-b bg-card/50 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <Image src="/k-pay.png" alt="Kastra Pay" width={40} height={40} className="rounded-lg" style={{ width: 'auto', height: '40px' }} />
            <span className="font-bold text-lg sm:text-xl text-foreground">Kastra Pay</span>
          </Link>
          <div className="flex items-center gap-2 sm:gap-4">
            <ThemeToggle />
            <Link href="/login">
              <Button variant="ghost" className="font-medium text-sm sm:text-base">Log in</Button>
            </Link>
          </div>
        </div>
      </header>

      <main className="flex-1 container mx-auto px-4 py-12 max-w-5xl">
        <h1 className="text-4xl font-bold mb-2 bg-gradient-to-r from-blue-600 via-teal-500 to-green-600 bg-clip-text text-transparent">
          API Documentation
        </h1>
        <p className="text-muted-foreground mb-8">Integrate Kastra Pay into your web applications</p>

        <div className="space-y-8">
          <section className="border-2 rounded-xl p-8 bg-card card-hover-subtle">
            <h2 className="text-2xl font-bold mb-4">1. Getting Started</h2>
            <p className="text-muted-foreground mb-4">
              To integrate Kastra Pay, you need API keys from your merchant dashboard.
            </p>
            <ol className="space-y-2 text-muted-foreground list-decimal list-inside">
              <li>Sign up at <Link href="/register?role=MERCHANT" className="text-primary hover:underline">kastrapay.com/register</Link></li>
              <li>Complete KYC verification</li>
              <li>Go to Settings → API Keys</li>
              <li>Copy your Merchant ID and Secret Key</li>
            </ol>
          </section>

          <section className="border-2 rounded-xl p-8 bg-card card-hover-subtle">
            <h2 className="text-2xl font-bold mb-4">2. Authentication</h2>
            <p className="text-muted-foreground mb-4">
              Include your API key in the Authorization header:
            </p>
            <CodeBlock code={`Authorization: Bearer kp_live_your_secret_key`} />
          </section>

          <section className="border-2 rounded-xl p-8 bg-card card-hover-subtle">
            <h2 className="text-2xl font-bold mb-4">3. Initiate Payment</h2>
            <div className="mb-4">
              <span className="inline-block px-3 py-1 bg-green-500/10 text-green-600 rounded font-mono text-sm mb-2">POST</span>
              <code className="text-sm ml-2">/api/v1/payments/initiate</code>
            </div>
            <CodeBlock code={`{
  "merchantId": "your_merchant_id",
  "method": "MPESA_STK",
  "amount": 1000,
  "currency": "KES",
  "customerPhone": "254712345678",
  "customerEmail": "customer@example.com",
  "customerName": "John Doe",
  "description": "Payment for Order #123",
  "idempotencyKey": "ORDER-123-" + Date.now(),
  "metadata": {
    "orderId": "123",
    "product": "Premium T-Shirt"
  }
}`} />
            <div className="mt-4 space-y-2 text-sm">
              <p className="font-semibold">Payment Methods:</p>
              <ul className="list-disc list-inside text-muted-foreground space-y-1">
                <li><code>MPESA_STK</code> - M-Pesa STK Push</li>
                <li><code>FLUTTERWAVE_CARD</code> - Card via Flutterwave</li>
                <li><code>PAYSTACK_CARD</code> - Card via Paystack</li>
              </ul>
            </div>
          </section>

          <section className="border-2 rounded-xl p-8 bg-card card-hover-subtle">
            <h2 className="text-2xl font-bold mb-4">4. Complete Integration Example</h2>
            <p className="text-muted-foreground mb-4">
              Full HTML + JavaScript example:
            </p>
            <CodeBlock code={`<!DOCTYPE html>
<html>
<head>
  <title>Checkout</title>
</head>
<body>
  <h1>Premium T-Shirt - KES 1,500</h1>
  <input type="email" id="email" placeholder="Email" required>
  <input type="tel" id="phone" placeholder="254712345678" required>
  <button onclick="checkout()">Pay with M-Pesa</button>

  <script>
    async function checkout() {
      const email = document.getElementById('email').value;
      const phone = document.getElementById('phone').value;
      
      const response = await fetch('https://kastrapay.com/api/v1/payments/initiate', {
        method: 'POST',
        headers: {
          'Authorization': 'Bearer kp_live_your_secret_key',
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          merchantId: 'your_merchant_id',
          method: 'MPESA_STK',
          amount: 1500,
          currency: 'KES',
          customerPhone: phone,
          customerEmail: email,
          description: 'Premium T-Shirt',
          idempotencyKey: 'ORDER-' + Date.now()
        })
      });
      
      const data = await response.json();
      
      if (data.success) {
        alert('Check your phone for M-Pesa prompt!');
        // Poll for payment status
        checkPaymentStatus(data.data.transactionId);
      } else {
        alert('Error: ' + data.error.message);
      }
    }
    
    async function checkPaymentStatus(transactionId) {
      const response = await fetch(
        'https://kastrapay.com/api/v1/payments/verify?transactionId=' + transactionId,
        {
          headers: {
            'Authorization': 'Bearer kp_live_your_secret_key'
          }
        }
      );
      
      const data = await response.json();
      
      if (data.data.status === 'COMPLETED') {
        alert('Payment successful!');
        window.location.href = '/success';
      } else if (data.data.status === 'FAILED') {
        alert('Payment failed');
      } else {
        // Still processing, check again in 3 seconds
        setTimeout(() => checkPaymentStatus(transactionId), 3000);
      }
    }
  </script>
</body>
</html>`} />
          </section>

          <section className="border-2 rounded-xl p-8 bg-card card-hover-subtle">
            <h2 className="text-2xl font-bold mb-4">5. Verify Payment</h2>
            <div className="mb-4">
              <span className="inline-block px-3 py-1 bg-blue-500/10 text-blue-600 rounded font-mono text-sm mb-2">GET</span>
              <code className="text-sm ml-2">/api/v1/payments/verify?transactionId=xxx</code>
            </div>
            <CodeBlock code={`const response = await fetch(
  'https://kastrapay.com/api/v1/payments/verify?transactionId=xxx',
  {
    headers: {
      'Authorization': 'Bearer kp_live_your_secret_key'
    }
  }
);

const data = await response.json();

// Response
{
  "success": true,
  "data": {
    "id": "transaction_id",
    "status": "COMPLETED",
    "amount": 1500,
    "currency": "KES",
    "paymentMethod": "MPESA_STK",
    "mpesaReceiptNumber": "ABC123XYZ",
    "completedAt": "2024-01-15T10:30:00Z"
  }
}`} />
          </section>

          <section className="border-2 rounded-xl p-8 bg-card card-hover-subtle">
            <h2 className="text-2xl font-bold mb-4">6. Backend Integration (Node.js)</h2>
            <CodeBlock code={`const express = require('express');
const app = express();

app.post('/checkout', async (req, res) => {
  const { email, phone, amount } = req.body;
  
  const response = await fetch('https://kastrapay.com/api/v1/payments/initiate', {
    method: 'POST',
    headers: {
      'Authorization': 'Bearer ' + process.env.KASTRAPAY_SECRET_KEY,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      merchantId: process.env.KASTRAPAY_MERCHANT_ID,
      method: 'MPESA_STK',
      amount: amount,
      currency: 'KES',
      customerPhone: phone,
      customerEmail: email,
      idempotencyKey: 'ORDER-' + Date.now()
    })
  });
  
  const data = await response.json();
  res.json(data);
});

app.listen(3000);`} />
          </section>

          <section className="border-2 rounded-xl p-8 bg-card card-hover-subtle">
            <h2 className="text-2xl font-bold mb-4">7. Testing</h2>
            <p className="text-muted-foreground mb-4">Use sandbox credentials:</p>
            <div className="space-y-3 text-sm">
              <div className="p-3 bg-muted rounded">
                <strong>M-Pesa Test:</strong><br/>
                Phone: 254712345678<br/>
                PIN: Any 4 digits
              </div>
              <div className="p-3 bg-muted rounded">
                <strong>Test Card:</strong><br/>
                Number: 4242 4242 4242 4242<br/>
                Expiry: Any future date<br/>
                CVV: 123
              </div>
            </div>
          </section>

          <section className="border-2 rounded-xl p-8 bg-card card-hover-subtle">
            <h2 className="text-2xl font-bold mb-4">Need Help?</h2>
            <p className="text-muted-foreground mb-4">
              Contact our developer support team for integration assistance.
            </p>
            <Link href="/contact">
              <Button>Contact Support</Button>
            </Link>
          </section>
        </div>
      </main>

      <footer className="border-t bg-card/30 py-8">
        <div className="container mx-auto px-4 text-center text-sm text-muted-foreground">
          <p>&copy; {new Date().getFullYear()} Kastra Pay. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}

function CodeBlock({ code }: { code: string }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="relative">
      <pre className="bg-muted p-4 rounded-lg overflow-x-auto text-sm">
        <code>{code}</code>
      </pre>
      <button
        onClick={handleCopy}
        className="absolute top-2 right-2 p-2 bg-background border rounded hover:bg-accent transition-colors"
      >
        {copied ? <Check className="h-4 w-4 text-green-600" /> : <Copy className="h-4 w-4" />}
      </button>
    </div>
  );
}
