import React from 'react';
import SimpleHeader from "@/components/SimpleHeader";

export const metadata = {
  title: 'Terms and Conditions - MenuMap',
  description: 'Read the terms and conditions for using MenuMap.',
};

export default function TermsPage() {
  return (
    <div className="bg-white text-on-surface min-h-screen font-body-md relative pt-32 pb-24">
      <SimpleHeader />
      
      <div className="max-w-4xl mx-auto px-margin-mobile md:px-margin-desktop">
        
        <div className="mb-16 animate-fadeInUp border-b border-outline-variant/20 pb-8">
          <h1 className="font-display-lg-mobile md:font-display-lg text-on-surface font-bold mb-4 tracking-tight">Terms & Conditions</h1>
          <p className="text-on-surface-variant text-lg">
            Last updated: November 2025
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 relative items-start">
          
          {/* Sticky Sidebar */}
          <div className="hidden lg:block lg:col-span-3 sticky top-32">
            <h3 className="font-bold text-on-surface mb-4 uppercase tracking-wider text-xs text-primary">Contents</h3>
            <ul className="space-y-4 text-sm font-medium text-on-surface-variant">
              <li><a href="#acceptance" className="hover:text-primary transition-colors">1. Acceptance of Terms</a></li>
              <li><a href="#accounts" className="hover:text-primary transition-colors">2. User Accounts</a></li>
              <li><a href="#restaurants" className="hover:text-primary transition-colors">3. Restaurant Owners</a></li>
              <li><a href="#orders" className="hover:text-primary transition-colors">4. Orders & Payments</a></li>
              <li><a href="#ip" className="hover:text-primary transition-colors">5. Intellectual Property</a></li>
              <li><a href="#liability" className="hover:text-primary transition-colors">6. Limitation of Liability</a></li>
            </ul>
          </div>

          {/* Main Content (No heavy cards, just clean text) */}
          <div className="lg:col-span-9 space-y-12">
            
            <section id="acceptance" className="scroll-mt-32">
              <h2 className="font-headline-md text-on-surface mb-4 font-bold">1. Acceptance of Terms</h2>
              <div className="space-y-4 text-on-surface-variant leading-relaxed text-base md:text-lg">
                <p>
                  By accessing or using the MenuMap platform ("Platform", "we", "us", or "our"), you agree to be bound by these Terms and Conditions ("Terms"). If you disagree with any part of the terms, then you do not have permission to access the Service.
                </p>
                <p>
                  MenuMap acts as an intermediary technology platform connecting independent restaurant partners ("Restaurants") with diners ("Customers"). We do not prepare, sell, or deliver food ourselves.
                </p>
              </div>
            </section>

            <section id="accounts" className="scroll-mt-32">
              <h2 className="font-headline-md text-on-surface mb-4 font-bold">2. User Accounts</h2>
              <div className="space-y-4 text-on-surface-variant leading-relaxed text-base md:text-lg">
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
              <h2 className="font-headline-md text-on-surface mb-4 font-bold">3. Restaurant Owners</h2>
              <div className="space-y-4 text-on-surface-variant leading-relaxed text-base md:text-lg">
                <p>
                  Restaurant owners who register on MenuMap ("Partners") agree to maintain accurate, up-to-date menus, pricing, and operational hours.
                </p>
                <p>
                  Partners bear full legal and regulatory responsibility for the quality, safety, and hygiene of the food and beverages they list on the Platform. MenuMap is not liable for any health issues, allergic reactions, or foodborne illnesses resulting from orders placed through our Platform.
                </p>
              </div>
            </section>

            <section id="orders" className="scroll-mt-32">
              <h2 className="font-headline-md text-on-surface mb-4 font-bold">4. Orders & Payments</h2>
              <div className="space-y-4 text-on-surface-variant leading-relaxed text-base md:text-lg">
                <p>
                  All prices listed on MenuMap are determined solely by the Restaurant Partners. Prices may change without prior notice. 
                </p>
                <p>
                  MenuMap securely processes payments via encrypted third-party gateways. Once an order is confirmed by the Restaurant, refunds are only issued at the discretion of the Restaurant or under exceptional circumstances handled by our support team.
                </p>
              </div>
            </section>

            <section id="ip" className="scroll-mt-32">
              <h2 className="font-headline-md text-on-surface mb-4 font-bold">5. Intellectual Property</h2>
              <div className="space-y-4 text-on-surface-variant leading-relaxed text-base md:text-lg">
                <p>
                  The Service and its original content (excluding Content provided by Restaurants), features, and functionality are and will remain the exclusive property of MenuMap and its licensors. The Service is protected by copyright, trademark, and other laws.
                </p>
              </div>
            </section>

            <section id="liability" className="scroll-mt-32">
              <h2 className="font-headline-md text-on-surface mb-4 font-bold">6. Limitation of Liability</h2>
              <div className="space-y-4 text-on-surface-variant leading-relaxed text-base md:text-lg">
                <p>
                  In no event shall MenuMap, nor its directors, employees, partners, agents, suppliers, or affiliates, be liable for any indirect, incidental, special, consequential or punitive damages, including without limitation, loss of profits, data, use, goodwill, or other intangible losses, resulting from your access to or use of or inability to access or use the Service.
                </p>
              </div>
            </section>

          </div>
        </div>
      </div>
    </div>
  );
}
