"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";
import { useUser, useClerk } from "@clerk/nextjs";

export default function SSOCallbackPage() {
  const router = useRouter();
  const { registerOwner } = useAuth();
  const { user, isLoaded } = useUser();
  const { signOut } = useClerk();
  const processedRef = useRef(false);
  
  const [status, setStatus] = useState("Authenticating with Google...");

  useEffect(() => {
    if (!isLoaded || processedRef.current) return;
    
    if (!user) {
      // Something went wrong or they cancelled
      router.push("/register/owner");
      return;
    }

    const processRegistration = async () => {
      processedRef.current = true;
      try {
        setStatus("Saving Restaurant OS...");
        
        // Grab pending data from storage
        const getOnboardingValue = (key) => sessionStorage.getItem(key) || localStorage.getItem(key);
        const ownerName = getOnboardingValue("onboarding_ownerName");
        const restaurantName = getOnboardingValue("onboarding_restaurantName");
        const restaurantCity = getOnboardingValue("onboarding_restaurantCity");
        const restaurantCuisines = getOnboardingValue("onboarding_restaurantCuisines");
        const lat = getOnboardingValue("onboarding_lat");
        const lng = getOnboardingValue("onboarding_lng");

        if (!ownerName || !restaurantName || !restaurantCity || !restaurantCuisines || !lat || !lng) {
          await signOut();
          setStatus("Please complete all restaurant setup steps, including location, before using Google.");
          setTimeout(() => router.push("/register/owner"), 2500);
          return;
        }
        
        const primaryEmail = user.primaryEmailAddress?.emailAddress;
        const clerkId = user.id;

        if (!primaryEmail) {
          throw new Error("Google did not return a verified email address.");
        }

        // Register in MongoDB with our Express API
        await registerOwner({
          name: ownerName,
          email: primaryEmail,
          clerkId: clerkId,
          restaurantName,
          city: restaurantCity,
          cuisine: restaurantCuisines,
          lat,
          lng,
        });

        [
          "onboarding_ownerName",
          "onboarding_restaurantName",
          "onboarding_restaurantCity",
          "onboarding_restaurantCuisines",
          "onboarding_lat",
          "onboarding_lng",
        ].forEach((key) => {
          sessionStorage.removeItem(key);
          localStorage.removeItem(key);
        });

        setStatus("Success! Redirecting to Dashboard...");
        router.replace("/admin/dashboard");
      } catch (error) {
        console.error(error);
        await signOut();
        const message = error.message || "Failed to create restaurant.";
        sessionStorage.setItem("auth_error", message);
        setStatus(message);
        setTimeout(() => router.replace("/register/owner"), 2500);
      }
    };

    processRegistration();
  }, [isLoaded, user, registerOwner, router, signOut]);

  return (
    <div className="bg-background text-on-background min-h-screen flex flex-col items-center justify-center font-body-md">
      <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin mb-6"></div>
      <h2 className="font-headline-md text-headline-md font-bold text-on-surface animate-pulse">
        {status}
      </h2>
    </div>
  );
}
