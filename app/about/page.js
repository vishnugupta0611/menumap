import React from 'react';
import Link from 'next/link';
import SimpleHeader from "@/components/SimpleHeader";

export const metadata = {
  metadataBase: new URL('https://heyrestro.com'),
  title: 'About HeyRestro - Restaurant Discovery & Digital Menu Platform',
  description: 'Discover how HeyRestro is revolutionizing restaurant discovery with interactive maps and digital menus. Empower restaurants with instant online presence and connect food lovers with their next favorite local restaurant.',
  keywords: 'HeyRestro, restaurant discovery, restaurant website, digital restaurant menu, QR menu, QR code menu, restaurant QR code, restaurant management, online restaurant menu, restaurants near me, food discovery, restaurant directory India, restaurant profile, restaurant marketing, restaurant digital presence',
  authors: [{ name: 'HeyRestro Team' }],
  creator: 'HeyRestro',
  publisher: 'HeyRestro',
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  canonical: 'https://heyrestro.com/about',
  openGraph: {
    title: 'About HeyRestro - Restaurant Discovery & Digital Menu Platform',
    description: 'Discover how HeyRestro connects restaurants with food lovers through interactive maps and stunning digital menus.',
    url: 'https://heyrestro.com/about',
    siteName: 'HeyRestro',
    images: [
      {
        url: 'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=1200&h=630',
        width: 1200,
        height: 630,
        alt: 'HeyRestro - Restaurant Discovery Platform',
      },
    ],
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'About HeyRestro - Restaurant Discovery & Digital Menu Platform',
    description: 'Discover how HeyRestro is revolutionizing restaurant discovery with interactive maps and digital menus.',
    images: ['https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=1200&h=630'],
  },
  alternates: {
    canonical: 'https://heyrestro.com/about',
  },
};

function OrganizationSchema() {
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{
        __html: JSON.stringify({
          '@context': 'https://schema.org',
          '@type': 'Organization',
          name: 'HeyRestro',
          url: 'https://heyrestro.com',
          logo: 'https://heyrestro.com/logo.png',
          description: 'HeyRestro is a digital platform connecting food lovers with local restaurants through interactive maps and digital menus.',
          sameAs: [
            'https://www.facebook.com/heyrestro',
            'https://www.twitter.com/heyrestro',
            'https://www.instagram.com/heyrestro',
            'https://www.linkedin.com/company/heyrestro',
          ],
          foundingDate: '2024',
          founder: {
            '@type': 'Person',
            name: 'HeyRestro Team',
          },
          contactPoint: {
            '@type': 'ContactPoint',
            contactType: 'Customer Service',
            email: 'support@heyrestro.com',
            url: 'https://heyrestro.com/contact',
          },
          areaServed: 'IN',
          knowsAbout: ['Restaurant Discovery', 'Digital Menus', 'Restaurant Management', 'Food Discovery'],
          slogan: 'Connecting food lovers with local flavors.',
        }),
      }}
    />
  );
}

function WebsiteSchema() {
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{
        __html: JSON.stringify({
          '@context': 'https://schema.org',
          '@type': 'WebSite',
          name: 'HeyRestro',
          url: 'https://heyrestro.com',
          potentialAction: {
            '@type': 'SearchAction',
            target: {
              '@type': 'EntryPoint',
              urlTemplate: 'https://heyrestro.com/search?q={search_term_string}',
            },
            query_input: 'required name=search_term_string',
          },
        }),
      }}
    />
  );
}

function AboutPageSchema() {
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{
        __html: JSON.stringify({
          '@context': 'https://schema.org',
          '@type': 'AboutPage',
          name: 'About HeyRestro',
          url: 'https://heyrestro.com/about',
          mainEntity: {
            '@type': 'Organization',
            name: 'HeyRestro',
            description: 'HeyRestro is revolutionizing restaurant discovery and digital presence with an innovative platform that connects food lovers with independent restaurants through interactive maps, stunning digital menus, and QR code technology.',
          },
        }),
      }}
    />
  );
}

