import React from 'react';
import SimpleHeader from "@/components/SimpleHeader";

export const metadata = {
  title: 'Privacy Policy - MenuMap',
  description: 'Read the privacy policy for using MenuMap.',
};

export default function PrivacyPage() {
  return (
    <div className="bg-white text-on-surface min-h-screen font-body-md relative pt-32 pb-24">
      <SimpleHeader />
      
      <div className="max-w-4xl mx-auto px-margin-mobile md:px-margin-desktop">
        
        <div className="mb-16 animate-fadeInUp border-b border-outline-variant/20 pb-8">
          <h1 className="font-display-lg-mobile md:font-display-lg text-on-surface font-bold mb-4 tracking-tight">Privacy Policy</h1>
          <p className="text-on-surface-variant text-lg">
            Last updated: November 2025
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 relative items-start">
          
          {/* Sticky Sidebar */}
          <div className="hidden lg:block lg:col-span-3 sticky top-32">
            <h3 className="font-bold text-on-surface mb-4 uppercase tracking-wider text-xs text-primary">Contents</h3>
            <ul className="space-y-4 text-sm font-medium text-on-surface-variant">
              <li><a href="#information-collection" className="hover:text-primary transition-colors">1. Data Collection</a></li>
              <li><a href="#use-of-data" className="hover:text-primary transition-colors">2. Use of Data</a></li>
              <li><a href="#data-sharing" className="hover:text-primary transition-colors">3. Data Sharing</a></li>
              <li><a href="#security" className="hover:text-primary transition-colors">4. Security</a></li>
              <li><a href="#cookies" className="hover:text-primary transition-colors">5. Cookies</a></li>
              <li><a href="#rights" className="hover:text-primary transition-colors">6. Your Rights</a></li>
            </ul>
          </div>

          {/* Main Content */}
          <div className="lg:col-span-9 space-y-12">
            
            <section id="information-collection" className="scroll-mt-32">
              <h2 className="font-headline-md text-on-surface mb-4 font-bold">1. Data Collection</h2>
              <div className="space-y-4 text-on-surface-variant leading-relaxed text-base md:text-lg">
                <p>
                  We collect several different types of information for various purposes to provide and improve our Service to you.
                </p>
                <p>
                  <strong>Personal Data:</strong> While using our Service, we may ask you to provide us with certain personally identifiable information that can be used to contact or identify you. Personally identifiable information may include, but is not limited to: Email address, First name and last name, Phone number, and Usage Data.
                </p>
              </div>
            </section>

            <section id="use-of-data" className="scroll-mt-32">
              <h2 className="font-headline-md text-on-surface mb-4 font-bold">2. Use of Data</h2>
              <div className="space-y-4 text-on-surface-variant leading-relaxed text-base md:text-lg">
                <p>
                  MenuMap uses the collected data for various purposes:
                </p>
                <ul className="list-disc pl-5 space-y-2">
                  <li>To provide and maintain our Service.</li>
                  <li>To notify you about changes to our Service or your orders.</li>
                  <li>To provide customer support and handle inquiries.</li>
                  <li>To monitor the usage of our Service and detect technical issues.</li>
                </ul>
              </div>
            </section>

            <section id="data-sharing" className="scroll-mt-32">
              <h2 className="font-headline-md text-on-surface mb-4 font-bold">3. Data Sharing</h2>
              <div className="space-y-4 text-on-surface-variant leading-relaxed text-base md:text-lg">
                <p>
                  We only share your information with third-party service providers when absolutely necessary for the functioning of the platform. For example, your contact information is shared with Restaurant Partners when you place an order so they can fulfill it. We never sell your personal data to third parties.
                </p>
              </div>
            </section>

            <section id="security" className="scroll-mt-32">
              <h2 className="font-headline-md text-on-surface mb-4 font-bold">4. Security</h2>
              <div className="space-y-4 text-on-surface-variant leading-relaxed text-base md:text-lg">
                <p>
                  The security of your data is important to us, but remember that no method of transmission over the Internet, or method of electronic storage is 100% secure. While we strive to use commercially acceptable means to protect your Personal Data (including SSL encryption and secure database hosting), we cannot guarantee its absolute security.
                </p>
              </div>
            </section>

            <section id="cookies" className="scroll-mt-32">
              <h2 className="font-headline-md text-on-surface mb-4 font-bold">5. Cookies</h2>
              <div className="space-y-4 text-on-surface-variant leading-relaxed text-base md:text-lg">
                <p>
                  We use cookies and similar tracking technologies to track the activity on our Service and hold certain information. You can instruct your browser to refuse all cookies or to indicate when a cookie is being sent. However, if you do not accept cookies, you may not be able to use some portions of our Service.
                </p>
              </div>
            </section>

            <section id="rights" className="scroll-mt-32">
              <h2 className="font-headline-md text-on-surface mb-4 font-bold">6. Your Rights</h2>
              <div className="space-y-4 text-on-surface-variant leading-relaxed text-base md:text-lg">
                <p>
                  You have the right to access, update, or delete the personal information we hold about you. You can usually do this directly within your account settings section. If you are unable to perform these actions yourself, please contact us to assist you.
                </p>
              </div>
            </section>

          </div>
        </div>
      </div>
    </div>
  );
}
