"use client";

import Link from "next/link";

export default function Navbar() {
  return (
    <nav className="w-full sticky top-0 z-50 bg-white border-b border-gray-200">
      <div className="max-w-6xl mx-auto px-6 py-5 flex justify-between items-center">

        {/* Brand */}
        <Link
          href="/"
          className="flex items-center gap-2"
        >
          <img src="/logo.png" alt="Legal Digest" className="h-12 w-30" />
        </Link>

        {/* Navigation */}
        <div className="flex items-center gap-12 text-sm font-medium">

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

        </div>
      </div>
    </nav>
  );
}
