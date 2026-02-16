"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import AuthModal from "./auth/AuthModal";
import { supabase } from "@/lib/supabase";
import { Bookmark } from "lucide-react";

export default function Navbar() {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    // Get current user
    supabase.auth.getUser().then(({ data }) => {
      setUser(data.user);
    });

    // Listen to auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_, session) => {
      setUser(session?.user ?? null);
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push("/");
    router.refresh();
  };

  return (
    <>
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

            {user && (
              <Link
                href="/bookmarks"
                className="flex gap-2 text-gray-600 hover:text-black transition"
              >
                <Bookmark size={18} />
                <span>Bookmarks</span>
              </Link>
            )}
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

            {/* Auth Section */}
            {user ? (
              <div className="flex items-center gap-3">
                {/* Avatar */}
                <div className="w-8 h-8 rounded-full bg-gray-300 flex items-center justify-center text-sm font-semibold">
                  {user.email?.charAt(0).toUpperCase()}
                </div>

                {/* Username / Email */}
                <span className="text-sm text-gray-700 hidden sm:block">
                  {user.user_metadata?.full_name || user.email}
                </span>

                {/* Logout */}
                <button
                  onClick={handleLogout}
                  className="text-red-500 hover:text-red-700 cursor-pointer transition"
                >
                  Logout
                </button>
              </div>
            ) : (
              <button
                onClick={() => setOpen(true)}
                className="bg-black text-white px-4 py-1.5 rounded-md cursor-pointer hover:bg-gray-800 transition"
              >
                Login
              </button>
            )}
          </div>
        </div>
      </nav>
      {/* Auth Modal */}
      <AuthModal isOpen={open} onClose={() => setOpen(false)} />
    </>
  );
}
