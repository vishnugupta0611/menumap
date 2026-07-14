import React from 'react';
import SimpleHeader from "@/components/SimpleHeader";

export const metadata = {
  title: 'About Us - MenuMap',
  description: 'Learn more about MenuMap and our mission to connect food lovers with local restaurants.',
};

export default function AboutPage() {
  return (
    <div className="bg-white text-on-surface min-h-screen font-body-md relative pt-32 pb-16 overflow-x-hidden">
      <SimpleHeader />
      
      <div className="max-w-7xl mx-auto px-margin-mobile md:px-margin-desktop">
        
        {/* Hero Section */}
        <div className="text-center max-w-4xl mx-auto mb-24 animate-fadeInUp">
          <h1 className="text-4xl md:text-6xl text-on-surface font-bold mb-6 leading-tight tracking-tight">
            Connecting food lovers with <span className="text-primary">local flavors.</span>
          </h1>
          <p className="text-on-surface-variant text-lg md:text-xl leading-relaxed max-w-2xl mx-auto">
            MenuMap is a digital platform designed to bridge the gap between independent restaurants and hungry customers. We believe great food deserves to be found easily.
          </p>
        </div>

        {/* Our Mission Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12 md:gap-20 items-center mb-32">
          <div>
            <h2 className="text-3xl font-bold text-on-surface mb-6">Our Mission</h2>
            <p className="text-on-surface-variant leading-relaxed text-lg mb-6">
              It started with a simple problem: discovering hidden culinary gems in the neighborhood was too hard, and local restaurants struggled to build beautiful digital menus without paying exorbitant fees to big delivery platforms.
            </p>
            <p className="text-on-surface-variant leading-relaxed text-lg">
              We built MenuMap to empower restaurant owners with stunning, instant digital storefronts, while giving customers an intuitive map-based discovery engine to find their next favorite meal effortlessly.
            </p>
          </div>
          <div className="h-[400px] rounded-3xl overflow-hidden shadow-2xl">
            <img 
              src="https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=800" 
              alt="Restaurant kitchen" 
              className="w-full h-full object-cover"
            />
          </div>
        </div>

        {/* What We Provide */}
        <div className="text-center mb-16">
          <h2 className="text-3xl font-bold text-on-surface mb-4">What We Provide</h2>
          <p className="text-on-surface-variant text-lg max-w-2xl mx-auto">
            MenuMap is a dual-sided ecosystem designed to bring immense value to both the people who make the food and the people who eat it.
          </p>
        </div>

        {/* For Diners */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12 md:gap-20 items-center mb-24">
          <div className="order-2 md:order-1 h-[400px] rounded-3xl overflow-hidden shadow-xl bg-surface-container-low">
            <img 
              src="https://images.unsplash.com/photo-1526367790999-0150786686a2?w=800" 
              alt="People dining" 
              className="w-full h-full object-cover"
            />
          </div>
          <div className="order-1 md:order-2">
            <h3 className="text-2xl font-bold text-primary mb-6 uppercase tracking-wider text-sm">For Diners</h3>
            <div className="space-y-8">
              <div>
                <h4 className="text-xl font-bold text-on-surface mb-2">Map-Based Discovery</h4>
                <p className="text-on-surface-variant">Instantly see all highly-rated restaurants plotted on a beautiful interactive map around your exact GPS location.</p>
              </div>
              <div>
                <h4 className="text-xl font-bold text-on-surface mb-2">Rich Digital Menus</h4>
                <p className="text-on-surface-variant">No more blurry PDF menus. View crystal-clear food photography, exact pricing, and dietary tags before you decide where to eat.</p>
              </div>
              <div>
                <h4 className="text-xl font-bold text-on-surface mb-2">Seamless Ordering</h4>
                <p className="text-on-surface-variant">Add items to your cart and place orders directly through the platform with just a few taps.</p>
              </div>
            </div>
          </div>
        </div>

        {/* For Restaurants */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12 md:gap-20 items-center mb-32">
          <div>
            <h3 className="text-2xl font-bold text-primary mb-6 uppercase tracking-wider text-sm">For Restaurants</h3>
            <div className="space-y-8">
              <div>
                <h4 className="text-xl font-bold text-on-surface mb-2">Instant Digital Storefronts</h4>
                <p className="text-on-surface-variant">Create a beautiful, SEO-optimized landing page for your restaurant in less than 2 minutes. No coding required.</p>
              </div>
              <div>
                <h4 className="text-xl font-bold text-on-surface mb-2">Automated QR Menus</h4>
                <p className="text-on-surface-variant">MenuMap automatically generates print-ready QR codes for your tables. When diners scan them, they see your live digital menu.</p>
              </div>
              <div>
                <h4 className="text-xl font-bold text-on-surface mb-2">Zero-Commission Structure</h4>
                <p className="text-on-surface-variant">Stop paying 30% cuts. MenuMap provides the software infrastructure so you keep 100% of your profits.</p>
              </div>
            </div>
          </div>
          <div className="h-[400px] rounded-3xl overflow-hidden shadow-xl bg-surface-container-low">
            <img 
              src="https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?w=800" 
              alt="Restaurant owner" 
              className="w-full h-full object-cover"
            />
          </div>
        </div>

      </div>
    </div>
  );
}
