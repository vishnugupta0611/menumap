import { Plus_Jakarta_Sans, Inter } from "next/font/google";
import QueryProvider from "@/components/QueryProvider";
import { ClerkProvider } from "@clerk/nextjs";
import { AuthProvider } from "@/contexts/AuthContext";
import "./globals.css";

const plusJakarta = Plus_Jakarta_Sans({
  subsets: ["latin"],
  weight: ["400", "600", "700", "800"],
  variable: "--font-plus-jakarta",
});

const inter = Inter({
  subsets: ["latin"],
  weight: ["400", "500", "600"],
  variable: "--font-inter",
});

import { Toaster } from "react-hot-toast";

export const metadata = {
  title: "HeyRestro | Restaurant OS and Food Discovery",
  description: "Search food first, discover nearby restaurants, and manage QR menus with HeyRestro.",
};

function OptionalClerkProvider({ children }) {
  const publishableKey = process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY;
  if (!publishableKey) {
    console.warn("Clerk Publishable Key is missing! Running in local mock auth bypass mode.");
    return <>{children}</>;
  }
  return <ClerkProvider publishableKey={publishableKey}>{children}</ClerkProvider>;
}

export default function RootLayout({ children }) {
  return (
    <html lang="en" className="light">
      <head>
        <link
          href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght,FILL@100..700,0..1&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className={`${plusJakarta.variable} ${inter.variable}`} suppressHydrationWarning>
        <OptionalClerkProvider>
          <AuthProvider>
            <QueryProvider>
              {children}
              <Toaster position="top-center" toastOptions={{ duration: 4000, style: { background: '#363636', color: '#fff', fontSize: '14px', borderRadius: '12px' } }} />
            </QueryProvider>
          </AuthProvider>
        </OptionalClerkProvider>
      </body>
    </html>
  );
}

