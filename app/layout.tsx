import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import Navbar from "@/app/components/Navbar";
import Footer from "@/app/components/Footer";
import Script from "next/script";
import { Search } from "lucide-react";
import { SearchProvider } from "./context/SearchContext";

const GA_ID = "G-Z6NGF984TS";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Legal-Digest",
  description:
    "Your daily dose of legal news, insights, and analysis. Stay informed with our curated feed of the latest developments in law, politics, finance, sports, and global affairs. Legal-Digest: Where law meets the world.",
  icons: {
    icon: "/new_logo.png",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <SearchProvider>
          <Navbar />

          <main className="min-h-screen">
            {children}
          </main>

          <Footer />

          {/* Google Analytics */}
          <Script
            src={`https://www.googletagmanager.com/gtag/js?id=${GA_ID}`}
            strategy="afterInteractive"
          />
          <Script id="google-analytics" strategy="afterInteractive">
            {`
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            gtag('js', new Date());
            gtag('config', '${GA_ID}');
          `}
          </Script>
        </SearchProvider>
      </body>
    </html>
  );
}
