"use client";

import React, { useState } from 'react';
import SimpleHeader from "@/components/SimpleHeader";

export default function ContactPage() {
  const [formData, setFormData] = useState({ name: '', email: '', subject: '', message: '' });
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    setTimeout(() => {
      setSubmitted(true);
      setFormData({ name: '', email: '', subject: '', message: '' });
    }, 1000);
  };

  return (
    <div className="bg-white text-on-surface min-h-screen font-body-md relative pt-32 pb-24">
      <SimpleHeader />
      
      <div className="max-w-5xl mx-auto px-margin-mobile md:px-margin-desktop">
        
        <div className="text-center max-w-2xl mx-auto mb-20 animate-fadeInUp">
          <h1 className="font-display-lg-mobile md:font-display-lg text-on-surface font-bold mb-4 tracking-tight">Contact Us</h1>
          <p className="text-on-surface-variant text-lg">
            Have a question, feedback, or need support? Our team is here to help you out. Drop us a line below.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-24">
          
          {/* Contact Info (Clean Text Layout) */}
          <div className="lg:col-span-5 space-y-10">
            <div>
              <h3 className="font-bold text-on-surface mb-2 text-xl">Email</h3>
              <p className="text-base text-on-surface-variant mb-2">For general inquiries and support.</p>
              <a href="mailto:support@menumap.com" className="text-primary font-bold text-lg hover:underline">support@menumap.com</a>
            </div>

            <div>
              <h3 className="font-bold text-on-surface mb-2 text-xl">Phone</h3>
              <p className="text-base text-on-surface-variant mb-2">Mon-Fri from 9am to 6pm IST.</p>
              <a href="tel:+919876543210" className="text-primary font-bold text-lg hover:underline">+91 98765 43210</a>
            </div>

            <div>
              <h3 className="font-bold text-on-surface mb-2 text-xl">Office</h3>
              <p className="text-base text-on-surface-variant leading-relaxed">
                123 Tech Park, Civil Lines<br/>
                Prayagraj, UP 211001<br/>
                India
              </p>
            </div>
          </div>

          {/* Contact Form (Clean Flat Input Fields) */}
          <div className="lg:col-span-7">
            {submitted ? (
              <div className="bg-primary/5 p-10 rounded-3xl text-center animate-fadeInUp">
                <div className="w-16 h-16 bg-primary/20 text-primary rounded-full flex items-center justify-center mx-auto mb-6">
                  <span className="material-symbols-outlined text-[32px]">check</span>
                </div>
                <h3 className="font-bold text-2xl text-on-surface mb-3">Message Sent!</h3>
                <p className="text-on-surface-variant mb-8 text-lg">Thank you for reaching out. We will get back to you within 24 hours.</p>
                <button onClick={() => setSubmitted(false)} className="text-primary font-bold hover:underline bg-transparent border-none cursor-pointer">
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
                      className="w-full h-14 px-4 rounded-xl border border-outline-variant bg-transparent text-on-surface outline-none focus:border-primary focus:ring-1 focus:ring-primary/20 transition-all"
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
                      className="w-full h-14 px-4 rounded-xl border border-outline-variant bg-transparent text-on-surface outline-none focus:border-primary focus:ring-1 focus:ring-primary/20 transition-all"
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
                    className="w-full h-14 px-4 rounded-xl border border-outline-variant bg-transparent text-on-surface outline-none focus:border-primary focus:ring-1 focus:ring-primary/20 transition-all"
                    placeholder="How can we help?"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-bold text-on-surface-variant uppercase tracking-wider">Message</label>
                  <textarea 
                    required
                    rows="6"
                    value={formData.message}
                    onChange={e => setFormData({...formData, message: e.target.value})}
                    className="w-full p-4 rounded-xl border border-outline-variant bg-transparent text-on-surface outline-none focus:border-primary focus:ring-1 focus:ring-primary/20 resize-none transition-all"
                    placeholder="Write your message here..."
                  ></textarea>
                </div>

                <button type="submit" className="w-full md:w-auto px-10 py-4 bg-primary text-on-primary font-bold rounded-xl hover:opacity-90 transition-opacity cursor-pointer border-none text-base shadow-sm">
                  Send Message
                </button>
              </form>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
