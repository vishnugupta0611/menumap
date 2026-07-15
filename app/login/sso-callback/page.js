"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";
import { useUser, useClerk } from "@clerk/nextjs";

export default function LoginSSOCallbackPage() {
  const router = useRouter();
  const { loginWithVerifiedEmail } = useAuth();
  const { user, isLoaded } = useUser();
  const { signOut } = useClerk();
  
  const [status, setStatus] = useState("Verifying login...");
  const [processed, setProcessed] = useState(false);

  useEffect(() => {
    if (!isLoaded || processed) return;
    
    if (!user) {
      console.log("No user found in Clerk context after SSO.");
      setStatus("No account found. Please register first.");
      setProcessed(true);
      setTimeout(() => router.push("/login"), 3000);
      return;
    }

    const processLogin = async () => {
      setProcessed(true);
      try {
        setStatus("Accessing Dashboard...");
        
        const primaryEmail = user.primaryEmailAddress?.emailAddress;
        const clerkId = user.id;
        const role = sessionStorage.getItem("login_role") || "customer";

        if (!primaryEmail) {
          throw new Error("Google did not return a verified email address.");
        }

        // Login using Express API (sets the cookie)
        const data = await loginWithVerifiedEmail({
          email: primaryEmail,
          name: user.fullName || "Foodie",
          clerkId: clerkId,
          role: role
        });

        // Sign out of Clerk on frontend to respect our custom JWT
        await signOut();

        setStatus("Success! Redirecting...");
        if (data.user.role === "owner") {
          router.push("/admin/dashboard");
        } else {
          router.push("/");
        }
      } catch (error) {
        console.error(error);
        await signOut();
        sessionStorage.setItem("auth_error", error.message || "Please create your account first.");
        setStatus(error.message || "Please create your account first.");
        setTimeout(() => router.push("/login"), 2500);
      }
    };

    processLogin();
  }, [isLoaded, user, loginWithVerifiedEmail, router, signOut]);

  return (
    <div className="bg-background text-on-background min-h-screen flex flex-col items-center justify-center font-body-md">
      <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin mb-6"></div>
      <h2 className="font-headline-md text-headline-md font-bold text-on-surface animate-pulse">
        {status}
      </h2>
      <p className="mt-4 text-on-surface-variant max-w-sm text-center">
        If you are stuck here, please ensure you have registered your account first.
      </p>
      <button onClick={() => router.push("/login")} className="mt-8 text-primary font-bold hover:underline">
        Back to Login
      </button>
    </div>
  );
}
