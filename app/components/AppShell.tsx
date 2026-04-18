"use client";

import { usePathname } from "next/navigation";
import type { ReactNode } from "react";

import Navbar from "@/app/components/Navbar";
import Footer from "@/app/components/Footer";
import SupportBot from "@/app/components/SupportBot";

import { useEffect } from "react";
import { logActivity } from "@/lib/logger";

export default function AppShell({ children }: { children: ReactNode }) {
  const pathname = usePathname();

  useEffect(() => {
    if (!pathname) return;

    // Log Page View
    logActivity("VIEW_PAGE", `Navigated to ${pathname}`);

    // Important Click Tracker
    const handleGlobalClick = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      // Capture clicks on buttons, links, inputs, and interactive elements
      const closestLink = target.closest("button, a, input, [role='button'], .clickable");
      
      if (closestLink) {
        const el = closestLink as HTMLElement;
        const input = closestLink as HTMLInputElement;
        const text = el.innerText?.trim().slice(0, 50) || input.placeholder || el.title || el.id || "Interactive Element";
        
        // Log immediately
        logActivity("CLICK", `User clicked [${el.tagName}] "${text}" on ${pathname}`);
      }
    };

    // Tab Switch Tracker
    const handleVisibilityChange = () => {
      const state = document.visibilityState === "visible" ? "Focused" : "Blurred";
      logActivity("TAB_SWITCH", `User ${state} tab at ${pathname}`);
    };

    window.addEventListener("click", handleGlobalClick);
    document.addEventListener("visibilitychange", handleVisibilityChange);

    return () => {
      window.removeEventListener("click", handleGlobalClick);
      document.removeEventListener("visibilitychange", handleVisibilityChange);
    };
  }, [pathname]);

  const isMootCourt = pathname?.startsWith("/toolkit/moot-court");
  const isAdmin = pathname?.startsWith("/admin");

  if (isMootCourt || isAdmin) {
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
