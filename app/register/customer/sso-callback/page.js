"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";
import { useUser, useClerk } from "@clerk/nextjs";

export default function CustomerSSOCallbackPage() {
  const router = useRouter();
  const { registerCustomer } = useAuth();
  const { user, isLoaded } = useUser();
  const { signOut } = useClerk();
  const processedRef = useRef(false);
  
  const [status, setStatus] = useState("Authenticating with Google...");

  useEffect(() => {
    if (!isLoaded || processedRef.current) return;
    
    if (!user) {
      // Something went wrong or they cancelled
      router.push("/register/customer");
      return;
    }

    const processRegistration = async () => {
      processedRef.current = true;
      try {
        setStatus("Creating your account...");
        
        // Grab pending data from storage or fallback to Google name
        const customerName = sessionStorage.getItem("onboarding_customerName") || localStorage.getItem("onboarding_customerName");
        const primaryEmail = user.primaryEmailAddress?.emailAddress;
        const clerkId = user.id;

        if (!customerName) {
          await signOut();
          setStatus("Please enter your name before continuing with Google.");
          setTimeout(() => router.push("/register/customer"), 2500);
          return;
        }

        if (!primaryEmail) {
          throw new Error("Google did not return a verified email address.");
        }

        // Register in MongoDB with our Express API
        await registerCustomer({
          name: customerName,
          email: primaryEmail,
          clerkId: clerkId,
        });

        // Clear session storage
        sessionStorage.removeItem("onboarding_customerName");
        localStorage.removeItem("onboarding_customerName");
        sessionStorage.removeItem("oauth_flow");
        localStorage.removeItem("oauth_flow");

        setStatus("Success! Redirecting to Discovery...");
        router.replace("/");
      } catch (error) {
        console.error(error);
        await signOut();
        const message = error.message || "Failed to create account.";
        sessionStorage.setItem("auth_error", message);
        setStatus(message);
        setTimeout(() => router.replace("/register/customer"), 2500);
      }
    };

    processRegistration();
  }, [isLoaded, user, registerCustomer, router, signOut]);

  return (
    <div className="bg-background text-on-background min-h-screen flex flex-col items-center justify-center font-body-md">
      <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin mb-6"></div>
      <h2 className="font-headline-md text-headline-md font-bold text-on-surface animate-pulse">
        {status}
      </h2>
      <p className="mt-4 text-on-surface-variant max-w-sm text-center">
        Setting up your MenuMap profile...
      </p>
    </div>
  );
}
