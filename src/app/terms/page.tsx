"use client";

import Link from "next/link";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { ThemeToggle } from "@/components/shared/theme-toggle";
import { useEffect, useState } from "react";
import PageLoader from "@/components/shared/page-loader";

export default function TermsPage() {
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => setIsLoading(false), 800);
    return () => clearTimeout(timer);
  }, []);

  if (isLoading) return <PageLoader />;

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
          Terms and Conditions
        </h1>
        <p className="text-muted-foreground mb-8">Payment Service Agreement - Last updated: {new Date().toLocaleDateString()}</p>

        {/* Table of Contents */}
        <div className="border-2 rounded-xl p-6 bg-card mb-8">
          <h2 className="text-xl font-bold mb-4">Contents</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm text-muted-foreground">
            <a href="#intro" className="hover:text-primary transition-colors">1. Introduction</a>
            <a href="#registration" className="hover:text-primary transition-colors">2. Account Registration</a>
            <a href="#service" className="hover:text-primary transition-colors">3. Service Description</a>
            <a href="#account" className="hover:text-primary transition-colors">4. Account Management</a>
            <a href="#payments" className="hover:text-primary transition-colors">5. Payment Processing</a>
            <a href="#rewards" className="hover:text-primary transition-colors">6. Rewards and Promotions</a>
            <a href="#records" className="hover:text-primary transition-colors">7. Transaction Records</a>
            <a href="#privacy" className="hover:text-primary transition-colors">8. Privacy and Data</a>
            <a href="#compliance" className="hover:text-primary transition-colors">9. Compliance and Verification</a>
            <a href="#disputes" className="hover:text-primary transition-colors">10. Dispute Resolution</a>
            <a href="#warranties" className="hover:text-primary transition-colors">11. User Warranties</a>
            <a href="#liability" className="hover:text-primary transition-colors">12. Liability Limitations</a>
            <a href="#indemnity" className="hover:text-primary transition-colors">13. Indemnification</a>
            <a href="#termination" className="hover:text-primary transition-colors">14. Account Termination</a>
            <a href="#general" className="hover:text-primary transition-colors">15. General Provisions</a>
            <a href="#contact" className="hover:text-primary transition-colors">16. Contact Information</a>
          </div>
        </div>

        <div className="space-y-8">
          {/* Section 1 */}
          <section id="intro" className="border-2 rounded-xl p-8 bg-card scroll-mt-20">
            <h2 className="text-2xl font-bold mb-4">1. Introduction</h2>
            <p className="text-muted-foreground leading-relaxed mb-4">
              Kastra Pay operates as a payment aggregation platform ("Service") that connects businesses ("Merchants") and customers ("Users") 
              with multiple payment service providers including M-Pesa, Flutterwave, and Paystack. Our platform enables seamless transaction 
              processing across Africa's diverse payment ecosystem.
            </p>
            <p className="text-muted-foreground leading-relaxed mb-4">
              These Terms and Conditions ("Terms") constitute a legally binding agreement between you and Kastra Pay Ltd regarding your 
              access to and use of our payment aggregation services, whether through our website, API, mobile applications, or merchant 
              checkout integrations.
            </p>
            <p className="text-muted-foreground leading-relaxed">
              By creating an account or using our Service, you acknowledge that you have read, understood, and agree to be bound by 
              these Terms. If you do not agree, you must discontinue use of the Service immediately.
            </p>
          </section>

          {/* Section 2 */}
          <section id="registration" className="border-2 rounded-xl p-8 bg-card scroll-mt-20">
            <h2 className="text-2xl font-bold mb-4">2. Account Registration</h2>
            <p className="text-muted-foreground leading-relaxed mb-4">
              To use Kastra Pay, you must create an account by providing accurate and complete information. You may register as either 
              a Customer or Merchant, depending on your intended use.
            </p>
            <p className="text-muted-foreground leading-relaxed mb-4">
              You must be at least 18 years old to create an account. By registering, you confirm that you meet this age requirement 
              and have the legal capacity to enter into binding agreements.
            </p>
            <p className="text-muted-foreground leading-relaxed mb-4">
              You are responsible for maintaining the confidentiality of your account credentials. Any activity conducted through your 
              account will be deemed to have been authorized by you.
            </p>
            <p className="text-muted-foreground leading-relaxed">
              We reserve the right to suspend, restrict, or terminate accounts that violate these Terms or engage in suspicious activity, 
              without prior notice.
            </p>
          </section>

          {/* Section 3 */}
          <section id="service" className="border-2 rounded-xl p-8 bg-card scroll-mt-20">
            <h2 className="text-2xl font-bold mb-4">3. Service Description</h2>
            <p className="text-muted-foreground leading-relaxed mb-4">
              Kastra Pay facilitates payment transactions between Users and Merchants. We act as a payment intermediary and are not 
              party to the underlying sale of goods or services.
            </p>
            <p className="text-muted-foreground leading-relaxed mb-4">
              Available payment methods may vary based on merchant preferences, your location, and regulatory requirements. We work 
              with licensed payment processors and financial institutions to enable transactions.
            </p>
            <p className="text-muted-foreground leading-relaxed">
              The merchant is the seller of record for all transactions. Kastra Pay's name or our payment processor's name may appear 
              on your payment statement.
            </p>
          </section>

          {/* Section 4 */}
          <section id="account" className="border-2 rounded-xl p-8 bg-card scroll-mt-20">
            <h2 className="text-2xl font-bold mb-4">4. Account Management</h2>
            <p className="text-muted-foreground leading-relaxed mb-4">
              Your Kastra Pay account allows you to store payment methods, view transaction history, and manage your payment preferences.
            </p>
            <p className="text-muted-foreground leading-relaxed mb-4">
              You may add multiple payment methods to your account, including credit cards, debit cards, and mobile money accounts. 
              You must verify ownership of payment methods before use.
            </p>
            <p className="text-muted-foreground leading-relaxed">
              You agree to provide accurate information and promptly update your account details if any information changes. We may 
              request additional verification documents to comply with regulatory requirements.
            </p>
          </section>

          {/* Section 5 */}
          <section id="payments" className="border-2 rounded-xl p-8 bg-card scroll-mt-20">
            <h2 className="text-2xl font-bold mb-4">5. Payment Processing</h2>
            <p className="text-muted-foreground leading-relaxed mb-4">
              All transactions are processed in the currency displayed at checkout. Your payment obligation is fulfilled when payment 
              is successfully processed through our Service.
            </p>
            <p className="text-muted-foreground leading-relaxed mb-4">
              Your payment provider may charge additional fees such as currency conversion or cash advance fees. Kastra Pay is not 
              responsible for fees charged by third-party payment providers.
            </p>
            <p className="text-muted-foreground leading-relaxed">
              Refunds for cancelled or returned purchases will be processed according to the merchant's refund policy. Refunds may 
              be credited to your Kastra Pay account balance or returned to your original payment method.
            </p>
          </section>

          {/* Section 6 */}
          <section id="rewards" className="border-2 rounded-xl p-8 bg-card scroll-mt-20">
            <h2 className="text-2xl font-bold mb-4">6. Rewards and Promotions</h2>
            <p className="text-muted-foreground leading-relaxed mb-4">
              We may offer promotional credits, cashback, or other rewards from time to time. Each promotion is subject to specific 
              terms and expiration dates.
            </p>
            <p className="text-muted-foreground leading-relaxed mb-4">
              Unless otherwise stated, promotional credits expire 30 days after issuance. We reserve the right to cancel or reclaim 
              rewards if fraud or abuse is detected.
            </p>
            <p className="text-muted-foreground leading-relaxed">
              Rewards cannot be transferred, sold, or exchanged for cash unless required by law.
            </p>
          </section>

          {/* Section 7 */}
          <section id="records" className="border-2 rounded-xl p-8 bg-card scroll-mt-20">
            <h2 className="text-2xl font-bold mb-4">7. Transaction Records</h2>
            <p className="text-muted-foreground leading-relaxed mb-4">
              Transaction confirmations and receipts are available in your account dashboard and will be sent to your registered email address.
            </p>
            <p className="text-muted-foreground leading-relaxed">
              You are responsible for maintaining your own records of transactions. We recommend downloading and storing receipts for 
              your records, as historical data may not be available indefinitely.
            </p>
          </section>

          {/* Section 8 */}
          <section id="privacy" className="border-2 rounded-xl p-8 bg-card scroll-mt-20">
            <h2 className="text-2xl font-bold mb-4">8. Privacy and Data</h2>
            <p className="text-muted-foreground leading-relaxed mb-4">
              Your use of Kastra Pay is subject to our Privacy Policy, which describes how we collect, use, and protect your personal information.
            </p>
            <p className="text-muted-foreground leading-relaxed">
              We implement industry-standard security measures to protect your data. However, no system is completely secure, and you 
              acknowledge the inherent risks of transmitting information online.
            </p>
          </section>

          {/* Section 9 */}
          <section id="compliance" className="border-2 rounded-xl p-8 bg-card scroll-mt-20">
            <h2 className="text-2xl font-bold mb-4">9. Compliance and Verification</h2>
            <p className="text-muted-foreground leading-relaxed mb-4">
              We maintain anti-fraud and anti-money laundering programs in compliance with applicable regulations. We may conduct 
              identity verification and due diligence checks on all users.
            </p>
            <p className="text-muted-foreground leading-relaxed">
              You agree to provide requested documentation and cooperate with investigations. Failure to comply may result in account 
              suspension or termination.
            </p>
          </section>

          {/* Section 10 */}
          <section id="disputes" className="border-2 rounded-xl p-8 bg-card scroll-mt-20">
            <h2 className="text-2xl font-bold mb-4">10. Dispute Resolution</h2>
            <p className="text-muted-foreground leading-relaxed mb-4">
              For issues with purchases, contact the merchant directly first. If unresolved, you may file a dispute through our 
              customer support within 60 days of the transaction.
            </p>
            <p className="text-muted-foreground leading-relaxed">
              We will investigate disputes in good faith but are not obligated to resolve disputes between users and merchants. 
              You may also pursue disputes through your payment provider's dispute resolution process.
            </p>
          </section>

          {/* Section 11 */}
          <section id="warranties" className="border-2 rounded-xl p-8 bg-card scroll-mt-20">
            <h2 className="text-2xl font-bold mb-4">11. User Warranties</h2>
            <p className="text-muted-foreground leading-relaxed mb-4">You warrant that:</p>
            <ul className="space-y-2 text-muted-foreground">
              <li className="flex gap-2"><span className="text-primary mt-1">•</span><span>You have the legal right and capacity to enter into these Terms</span></li>
              <li className="flex gap-2"><span className="text-primary mt-1">•</span><span>You will use the Service only for lawful purposes and your own account</span></li>
              <li className="flex gap-2"><span className="text-primary mt-1">•</span><span>All information provided is accurate and complete</span></li>
              <li className="flex gap-2"><span className="text-primary mt-1">•</span><span>You are not subject to sanctions or prohibited party lists</span></li>
              <li className="flex gap-2"><span className="text-primary mt-1">•</span><span>You will not use the Service for fraudulent or illegal activities</span></li>
            </ul>
          </section>

          {/* Section 12 */}
          <section id="liability" className="border-2 rounded-xl p-8 bg-card scroll-mt-20">
            <h2 className="text-2xl font-bold mb-4">12. Liability Limitations</h2>
            <p className="text-muted-foreground leading-relaxed mb-4">
              The Service is provided "as is" without warranties of any kind. We do not guarantee uninterrupted or error-free service.
            </p>
            <p className="text-muted-foreground leading-relaxed mb-4">
              To the maximum extent permitted by law, Kastra Pay shall not be liable for indirect, incidental, special, or consequential 
              damages, including loss of profits, data, or business opportunities.
            </p>
            <p className="text-muted-foreground leading-relaxed">
              Our total liability for any claim shall not exceed the fees paid by you in the 12 months preceding the claim.
            </p>
          </section>

          {/* Section 13 */}
          <section id="indemnity" className="border-2 rounded-xl p-8 bg-card scroll-mt-20">
            <h2 className="text-2xl font-bold mb-4">13. Indemnification</h2>
            <p className="text-muted-foreground leading-relaxed">
              You agree to indemnify and hold harmless Kastra Pay, its affiliates, and their respective officers, directors, and employees 
              from any claims, damages, losses, or expenses arising from your breach of these Terms or misuse of the Service.
            </p>
          </section>

          {/* Section 14 */}
          <section id="termination" className="border-2 rounded-xl p-8 bg-card scroll-mt-20">
            <h2 className="text-2xl font-bold mb-4">14. Account Termination</h2>
            <p className="text-muted-foreground leading-relaxed mb-4">
              You may close your account at any time by contacting customer support. Upon closure, any remaining account balance will 
              be returned to you according to our refund procedures.
            </p>
            <p className="text-muted-foreground leading-relaxed">
              We may suspend or terminate your account immediately if you violate these Terms, engage in fraudulent activity, or for 
              any other reason at our discretion. Termination does not relieve you of obligations incurred prior to termination.
            </p>
          </section>

          {/* Section 15 */}
          <section id="general" className="border-2 rounded-xl p-8 bg-card scroll-mt-20">
            <h2 className="text-2xl font-bold mb-4">15. General Provisions</h2>
            <div className="space-y-4 text-muted-foreground">
              <div>
                <h3 className="font-semibold text-foreground mb-2">Modifications</h3>
                <p className="leading-relaxed">We may modify these Terms at any time. Changes become effective 7 days after notification. 
                Continued use of the Service constitutes acceptance of modified Terms.</p>
              </div>
              <div>
                <h3 className="font-semibold text-foreground mb-2">Governing Law</h3>
                <p className="leading-relaxed">These Terms are governed by the laws of Kenya. Disputes shall be subject to the exclusive 
                jurisdiction of Kenyan courts.</p>
              </div>
              <div>
                <h3 className="font-semibold text-foreground mb-2">Severability</h3>
                <p className="leading-relaxed">If any provision is found unenforceable, the remaining provisions shall continue in full effect.</p>
              </div>
              <div>
                <h3 className="font-semibold text-foreground mb-2">Assignment</h3>
                <p className="leading-relaxed">We may assign our rights and obligations under these Terms. You may not assign your rights 
                without our prior written consent.</p>
              </div>
              <div>
                <h3 className="font-semibold text-foreground mb-2">Entire Agreement</h3>
                <p className="leading-relaxed">These Terms, together with our Privacy Policy, constitute the entire agreement between you 
                and Kastra Pay regarding the Service.</p>
              </div>
            </div>
          </section>

          {/* Section 16 */}
          <section id="contact" className="border-2 rounded-xl p-8 bg-card scroll-mt-20">
            <h2 className="text-2xl font-bold mb-4">16. Contact Information</h2>
            <p className="text-muted-foreground leading-relaxed mb-4">
              For questions or concerns regarding these Terms, please contact us:
            </p>
            <div className="space-y-2 text-muted-foreground">
              <p><strong className="text-foreground">Email:</strong> legal@kastrapay.com</p>
              <p><strong className="text-foreground">Support:</strong> support@kastrapay.com</p>
              <p><strong className="text-foreground">Disputes:</strong> dispute@kastrapay.com</p>
            </div>
          </section>
        </div>

        <div className="mt-12 p-6 bg-muted/50 rounded-lg text-center">
          <h2 className="text-xl font-semibold mb-2">Questions about our terms?</h2>
          <p className="text-muted-foreground mb-4">Our legal team is here to help</p>
          <a href="mailto:legal@kastrapay.com">
            <Button size="lg">Contact Legal Team</Button>
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
