import React from 'react';
import Link from 'next/link';
import MaterialIcon from "@/components/stitch/MaterialIcon";

export const metadata = {
  title: 'Terms and Conditions - MenuMap',
  description: 'Read the terms and conditions for using MenuMap.',
};

export default function TermsPage() {
  return (
    <div className="bg-background text-on-background min-h-screen font-body-md relative pt-24 pb-16">
      
      {/* Aesthetic Header */}
      <div className="absolute top-0 left-0 w-full h-80 bg-primary/5 rounded-b-[48px] -z-10 overflow-hidden">
        <div className="absolute top-1/2 left-1/4 w-96 h-96 bg-primary/10 rounded-full blur-3xl -translate-y-1/2 -z-10"></div>
        <div className="absolute top-1/2 right-1/4 w-80 h-80 bg-secondary/10 rounded-full blur-3xl -translate-y-1/2 -z-10"></div>
      </div>

      <div className="max-w-7xl mx-auto px-margin-mobile md:px-margin-desktop">
        <Link href="/" className="inline-flex items-center gap-2 text-primary font-bold mb-8 hover:underline">
          <MaterialIcon name="arrow_back" className="text-[20px]" />
          Back to Home
        </Link>
        
        <div className="text-center max-w-3xl mx-auto mb-16 animate-fadeInUp">
          <h1 className="font-display-lg-mobile md:font-display-lg text-primary font-bold mb-4">Terms & Conditions</h1>
          <p className="text-on-surface-variant text-lg">
            Last updated: November 2025. Please read these terms carefully before using MenuMap.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 relative items-start">
          
          {/* Sticky Sidebar */}
          <div className="hidden lg:block lg:col-span-3 sticky top-32">
            <div className="glass-card bg-surface/80 p-6 rounded-3xl border border-outline-variant/30 shadow-sm">
              <h3 className="font-bold text-on-surface mb-4 uppercase tracking-wider text-xs">Contents</h3>
              <ul className="space-y-3 text-sm text-on-surface-variant">
                <li><a href="#acceptance" className="hover:text-primary transition-colors font-bold text-primary">1. Acceptance of Terms</a></li>
                <li><a href="#accounts" className="hover:text-primary transition-colors">2. User Accounts</a></li>
                <li><a href="#restaurants" className="hover:text-primary transition-colors">3. Restaurant Owners</a></li>
                <li><a href="#orders" className="hover:text-primary transition-colors">4. Orders & Payments</a></li>
                <li><a href="#ip" className="hover:text-primary transition-colors">5. Intellectual Property</a></li>
                <li><a href="#liability" className="hover:text-primary transition-colors">6. Limitation of Liability</a></li>
              </ul>
            </div>
          </div>

          {/* Main Content */}
          <div className="lg:col-span-9">
            <div className="glass-card bg-surface p-8 md:p-12 rounded-[32px] border border-outline-variant/30 shadow-lg space-y-12 text-on-surface">
              
              <section id="acceptance" className="scroll-mt-32">
                <h2 className="font-headline-md text-primary mb-4 flex items-center gap-2">
                  <MaterialIcon name="gavel" />
                  1. Acceptance of Terms
                </h2>
                <div className="space-y-4 text-on-surface-variant leading-relaxed">
                  <p>
                    By accessing or using the MenuMap platform ("Platform", "we", "us", or "our"), you agree to be bound by these Terms and Conditions ("Terms"). If you disagree with any part of the terms, then you do not have permission to access the Service.
                  </p>
                  <p>
                    MenuMap acts as an intermediary technology platform connecting independent restaurant partners ("Restaurants") with diners ("Customers"). We do not prepare, sell, or deliver food ourselves.
                  </p>
                </div>
              </section>

              <section id="accounts" className="scroll-mt-32">
                <h2 className="font-headline-md text-primary mb-4 flex items-center gap-2">
                  <MaterialIcon name="person" />
                  2. User Accounts
                </h2>
                <div className="space-y-4 text-on-surface-variant leading-relaxed">
                  <p>
                    When you create an account with us, you must provide information that is accurate, complete, and current at all times. Failure to do so constitutes a breach of the Terms, which may result in immediate termination of your account.
                  </p>
                  <ul className="list-disc pl-5 space-y-2">
                    <li>You are responsible for safeguarding the password that you use to access the Service.</li>
                    <li>You agree not to disclose your password to any third party.</li>
                    <li>You must notify us immediately upon becoming aware of any breach of security or unauthorized use of your account.</li>
                  </ul>
                </div>
              </section>

              <section id="restaurants" className="scroll-mt-32">
                <h2 className="font-headline-md text-primary mb-4 flex items-center gap-2">
                  <MaterialIcon name="storefront" />
                  3. Restaurant Owners
                </h2>
                <div className="space-y-4 text-on-surface-variant leading-relaxed">
                  <p>
                    Restaurant owners who register on MenuMap ("Partners") agree to maintain accurate, up-to-date menus, pricing, and operational hours.
                  </p>
                  <p>
                    Partners bear full legal and regulatory responsibility for the quality, safety, and hygiene of the food and beverages they list on the Platform. MenuMap is not liable for any health issues, allergic reactions, or foodborne illnesses resulting from orders placed through our Platform.
                  </p>
                </div>
              </section>

              <section id="orders" className="scroll-mt-32">
                <h2 className="font-headline-md text-primary mb-4 flex items-center gap-2">
                  <MaterialIcon name="receipt_long" />
                  4. Orders & Payments
                </h2>
                <div className="space-y-4 text-on-surface-variant leading-relaxed">
                  <p>
                    All prices listed on MenuMap are determined solely by the Restaurant Partners. Prices may change without prior notice. 
                  </p>
                  <p>
                    MenuMap securely processes payments via encrypted third-party gateways. Once an order is confirmed by the Restaurant, refunds are only issued at the discretion of the Restaurant or under exceptional circumstances handled by our support team.
                  </p>
                </div>
              </section>

              <section id="ip" className="scroll-mt-32">
                <h2 className="font-headline-md text-primary mb-4 flex items-center gap-2">
                  <MaterialIcon name="copyright" />
                  5. Intellectual Property
                </h2>
                <div className="space-y-4 text-on-surface-variant leading-relaxed">
                  <p>
                    The Service and its original content (excluding Content provided by Restaurants), features, and functionality are and will remain the exclusive property of MenuMap and its licensors. The Service is protected by copyright, trademark, and other laws.
                  </p>
                </div>
              </section>

              <section id="liability" className="scroll-mt-32">
                <h2 className="font-headline-md text-primary mb-4 flex items-center gap-2">
                  <MaterialIcon name="gpp_bad" />
                  6. Limitation of Liability
                </h2>
                <div className="space-y-4 text-on-surface-variant leading-relaxed">
                  <p>
                    In no event shall MenuMap, nor its directors, employees, partners, agents, suppliers, or affiliates, be liable for any indirect, incidental, special, consequential or punitive damages, including without limitation, loss of profits, data, use, goodwill, or other intangible losses, resulting from your access to or use of or inability to access or use the Service.
                  </p>
                </div>
              </section>

            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
