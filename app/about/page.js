import React from 'react';
import Link from 'next/link';
import MaterialIcon from "@/components/stitch/MaterialIcon";

export const metadata = {
  title: 'About Us - MenuMap',
  description: 'Learn more about MenuMap and our mission to connect food lovers with local restaurants.',
};

export default function AboutPage() {
  return (
    <div className="bg-background text-on-background min-h-screen font-body-md relative pt-24 pb-16 overflow-hidden">
      
      {/* Aesthetic Header Background */}
      <div className="absolute top-0 left-0 w-full h-96 bg-primary/5 rounded-b-[64px] -z-10 overflow-hidden">
        <div className="absolute top-1/2 left-1/4 w-[500px] h-[500px] bg-primary/10 rounded-full blur-3xl -translate-y-1/2 -z-10 animate-pulse"></div>
        <div className="absolute top-1/2 right-1/4 w-[400px] h-[400px] bg-secondary/10 rounded-full blur-3xl -translate-y-1/2 -z-10 animate-pulse delay-1000"></div>
      </div>

      <div className="max-w-7xl mx-auto px-margin-mobile md:px-margin-desktop">
        <Link href="/" className="inline-flex items-center gap-2 text-primary font-bold mb-8 hover:underline">
          <MaterialIcon name="arrow_back" className="text-[20px]" />
          Back to Home
        </Link>
        
        {/* Hero Section */}
        <div className="text-center max-w-4xl mx-auto mb-20 animate-fadeInUp">
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-primary/10 text-primary mb-6 shadow-sm">
            <MaterialIcon name="restaurant_menu" className="text-[40px]" />
          </div>
          <h1 className="font-display-lg-mobile md:font-display-lg text-on-surface font-bold mb-6 leading-tight">
            Connecting food lovers with <span className="text-primary">local flavors.</span>
          </h1>
          <p className="text-on-surface-variant text-lg md:text-xl leading-relaxed">
            MenuMap is a digital platform designed to bridge the gap between independent restaurants and hungry customers. We believe great food deserves to be found easily.
          </p>
        </div>

        {/* Our Story Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-20">
          <div className="glass-card bg-surface p-8 md:p-12 rounded-[32px] border border-outline-variant/30 shadow-lg flex flex-col justify-center">
            <h2 className="font-headline-lg text-primary mb-6">Our Story</h2>
            <p className="text-on-surface-variant leading-relaxed mb-4">
              It started with a simple problem: discovering hidden culinary gems in the neighborhood was too hard, and local restaurants struggled to build beautiful digital menus without paying exorbitant fees.
            </p>
            <p className="text-on-surface-variant leading-relaxed">
              We built MenuMap to empower restaurant owners with stunning, instant digital storefronts, while giving customers an intuitive map-based discovery engine to find their next favorite meal.
            </p>
          </div>
          <div className="h-full min-h-[300px] rounded-[32px] overflow-hidden shadow-lg">
            <img 
              src="https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=800" 
              alt="Restaurant kitchen" 
              className="w-full h-full object-cover hover:scale-105 transition-transform duration-700"
            />
          </div>
        </div>

        {/* Core Values */}
        <div className="text-center mb-12">
          <h2 className="font-headline-lg text-on-surface mb-4">Our Core Values</h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-20">
          {[
            { icon: "rocket_launch", title: "Speed & Simplicity", desc: "No complex onboarding. Restaurants can launch their digital menu in under 2 minutes." },
            { icon: "favorite", title: "Community First", desc: "We prioritize local, independent eateries and help them thrive in a digital-first world." },
            { icon: "shield", title: "Transparency", desc: "Zero hidden fees, transparent pricing, and direct connections between diners and chefs." }
          ].map((val, i) => (
            <div key={i} className="glass-card bg-surface p-8 rounded-3xl border border-outline-variant/30 shadow-sm hover:shadow-md transition-shadow text-center">
              <div className="w-14 h-14 mx-auto rounded-full bg-primary/10 text-primary flex items-center justify-center mb-6">
                <MaterialIcon name={val.icon} className="text-[28px]" />
              </div>
              <h3 className="font-headline-sm text-on-surface mb-3">{val.title}</h3>
              <p className="text-on-surface-variant text-sm leading-relaxed">{val.desc}</p>
            </div>
          ))}
        </div>

        {/* Call to action */}
        <div className="glass-card bg-primary text-on-primary p-12 rounded-[32px] text-center shadow-xl">
          <h2 className="font-headline-lg font-bold mb-4">Ready to join the map?</h2>
          <p className="opacity-90 mb-8 max-w-2xl mx-auto">
            Whether you're looking for your next meal or looking to showcase your culinary creations, there's a place for you here.
          </p>
          <div className="flex flex-col sm:flex-row justify-center gap-4">
            <Link href="/register/owner" className="bg-white text-primary font-bold py-3 px-8 rounded-full hover:bg-surface transition-colors shadow-md">
              Add Your Restaurant
            </Link>
            <Link href="/search" className="bg-primary-dark border border-white/30 text-white font-bold py-3 px-8 rounded-full hover:bg-white/10 transition-colors">
              Explore Menus
            </Link>
          </div>
        </div>

      </div>
    </div>
  );
}
