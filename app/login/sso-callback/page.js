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

  useEffect(() => {
    if (!isLoaded) return;
    
    if (!user) {
      console.log("No user found in Clerk context after SSO.");
      setStatus("No account found. Please register first.");
      setTimeout(() => router.push("/login"), 3000);
      return;
    }

    const processLogin = async () => {
      try {
        setStatus("Accessing Dashboard...");
        
        const primaryEmail = user.primaryEmailAddress?.emailAddress;
        const clerkId = user.id;

        // Try to login as owner first, if it fails, try customer. 
        // In a real app we might know their role beforehand, but we can default to owner and let backend figure it out, 
        // or just let backend check what role they actually are.
        // Our backend /login-verified will return the role.
        const data = await loginWithVerifiedEmail({
          email: primaryEmail,
          clerkId: clerkId,
          role: "owner" // We pass owner as a default expectation, if they are customer, backend just logs them in and returns role: customer
        });

        // Sign out of Clerk on frontend to strictly use our custom JWT
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
        setStatus("Failed to login. " + (error.message || ""));
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
