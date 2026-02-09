"use client";

import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

export default function Navbar() {
  const router = useRouter();
  const [isLive, setIsLive] = useState(false);

  useEffect(() => {
    const checkLiveStatus = async () => {
      try {
        const res = await fetch("/api/get-legal-news");
        const data = await res.json();

        if (data.success && data.lastUpdated) {
          const lastUpdated = new Date(data.lastUpdated).getTime();
          const now = Date.now();

          // 3.5 hour buffer (cron runs every 3h)
          const isFresh = now - lastUpdated < 3.5 * 60 * 60 * 1000;

          setIsLive(isFresh);
        }
      } catch (err) {
        console.error("Live status check failed");
      }
    };

    checkLiveStatus();
  }, []);

  return (
    <nav className="w-full sticky top-0 z-50 bg-white border-b border-gray-200">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-4 flex justify-between items-center">

        {/* Logo */}
        <Image
          src="/logo.png"
          alt="Legal Digest"
          width={160}
          height={40}
          className="cursor-pointer"
          onClick={() => {
            router.push("/");
            router.refresh();
          }}
        />

        {/* Navigation */}
        <div className="flex items-center gap-6 sm:gap-10 text-sm sm:text-base font-medium">

          <Link
            href="/national"
            className="relative text-gray-600 hover:text-black transition group"
          >
            National
            <span className="absolute left-0 -bottom-1 h-[2px] w-0 bg-black transition-all duration-300 group-hover:w-full"></span>
          </Link>

          <Link
            href="/international"
            className="relative text-gray-600 hover:text-black transition group"
          >
            International
            <span className="absolute left-0 -bottom-1 h-[2px] w-0 bg-black transition-all duration-300 group-hover:w-full"></span>
          </Link>

          {/* LIVE Indicator */}
          {isLive && (
            <div className="flex items-center gap-2 text-sm">
              <span className="relative flex h-3 w-3">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-3 w-3 bg-green-500"></span>
              </span>
              <span className="text-[#2f4a63] font-medium">
                Live
              </span>
            </div>
          )}

        </div>
      </div>
    </nav>
  );
}
