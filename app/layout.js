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
  metadataBase: new URL("https://heyrestro.com"),

  title: {
    default: "HeyRestro",
    template: "%s | HeyRestro",
  },

  description:
    "Discover nearby restaurants, explore menus, and create beautiful QR code digital menus with HeyRestro.",

  keywords: [
    "HeyRestro",
    "Restaurant",
    "Restaurant Menu",
    "Digital Menu",
    "QR Menu",
    "Food Discovery",
    "Restaurant Website",
    "Restaurant QR Code",
    "Online Menu",
    "Restaurant Management",
  ],

  authors: [{ name: "HeyRestro" }],

  creator: "HeyRestro",

  publisher: "HeyRestro",

  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-image-preview": "large",
      "max-video-preview": -1,
      "max-snippet": -1,
    },
  },

  alternates: {
    canonical: "/",
  },

  icons: {
    icon: [
      { url: "/favicon.ico" },
      { url: "/favicon-32x32.png", sizes: "32x32", type: "image/png" },
      { url: "/favicon-16x16.png", sizes: "16x16", type: "image/png" },
    ],
    apple: "/apple-icon-180x180.png",
  },

  manifest: "/manifest.json",

  openGraph: {
    type: "website",
    locale: "en_IN",
    url: "https://heyrestro.com",
    title: "HeyRestro",
    description:
      "Discover nearby restaurants, explore menus, and create beautiful QR code digital menus with HeyRestro.",
    siteName: "HeyRestro",
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "HeyRestro",
      },
    ],
  },

  twitter: {
    card: "summary_large_image",
    title: "HeyRestro",
    description:
      "Discover nearby restaurants, explore menus, and create beautiful QR code digital menus with HeyRestro.",
    images: ["/og-image.png"],
  },

  themeColor: "#ffffff",
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
        <link rel="apple-touch-icon" sizes="57x57" href="/apple-icon-57x57.png" />
        <link rel="apple-touch-icon" sizes="60x60" href="/apple-icon-60x60.png" />
        <link rel="apple-touch-icon" sizes="72x72" href="/apple-icon-72x72.png" />
        <link rel="apple-touch-icon" sizes="76x76" href="/apple-icon-76x76.png" />
        <link rel="apple-touch-icon" sizes="114x114" href="/apple-icon-114x114.png" />
        <link rel="apple-touch-icon" sizes="120x120" href="/apple-icon-120x120.png" />
        <link rel="apple-touch-icon" sizes="144x144" href="/apple-icon-144x144.png" />
        <link rel="apple-touch-icon" sizes="152x152" href="/apple-icon-152x152.png" />
        <link rel="apple-touch-icon" sizes="180x180" href="/apple-icon-180x180.png" />
        <link rel="icon" type="image/png" sizes="192x192" href="/android-icon-192x192.png" />
        <link rel="icon" type="image/png" sizes="32x32" href="/favicon-32x32.png" />
        <link rel="icon" type="image/png" sizes="96x96" href="/favicon-96x96.png" />
        <link rel="icon" type="image/png" sizes="16x16" href="/favicon-16x16.png" />
        <link rel="manifest" href="/manifest.json" />
        <meta name="msapplication-TileColor" content="#ffffff" />
        <meta name="msapplication-TileImage" content="/ms-icon-144x144.png" />
        <meta name="theme-color" content="#ffffff" />
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