function BreadcrumbSchema() {
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{
        __html: JSON.stringify({
          '@context': 'https://schema.org',
          '@type': 'BreadcrumbList',
          itemListElement: [
            {
              '@type': 'ListItem',
              position: 1,
              name: 'Home',
              item: 'https://heyrestro.com',
            },
            {
              '@type': 'ListItem',
              position: 2,
              name: 'About',
              item: 'https://heyrestro.com/about',
            },
          ],
        }),
      }}
    />
  );
}

function FAQSchema() {
  const faqs = [
    {
      question: 'What is HeyRestro?',
      answer: 'HeyRestro is a comprehensive restaurant discovery and digital management platform that helps food lovers find amazing local restaurants through interactive maps while enabling restaurant owners to establish their digital presence with stunning online storefronts and QR code menus.',
    },
    {
      question: 'How does HeyRestro help restaurants?',
      answer: 'HeyRestro empowers restaurants with instant digital storefronts, automated QR code menus, comprehensive management tools, and a zero-commission structure that allows restaurants to keep 100% of their profits while reaching more customers through our discovery platform.',
    },
    {
      question: 'How do customers benefit from HeyRestro?',
      answer: 'Customers enjoy map-based restaurant discovery, access to rich digital menus with food photography and pricing, seamless ordering capabilities, dietary filters, real-time ratings, and personalized restaurant recommendations based on their location and preferences.',
    },
    {
      question: 'Is HeyRestro available for restaurants outside India?',
      answer: 'Currently, HeyRestro focuses on providing exceptional service to restaurants in India. We are planning to expand to international markets in the near future. Check our roadmap or contact us for updates on expansion plans.',
    },
    {
      question: 'What makes HeyRestro different from other restaurant platforms?',
      answer: 'HeyRestro stands out with its zero-commission model, interactive map-based discovery, automated QR code technology, beautiful digital storefronts that require no coding, comprehensive restaurant management tools, and our focus on supporting independent restaurants.',
    },
    {
      question: 'How do I register my restaurant on HeyRestro?',
      answer: 'Registering your restaurant on HeyRestro takes less than 2 minutes. Visit our restaurant registration page, fill in your basic information, upload your menu, and you\'ll instantly have a beautiful, SEO-optimized digital storefront with QR code menus for your tables.',
    },
  ];

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{
        __html: JSON.stringify({
          '@context': 'https://schema.org',
          '@type': 'FAQPage',
          mainEntity: faqs.map((faq) => ({
            '@type': 'Question',
            name: faq.question,
            acceptedAnswer: {
              '@type': 'Answer',
              text: faq.answer,
            },
          })),
        }),
      }}
    />
  );
}

