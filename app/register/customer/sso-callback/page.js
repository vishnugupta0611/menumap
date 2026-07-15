"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";
import { useUser, useClerk } from "@clerk/nextjs";

export default function CustomerSSOCallbackPage() {
  const router = useRouter();
  const { registerCustomer } = useAuth();
  const { user, isLoaded } = useUser();
  const { signOut } = useClerk();
  
  const [status, setStatus] = useState("Authenticating with Google...");

  useEffect(() => {
    if (!isLoaded) return;
    
    if (!user) {
      // Something went wrong or they cancelled
      router.push("/register/customer");
      return;
    }

    const processRegistration = async () => {
      try {
        setStatus("Creating your account...");
        
        // Grab pending data from storage or fallback to Google name
        const customerName = sessionStorage.getItem("onboarding_customerName") || user.fullName || "Foodie";
        const primaryEmail = user.primaryEmailAddress?.emailAddress;
        const clerkId = user.id;

        // Register in MongoDB with our Express API
        await registerCustomer({
          name: customerName,
          email: primaryEmail,
          clerkId: clerkId,
        });

        // Clear session storage
        sessionStorage.removeItem("onboarding_customerName");

        // Sign out of Clerk on frontend to respect the "hybrid" architecture 
        // (We use our own custom JWT stored in localStorage now)
        await signOut();

        setStatus("Success! Redirecting to Discovery...");
        router.push("/");
      } catch (error) {
        console.error(error);
        setStatus("Failed to create account. " + (error.message || ""));
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
