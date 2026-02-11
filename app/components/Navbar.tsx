"use client";

import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";

export default function Navbar() {
  const router = useRouter();

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

        </div>
      </div>
    </nav>
  );
}
