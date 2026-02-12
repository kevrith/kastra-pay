import Link from "next/link";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { ThemeToggle } from "@/components/shared/theme-toggle";
import { Target, Eye, Users, Zap, Shield, Globe } from "lucide-react";

export default function AboutPage() {
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

      <main className="flex-1">
        {/* Hero Section */}
        <section className="container mx-auto px-4 py-20 text-center">
          <h1 className="text-4xl md:text-6xl font-bold mb-6 bg-gradient-to-r from-blue-600 via-teal-500 to-green-600 bg-clip-text text-transparent">
            About Kastra Pay
          </h1>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto leading-relaxed">
            Revolutionizing digital payments across Africa by unifying multiple payment providers into one powerful platform for businesses of all sizes.
          </p>
        </section>

        {/* Mission & Vision */}
        <section className="container mx-auto px-4 py-16">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-5xl mx-auto">
            <div className="border-2 rounded-xl p-8 bg-card">
              <div className="h-14 w-14 rounded-full bg-blue-500/10 flex items-center justify-center mb-6">
                <Target className="h-7 w-7 text-blue-600" />
              </div>
              <h2 className="text-2xl font-bold mb-4">Our Mission</h2>
              <p className="text-muted-foreground leading-relaxed">
                To democratize payment acceptance across Africa by eliminating technical barriers and providing businesses with 
                enterprise-grade payment infrastructure through a single, unified integration.
              </p>
            </div>

            <div className="border-2 rounded-xl p-8 bg-card">
              <div className="h-14 w-14 rounded-full bg-green-500/10 flex items-center justify-center mb-6">
                <Eye className="h-7 w-7 text-green-600" />
              </div>
              <h2 className="text-2xl font-bold mb-4">Our Vision</h2>
              <p className="text-muted-foreground leading-relaxed">
                To become Africa's most trusted payment platform, driving financial inclusion and enabling millions of businesses 
                to thrive in the digital economy.
              </p>
            </div>
          </div>
        </section>

        {/* Our Story */}
        <section className="bg-muted/30 py-16">
          <div className="container mx-auto px-4 max-w-4xl">
            <h2 className="text-3xl font-bold text-center mb-8">Our Story</h2>
            <div className="space-y-4 text-muted-foreground leading-relaxed">
              <p>
                Kastra Pay was founded with a simple yet powerful vision: to make payments easier for African businesses. 
                We recognized that merchants across the continent faced significant challenges in accepting digital payments, 
                often needing to integrate with multiple payment providers separately.
              </p>
              <p>
                Our platform brings together M-Pesa, Flutterwave, Paystack, and other leading payment providers into one 
                unified solution. This means businesses can accept payments from customers using their preferred payment 
                method, without the complexity of managing multiple integrations.
              </p>
              <p>
                Today, we're proud to serve thousands of merchants across Africa, processing millions in transactions and 
                helping businesses grow by removing payment barriers. Our commitment to security, reliability, and customer 
                service has made us a trusted partner for businesses of all sizes.
              </p>
            </div>
          </div>
        </section>

        {/* Core Values */}
        <section className="container mx-auto px-4 py-16">
          <h2 className="text-3xl font-bold text-center mb-12">Our Core Values</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-5xl mx-auto">
            <div className="border-2 rounded-xl p-6 bg-card text-center">
              <div className="h-14 w-14 rounded-full bg-blue-500/10 flex items-center justify-center mx-auto mb-4">
                <Shield className="h-7 w-7 text-blue-600" />
              </div>
              <h3 className="text-xl font-bold mb-3">Security First</h3>
              <p className="text-muted-foreground">
                We prioritize the security of every transaction with end-to-end encryption and industry-leading fraud prevention.
              </p>
            </div>

            <div className="border-2 rounded-xl p-6 bg-card text-center">
              <div className="h-14 w-14 rounded-full bg-green-500/10 flex items-center justify-center mx-auto mb-4">
                <Users className="h-7 w-7 text-green-600" />
              </div>
              <h3 className="text-xl font-bold mb-3">Customer Focused</h3>
              <p className="text-muted-foreground">
                Our customers are at the heart of everything we do. We listen, adapt, and continuously improve our service.
              </p>
            </div>

            <div className="border-2 rounded-xl p-6 bg-card text-center">
              <div className="h-14 w-14 rounded-full bg-purple-500/10 flex items-center justify-center mx-auto mb-4">
                <Zap className="h-7 w-7 text-purple-600" />
              </div>
              <h3 className="text-xl font-bold mb-3">Innovation</h3>
              <p className="text-muted-foreground">
                We embrace new technologies and continuously innovate to provide the best payment experience.
              </p>
            </div>
          </div>
        </section>

        {/* Why Choose Us */}
        <section className="bg-muted/30 py-16">
          <div className="container mx-auto px-4 max-w-4xl">
            <h2 className="text-3xl font-bold text-center mb-12">Why Choose Kastra Pay?</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="flex gap-4">
                <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0 mt-1">
                  <Globe className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <h3 className="font-semibold text-lg mb-2">Multi-Provider Support</h3>
                  <p className="text-muted-foreground">Accept payments from M-Pesa, cards, and mobile money through one integration.</p>
                </div>
              </div>

              <div className="flex gap-4">
                <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0 mt-1">
                  <Zap className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <h3 className="font-semibold text-lg mb-2">Fast Setup</h3>
                  <p className="text-muted-foreground">Get started in minutes with our simple onboarding process.</p>
                </div>
              </div>

              <div className="flex gap-4">
                <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0 mt-1">
                  <Shield className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <h3 className="font-semibold text-lg mb-2">Bank-Level Security</h3>
                  <p className="text-muted-foreground">PCI-DSS compliant with advanced fraud detection and prevention.</p>
                </div>
              </div>

              <div className="flex gap-4">
                <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0 mt-1">
                  <Users className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <h3 className="font-semibold text-lg mb-2">24/7 Support</h3>
                  <p className="text-muted-foreground">Our dedicated support team is always here to help you succeed.</p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="container mx-auto px-4 py-16">
          <div className="max-w-3xl mx-auto text-center border-2 rounded-xl p-12 bg-card">
            <h2 className="text-3xl font-bold mb-4">Ready to get started?</h2>
            <p className="text-muted-foreground mb-8 text-lg">
              Join thousands of businesses already using Kastra Pay to accept payments across Africa.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/register">
                <Button size="lg" className="w-full sm:w-auto">Create Account</Button>
              </Link>
              <Link href="/contact">
                <Button size="lg" variant="outline" className="w-full sm:w-auto">Contact Sales</Button>
              </Link>
            </div>
          </div>
        </section>
      </main>

      <footer className="border-t bg-card/30 py-8">
        <div className="container mx-auto px-4 text-center text-sm text-muted-foreground">
          <p>&copy; {new Date().getFullYear()} Kastra Pay. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}