export default function AboutPage() {
  return (
    <>
      <OrganizationSchema />
      <WebsiteSchema />
      <AboutPageSchema />
      <BreadcrumbSchema />
      <FAQSchema />
      
      <main className="bg-white text-on-surface min-h-screen font-body-md relative overflow-x-hidden">
        <SimpleHeader />
        
        <div className="pt-32 pb-16">
          <div className="max-w-7xl mx-auto px-margin-mobile md:px-margin-desktop">
            
            {/* Hero Section */}
            <header className="text-center max-w-4xl mx-auto mb-24 animate-fadeInUp">
              <h1 className="text-4xl md:text-6xl text-on-surface font-bold mb-6 leading-tight tracking-tight">
                Connecting food lovers with <span className="text-primary">local flavors.</span>
              </h1>
              <p className="text-on-surface-variant text-lg md:text-xl leading-relaxed max-w-2xl mx-auto">
                HeyRestro is a revolutionary restaurant discovery platform and digital management solution designed to bridge the gap between independent restaurants and hungry customers. We believe exceptional food deserves to be discovered effortlessly.
              </p>
            </header>

            {/* Our Mission Section */}
            <section className="grid grid-cols-1 md:grid-cols-2 gap-12 md:gap-20 items-center mb-32">
              <article>
                <h2 className="text-3xl font-bold text-on-surface mb-6">Our Mission</h2>
                <p className="text-on-surface-variant leading-relaxed text-lg mb-6">
                  It started with a simple observation: discovering hidden culinary gems in your neighborhood was unnecessarily difficult, and talented restaurant owners struggled to build beautiful digital menus without exorbitant fees or technical expertise. We recognized this gap and knew we could do better.
                </p>
                <p className="text-on-surface-variant leading-relaxed text-lg">
                  We created HeyRestro to empower independent restaurants with stunning, instant digital storefronts and comprehensive management tools, while simultaneously providing customers with an intuitive, map-based discovery engine to find their next favorite meal. Today, HeyRestro is transforming how restaurants and food lovers connect.
                </p>
              </article>
              <div className="h-[400px] rounded-3xl overflow-hidden shadow-2xl">
                <img 
                  src="https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=800" 
                  alt="Professional restaurant kitchen with chefs preparing meals at HeyRestro" 
                  className="w-full h-full object-cover"
                  loading="lazy"
                />
              </div>
            </section>

            {/* Our Vision Section */}
            <section className="grid grid-cols-1 md:grid-cols-2 gap-12 md:gap-20 items-center mb-32">
              <div className="order-2 md:order-1 h-[400px] rounded-3xl overflow-hidden shadow-2xl">
                <img 
                  src="https://images.unsplash.com/photo-1504674900271-8f9b30fbbb4a?w=800" 
                  alt="Modern restaurant with digital menu displays and customers using HeyRestro platform" 
                  className="w-full h-full object-cover"
                  loading="lazy"
                />
              </div>
              <article className="order-1 md:order-2">
                <h2 className="text-3xl font-bold text-on-surface mb-6">Our Vision</h2>
                <p className="text-on-surface-variant leading-relaxed text-lg mb-6">
                  We envision a world where every independent restaurant, regardless of size or resources, has access to world-class digital tools to showcase their culinary creations and connect with their community. We see HeyRestro becoming the preferred platform for restaurant discovery across India and beyond.
                </p>
                <p className="text-on-surface-variant leading-relaxed text-lg">
                  Our long-term vision extends beyond digital menus and maps. We're building a comprehensive ecosystem where restaurants have complete operational control, customers enjoy personalized dining experiences, and technology serves as the bridge bringing these two worlds together seamlessly.
                </p>
              </article>
            </section>

            {/* What We Provide */}
            <section className="text-center mb-16">
              <h2 className="text-3xl font-bold text-on-surface mb-4">What HeyRestro Provides</h2>
              <p className="text-on-surface-variant text-lg max-w-2xl mx-auto">
                HeyRestro is a dual-sided ecosystem designed to deliver exceptional value to both restaurant owners and food enthusiasts, creating a thriving community of culinary discovery.
              </p>
            </section>

            {/* For Diners Section */}
            <section className="grid grid-cols-1 md:grid-cols-2 gap-12 md:gap-20 items-center mb-24">
              <div className="order-2 md:order-1 h-[400px] rounded-3xl overflow-hidden shadow-xl bg-surface-container-low">
                <img 
                  src="https://images.unsplash.com/photo-1526367790999-0150786686a2?w=800" 
                  alt="Friends enjoying meals at a restaurant discovered through HeyRestro" 
                  className="w-full h-full object-cover"
                  loading="lazy"
                />
              </div>
              <article className="order-1 md:order-2">
                <h3 className="text-2xl font-bold text-primary mb-6 uppercase tracking-wider text-sm">For Diners & Food Lovers</h3>
                <div className="space-y-8">
                  <div>
                    <h4 className="text-xl font-bold text-on-surface mb-2">Interactive Map-Based Discovery</h4>
                    <p className="text-on-surface-variant">Instantly visualize all highly-rated restaurants plotted on a beautiful, responsive interactive map centered on your exact GPS location. Discover hidden gems in your neighborhood with ease.</p>
                  </div>
                  <div>
                    <h4 className="text-xl font-bold text-on-surface mb-2">Rich Digital Restaurant Menus</h4>
                    <p className="text-on-surface-variant">Say goodbye to blurry PDF menus. Browse crystal-clear professional food photography, exact pricing information, dietary filters, and ingredient details. Make informed decisions about where to eat before you arrive.</p>
                  </div>
                  <div>
                    <h4 className="text-xl font-bold text-on-surface mb-2">Seamless Online Ordering</h4>
                    <p className="text-on-surface-variant">Add your favorite items to your cart and place orders directly through our intuitive platform with just a few taps. Enjoy convenient food delivery and pickup options from your preferred restaurants.</p>
                  </div>
                  <div>
                    <h4 className="text-xl font-bold text-on-surface mb-2">Personalized Restaurant Recommendations</h4>
                    <p className="text-on-surface-variant">Receive smart recommendations based on your location, cuisine preferences, dietary requirements, and ratings. Never miss an opportunity to discover your next favorite restaurant.</p>
                  </div>
                </div>
              </article>
            </section>

            {/* For Restaurants Section */}
            <section className="grid grid-cols-1 md:grid-cols-2 gap-12 md:gap-20 items-center mb-32">
              <article>
                <h3 className="text-2xl font-bold text-primary mb-6 uppercase tracking-wider text-sm">For Restaurants & Owners</h3>
                <div className="space-y-8">
                  <div>
                    <h4 className="text-xl font-bold text-on-surface mb-2">Instant Digital Restaurant Storefronts</h4>
                    <p className="text-on-surface-variant">Create a stunning, fully-featured, SEO-optimized digital storefront for your restaurant in less than 2 minutes. No coding, no technical knowledge, and no expensive agency fees required.</p>
                  </div>
                  <div>
                    <h4 className="text-xl font-bold text-on-surface mb-2">Automated QR Code Restaurant Menus</h4>
                    <p className="text-on-surface-variant">HeyRestro automatically generates print-ready QR codes customized for your restaurant. Place them on your tables, and when diners scan, they instantly access your live digital menu with real-time updates.</p>
                  </div>
                  <div>
                    <h4 className="text-xl font-bold text-on-surface mb-2">Zero-Commission Business Model</h4>
                    <p className="text-on-surface-variant">Eliminate predatory commission structures. HeyRestro operates on a transparent, zero-commission model, allowing you to keep 100% of your profits while accessing enterprise-grade restaurant management technology.</p>
                  </div>
                  <div>
                    <h4 className="text-xl font-bold text-on-surface mb-2">Comprehensive Restaurant Management Tools</h4>
                    <p className="text-on-surface-variant">Manage your menu, update pricing, track orders, analyze customer feedback, and access detailed analytics—all from one intuitive dashboard designed for restaurant owners.</p>
                  </div>
                </div>
              </article>
              <div className="h-[400px] rounded-3xl overflow-hidden shadow-xl bg-surface-container-low">
                <img 
                  src="https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?w=800" 
                  alt="Restaurant owner using HeyRestro digital management tools to manage online menu and QR codes" 
                  className="w-full h-full object-cover"
                  loading="lazy"
                />
              </div>
            </section>

            {/* Why HeyRestro Section */}
            <section className="mb-32">
              <h2 className="text-3xl font-bold text-on-surface mb-12 text-center">Why Choose HeyRestro</h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                <article className="p-8 rounded-2xl bg-surface-container-low border border-outline-variant hover:shadow-lg transition-shadow duration-300">
                  <h3 className="text-xl font-bold text-primary mb-4">For Restaurants</h3>
                  <ul className="space-y-3 text-on-surface-variant">
                    <li className="flex items-start">
                      <span className="text-primary font-bold mr-3">✓</span>
                      <span>Zero commission on orders—keep 100% of profits</span>
                    </li>
                    <li className="flex items-start">
                      <span className="text-primary font-bold mr-3">✓</span>
                      <span>Professional digital presence in 2 minutes</span>
                    </li>
                    <li className="flex items-start">
                      <span className="text-primary font-bold mr-3">✓</span>
                      <span>Automated QR code generation and management</span>
                    </li>
                    <li className="flex items-start">
                      <span className="text-primary font-bold mr-3">✓</span>
                      <span>Complete menu and order management tools</span>
                    </li>
                    <li className="flex items-start">
                      <span className="text-primary font-bold mr-3">✓</span>
                      <span>Dedicated customer support team</span>
                    </li>
                  </ul>
                </article>

                <article className="p-8 rounded-2xl bg-surface-container-low border border-outline-variant hover:shadow-lg transition-shadow duration-300">
                  <h3 className="text-xl font-bold text-primary mb-4">For Customers</h3>
                  <ul className="space-y-3 text-on-surface-variant">
                    <li className="flex items-start">
                      <span className="text-primary font-bold mr-3">✓</span>
                      <span>Discover restaurants on interactive maps</span>
                    </li>
                    <li className="flex items-start">
                      <span className="text-primary font-bold mr-3">✓</span>
                      <span>Browse accurate digital menus with photos</span>
                    </li>
                    <li className="flex items-start">
                      <span className="text-primary font-bold mr-3">✓</span>
                      <span>Filter by cuisine, pricing, and dietary needs</span>
                    </li>
                    <li className="flex items-start">
                      <span className="text-primary font-bold mr-3">✓</span>
                      <span>Seamless ordering and reservation system</span>
                    </li>
                    <li className="flex items-start">
                      <span className="text-primary font-bold mr-3">✓</span>
                      <span>Real-time ratings and reviews</span>
                    </li>
                  </ul>
                </article>

                <article className="p-8 rounded-2xl bg-surface-container-low border border-outline-variant hover:shadow-lg transition-shadow duration-300">
                  <h3 className="text-xl font-bold text-primary mb-4">Our Commitment</h3>
                  <ul className="space-y-3 text-on-surface-variant">
                    <li className="flex items-start">
                      <span className="text-primary font-bold mr-3">✓</span>
                      <span>Transparent, ethical business practices</span>
                    </li>
                    <li className="flex items-start">
                      <span className="text-primary font-bold mr-3">✓</span>
                      <span>Supporting independent restaurants</span>
                    </li>
                    <li className="flex items-start">
                      <span className="text-primary font-bold mr-3">✓</span>
                      <span>Continuous platform innovation</span>
                    </li>
                    <li className="flex items-start">
                      <span className="text-primary font-bold mr-3">✓</span>
                      <span>Community-focused development</span>
                    </li>
                    <li className="flex items-start">
                      <span className="text-primary font-bold mr-3">✓</span>
                      <span>Industry-leading security and privacy</span>
                    </li>
                  </ul>
                </article>
              </div>
            </section>

            {/* Technology Section */}
            <section className="mb-32">
              <h2 className="text-3xl font-bold text-on-surface mb-6 text-center">Built with Modern Technology</h2>
              <p className="text-on-surface-variant text-lg text-center max-w-2xl mx-auto mb-12">
                HeyRestro leverages cutting-edge technology to deliver fast, reliable, and scalable restaurant discovery and management solutions.
              </p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <article className="p-6 rounded-xl bg-surface-container-low">
                  <h3 className="text-lg font-bold text-on-surface mb-4">Robust Backend Infrastructure</h3>
                  <p className="text-on-surface-variant">Built on scalable cloud architecture, our backend handles millions of daily queries, ensuring lightning-fast restaurant discovery and real-time menu updates for your seamless experience.</p>
                </article>
                <article className="p-6 rounded-xl bg-surface-container-low">
                  <h3 className="text-lg font-bold text-on-surface mb-4">Responsive Mobile-First Design</h3>
                  <p className="text-on-surface-variant">Optimized for all devices, HeyRestro delivers a beautiful, intuitive experience whether you're searching on your smartphone, tablet, or desktop computer.</p>
                </article>
                <article className="p-6 rounded-xl bg-surface-container-low">
                  <h3 className="text-lg font-bold text-on-surface mb-4">Advanced Location Intelligence</h3>
                  <p className="text-on-surface-variant">Our proprietary mapping and geolocation algorithms power accurate, context-aware restaurant recommendations based on your precise location and preferences.</p>
                </article>
                <article className="p-6 rounded-xl bg-surface-container-low">
                  <h3 className="text-lg font-bold text-on-surface mb-4">Intelligent Search & Discovery</h3>
                  <p className="text-on-surface-variant">Machine learning algorithms analyze user behavior and preferences to deliver personalized restaurant recommendations that match your unique tastes.</p>
                </article>
              </div>
            </section>

            {/* Security Section */}
            <section className="mb-32">
              <h2 className="text-3xl font-bold text-on-surface mb-6 text-center">Enterprise-Grade Security</h2>
              <p className="text-on-surface-variant text-lg text-center max-w-2xl mx-auto mb-12">
                We prioritize your data security and privacy with industry-leading protection standards.
              </p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <article className="p-6 rounded-xl border-l-4 border-primary bg-surface-container-low">
                  <h3 className="text-lg font-bold text-on-surface mb-3">Data Protection</h3>
                  <p className="text-on-surface-variant">End-to-end encryption, secure data storage, and regular security audits protect your personal information and restaurant data from unauthorized access.</p>
                </article>
                <article className="p-6 rounded-xl border-l-4 border-primary bg-surface-container-low">
                  <h3 className="text-lg font-bold text-on-surface mb-3">Privacy Compliance</h3>
                  <p className="text-on-surface-variant">Full compliance with international privacy regulations including GDPR and local data protection laws. Your data is your own, and we treat it with utmost respect.</p>
                </article>
                <article className="p-6 rounded-xl border-l-4 border-primary bg-surface-container-low">
                  <h3 className="text-lg font-bold text-on-surface mb-3">Payment Security</h3>
                  <p className="text-on-surface-variant">PCI-DSS compliant payment processing with tokenization technology ensures your financial information remains completely secure during every transaction.</p>
                </article>
                <article className="p-6 rounded-xl border-l-4 border-primary bg-surface-container-low">
                  <h3 className="text-lg font-bold text-on-surface mb-3">Continuous Monitoring</h3>
                  <p className="text-on-surface-variant">24/7 security monitoring and threat detection systems identify and prevent potential security incidents before they impact users.</p>
                </article>
              </div>
            </section>

            {/* Future Roadmap Section */}
            <section className="mb-32">
              <h2 className="text-3xl font-bold text-on-surface mb-6 text-center">Our Future Roadmap</h2>
              <p className="text-on-surface-variant text-lg text-center max-w-2xl mx-auto mb-12">
                We're continuously evolving HeyRestro to serve restaurants and food lovers even better. Here's what we're building next.
              </p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <article className="p-6 rounded-xl bg-primary/10 border border-primary/30">
                  <h3 className="text-lg font-bold text-primary mb-3">AI-Powered Recommendations</h3>
                  <p className="text-on-surface-variant">Advanced machine learning models will provide hyper-personalized restaurant suggestions based on your dining history, preferences, and real-time context.</p>
                </article>
                <article className="p-6 rounded-xl bg-primary/10 border border-primary/30">
                  <h3 className="text-lg font-bold text-primary mb-3">Loyalty Program Integration</h3>
                  <p className="text-on-surface-variant">Unified loyalty program platform for restaurants to reward repeat customers with points, discounts, and exclusive offers directly through HeyRestro.</p>
                </article>
                <article className="p-6 rounded-xl bg-primary/10 border border-primary/30">
                  <h3 className="text-lg font-bold text-primary mb-3">International Expansion</h3>
                  <p className="text-on-surface-variant">Bringing HeyRestro to restaurants and food lovers across Southeast Asia, Europe, and North America with localized features and support.</p>
                </article>
                <article className="p-6 rounded-xl bg-primary/10 border border-primary/30">
                  <h3 className="text-lg font-bold text-primary mb-3">Restaurant Analytics Dashboard</h3>
                  <p className="text-on-surface-variant">Comprehensive insights into customer behavior, order trends, peak hours, and performance metrics to help restaurants optimize operations and profitability.</p>
                </article>
                <article className="p-6 rounded-xl bg-primary/10 border border-primary/30">
                  <h3 className="text-lg font-bold text-primary mb-3">Table Reservation System</h3>
                  <p className="text-on-surface-variant">Integrated reservation and table management system allowing customers to book tables directly and restaurants to optimize seating arrangements.</p>
                </article>
                <article className="p-6 rounded-xl bg-primary/10 border border-primary/30">
                  <h3 className="text-lg font-bold text-primary mb-3">Delivery Integration</h3>
                  <p className="text-on-surface-variant">Seamless integration with multiple delivery partners, giving restaurants the flexibility to manage delivery orders from a single unified dashboard.</p>
                </article>
              </div>
            </section>

            {/* FAQ Section */}
            <section className="mb-32">
              <h2 className="text-3xl font-bold text-on-surface mb-12 text-center">Frequently Asked Questions</h2>
              <div className="max-w-3xl mx-auto space-y-6">
                <article className="p-6 rounded-xl bg-surface-container-low border border-outline-variant">
                  <h3 className="text-lg font-bold text-on-surface mb-3">What exactly is HeyRestro?</h3>
                  <p className="text-on-surface-variant">HeyRestro is a comprehensive restaurant discovery and digital management platform that helps food lovers discover amazing local restaurants through interactive maps and detailed digital menus, while enabling restaurant owners to build their online presence, manage digital menus, generate QR codes, and accept orders—all with a zero-commission model.</p>
                </article>

                <article className="p-6 rounded-xl bg-surface-container-low border border-outline-variant">
                  <h3 className="text-lg font-bold text-on-surface mb-3">How does HeyRestro help restaurants increase their visibility?</h3>
                  <p className="text-on-surface-variant">HeyRestro helps restaurants through several channels: restaurants appear on our interactive discovery maps, customers can find them through location-based search, we provide SEO-optimized digital storefronts that rank well in search engines, and restaurants gain visibility through customer reviews and ratings. Additionally, automated QR codes make it easy for customers to access menus instantly.</p>
                </article>

                <article className="p-6 rounded-xl bg-surface-container-low border border-outline-variant">
                  <h3 className="text-lg font-bold text-on-surface mb-3">What are the costs and fees for restaurants on HeyRestro?</h3>
                  <p className="text-on-surface-variant">HeyRestro operates on a transparent, zero-commission model. We don't charge commission on individual orders, allowing restaurants to keep 100% of their revenue. Premium features and advanced analytics may have separate subscription tiers, but basic functionality is available to all restaurants.</p>
                </article>

                <article className="p-6 rounded-xl bg-surface-container-low border border-outline-variant">
                  <h3 className="text-lg font-bold text-on-surface mb-3">Is HeyRestro available in my city?</h3>
                  <p className="text-on-surface-variant">Currently, HeyRestro is available across major cities in India. We're continuously expanding to additional cities and regions. Visit the restaurant registration page or contact our support team to check availability in your specific location and to get your restaurant listed.</p>
                </article>

                <article className="p-6 rounded-xl bg-surface-container-low border border-outline-variant">
                  <h3 className="text-lg font-bold text-on-surface mb-3">How long does it take to set up a restaurant profile on HeyRestro?</h3>
                  <p className="text-on-surface-variant">You can set up a complete restaurant profile in less than 2 minutes. Simply register with basic restaurant information, upload your menu (or create one using our template), add your hours and location, and you're live. Your SEO-optimized digital storefront and QR codes are instantly available.</p>
                </article>

                <article className="p-6 rounded-xl bg-surface-container-low border border-outline-variant">
                  <h3 className="text-lg font-bold text-on-surface mb-3">How do I get started with HeyRestro as a restaurant owner?</h3>
                  <p className="text-on-surface-variant">Getting started is simple: Visit our restaurant registration page, fill in your restaurant details, upload your menu, set your operating hours and location, and verify your information. Within minutes, your restaurant will be live on HeyRestro with a professional digital storefront, menu, and QR codes ready for your tables.</p>
                </article>
              </div>
            </section>

            {/* CTA Section */}
            <section className="rounded-3xl bg-gradient-to-r from-primary to-primary/80 p-12 md:p-16 text-center mb-0">
              <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">Ready to Transform Your Restaurant?</h2>
              <p className="text-white/90 text-lg mb-8 max-w-2xl mx-auto">
                Join hundreds of restaurants already using HeyRestro to connect with customers and grow their business. Set up your restaurant profile in less than 2 minutes—completely free, zero commission.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
                <Link 
                  href="/restaurant/register" 
                  className="px-8 py-4 bg-white text-primary font-bold rounded-lg hover:bg-gray-100 transition-colors duration-300 w-full sm:w-auto text-center"
                  aria-label="Register your restaurant on HeyRestro"
                >
                  Register Your Restaurant
                </Link>
                <Link 
                  href="/contact" 
                  className="px-8 py-4 bg-white/20 text-white font-bold rounded-lg hover:bg-white/30 transition-colors duration-300 border-2 border-white w-full sm:w-auto text-center"
                  aria-label="Contact HeyRestro support team"
                >
                  Contact Us
                </Link>
              </div>
            </section>

          </div>
        </div>

        {/* Footer */}
        <footer className="bg-surface-container-low text-on-surface-variant py-12 border-t border-outline-variant">
          <div className="max-w-7xl mx-auto px-margin-mobile md:px-margin-desktop">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
              <article>
                <h3 className="font-bold text-on-surface mb-4">About HeyRestro</h3>
                <ul className="space-y-2 text-sm">
                  <li><Link href="/about" className="hover:text-primary transition-colors">About Us</Link></li>
                  <li><Link href="/blog" className="hover:text-primary transition-colors">Blog</Link></li>
                  <li><Link href="/careers" className="hover:text-primary transition-colors">Careers</Link></li>
                  <li><Link href="/press" className="hover:text-primary transition-colors">Press</Link></li>
                </ul>
              </article>

              <article>
                <h3 className="font-bold text-on-surface mb-4">For Restaurants</h3>
                <ul className="space-y-2 text-sm">
                  <li><Link href="/restaurant/register" className="hover:text-primary transition-colors">Register Restaurant</Link></li>
                  <li><Link href="/restaurant/features" className="hover:text-primary transition-colors">Features</Link></li>
                  <li><Link href="/restaurant/pricing" className="hover:text-primary transition-colors">Pricing</Link></li>
                  <li><Link href="/restaurant/support" className="hover:text-primary transition-colors">Support</Link></li>
                </ul>
              </article>

              <article>
                <h3 className="font-bold text-on-surface mb-4">For Users</h3>
                <ul className="space-y-2 text-sm">
                  <li><Link href="/" className="hover:text-primary transition-colors">Home</Link></li>
                  <li><Link href="/search" className="hover:text-primary transition-colors">Search Restaurants</Link></li>
                  <li><Link href="/restaurants" className="hover:text-primary transition-colors">Explore Menus</Link></li>
                  <li><Link href="/how-it-works" className="hover:text-primary transition-colors">How It Works</Link></li>
                </ul>
              </article>

              <article>
                <h3 className="font-bold text-on-surface mb-4">Legal & Policies</h3>
                <ul className="space-y-2 text-sm">
                  <li><Link href="/privacy-policy" className="hover:text-primary transition-colors">Privacy Policy</Link></li>
                  <li><Link href="/terms-of-service" className="hover:text-primary transition-colors">Terms of Service</Link></li>
                  <li><Link href="/contact" className="hover:text-primary transition-colors">Contact</Link></li>
                  <li><Link href="/sitemap.xml" className="hover:text-primary transition-colors">Sitemap</Link></li>
                </ul>
              </article>
            </div>

            <div className="border-t border-outline-variant pt-8 mt-8">
              <p className="text-center text-sm">
                &copy; 2024 HeyRestro. All rights reserved. | 
                <Link href="/privacy-policy" className="ml-2 hover:text-primary transition-colors">Privacy</Link> | 
                <Link href="/terms-of-service" className="ml-2 hover:text-primary transition-colors">Terms</Link>
              </p>
              <p className="text-center text-sm mt-4">
                HeyRestro: Connecting Food Lovers with Local Restaurants Through Interactive Discovery Maps and Digital Menus
              </p>
            </div>
          </div>
        </footer>
      </main>
    </>
  );
}
