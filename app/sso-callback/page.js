"use client";

import { AuthenticateWithRedirectCallback } from "@clerk/nextjs";

export default function SSOCallback() {
  return (
    <div className="bg-background text-on-background min-h-screen flex flex-col items-center justify-center font-body-md">
      <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin mb-6"></div>
      <h2 className="font-headline-md text-headline-md font-bold text-on-surface animate-pulse">
        Authenticating securely...
      </h2>
      <AuthenticateWithRedirectCallback />
    </div>
  );
}
