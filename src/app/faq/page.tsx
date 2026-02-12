"use client";

import Link from "next/link";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { ThemeToggle } from "@/components/shared/theme-toggle";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

export default function FAQPage() {
  return (
    <div className="min-h-screen flex flex-col">
      <header className="border-b bg-card/50 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <Image src="/k-pay.png" alt="Kastra Pay" width={40} height={40} className="rounded-lg" />
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

      <main className="flex-1 container mx-auto px-4 py-12 pb-24 max-w-4xl">
        <h1 className="text-4xl font-bold mb-2 bg-gradient-to-r from-blue-600 via-teal-500 to-green-600 bg-clip-text text-transparent">Customer FAQ</h1>
        <p className="text-muted-foreground mb-8">Find answers to common questions about Kastra Pay</p>

        <Accordion type="single" collapsible className="space-y-4 mb-8">
          <AccordionItem value="about" className="border-2 rounded-lg px-6">
            <AccordionTrigger className="text-lg font-semibold hover:no-underline">1. About Kastra Pay</AccordionTrigger>
            <AccordionContent className="space-y-4">
              <div>
                <h3 className="font-semibold mb-2">1.1. What is Kastra Pay?</h3>
                <p className="text-muted-foreground">Kastra Pay is a multi-merchant payment platform that enables businesses across Africa to accept payments via M-Pesa, Flutterwave, and Paystack through a unified checkout experience.</p>
              </div>
              <div>
                <h3 className="font-semibold mb-2">1.2. Why should I use Kastra Pay?</h3>
                <p className="text-muted-foreground">Kastra Pay offers seamless integration with multiple payment providers, real-time transaction tracking, secure payment processing, and competitive transaction fees.</p>
              </div>
              <div>
                <h3 className="font-semibold mb-2">1.3. How secure are Kastra Pay transactions?</h3>
                <p className="text-muted-foreground">All transactions are encrypted end-to-end, and we comply with PCI-DSS standards. We use webhook verification and secure API authentication.</p>
              </div>
              <div>
                <h3 className="font-semibold mb-2">1.4. Where can I use Kastra Pay?</h3>
                <p className="text-muted-foreground">Kastra Pay is available across Africa, supporting multiple currencies including KES, USD, and NGN.</p>
              </div>
              <div>
                <h3 className="font-semibold mb-2">1.5. How to contact us?</h3>
                <p className="text-muted-foreground">Email us at support@kastrapay.com or call +254 700 000 000 for assistance.</p>
              </div>
            </AccordionContent>
          </AccordionItem>

          <AccordionItem value="register" className="border-2 rounded-lg px-6">
            <AccordionTrigger className="text-lg font-semibold hover:no-underline">2. Registration</AccordionTrigger>
            <AccordionContent className="space-y-4">
              <div>
                <h3 className="font-semibold mb-2">2.1. How do I sign up for Kastra Pay?</h3>
                <p className="text-muted-foreground">Click "Get Started" on our homepage, fill in your details, and choose between Customer or Merchant account type.</p>
              </div>
              <div>
                <h3 className="font-semibold mb-2">2.2. My account doesn't work.</h3>
                <p className="text-muted-foreground">Please verify your email address first. If issues persist, contact our support team.</p>
              </div>
              <div>
                <h3 className="font-semibold mb-2">2.3. I've forgotten my password.</h3>
                <p className="text-muted-foreground">Click "Forgot your password?" on the login page to reset it via email.</p>
              </div>
            </AccordionContent>
          </AccordionItem>

          <AccordionItem value="payment" className="border-2 rounded-lg px-6">
            <AccordionTrigger className="text-lg font-semibold hover:no-underline">3. Payment Processing</AccordionTrigger>
            <AccordionContent className="space-y-4">
              <div>
                <h3 className="font-semibold mb-2">3.1. An error message appears after I click "Pay Now"</h3>
                <p className="text-muted-foreground">Check your internet connection and payment details. If the error persists, try a different payment method or contact support.</p>
              </div>
              <div>
                <h3 className="font-semibold mb-2">3.2. My order is still loading, do I need to refresh?</h3>
                <p className="text-muted-foreground">No, please wait. Payment processing can take up to 2 minutes. Refreshing may cause duplicate charges.</p>
              </div>
              <div>
                <h3 className="font-semibold mb-2">3.3. When is my order confirmed?</h3>
                <p className="text-muted-foreground">You'll receive a confirmation email and SMS once payment is successfully processed.</p>
              </div>
              <div>
                <h3 className="font-semibold mb-2">3.4. I see an unrecognized transaction from Kastra Pay</h3>
                <p className="text-muted-foreground">Contact our support team immediately with your transaction reference number for investigation.</p>
              </div>
            </AccordionContent>
          </AccordionItem>

          <AccordionItem value="protection" className="border-2 rounded-lg px-6">
            <AccordionTrigger className="text-lg font-semibold hover:no-underline">4. Customer Protection</AccordionTrigger>
            <AccordionContent className="space-y-4">
              <div>
                <h3 className="font-semibold mb-2">4.1. What is customer protection?</h3>
                <p className="text-muted-foreground">Customer protection ensures you get a refund if your order isn't delivered or doesn't match the description.</p>
              </div>
              <div>
                <h3 className="font-semibold mb-2">4.2. How long will it take to get refunded?</h3>
                <p className="text-muted-foreground">Refunds are processed within 5-7 business days after approval.</p>
              </div>
              <div>
                <h3 className="font-semibold mb-2">4.3. Where will I receive my refund?</h3>
                <p className="text-muted-foreground">Refunds are sent to your original payment method (M-Pesa, card, etc.).</p>
              </div>
              <div>
                <h3 className="font-semibold mb-2">4.4. Who should I contact for a refund?</h3>
                <p className="text-muted-foreground">Contact the merchant first. If unresolved, reach out to our support team with your transaction details.</p>
              </div>
            </AccordionContent>
          </AccordionItem>

          <AccordionItem value="account" className="border-2 rounded-lg px-6 mb-4">
            <AccordionTrigger className="text-lg font-semibold hover:no-underline">5. My Kastra Pay Account</AccordionTrigger>
            <AccordionContent className="space-y-4">
              <div>
                <h3 className="font-semibold mb-2">5.1. Can I access my transaction history?</h3>
                <p className="text-muted-foreground">Yes, log in to your dashboard to view all your transactions, receipts, and payment history.</p>
              </div>
              <div>
                <h3 className="font-semibold mb-2">5.2. How do I edit my profile?</h3>
                <p className="text-muted-foreground">Go to Account Settings in your dashboard to update your personal information.</p>
              </div>
              <div>
                <h3 className="font-semibold mb-2">5.3. Can I use an email registered with another account?</h3>
                <p className="text-muted-foreground">No, each email address can only be associated with one Kastra Pay account.</p>
              </div>
              <div>
                <h3 className="font-semibold mb-2">5.4. Why is Kastra Pay sending me emails?</h3>
                <p className="text-muted-foreground">We send transaction confirmations, security alerts, and important account updates. You can manage email preferences in settings.</p>
              </div>
              <div>
                <h3 className="font-semibold mb-2">5.5. How can I close my account?</h3>
                <p className="text-muted-foreground">Contact our support team to request account closure. Ensure all pending transactions are completed first.</p>
              </div>
            </AccordionContent>
          </AccordionItem>
        </Accordion>

        <div className="mt-12 p-6 bg-muted/50 rounded-lg text-center">
          <h2 className="text-xl font-semibold mb-2">Still have questions?</h2>
          <p className="text-muted-foreground mb-4">Our support team is here to help</p>
          <Link href="/contact">
            <Button size="lg">Contact Support</Button>
          </Link>
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
