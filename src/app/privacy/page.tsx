import Link from "next/link";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { ThemeToggle } from "@/components/shared/theme-toggle";

export default function PrivacyPage() {
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
          Privacy and Cookie Notice
        </h1>
        <p className="text-muted-foreground mb-8">Last updated: {new Date().toLocaleDateString()}</p>

        {/* Table of Contents */}
        <div className="border-2 rounded-xl p-6 bg-card mb-8">
          <h2 className="text-xl font-bold mb-4">Contents</h2>
          <ol className="space-y-2 text-muted-foreground">
            <li><a href="#section1" className="hover:text-primary transition-colors">1. About this Privacy and Cookie Notice</a></li>
            <li><a href="#section2" className="hover:text-primary transition-colors">2. The data we collect about you</a></li>
            <li><a href="#section3" className="hover:text-primary transition-colors">3. Cookies and how we use them</a></li>
            <li><a href="#section4" className="hover:text-primary transition-colors">4. How we use your personal data</a></li>
            <li><a href="#section5" className="hover:text-primary transition-colors">5. How we share your personal data</a></li>
            <li><a href="#section6" className="hover:text-primary transition-colors">6. International transfers</a></li>
            <li><a href="#section7" className="hover:text-primary transition-colors">7. Data security</a></li>
            <li><a href="#section8" className="hover:text-primary transition-colors">8. Your legal rights</a></li>
            <li><a href="#section9" className="hover:text-primary transition-colors">9. Further details</a></li>
          </ol>
        </div>

        <div className="space-y-8">
          {/* Section 1 */}
          <section id="section1" className="border-2 rounded-xl p-8 bg-card scroll-mt-20">
            <h2 className="text-2xl font-bold mb-4">1. About this Notice</h2>
            <p className="text-muted-foreground leading-relaxed">
              This Privacy and Cookie Notice explains how Kastra Pay Ltd ("we", "us", "our") collects, processes, stores, and protects 
              your personal information when you interact with our payment aggregation platform, including our website, mobile applications, 
              API services, and merchant checkout integrations. We are committed to transparency and protecting your privacy rights.
            </p>
          </section>

          {/* Section 2 */}
          <section id="section2" className="border-2 rounded-xl p-8 bg-card scroll-mt-20">
            <h2 className="text-2xl font-bold mb-4">2. The data we collect about you</h2>
            <p className="text-muted-foreground leading-relaxed mb-4">
              We collect your personal data in order to provide and continually improve our products and services.
            </p>
            <p className="text-muted-foreground leading-relaxed mb-4">
              We may collect, use, store and transfer the following different kinds of personal data about you:
            </p>
            <ul className="space-y-3 text-muted-foreground mb-6">
              <li className="flex gap-2">
                <span className="text-primary mt-1">•</span>
                <span><strong>Information you provide to us:</strong> We receive and store the information you provide to us including your identity data, contact data, delivery address and financial data.</span>
              </li>
              <li className="flex gap-2">
                <span className="text-primary mt-1">•</span>
                <span><strong>Information on your use of our website and/or mobile applications:</strong> We automatically collect and store certain types of information regarding your use of the Kastra Pay marketplace including information about your searches, views, downloads and purchases.</span>
              </li>
              <li className="flex gap-2">
                <span className="text-primary mt-1">•</span>
                <span><strong>Information from third parties and publicly available sources:</strong> We may receive information about you from third parties including our carriers; payment service providers; merchants/brands; and advertising service providers.</span>
              </li>
            </ul>
            <p className="text-muted-foreground leading-relaxed mb-4">
              We shall also collect data from you where you request access to third-party lending services on our platform. The data we collect 
              from you is shared with the third-party providers of the requested lending services who retain such data in accordance with their 
              respective privacy policies. You will be prompted to consent to the collection of such data before it is collected.
            </p>
          </section>

          {/* Section 3 */}
          <section id="section3" className="border-2 rounded-xl p-8 bg-card scroll-mt-20">
            <h2 className="text-2xl font-bold mb-4">3. Cookies and how we use them</h2>
            <p className="text-muted-foreground leading-relaxed mb-4">
              A cookie is a small file of letters and numbers that we put on your computer if you agree.
            </p>
            <p className="text-muted-foreground leading-relaxed mb-4">
              Cookies allow us to distinguish you from other users of our website and mobile applications, which helps us to provide you with 
              an enhanced browsing experience. For example we use cookies for the following purposes:
            </p>
            <ul className="space-y-3 text-muted-foreground mb-4">
              <li className="flex gap-2">
                <span className="text-primary mt-1">•</span>
                <span>Recognising and counting the number of visitors and to see how visitors move around the site when they are using it</span>
              </li>
              <li className="flex gap-2">
                <span className="text-primary mt-1">•</span>
                <span>Identifying your preferences and subscriptions e.g. language settings, saved items, items stored in your basket</span>
              </li>
              <li className="flex gap-2">
                <span className="text-primary mt-1">•</span>
                <span>Sending you newsletters and commercial/advertising messages tailored to your interests</span>
              </li>
            </ul>
            <p className="text-muted-foreground leading-relaxed">
              Our approved third parties may also set cookies when you use our marketplace. Third parties include search engines, providers of 
              measurement and analytics services, social media networks and advertising companies.
            </p>
          </section>

          {/* Section 4 */}
          <section id="section4" className="border-2 rounded-xl p-8 bg-card scroll-mt-20">
            <h2 className="text-2xl font-bold mb-4">4. How we use your personal data</h2>
            <p className="text-muted-foreground leading-relaxed mb-4">
              We use your personal data to operate, provide, develop and improve the products and services that we offer, including the following:
            </p>
            <ul className="space-y-3 text-muted-foreground">
              <li className="flex gap-2"><span className="text-primary mt-1">•</span><span>Registering you as a new customer</span></li>
              <li className="flex gap-2"><span className="text-primary mt-1">•</span><span>Processing and delivering your orders</span></li>
              <li className="flex gap-2"><span className="text-primary mt-1">•</span><span>Managing your relationship with us</span></li>
              <li className="flex gap-2"><span className="text-primary mt-1">•</span><span>Enabling you to participate in promotions, competitions and surveys</span></li>
              <li className="flex gap-2"><span className="text-primary mt-1">•</span><span>Improving our website, applications, products and services</span></li>
              <li className="flex gap-2"><span className="text-primary mt-1">•</span><span>Recommending/advertising products or services which may be of interest to you</span></li>
              <li className="flex gap-2"><span className="text-primary mt-1">•</span><span>Complying with our legal obligations, including verifying your identity where necessary</span></li>
              <li className="flex gap-2"><span className="text-primary mt-1">•</span><span>Detecting fraud</span></li>
            </ul>
          </section>

          {/* Section 5 */}
          <section id="section5" className="border-2 rounded-xl p-8 bg-card scroll-mt-20">
            <h2 className="text-2xl font-bold mb-4">5. How we share your personal data</h2>
            <p className="text-muted-foreground leading-relaxed mb-4">
              We may need to share your personal data with third parties for the following purposes:
            </p>
            <ul className="space-y-4 text-muted-foreground mb-6">
              <li>
                <strong className="text-foreground">Sale of products and services:</strong> In order to deliver your products and services purchased 
                on our marketplace from third parties, we may be required to provide your personal data to such third parties.
              </li>
              <li>
                <strong className="text-foreground">Working with third party service providers:</strong> We engage third parties to perform certain 
                functions on our behalf. Examples include fulfilling orders, delivering packages, analyzing data, providing marketing assistance, 
                processing payments, and providing customer service.
              </li>
              <li>
                <strong className="text-foreground">Business transfers:</strong> As we continue to develop our business, we might sell or buy other 
                businesses or services. In such transactions, customer information may be transferred together with other business assets.
              </li>
              <li>
                <strong className="text-foreground">Detecting fraud and abuse:</strong> We release account and other personal data to other companies 
                and organizations for fraud protection and credit risk reduction, and to comply with the law.
              </li>
            </ul>
            <p className="text-muted-foreground leading-relaxed mb-2">When we share your personal data with third parties we:</p>
            <ul className="space-y-2 text-muted-foreground">
              <li className="flex gap-2"><span className="text-primary mt-1">•</span><span>Require them to agree to use your data in accordance with the terms of this Privacy and Cookie Notice and in accordance with the law</span></li>
              <li className="flex gap-2"><span className="text-primary mt-1">•</span><span>Only permit them to process your personal data for specified purposes and in accordance with our instructions</span></li>
            </ul>
          </section>

          {/* Section 6 */}
          <section id="section6" className="border-2 rounded-xl p-8 bg-card scroll-mt-20">
            <h2 className="text-2xl font-bold mb-4">6. International transfers</h2>
            <p className="text-muted-foreground leading-relaxed mb-4">
              We may transfer your personal data to locations in another country, if this is permissible pursuant to applicable laws in your location. 
              There are inherent risks in such transfers.
            </p>
            <p className="text-muted-foreground leading-relaxed">
              In the event of international transfers of your personal data, we shall put in place measures necessary to protect your data, and we 
              shall continue to respect your legal rights pursuant to the terms of this Privacy and Cookie Notice and applicable laws in your location.
            </p>
          </section>

          {/* Section 7 */}
          <section id="section7" className="border-2 rounded-xl p-8 bg-card scroll-mt-20">
            <h2 className="text-2xl font-bold mb-4">7. Data security</h2>
            <p className="text-muted-foreground leading-relaxed mb-4">
              We have put in place appropriate security measures to prevent your personal data from being accidentally lost, used or accessed in an 
              unauthorised way, altered or disclosed.
            </p>
            <p className="text-muted-foreground leading-relaxed mb-4">
              In addition, we limit access to your personal data to those employees, agents, contractors and other third parties who have a business 
              need to know. They will only process your personal data on our instructions and they are subject to a duty of confidentiality.
            </p>
            <p className="text-muted-foreground leading-relaxed">
              We have put in place procedures to deal with any suspected personal data breach and will notify you and any applicable regulator of a 
              breach where we are legally required to do so.
            </p>
          </section>

          {/* Section 8 */}
          <section id="section8" className="border-2 rounded-xl p-8 bg-card scroll-mt-20">
            <h2 className="text-2xl font-bold mb-4">8. Your legal rights</h2>
            <p className="text-muted-foreground leading-relaxed mb-4">
              It is important that the personal data we hold about you is accurate and current. Please keep us informed if your personal data changes 
              during your relationship with us.
            </p>
            <p className="text-muted-foreground leading-relaxed">
              Under certain circumstances, you have rights under data protection laws in relation to your personal data, including the right to access, 
              correct or erase your personal data, object to or restrict processing of your personal data, and unsubscribe from our emails and newsletters.
            </p>
          </section>

          {/* Section 9 */}
          <section id="section9" className="border-2 rounded-xl p-8 bg-card scroll-mt-20">
            <h2 className="text-2xl font-bold mb-4">9. Further details</h2>
            <p className="text-muted-foreground leading-relaxed">
              If you are looking for more information on how we process your personal data, or you wish to exercise your legal rights in respect of 
              your personal data, please contact <strong className="text-primary">privacy@kastrapay.com</strong>.
            </p>
          </section>
        </div>

        <div className="mt-12 p-6 bg-muted/50 rounded-lg text-center">
          <h2 className="text-xl font-semibold mb-2">Questions about our privacy policy?</h2>
          <p className="text-muted-foreground mb-4">Contact our privacy team</p>
          <a href="mailto:privacy@kastrapay.com">
            <Button size="lg">Contact Privacy Team</Button>
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
