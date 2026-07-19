"use client";

import { useEffect, useState } from "react";

export default function DummyPromoPopup({ show, onClose }) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    if (show) {
      const raf = requestAnimationFrame(() => setMounted(true));
      return () => cancelAnimationFrame(raf);
    } else {
      setMounted(false);
    }
  }, [show]);

  if (!show) return null;

  return (
    <div className="fixed inset-0 z-[100]">
      {/* Backdrop */}
      <div
        onClick={onClose}
        className={`absolute inset-0 bg-black/50 backdrop-blur-sm transition-opacity duration-500 ${
          mounted ? "opacity-100" : "opacity-0"
        }`}
      />

      {/* Bottom Sheet */}
      <div
        className={`absolute bottom-0 left-0 right-0 h-[80vh] sm:h-[74vh] max-w-md sm:mx-auto rounded-t-[24px] sm:rounded-t-[32px] bg-surface border-t border-surface-container shadow-[0_-20px_60px_rgba(0,0,0,0.18)] transition-transform duration-500 ease-out overflow-hidden ${
          mounted ? "translate-y-0" : "translate-y-full"
        } flex flex-col`}
      >
        {/* Handle */}
        <div className="w-10 sm:w-12 h-1.5 rounded-full bg-surface-container-highest mx-auto mt-3 shrink-0" />

        {/* Close */}
        <button
          onClick={onClose}
          aria-label="Close"
          className="absolute right-3 sm:right-4 top-3 sm:top-4 flex h-9 w-9 sm:h-10 sm:w-10 items-center justify-center rounded-full bg-surface-container hover:bg-surface-container-highest shrink-0 z-10"
        >
          <span className="material-symbols-outlined text-[18px] sm:text-[20px]">close</span>
        </button>

        <div className="flex-1 overflow-y-auto px-4 sm:px-6 py-5 sm:py-6 min-w-0">
          {/* Hero */}
          <div className="text-center px-2">
            <div className="relative mx-auto mb-4 sm:mb-5 flex h-16 w-16 sm:h-20 sm:w-20 items-center justify-center rounded-2xl sm:rounded-3xl bg-primary/10">
              <span className="text-4xl sm:text-5xl">🍽️</span>

              <span className="absolute -top-2 -right-3 sm:-right-6 rounded-full bg-green-500 px-2 sm:px-3 py-0.5 sm:py-1 text-[8px] sm:text-[10px] font-black uppercase tracking-wider text-white shadow-lg whitespace-nowrap">
                FREE
              </span>
            </div>

            <h2 className="text-lg sm:text-2xl font-black text-on-surface leading-tight">
              This is a Demo Restaurant
            </h2>

            <p className="mt-2.5 sm:mt-3 text-[13px] sm:text-[15px] leading-6 sm:leading-7 text-on-surface-variant">
              <span className="font-semibold text-on-surface">
Aap jo page abhi dekh rahe hain, woh sirf ek demo restaurant hai.              </span>
              <br />
              <br />
              Hum aapke restaurant ke liye ek professional Digital Menu aur QR Code bilkul FREE bana rahe hain. Bas apne restaurant ki basic details daliyega, aur HeyRestro sirf 5 minute mein aapka digital menu website tayyar kar dega.
            </p>
          </div>

          {/* Features */}
          <div className="mt-6 sm:mt-8 space-y-2.5 sm:space-y-3">
            <div className="flex items-center gap-3 sm:gap-4 rounded-xl sm:rounded-2xl bg-surface-container p-3 sm:p-4">
              <span className="text-xl sm:text-2xl shrink-0">📱</span>

              <div className="min-w-0">
                <h3 className="font-semibold text-on-surface text-[13px] sm:text-base">
                  Digital QR Menu
                </h3>

                <p className="text-[12px] sm:text-sm text-on-surface-variant">
                  Customers scan & instantly view your menu.
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3 sm:gap-4 rounded-xl sm:rounded-2xl bg-surface-container p-3 sm:p-4">
              <span className="text-xl sm:text-2xl shrink-0">✏️</span>

              <div className="min-w-0">
                <h3 className="font-semibold text-on-surface text-[13px] sm:text-base">
                  Easy Updates
                </h3>

                <p className="text-[12px] sm:text-sm text-on-surface-variant">
                  Update prices or menu items anytime.
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3 sm:gap-4 rounded-xl sm:rounded-2xl bg-surface-container p-3 sm:p-4">
              <span className="text-xl sm:text-2xl shrink-0">🎨</span>

              <div className="min-w-0">
                <h3 className="font-semibold text-on-surface text-[13px] sm:text-base">
                  Beautiful Restaurant Page
                </h3>

                <p className="text-[12px] sm:text-sm text-on-surface-variant">
                  Modern design with multiple themes.
                </p>
              </div>
            </div>
          </div>

          {/* CTA */}
          <div className="mt-6 sm:mt-8 rounded-2xl sm:rounded-3xl bg-primary p-4 sm:p-6 text-center text-on-primary">
            <h3 className="text-lg sm:text-2xl font-black">
              Start Completely FREE 🚀
            </h3>

            <p className="mt-1.5 sm:mt-2 text-[12px] sm:text-sm leading-5 sm:leading-6 opacity-90">
              Need any help creating your account?
              <br />
              Feel free to contact us on WhatsApp.
            </p>

            <a
              href="https://wa.me/919984204758"
              target="_blank"
              rel="noopener noreferrer"
              className="mt-4 sm:mt-5 flex h-11 sm:h-12 w-full items-center justify-center gap-1.5 rounded-full bg-white font-bold text-primary shadow-sm transition hover:scale-[1.02] px-2"
            >
              <span className="shrink-0">📞</span>
              <span className="text-[12px] sm:text-base whitespace-nowrap tracking-tight">
                +91 99842 04758
              </span>
            </a>

            <a
              href="https://www.heyrestro.com/register/owner"
              className="mt-3 sm:mt-4 flex h-11 sm:h-12 w-full items-center justify-center gap-1.5 rounded-full border border-white/20 bg-white/15 font-bold text-white transition hover:bg-white/20 px-2"
            >
              <span className="shrink-0">🍽️</span>
              <span className="text-[12px] sm:text-base whitespace-nowrap">
                Create Your Restro
              </span>
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}