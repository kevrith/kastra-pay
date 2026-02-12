import type { Metadata } from "next";
import "./globals.css";
import { ThemeProvider } from "@/components/providers/theme-provider";
import { SessionProvider } from "@/components/providers/session-provider";
import { Toaster } from "@/components/ui/sonner";
import { Analytics } from "@/components/analytics";

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXTAUTH_URL || 'http://localhost:3000'),
  title: {
    default: "Kastra Pay - Multi-Merchant Payment Platform for Africa",
    template: "%s | Kastra Pay",
  },
  description:
    "Accept payments via M-Pesa, Flutterwave, and Paystack through a unified checkout experience. Trusted by businesses across Africa.",
  keywords: [
    "payment gateway",
    "M-Pesa",
    "Flutterwave",
    "Paystack",
    "Africa payments",
    "online payments",
    "payment processing",
    "merchant services",
  ],
  authors: [{ name: "Kastra Pay" }],
  creator: "Kastra Pay",
  openGraph: {
    type: "website",
    locale: "en_US",
    url: "https://kastrapay.com",
    title: "Kastra Pay - Multi-Merchant Payment Platform for Africa",
    description:
      "Accept payments via M-Pesa, Flutterwave, and Paystack through a unified checkout experience.",
    siteName: "Kastra Pay",
    images: [
      {
        url: "/k-pay.png",
        width: 605,
        height: 489,
        alt: "Kastra Pay Logo",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Kastra Pay - Multi-Merchant Payment Platform for Africa",
    description:
      "Accept payments via M-Pesa, Flutterwave, and Paystack through a unified checkout experience.",
    images: ["/k-pay.png"],
    creator: "@kastrapay",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  verification: {
    google: "your-google-verification-code",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className="font-sans antialiased" suppressHydrationWarning>
        <SessionProvider>
          <ThemeProvider>
            {children}
            <Toaster richColors position="top-right" />
          </ThemeProvider>
        </SessionProvider>
        <Analytics />
      </body>
    </html>
  );
}
