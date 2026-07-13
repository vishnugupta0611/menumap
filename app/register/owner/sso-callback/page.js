"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";
import { useUser, useClerk } from "@clerk/nextjs";

export default function SSOCallbackPage() {
  const router = useRouter();
  const { registerOwner } = useAuth();
  const { user, isLoaded } = useUser();
  const { signOut } = useClerk();
  
  const [status, setStatus] = useState("Authenticating with Google...");

  useEffect(() => {
    if (!isLoaded) return;
    
    if (!user) {
      // Something went wrong or they cancelled
      router.push("/register/owner");
      return;
    }

    const processRegistration = async () => {
      try {
        setStatus("Saving Restaurant OS...");
        
        // Grab pending data from storage
        const ownerName = sessionStorage.getItem("onboarding_ownerName") || user.fullName || "Owner";
        const restaurantName = sessionStorage.getItem("onboarding_restaurantName") || "My Restaurant";
        const restaurantCity = sessionStorage.getItem("onboarding_restaurantCity") || "kanpur";
        const restaurantCuisines = sessionStorage.getItem("onboarding_restaurantCuisines") || "Multi-Cuisine";
        const lat = sessionStorage.getItem("onboarding_lat") || "26.4499";
        const lng = sessionStorage.getItem("onboarding_lng") || "80.3319";
        
        const primaryEmail = user.primaryEmailAddress?.emailAddress;
        const clerkId = user.id;

        // Register in MongoDB with our Express API
        await registerOwner({
          name: ownerName,
          email: primaryEmail,
          password: "", // Optional for SSO users
          clerkId: clerkId,
          restaurantName,
          city: restaurantCity,
          cuisine: restaurantCuisines,
        });

        // Clear session storage
        sessionStorage.clear();

        // Sign out of Clerk on frontend to respect the "hybrid" architecture 
        // (We use our own custom JWT stored in localStorage now)
        await signOut();

        setStatus("Success! Redirecting to Dashboard...");
        router.push("/admin/dashboard");
      } catch (error) {
        console.error(error);
        setStatus("Failed to create restaurant. " + (error.message || ""));
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
