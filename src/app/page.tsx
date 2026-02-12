"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ThemeToggle } from "@/components/shared/theme-toggle";
import { MobileMenu } from "@/components/shared/mobile-menu";
import { BackToTop } from "@/components/shared/back-to-top";
import { MpesaLogo, CardLogos } from "@/components/icons/payment-logos";
import { useEffect, useState } from "react";
import {
  Smartphone,
  Shield,
  BarChart3,
  ArrowRight,
  Zap,
  Globe,
} from "lucide-react";

export default function HomePage() {
  const [stats, setStats] = useState({
    successRate: "99.9%",
    totalTransactions: "0",
    activeMerchants: "0",
    totalVolume: "KES 0M",
  });
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetch("/api/stats")
      .then((res) => res.json())
      .then((data) => {
        setStats(data);
        setIsLoading(false);
      })
      .catch(() => setIsLoading(false));
  }, []);

  return (
    <div className="min-h-screen flex flex-col">
      {/* Header */}
      <header className="border-b bg-card/50 backdrop-blur-sm sticky top-0 z-50 transition-shadow hover:shadow-md">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <img src="/k-pay.png" alt="Kastra Pay" className="rounded-lg h-10 w-auto" />
            <span className="font-bold text-lg sm:text-xl text-foreground">Kastra Pay</span>
          </div>
          <div className="flex items-center gap-2 sm:gap-4">
            <ThemeToggle />
            <div className="hidden md:flex items-center gap-4">
              <Link href="/login">
                <Button variant="ghost" className="font-medium text-sm sm:text-base px-3 sm:px-4">Log in</Button>
              </Link>
              <Link href="/register">
                <Button className="font-medium shadow-lg shadow-primary/20 hover:shadow-xl hover:shadow-primary/30 transition-all text-sm sm:text-base px-3 sm:px-4">Get Started</Button>
              </Link>
            </div>
            <MobileMenu />
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <main className="flex-1">
        <section className="container mx-auto px-4 py-20 md:py-24 text-center relative">
          <div className="absolute inset-0 bg-gradient-to-b from-accent/20 to-transparent -z-10" />
          <div className="max-w-4xl mx-auto">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 text-primary text-sm font-medium mb-6 animate-fade-in">
              <Zap className="h-4 w-4" />
              <span>Trusted by businesses across Africa</span>
            </div>
            <h1 className="text-3xl sm:text-4xl md:text-6xl lg:text-7xl font-bold tracking-tight mb-6 leading-tight animate-fade-in-up">
              <span className="bg-gradient-to-r from-blue-600 via-teal-500 to-green-600 bg-clip-text text-transparent font-extrabold">Accept Payments Across Africa</span>
            </h1>
            <p className="text-base sm:text-lg md:text-xl lg:text-2xl text-muted-foreground mb-10 max-w-3xl mx-auto leading-relaxed animate-fade-in-up" style={{ animationDelay: "0.1s" }}>
              One platform to accept M-Pesa, card payments via Flutterwave and
              Paystack. Built for African businesses that want to grow.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center animate-fade-in-up" style={{ animationDelay: "0.2s" }}>
              <Link href="/register">
                <Button size="lg" className="w-full sm:w-auto text-base px-8 py-6 shadow-xl shadow-primary/30 hover:shadow-2xl hover:shadow-primary/40 hover:scale-105 transition-all">
                  Start Accepting Payments
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
              </Link>
              <Link href="/register?role=MERCHANT">
                <Button size="lg" variant="outline" className="w-full sm:w-auto text-base px-8 py-6 border-2 hover:bg-accent/50 hover:border-primary transition-all">
                  Register as Merchant
                </Button>
              </Link>
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section className="container mx-auto px-4 py-24">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold mb-4">
              Everything You Need to Get Paid
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Enterprise-grade payment infrastructure designed for scale
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <FeatureCard
              icon={<MpesaLogo className="h-16 w-auto" />}
              iconBg="from-muted to-muted/50"
              title="M-Pesa Integration"
              description="Accept M-Pesa payments instantly via STK Push. Your customers pay with just their phone number and PIN."
            />
            <FeatureCard
              icon={<CardLogos />}
              iconBg="from-muted to-muted/50"
              title="Card Payments"
              description="Accept Visa and Mastercard through Flutterwave and Paystack. Multiple providers for maximum reliability."
            />
            <FeatureCard
              icon={<BarChart3 className="h-12 w-12 text-white" />}
              iconBg="from-blue-500 to-blue-600"
              title="Real-time Dashboard"
              description="Track your revenue, view transaction history, and export reports. All in one beautiful dashboard."
            />
            <FeatureCard
              icon={<Shield className="h-12 w-12 text-white" />}
              iconBg="from-green-500 to-emerald-600"
              title="Secure by Default"
              description="End-to-end encryption, webhook verification, and PCI-compliant card processing through certified providers."
            />
            <FeatureCard
              icon={<Zap className="h-12 w-12 text-white" />}
              iconBg="from-yellow-500 to-orange-600"
              title="Payment Links"
              description="Generate shareable payment links and QR codes. Accept payments without building a website."
            />
            <FeatureCard
              icon={<Globe className="h-12 w-12 text-white" />}
              iconBg="from-purple-500 to-pink-600"
              title="Multi-Currency"
              description="Accept payments in KES, USD, NGN and more. Serve customers across Africa and beyond."
            />
          </div>
        </section>

        {/* Stats Section */}
        <section className="container mx-auto px-4 py-16">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 max-w-4xl mx-auto">
            {isLoading ? (
              <>
                <StatSkeleton />
                <StatSkeleton />
                <StatSkeleton />
                <StatSkeleton />
              </>
            ) : (
              <>
                <div className="text-center animate-fade-in">
                  <div className="text-3xl sm:text-4xl md:text-5xl font-bold text-primary mb-2">{stats.successRate}</div>
                  <div className="text-xs sm:text-sm text-muted-foreground">Success Rate</div>
                </div>
                <div className="text-center animate-fade-in" style={{ animationDelay: "0.1s" }}>
                  <div className="text-3xl sm:text-4xl md:text-5xl font-bold text-primary mb-2">{stats.totalTransactions}</div>
                  <div className="text-xs sm:text-sm text-muted-foreground">Transactions</div>
                </div>
                <div className="text-center animate-fade-in" style={{ animationDelay: "0.2s" }}>
                  <div className="text-3xl sm:text-4xl md:text-5xl font-bold text-primary mb-2">{stats.activeMerchants}</div>
                  <div className="text-xs sm:text-sm text-muted-foreground">Merchants</div>
                </div>
                <div className="text-center animate-fade-in" style={{ animationDelay: "0.3s" }}>
                  <div className="text-3xl sm:text-4xl md:text-5xl font-bold text-primary mb-2">{stats.totalVolume}</div>
                  <div className="text-xs sm:text-sm text-muted-foreground">Processed</div>
                </div>
              </>
            )}
          </div>
        </section>

        {/* How It Works */}
        <section className="bg-gradient-to-b from-muted/30 to-muted/60 py-24">
          <div className="container mx-auto px-4">
            <div className="text-center mb-16">
              <h2 className="text-4xl md:text-5xl font-bold mb-4">
                How It Works
              </h2>
              <p className="text-lg text-muted-foreground">Get started in minutes, not days</p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-12 max-w-5xl mx-auto">
              <StepCard
                step="1"
                title="Sign Up"
                description="Create your merchant account and set up your business profile in minutes."
              />
              <StepCard
                step="2"
                title="Integrate"
                description="Get your API keys and create payment links. No complex integration needed."
              />
              <StepCard
                step="3"
                title="Get Paid"
                description="Start accepting payments via M-Pesa, cards, and mobile money immediately."
              />
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="border-t bg-card/30 py-12">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
            <div className="md:col-span-1">
              <div className="flex items-center gap-2 mb-4">
                <img src="/k-pay.png" alt="Kastra Pay" className="rounded h-8 w-auto" />
                <span className="font-bold text-lg">Kastra Pay</span>
              </div>
              <p className="text-sm text-muted-foreground">Accept payments across Africa with ease.</p>
            </div>
            <div>
              <h3 className="font-semibold mb-4">Company</h3>
              <ul className="space-y-2 text-sm">
                <li><Link href="/about" className="text-muted-foreground hover:text-primary transition-colors">About Us</Link></li>
                <li><Link href="/contact" className="text-muted-foreground hover:text-primary transition-colors">Contact Us</Link></li>
                <li><Link href="/faq" className="text-muted-foreground hover:text-primary transition-colors">FAQ</Link></li>
              </ul>
            </div>
            <div>
              <h3 className="font-semibold mb-4">Legal</h3>
              <ul className="space-y-2 text-sm">
                <li><Link href="/terms" className="text-muted-foreground hover:text-primary transition-colors">Terms and Conditions</Link></li>
                <li><Link href="/privacy" className="text-muted-foreground hover:text-primary transition-colors">Privacy Policy</Link></li>
                <li><Link href="/disputes" className="text-muted-foreground hover:text-primary transition-colors">Customer Disputes</Link></li>
              </ul>
            </div>
            <div>
              <h3 className="font-semibold mb-4">Support</h3>
              <p className="text-sm text-muted-foreground mb-2">Email: support@kastrapay.com</p>
              <p className="text-sm text-muted-foreground">Phone: +254 700 000 000</p>
            </div>
          </div>
          <div className="border-t pt-8 text-center text-sm text-muted-foreground">
            <p>&copy; {new Date().getFullYear()} Kastra Pay. All rights reserved.</p>
          </div>
        </div>
      </footer>
      <BackToTop />
    </div>
  );
}

