"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import AuthModal from "./auth/AuthModal";
import { supabase } from "@/lib/supabase";
import { useSearch } from "@/app/context/SearchContext";

export default function Navbar() {
  const router = useRouter();
  const { search, setSearch } = useSearch();

  const [authOpen, setAuthOpen] = useState(false);
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      setUser(data.user);
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_, session) => {
      setUser(session?.user ?? null);
    });

    return () => subscription.unsubscribe();
  }, []);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push("/");
    router.refresh();
  };

  return (
    <>
      <nav className="w-full sticky top-0 z-50 bg-white dark:bg-[#0b1220] border-b border-gray-200 dark:border-gray-800">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 py-4 flex items-center justify-between">

          {/* LEFT — Logo */}
          <Image
            src="/logo.png"
            alt="Legal Digest"
            width={140}
            height={35}
            className="cursor-pointer w-[120px] sm:w-[140px] h-auto"
            onClick={() => router.push("/")}
          />

          {/* RIGHT SIDE */}
          <div className="flex items-center gap-6">

            <Link
              href="/national"
              className="text-gray-600 dark:text-gray-300 hover:text-black dark:hover:text-white transition"
            >
              National
            </Link>

            <Link
              href="/international"
              className="text-gray-600 dark:text-gray-300 hover:text-black dark:hover:text-white transition"
            >
              International
            </Link>

            {/* Search */}
            <div className="relative w-56">
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search..."
                className="w-full bg-gray-100 dark:bg-black/40 border border-gray-300 dark:border-indigo-500/30 rounded-lg pl-9 pr-4 py-2 text-sm text-gray-900 dark:text-white focus:outline-none focus:border-indigo-500 dark:focus:border-indigo-400 transition"
              />
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-indigo-500">
                🔎
              </span>
            </div>

            {/* Auth */}
            {user ? (
              <button
                onClick={handleLogout}
                className="text-red-500 hover:text-red-700 transition"
              >
                Logout
              </button>
            ) : (
              <button
                onClick={() => setAuthOpen(true)}
                className="bg-white text-black px-4 py-1.5 rounded-md hover:bg-gray-200 transition"
              >
                Login
              </button>
            )}
          </div>
        </div>
      </nav>

      <AuthModal isOpen={authOpen} onClose={() => setAuthOpen(false)} />
    </>
  );
}