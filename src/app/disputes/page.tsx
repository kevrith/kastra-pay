import Link from "next/link";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { ThemeToggle } from "@/components/shared/theme-toggle";
import { Shield, Eye, AlertTriangle, CheckCircle, XCircle } from "lucide-react";

export default function DisputesPage() {
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

      <main className="flex-1 container mx-auto px-4 py-12 pb-24 max-w-4xl">
        <h1 className="text-4xl font-bold mb-2 bg-gradient-to-r from-blue-600 via-teal-500 to-green-600 bg-clip-text text-transparent">
          Disputes Information for Customers
        </h1>
        <p className="text-muted-foreground mb-12">Your protection and security are our top priorities</p>

        <div className="space-y-8">
          {/* Safety Section */}
          <section className="border-2 rounded-xl p-8 bg-card">
            <div className="flex items-center gap-3 mb-4">
              <div className="h-12 w-12 rounded-full bg-green-500/10 flex items-center justify-center">
                <Shield className="h-6 w-6 text-green-600" />
              </div>
              <h2 className="text-2xl font-bold">Safety</h2>
            </div>
            <p className="text-muted-foreground leading-relaxed">
              At Kastra Pay, your security is paramount. We employ bank-grade encryption, PCI-DSS compliance, and advanced fraud detection 
              systems to safeguard every transaction. Your payment credentials are tokenized and never stored on our servers or shared with 
              merchants. We act solely as a secure payment intermediary, ensuring your financial data remains protected at all times.
            </p>
          </section>

          {/* Real-Time Risk Monitoring */}
          <section className="border-2 rounded-xl p-8 bg-card">
            <div className="flex items-center gap-3 mb-4">
              <div className="h-12 w-12 rounded-full bg-blue-500/10 flex items-center justify-center">
                <Eye className="h-6 w-6 text-blue-600" />
              </div>
              <h2 className="text-2xl font-bold">Real-Time Risk Monitoring</h2>
            </div>
            <p className="text-muted-foreground leading-relaxed">
              All activities on Kastra Pay are monitored around the clock. Our real-time risk monitoring platform analyses all user behavior, 
              and our dedicated fraud team reviews all suspicious activity.
            </p>
          </section>

          {/* Fraud Prevention */}
          <section className="border-2 rounded-xl p-8 bg-card">
            <div className="flex items-center gap-3 mb-4">
              <div className="h-12 w-12 rounded-full bg-red-500/10 flex items-center justify-center">
                <AlertTriangle className="h-6 w-6 text-red-600" />
              </div>
              <h2 className="text-2xl font-bold">Fraud Prevention</h2>
            </div>
            <p className="text-muted-foreground leading-relaxed mb-4">
              If you notice anything suspicious - from emails, messages or calls claiming to be from Kastra Pay to activities on your account 
              that you cannot explain, or you were charged for a transaction that you did not make - contact us immediately by raising your dispute.
            </p>
            <p className="text-muted-foreground leading-relaxed mb-4">
              After an internal investigation, we will fully compensate any unauthorized transactions that were made with your Kastra Pay account.
            </p>
            <div className="bg-amber-500/10 border-2 border-amber-500/20 rounded-lg p-4">
              <p className="text-sm font-medium">
                <strong>Important:</strong> Kastra Pay will never ask for your password or full financial information (like a credit card number) 
                via email, text message or on the phone.
              </p>
            </div>
          </section>

          {/* Disputing Transactions */}
          <section className="border-2 rounded-xl p-8 bg-card">
            <h2 className="text-2xl font-bold mb-4">Disputing Transactions</h2>
            <p className="text-muted-foreground leading-relaxed mb-4">
              If you did not receive an item you ordered, or if it was damaged or significantly different from what was promised, we have your back. 
              Contact us immediately, but if possible 14 days after receiving the item at the latest, by raising your dispute.
            </p>
            <p className="text-muted-foreground leading-relaxed mb-6">
              Depending on the outcome of our investigation, we will reimburse you up to the full purchase price plus the original shipping costs.
            </p>
            <p className="text-muted-foreground leading-relaxed">
              For our investigation to be successful, we may require your help. Please make sure that you watch out for emails from Kastra Pay 
              in case we need additional information or documentation from you.
            </p>
          </section>

          {/* You are protected if */}
          <section className="border-2 rounded-xl p-8 bg-card">
            <div className="flex items-center gap-3 mb-6">
              <CheckCircle className="h-6 w-6 text-green-600" />
              <h2 className="text-2xl font-bold">You are protected if...</h2>
            </div>
            <ul className="space-y-3 text-muted-foreground">
              <li className="flex gap-2"><span className="text-green-600 mt-1">•</span><span>You received the wrong item</span></li>
              <li className="flex gap-2"><span className="text-green-600 mt-1">•</span><span>You ordered an original item (not a replica), but the item you received is counterfeit</span></li>
              <li className="flex gap-2"><span className="text-green-600 mt-1">•</span><span>The item was damaged during transport</span></li>
              <li className="flex gap-2"><span className="text-green-600 mt-1">•</span><span>The shipment was incomplete, and the merchant did not advise you beforehand</span></li>
              <li className="flex gap-2"><span className="text-green-600 mt-1">•</span><span>You did not receive the correct number of items, and the merchant did not advise you beforehand</span></li>
              <li className="flex gap-2"><span className="text-green-600 mt-1">•</span><span>You were charged a higher amount than shown on your invoice</span></li>
            </ul>
          </section>

          {/* Protection may not apply */}
          <section className="border-2 rounded-xl p-8 bg-card">
            <div className="flex items-center gap-3 mb-6">
              <XCircle className="h-6 w-6 text-red-600" />
              <h2 className="text-2xl font-bold">Kastra Pay Protection may not apply if...</h2>
            </div>
            <ul className="space-y-3 text-muted-foreground">
              <li className="flex gap-2"><span className="text-red-600 mt-1">•</span><span>You exchanged goods in person directly with the merchant, and not via a delivery service</span></li>
              <li className="flex gap-2"><span className="text-red-600 mt-1">•</span><span>You bought motorized machines or vehicles</span></li>
              <li className="flex gap-2"><span className="text-red-600 mt-1">•</span><span>You ordered services or items custom-made or tailored for you</span></li>
              <li className="flex gap-2"><span className="text-red-600 mt-1">•</span><span>You bought vouchers, prepaid cards, airtime top-ups</span></li>
              <li className="flex gap-2"><span className="text-red-600 mt-1">•</span><span>You ordered perishables like fresh food</span></li>
              <li className="flex gap-2"><span className="text-red-600 mt-1">•</span><span>You used Kastra Pay to order items that are in violation of our terms and conditions</span></li>
              <li className="flex gap-2"><span className="text-red-600 mt-1">•</span><span>You raised the dispute later than 60 days after the transaction</span></li>
              <li className="flex gap-2"><span className="text-red-600 mt-1">•</span><span>You used Kastra Pay for donations or to send money</span></li>
              <li className="flex gap-2"><span className="text-red-600 mt-1">•</span><span>The items and terms of delivery were correctly described by the merchant, and you have changed your mind about the transaction</span></li>
            </ul>
          </section>

          {/* Raising Your Dispute */}
          <section className="border-2 rounded-xl p-8 bg-card">
            <h2 className="text-2xl font-bold mb-4">Raising Your Dispute</h2>
            <p className="text-muted-foreground leading-relaxed mb-4">
              Generally, we suggest that you contact the merchant first - in many cases, a misunderstanding can be resolved this way the easiest. 
              If this does not solve your problem, we are here to help. Contact us at <strong className="text-primary">dispute@kastrapay.com</strong>.
            </p>
            
            <h3 className="font-semibold text-lg mb-3">Please include as much supporting information as possible:</h3>
            <ul className="space-y-2 text-muted-foreground mb-6">
              <li className="flex gap-2"><span className="text-primary mt-1">•</span><span>Kastra Pay Reference Number</span></li>
              <li className="flex gap-2"><span className="text-primary mt-1">•</span><span>A copy or screenshot of the merchant's invoice or order confirmation</span></li>
              <li className="flex gap-2"><span className="text-primary mt-1">•</span><span>If available, the tracking or waybill number of the delivery service</span></li>
            </ul>

            <div className="bg-red-500/10 border-2 border-red-500/20 rounded-lg p-4">
              <h3 className="font-semibold text-lg mb-3 text-red-600">Under no circumstances send us confidential information:</h3>
              <ul className="space-y-2 text-sm">
                <li className="flex gap-2"><span className="text-red-600 mt-1">✗</span><span>Do not send your full debit/credit card number, or a photo of the card, or other full financial information</span></li>
                <li className="flex gap-2"><span className="text-red-600 mt-1">✗</span><span>Do not send your password</span></li>
              </ul>
            </div>
          </section>
        </div>

        <div className="mt-12 p-6 bg-muted/50 rounded-lg text-center">
          <h2 className="text-xl font-semibold mb-2">Need to raise a dispute?</h2>
          <p className="text-muted-foreground mb-4">Our team is ready to assist you</p>
          <a href="mailto:dispute@kastrapay.com">
            <Button size="lg">Contact Dispute Team</Button>
          </a>
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
