"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter, usePathname } from "next/navigation";
import AuthModal from "./auth/AuthModal";
import { supabase } from "@/lib/supabase";
import { useSearch } from "@/app/context/SearchContext";

export default function Navbar() {
  const router = useRouter();
  const pathname = usePathname();
  const { search, setSearch } = useSearch();

  const [authOpen, setAuthOpen] = useState(false);
  const [user, setUser] = useState<any>(null);
  const [menuOpen, setMenuOpen] = useState(false);

  const [results, setResults] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  const dropdownRef = useRef<HTMLDivElement>(null);

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

  useEffect(() => {
    setMenuOpen(false);
  }, [pathname]);

  useEffect(() => {
    const fetchResults = async () => {
      if (!search.trim()) {
        setResults([]);
        return;
      }

      setLoading(true);

      try {
        const res = await fetch(
          `/api/get-news?search=${encodeURIComponent(search)}&limit=5`
        );
        const data = await res.json();
        if (data.success) setResults(data.articles || []);
        else setResults([]);
      } catch {
        setResults([]);
      }

      setLoading(false);
    };

    const debounce = setTimeout(fetchResults, 300);
    return () => clearTimeout(debounce);
  }, [search]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setResults([]);
      }
    };

    document.addEventListener("click", handleClickOutside);
    return () =>
      document.removeEventListener("click", handleClickOutside);
  }, []);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push("/");
    router.refresh();
  };

  return (
    <>
      <nav className="w-full sticky top-0 z-[100] backdrop-blur-md bg-white/80 dark:bg-[#0b1220]/80 border-b border-gray-200 dark:border-gray-800 transition-all">

        <div className="max-w-5xl mx-auto px-4 py-4 flex items-center justify-between">

          {/* Logo */}
          <Image
            src="/logo.png"
            alt="Logo"
            width={140}
            height={35}
            className="cursor-pointer w-[120px] sm:w-[140px]"
            onClick={() => router.push("/")}
          />

          {/* Desktop Menu */}
          <div className="hidden sm:flex items-center gap-8">

            <Link
              href="/national"
              className="hover:text-indigo-600 transition font-medium"
            >
              National
            </Link>

            <Link
              href="/international"
              className="hover:text-indigo-600 transition font-medium"
            >
              International
            </Link>

            {/* Search */}
            <div className="relative w-56" ref={dropdownRef}>
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search..."
                className="w-full bg-gray-100 dark:bg-black/40 border rounded-lg pl-9 pr-4 py-2 text-sm focus:ring-2 focus:ring-indigo-400"
              />
              <span className="absolute left-3 top-1/2 -translate-y-1/2">
                🔎
              </span>

              {search.trim() !== "" && (
                <div className="absolute top-full left-0 w-full mt-2 bg-white dark:bg-[#111827] border rounded-lg shadow-xl z-[200] max-h-80 overflow-y-auto">
                  {loading && (
                    <div className="p-3 text-sm text-gray-500">
                      Searching...
                    </div>
                  )}
                  {!loading &&
                    results.map((item) => (
                      <div
                        key={item.url}
                        onClick={() => {
                          router.push(item.url);
                          setSearch("");
                          setResults([]);
                        }}
                        className="p-3 text-sm cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-800"
                      >
                        <p className="font-medium">{item.title}</p>
                        <p className="text-xs text-gray-500">
                          {item.source}
                        </p>
                      </div>
                    ))}
                </div>
              )}
            </div>

            {user ? (
              <button
                onClick={handleLogout}
                className="text-red-500 font-medium"
              >
                Logout
              </button>
            ) : (
              <button
                onClick={() => setAuthOpen(true)}
                className="px-4 py-1.5 rounded-full bg-indigo-600 text-white hover:bg-indigo-700 transition font-medium"
              >
                Login
              </button>
            )}
          </div>

          {/* Mobile Top Section */}
          <div className="flex items-center gap-3 sm:hidden">

            {/* Search */}
            <div className="relative w-32" ref={dropdownRef}>
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search..."
                className="w-full bg-gray-100 dark:bg-black/40 border rounded-lg pl-8 pr-2 py-1.5 text-sm"
              />
              <span className="absolute left-2 top-1/2 -translate-y-1/2 text-sm">
                🔎
              </span>
            </div>

            {/* Animated Hamburger */}
            <button
              onClick={() => setMenuOpen(!menuOpen)}
              className="relative w-6 h-6 flex flex-col justify-between"
            >
              <span className={`h-0.5 w-full bg-black dark:bg-white transition-all duration-300 ${menuOpen ? "rotate-45 translate-y-2.5" : ""}`} />
              <span className={`h-0.5 w-full bg-black dark:bg-white transition-all duration-300 ${menuOpen ? "opacity-0" : ""}`} />
              <span className={`h-0.5 w-full bg-black dark:bg-white transition-all duration-300 ${menuOpen ? "-rotate-45 -translate-y-2.5" : ""}`} />
            </button>
          </div>
        </div>

        {/* Mobile Dropdown */}
        <div
          className={`sm:hidden overflow-hidden transition-all duration-300 ${
            menuOpen ? "max-h-96 opacity-100" : "max-h-0 opacity-0"
          }`}
        >
          <div className="px-6 py-8 bg-white dark:bg-[#0b1220] border-t border-gray-200 dark:border-gray-700">

            {/* Centered Links */}
            <div className="flex flex-col items-center gap-6 text-lg font-medium">

              <Link
                href="/national"
                className="hover:text-indigo-500 transition"
              >
                National
              </Link>

              <Link
                href="/international"
                className="hover:text-indigo-500 transition"
              >
                International
              </Link>

            </div>

            {/* Auth Section */}
            <div className="mt-10 flex justify-center">

              {user ? (
                <button
                  onClick={handleLogout}
                  className="px-8 py-2 rounded-full bg-red-500 text-white hover:bg-red-600 transition font-medium"
                >
                  Logout
                </button>
              ) : (
                <button
                  onClick={() => setAuthOpen(true)}
                  className="px-8 py-2 rounded-full bg-indigo-600 text-white hover:bg-indigo-700 transition font-medium shadow-md"
                >
                  Login
                </button>
              )}

            </div>
          </div>
        </div>
      </nav>

      <AuthModal isOpen={authOpen} onClose={() => setAuthOpen(false)} />
    </>
  );
}