function StatSkeleton() {
  return (
    <div className="text-center animate-pulse">
      <div className="h-12 w-24 mx-auto bg-muted rounded-lg mb-2" />
      <div className="h-4 w-20 mx-auto bg-muted rounded" />
    </div>
  );
}

function FeatureCard({
  icon,
  iconBg,
  title,
  description,
}: {
  icon: React.ReactNode;
  iconBg: string;
  title: string;
  description: string;
}) {
  return (
    <div className="group rounded-xl border-2 bg-card p-8 hover:shadow-xl hover:shadow-primary/10 hover:border-primary/50 transition-all duration-300">
      <div className={`h-24 w-full rounded-xl bg-gradient-to-br ${iconBg} flex items-center justify-center mb-6 group-hover:scale-105 transition-transform overflow-hidden shadow-lg`}>
        {icon}
      </div>
      <h3 className="font-bold text-xl mb-3">{title}</h3>
      <p className="text-muted-foreground leading-relaxed">{description}</p>
    </div>
  );
}

function StepCard({
  step,
  title,
  description,
}: {
  step: string;
  title: string;
  description: string;
}) {
  return (
    <div className="text-center group">
      <div className="h-16 w-16 rounded-2xl bg-gradient-to-br from-primary to-blue-600 text-white flex items-center justify-center text-2xl font-bold mx-auto mb-6 shadow-xl shadow-primary/30 group-hover:scale-110 transition-transform">
        {step}
      </div>
      <h3 className="font-bold text-xl mb-3">{title}</h3>
      <p className="text-muted-foreground leading-relaxed">{description}</p>
    </div>
  );
}
