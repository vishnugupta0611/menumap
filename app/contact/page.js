"use client";

import React, { useState } from 'react';
import Link from 'next/link';
import MaterialIcon from "@/components/stitch/MaterialIcon";

export default function ContactPage() {
  const [formData, setFormData] = useState({ name: '', email: '', subject: '', message: '' });
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    // Mock backend integration
    setTimeout(() => {
      setSubmitted(true);
      setFormData({ name: '', email: '', subject: '', message: '' });
    }, 1000);
  };

  return (
    <div className="bg-background text-on-background min-h-screen font-body-md relative pt-24 pb-16 overflow-x-hidden">
      
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
          <h1 className="font-display-lg-mobile md:font-display-lg text-primary font-bold mb-4">Contact Us</h1>
          <p className="text-on-surface-variant text-lg">
            Have a question, feedback, or need support? Our team is here to help you out.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 md:gap-12">
          
          {/* Contact Info Cards */}
          <div className="lg:col-span-4 space-y-6">
            <div className="glass-card bg-surface p-6 rounded-3xl border border-outline-variant/30 shadow-sm flex items-start gap-4 hover:shadow-md transition-shadow">
              <div className="w-12 h-12 rounded-full bg-primary/10 text-primary flex items-center justify-center shrink-0">
                <MaterialIcon name="mail" className="text-[24px]" />
              </div>
              <div>
                <h3 className="font-bold text-on-surface mb-1">Email</h3>
                <p className="text-sm text-on-surface-variant mb-2">For general inquiries</p>
                <a href="mailto:support@menumap.com" className="text-primary font-bold hover:underline">support@menumap.com</a>
              </div>
            </div>

            <div className="glass-card bg-surface p-6 rounded-3xl border border-outline-variant/30 shadow-sm flex items-start gap-4 hover:shadow-md transition-shadow">
              <div className="w-12 h-12 rounded-full bg-primary/10 text-primary flex items-center justify-center shrink-0">
                <MaterialIcon name="call" className="text-[24px]" />
              </div>
              <div>
                <h3 className="font-bold text-on-surface mb-1">Phone</h3>
                <p className="text-sm text-on-surface-variant mb-2">Mon-Fri from 9am to 6pm</p>
                <a href="tel:+919876543210" className="text-primary font-bold hover:underline">+91 98765 43210</a>
              </div>
            </div>

            <div className="glass-card bg-surface p-6 rounded-3xl border border-outline-variant/30 shadow-sm flex items-start gap-4 hover:shadow-md transition-shadow">
              <div className="w-12 h-12 rounded-full bg-primary/10 text-primary flex items-center justify-center shrink-0">
                <MaterialIcon name="location_on" className="text-[24px]" />
              </div>
              <div>
                <h3 className="font-bold text-on-surface mb-1">Office</h3>
                <p className="text-sm text-on-surface-variant leading-relaxed">
                  123 Tech Park, Civil Lines<br/>
                  Prayagraj, UP 211001<br/>
                  India
                </p>
              </div>
            </div>
          </div>

          {/* Contact Form */}
          <div className="lg:col-span-8">
            <div className="glass-card bg-surface p-8 md:p-10 rounded-[32px] border border-outline-variant/30 shadow-lg">
              <h2 className="font-headline-md text-on-surface mb-6">Send us a message</h2>
              
              {submitted ? (
                <div className="bg-primary/10 border border-primary/30 p-8 rounded-2xl text-center animate-fadeInUp">
                  <div className="w-16 h-16 bg-primary text-on-primary rounded-full flex items-center justify-center mx-auto mb-4 shadow-md">
                    <MaterialIcon name="check" className="text-[32px]" />
                  </div>
                  <h3 className="font-bold text-xl text-on-surface mb-2">Message Sent!</h3>
                  <p className="text-on-surface-variant">Thank you for reaching out. We will get back to you within 24 hours.</p>
                  <button onClick={() => setSubmitted(false)} className="mt-6 text-primary font-bold hover:underline bg-transparent border-none cursor-pointer">
                    Send another message
                  </button>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <label className="text-xs font-bold text-on-surface-variant uppercase tracking-wider">Your Name</label>
                      <input 
                        required
                        type="text" 
                        value={formData.name}
                        onChange={e => setFormData({...formData, name: e.target.value})}
                        className="w-full h-12 px-4 rounded-xl border border-outline-variant bg-surface-container-lowest text-on-surface outline-none focus:border-primary focus:ring-1 focus:ring-primary/20"
                        placeholder="John Doe"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-xs font-bold text-on-surface-variant uppercase tracking-wider">Email Address</label>
                      <input 
                        required
                        type="email" 
                        value={formData.email}
                        onChange={e => setFormData({...formData, email: e.target.value})}
                        className="w-full h-12 px-4 rounded-xl border border-outline-variant bg-surface-container-lowest text-on-surface outline-none focus:border-primary focus:ring-1 focus:ring-primary/20"
                        placeholder="john@example.com"
                      />
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-on-surface-variant uppercase tracking-wider">Subject</label>
                    <input 
                      required
                      type="text" 
                      value={formData.subject}
                      onChange={e => setFormData({...formData, subject: e.target.value})}
                      className="w-full h-12 px-4 rounded-xl border border-outline-variant bg-surface-container-lowest text-on-surface outline-none focus:border-primary focus:ring-1 focus:ring-primary/20"
                      placeholder="How can we help?"
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="text-xs font-bold text-on-surface-variant uppercase tracking-wider">Message</label>
                    <textarea 
                      required
                      rows="5"
                      value={formData.message}
                      onChange={e => setFormData({...formData, message: e.target.value})}
                      className="w-full p-4 rounded-xl border border-outline-variant bg-surface-container-lowest text-on-surface outline-none focus:border-primary focus:ring-1 focus:ring-primary/20 resize-none"
                      placeholder="Write your message here..."
                    ></textarea>
                  </div>

                  <button type="submit" className="w-full md:w-auto px-8 py-3 bg-primary text-on-primary font-bold rounded-xl shadow-md hover:bg-primary/90 transition-colors cursor-pointer border-none flex items-center justify-center gap-2">
                    <MaterialIcon name="send" className="text-[18px]" />
                    Send Message
                  </button>
                </form>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
