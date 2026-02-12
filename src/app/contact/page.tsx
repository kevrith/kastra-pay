"use client";

import Link from "next/link";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { ThemeToggle } from "@/components/shared/theme-toggle";
import { Mail, Phone, MapPin, Clock } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

export default function ContactPage() {
  const [formData, setFormData] = useState({ name: "", email: "", subject: "", message: "" });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    try {
      const response = await fetch("https://api.web3forms.com/submit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          access_key: process.env.NEXT_PUBLIC_WEB3FORMS_KEY || "YOUR_ACCESS_KEY_HERE",
          name: formData.name,
          email: formData.email,
          subject: formData.subject,
          message: formData.message,
        }),
      });

      const data = await response.json();

      if (data.success) {
        toast.success("Message sent successfully!", {
          description: "We'll get back to you soon.",
        });
        setFormData({ name: "", email: "", subject: "", message: "" });
      } else {
        toast.error("Failed to send message", {
          description: "Please try again later.",
        });
      }
    } catch (error) {
      toast.error("Something went wrong", {
        description: "Please check your connection and try again.",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

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

      <main className="flex-1 container mx-auto px-4 py-12 pb-24 max-w-6xl">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold mb-2 bg-gradient-to-r from-blue-600 via-teal-500 to-green-600 bg-clip-text text-transparent">
            Contact Us
          </h1>
          <p className="text-muted-foreground">We're here to help. Reach out to us anytime.</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Contact Form */}
          <div className="border-2 rounded-xl p-8 bg-card">
            <h2 className="text-2xl font-bold mb-6">Send us a message</h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">Name</label>
                <Input
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="Your name"
                  required
                  className="h-11 border-2"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Email</label>
                <Input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  placeholder="your@email.com"
                  required
                  className="h-11 border-2"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Subject</label>
                <Input
                  value={formData.subject}
                  onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                  placeholder="How can we help?"
                  required
                  className="h-11 border-2"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Message</label>
                <Textarea
                  value={formData.message}
                  onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                  placeholder="Tell us more..."
                  required
                  className="min-h-32 border-2"
                />
              </div>
              <Button type="submit" className="w-full h-11" disabled={isSubmitting}>
                {isSubmitting ? "Sending..." : "Send Message"}
              </Button>
            </form>
          </div>

          {/* Contact Information */}
          <div className="space-y-6">
            <div className="border-2 rounded-xl p-6 bg-card">
              <div className="flex items-start gap-4">
                <div className="h-12 w-12 rounded-full bg-blue-500/10 flex items-center justify-center flex-shrink-0">
                  <Mail className="h-6 w-6 text-blue-600" />
                </div>
                <div>
                  <h3 className="font-semibold text-lg mb-2">Email</h3>
                  <p className="text-muted-foreground mb-1">General: support@kastrapay.com</p>
                  <p className="text-muted-foreground mb-1">Disputes: dispute@kastrapay.com</p>
                  <p className="text-muted-foreground">Legal: legal@kastrapay.com</p>
                </div>
              </div>
            </div>

            <div className="border-2 rounded-xl p-6 bg-card">
              <div className="flex items-start gap-4">
                <div className="h-12 w-12 rounded-full bg-green-500/10 flex items-center justify-center flex-shrink-0">
                  <Phone className="h-6 w-6 text-green-600" />
                </div>
                <div>
                  <h3 className="font-semibold text-lg mb-2">Phone</h3>
                  <p className="text-muted-foreground mb-1">Kenya: +254 700 000 000</p>
                  <p className="text-muted-foreground">Toll-free: 0800 000 000</p>
                </div>
              </div>
            </div>

            <div className="border-2 rounded-xl p-6 bg-card">
              <div className="flex items-start gap-4">
                <div className="h-12 w-12 rounded-full bg-purple-500/10 flex items-center justify-center flex-shrink-0">
                  <MapPin className="h-6 w-6 text-purple-600" />
                </div>
                <div>
                  <h3 className="font-semibold text-lg mb-2">Office</h3>
                  <p className="text-muted-foreground">Westlands, Nairobi</p>
                  <p className="text-muted-foreground">Kenya</p>
                </div>
              </div>
            </div>

            <div className="border-2 rounded-xl p-6 bg-card">
              <div className="flex items-start gap-4">
                <div className="h-12 w-12 rounded-full bg-amber-500/10 flex items-center justify-center flex-shrink-0">
                  <Clock className="h-6 w-6 text-amber-600" />
                </div>
                <div>
                  <h3 className="font-semibold text-lg mb-2">Business Hours</h3>
                  <p className="text-muted-foreground mb-1">Monday - Friday: 8:00 AM - 6:00 PM</p>
                  <p className="text-muted-foreground mb-1">Saturday: 9:00 AM - 2:00 PM</p>
                  <p className="text-muted-foreground">Sunday: Closed</p>
                </div>
              </div>
            </div>
          </div>
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
