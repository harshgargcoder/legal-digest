"use client";

import { usePathname } from "next/navigation";
import type { ReactNode } from "react";

import Navbar from "@/app/components/Navbar";
import Footer from "@/app/components/Footer";
import SupportBot from "@/app/components/SupportBot";

export default function AppShell({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const isMootCourt = pathname?.startsWith("/toolkit/moot-court");

  if (isMootCourt) {
    return <>{children}</>;
  }

  return (
    <>
      <Navbar />
      <main className="min-h-screen">{children}</main>
      <Footer />
      <SupportBot />
    </>
  );
}
