import Link from "next/link";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { ThemeToggle } from "@/components/shared/theme-toggle";
import {
  CreditCard,
  Smartphone,
  Shield,
  BarChart3,
  ArrowRight,
  Zap,
  Globe,
} from "lucide-react";

export default function HomePage() {
  return (
    <div className="min-h-screen flex flex-col">
      {/* Header */}
      <header className="border-b">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Image src="/k-pay.png" alt="Kastra Pay" width={36} height={36} />
            <span className="font-bold text-xl">Kastra Pay</span>
          </div>
          <div className="flex items-center gap-4">
            <ThemeToggle />
            <Link href="/login">
              <Button variant="ghost">Log in</Button>
            </Link>
            <Link href="/register">
              <Button>Get Started</Button>
            </Link>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <main className="flex-1">
        <section className="container mx-auto px-4 py-20 text-center">
          <div className="max-w-3xl mx-auto">
            <h1 className="text-4xl md:text-6xl font-bold tracking-tight mb-6">
              Accept Payments
              <span className="text-primary"> Across Africa</span>
            </h1>
            <p className="text-lg md:text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
              One platform to accept M-Pesa, card payments via Flutterwave and
              Paystack. Built for African businesses that want to grow.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/register">
                <Button size="lg" className="w-full sm:w-auto">
                  Start Accepting Payments
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </Link>
              <Link href="/register?role=MERCHANT">
                <Button size="lg" variant="outline" className="w-full sm:w-auto">
                  Register as Merchant
                </Button>
              </Link>
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section className="container mx-auto px-4 py-20">
          <h2 className="text-3xl font-bold text-center mb-12">
            Everything You Need to Get Paid
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            <FeatureCard
              icon={<Smartphone className="h-6 w-6" />}
              title="M-Pesa Integration"
              description="Accept M-Pesa payments instantly via STK Push. Your customers pay with just their phone number and PIN."
            />
            <FeatureCard
              icon={<CreditCard className="h-6 w-6" />}
              title="Card Payments"
              description="Accept Visa and Mastercard through Flutterwave and Paystack. Multiple providers for maximum reliability."
            />
            <FeatureCard
              icon={<BarChart3 className="h-6 w-6" />}
              title="Real-time Dashboard"
              description="Track your revenue, view transaction history, and export reports. All in one beautiful dashboard."
            />
            <FeatureCard
              icon={<Shield className="h-6 w-6" />}
              title="Secure by Default"
              description="End-to-end encryption, webhook verification, and PCI-compliant card processing through certified providers."
            />
            <FeatureCard
              icon={<Zap className="h-6 w-6" />}
              title="Payment Links"
              description="Generate shareable payment links and QR codes. Accept payments without building a website."
            />
            <FeatureCard
              icon={<Globe className="h-6 w-6" />}
              title="Multi-Currency"
              description="Accept payments in KES, USD, NGN and more. Serve customers across Africa and beyond."
            />
          </div>
        </section>

        {/* How It Works */}
        <section className="bg-muted/50 py-20">
          <div className="container mx-auto px-4">
            <h2 className="text-3xl font-bold text-center mb-12">
              How It Works
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-4xl mx-auto">
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
      <footer className="border-t py-8">
        <div className="container mx-auto px-4 text-center text-muted-foreground">
          <p>&copy; {new Date().getFullYear()} Kastra Pay. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}

function FeatureCard({
  icon,
  title,
  description,
}: {
  icon: React.ReactNode;
  title: string;
  description: string;
}) {
  return (
    <div className="rounded-lg border bg-card p-6 hover:shadow-md transition-shadow">
      <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center mb-4 text-primary">
        {icon}
      </div>
      <h3 className="font-semibold text-lg mb-2">{title}</h3>
      <p className="text-muted-foreground">{description}</p>
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
    <div className="text-center">
      <div className="h-12 w-12 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-xl font-bold mx-auto mb-4">
        {step}
      </div>
      <h3 className="font-semibold text-lg mb-2">{title}</h3>
      <p className="text-muted-foreground">{description}</p>
    </div>
  );
}
