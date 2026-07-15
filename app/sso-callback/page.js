"use client";

import { useEffect, useState } from "react";
import { AuthenticateWithRedirectCallback } from "@clerk/nextjs";

export default function SSOCallback() {
  const [redirectUrlComplete, setRedirectUrlComplete] = useState(null);

  useEffect(() => {
    const flow = sessionStorage.getItem("oauth_flow") || localStorage.getItem("oauth_flow");
    const completeUrlByFlow = {
      "owner-register": "/register/owner/sso-callback",
      "customer-register": "/register/customer/sso-callback",
      login: "/login/sso-callback",
    };

    setRedirectUrlComplete(completeUrlByFlow[flow] || "/login/sso-callback");
  }, []);

  return (
    <div className="bg-background text-on-background min-h-screen flex flex-col items-center justify-center font-body-md">
      <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin mb-6"></div>
      <h2 className="font-headline-md text-headline-md font-bold text-on-surface animate-pulse">
        Authenticating securely...
      </h2>
      {redirectUrlComplete && (
        <AuthenticateWithRedirectCallback redirectUrlComplete={redirectUrlComplete} />
      )}
    </div>
  );
}
