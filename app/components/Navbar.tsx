"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter, usePathname } from "next/navigation";
import AuthModal from "./auth/AuthModal";
import { auth } from "@/lib/firebase";
import { onAuthStateChanged, signOut } from "firebase/auth";
import { useSearch } from "@/app/context/SearchContext";
import { User, LogOut, LayoutDashboard, Bookmark as BookmarkIcon, ChevronDown, Users, Bell, Network } from "lucide-react";

export default function Navbar() {
  const router = useRouter();
  const pathname = usePathname();
  const { search, setSearch } = useSearch();
  const [mounted, setMounted] = useState(false);

  const [authOpen, setAuthOpen] = useState(false);
  const [user, setUser] = useState<any>(null);
  const [menuOpen, setMenuOpen] = useState(false);
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);
  const [notificationOpen, setNotificationOpen] = useState(false);
  const [notificationsEnabled, setNotificationsEnabled] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    setMounted(true);
    setNotificationsEnabled(localStorage.getItem("notifications") === "true");
  }, []);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    const handleStorageChange = () => {
      setNotificationsEnabled(localStorage.getItem("notifications") === "true");
    };
    window.addEventListener("scroll", handleScroll);
    window.addEventListener("storage", handleStorageChange);
    return () => {
      window.removeEventListener("scroll", handleScroll);
      window.removeEventListener("storage", handleStorageChange);
    };
  }, []);

  const [results, setResults] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  const desktopSearchRef = useRef<HTMLDivElement>(null);
  const mobileSearchRef = useRef<HTMLDivElement>(null);
  const userDropdownRef = useRef<HTMLDivElement>(null);
  const notificationRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
    });

    return () => unsubscribe();
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
      const target = event.target as Node;
      if (
        (desktopSearchRef.current && !desktopSearchRef.current.contains(target)) &&
        (mobileSearchRef.current && !mobileSearchRef.current.contains(target))
      ) {
        setResults([]);
      }
      if (userDropdownRef.current && !userDropdownRef.current.contains(target)) {
        setUserDropdownOpen(false);
      }
      if (notificationRef.current && !notificationRef.current.contains(target)) {
        setNotificationOpen(false);
      }
    };

    document.addEventListener("click", handleClickOutside);
    return () =>
      document.removeEventListener("click", handleClickOutside);
  }, []);

  const handleLogout = async () => {
    await signOut(auth);
    router.push("/");
    router.refresh();
  };

  const toggleNotifications = async () => {
    if (!notificationsEnabled) {
      if (typeof window !== "undefined" && "Notification" in window) {
        if (Notification.permission === "granted") {
          setNotificationsEnabled(true);
          localStorage.setItem("notifications", "true");
        } else {
          try {
            const permission = await Notification.requestPermission();
            if (permission === "granted") {
              setNotificationsEnabled(true);
              localStorage.setItem("notifications", "true");
            } else {
              setNotificationsEnabled(false);
              localStorage.setItem("notifications", "false");
            }
          } catch (e) {
            setNotificationsEnabled(false);
            localStorage.setItem("notifications", "false");
          }
        }
      } else {
        setNotificationsEnabled(true);
        localStorage.setItem("notifications", "true");
      }
    } else {
      setNotificationsEnabled(false);
      localStorage.setItem("notifications", "false");
    }
  };

  return (
    <>
      <div className="fixed top-0 w-full z-[1000] px-4 pt-4 sm:pt-6 flex justify-center pointer-events-none">
        <nav
          className={`pointer-events-auto transition-all duration-500 ease-[cubic-bezier(0.25,1,0.5,1)] flex items-center justify-between shadow-[0_8px_30px_rgb(0,0,0,0.08)] backdrop-blur-xl border border-gray-200/40 bg-white/40
            ${scrolled
              ? "w-full max-w-4xl py-2 px-5 rounded-full"
              : "w-full max-w-7xl py-3 px-6 rounded-3xl"}
          `}
        >
          {/* Logo */}
          <div className="flex-shrink-0 flex items-center">
            <Image
              src="/new_logo.png"
              alt="Legal Digest"
              width={scrolled ? 70 : 80}
              height={scrolled ? 30 : 40}
              className="cursor-pointer transition-all duration-300 h-auto"
              onClick={() => {
                if (pathname === "/") {
                  window.scrollTo({ top: 0, behavior: "smooth" });
                } else {
                  router.push("/");
                }
              }}
            />
          </div>

          {/* Desktop Search & Actions */}
          <div className="hidden lg:flex items-center gap-6 flex-1 justify-end">

            <Link href="/graph" className="text-sm font-semibold text-slate-700 hover:text-indigo-600 transition flex items-center gap-2">
              <Network size={16} /> Topology
            </Link>

            <Link href="/community" className="text-sm font-semibold text-slate-700 hover:text-indigo-600 transition flex items-center gap-2">
              <Users size={16} /> Community
            </Link>

            {/* Notifications */}
            <div className="relative" ref={notificationRef}>
              <button
                onClick={() => setNotificationOpen(!notificationOpen)}
                className="p-2.5 rounded-full border border-gray-200/70 bg-white/50 hover:bg-white transition-all duration-300 shadow-sm relative group"
              >
                <Bell size={18} className="text-gray-600 group-hover:text-indigo-600 transition-colors" />
                {notificationsEnabled && <span className="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full border border-white animate-pulse"></span>}
              </button>

              {notificationOpen && (
                <div className="absolute top-[calc(100%+12px)] right-0 w-72 bg-white border border-gray-100 rounded-2xl shadow-xl z-[1100] overflow-hidden animate-in fade-in zoom-in-95 duration-200">
                  <div className="px-4 py-3 border-b border-gray-100 bg-slate-50 flex justify-between items-center">
                    <p className="text-sm font-bold text-slate-900">Notifications</p>
                  </div>
                  <div className="p-5 flex flex-col items-center text-center space-y-4">
                    <div className={`w-12 h-12 rounded-full flex items-center justify-center border ${notificationsEnabled ? 'bg-indigo-50 border-indigo-100' : 'bg-slate-50 border-slate-100'}`}>
                      <Bell size={24} className={notificationsEnabled ? 'text-indigo-500' : 'text-slate-400'} />
                    </div>
                    <div>
                      <h4 className="text-sm font-bold text-slate-800">Stay Updated</h4>
                      <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                        Get real-time intelligence alerts for major legal rulings and community insights.
                      </p>
                    </div>
                    <button
                      onClick={toggleNotifications}
                      className={`w-full py-2.5 rounded-xl text-xs font-semibold transition-all border ${notificationsEnabled
                        ? 'bg-red-50 text-red-600 border-red-100 hover:bg-red-100'
                        : 'bg-indigo-600 text-white border-indigo-600 hover:bg-indigo-700 shadow-lg shadow-indigo-600/20'
                        }`}
                    >
                      {notificationsEnabled ? "Disable Alerts" : "Enable Alerts"}
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Search */}
            <div className="relative w-56" ref={desktopSearchRef}>
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search cases..."
                className="w-full bg-slate-50 border border-gray-200/50 rounded-full pl-9 pr-4 py-1.5 text-sm text-slate-900 placeholder-slate-400 focus:ring-2 focus:ring-indigo-500 focus:outline-none transition-all shadow-inner"
              />
              <span className="absolute left-3 top-1/2 -translate-y-1/2 opacity-70">
                🔎
              </span>

              {search.trim() !== "" && (
                <div className="absolute top-[calc(100%+8px)] left-0 w-full bg-white border border-gray-200 rounded-2xl shadow-xl z-[1100] max-h-80 overflow-y-auto">
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
                        className="p-3 text-sm cursor-pointer hover:bg-gray-50 text-gray-800"
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
              <div className="relative" ref={userDropdownRef}>
                <button
                  onClick={() => setUserDropdownOpen(!userDropdownOpen)}
                  className="group flex items-center gap-2 pl-2 pr-4 py-1.5 rounded-full border border-gray-200/70 bg-white/50 hover:bg-white transition-all duration-300 shadow-sm"
                >
                  <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-indigo-500 to-purple-500 flex items-center justify-center text-white shadow-inner font-bold text-sm flex-shrink-0">
                    {user.displayName ? user.displayName[0].toUpperCase() : (user.email ? user.email[0].toUpperCase() : "?")}
                  </div>
                  <span className="max-w-0 overflow-hidden text-sm font-semibold text-gray-800 group-hover:max-w-[120px] transition-all duration-500 ease-[cubic-bezier(0.25,1,0.5,1)] whitespace-nowrap">
                    {user.displayName || user.email?.split('@')[0]}
                  </span>
                  <ChevronDown size={14} className="text-gray-500 group-hover:text-indigo-500 transition-colors" />
                </button>

                {userDropdownOpen && (
                  <div className="absolute top-[calc(100%+8px)] right-0 w-56 bg-white border border-gray-100 rounded-2xl shadow-[0_8px_30px_rgb(0,0,0,0.12)] z-[1100] overflow-hidden animate-in fade-in zoom-in-95 duration-200">
                    <div className="px-4 py-3 border-b border-gray-100 bg-slate-50">
                      <p className="text-sm font-bold text-slate-900 truncate">{user.displayName || user.email}</p>
                      <p className="text-xs text-indigo-600 font-bold uppercase tracking-wider">{user.photoURL || "Researcher"}</p>
                    </div>
                    <div className="p-2 space-y-1">
                      <Link href="/profile" onClick={() => setUserDropdownOpen(false)} className="flex items-center gap-3 px-3 py-2 text-sm text-gray-700 hover:bg-indigo-50 rounded-xl transition">
                        <User size={16} className="text-indigo-500" /> My Profile
                      </Link>
                      <Link href="/dashboard" onClick={() => setUserDropdownOpen(false)} className="flex items-center gap-3 px-3 py-2 text-sm text-gray-700 hover:bg-indigo-50 rounded-xl transition">
                        <LayoutDashboard size={16} className="text-indigo-500" /> Dashboard
                      </Link>
                      <Link href="/bookmarks" onClick={() => setUserDropdownOpen(false)} className="flex items-center gap-3 px-3 py-2 text-sm text-gray-700 hover:bg-indigo-50 rounded-xl transition">
                        <BookmarkIcon size={16} className="text-indigo-500" /> My Saved Cases
                      </Link>
                    </div>
                    <div className="p-2 border-t border-gray-100">
                      <button
                        onClick={handleLogout}
                        className="w-full flex items-center gap-3 px-3 py-2 text-sm text-red-600 hover:bg-red-50 rounded-xl transition"
                      >
                        <LogOut size={16} /> Logout
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <button
                onClick={() => setAuthOpen(true)}
                className="px-5 py-2 rounded-full bg-gradient-to-r from-indigo-600 to-purple-600 text-white hover:shadow-lg hover:shadow-indigo-500/25 transition-all font-medium text-sm flex items-center gap-2"
              >
                <User size={16} /> Researcher Login
              </button>
            )}
          </div>

          {/* Mobile Top Section */}
          <div className="flex items-center gap-3 lg:hidden">

            {/* Search */}
            <div className="relative w-32" ref={mobileSearchRef}>
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search..."
                className="w-full bg-gray-100 border border-gray-200 rounded-full pl-8 pr-2 py-1.5 text-sm text-gray-800"
              />
              <span className="absolute left-2 top-1/2 -translate-y-1/2 text-sm opacity-70">
                🔎
              </span>
            </div>

            {/* Animated Hamburger */}
            <button
              onClick={() => setMenuOpen(!menuOpen)}
              className="relative w-6 h-6 flex flex-col justify-between"
            >
              <span className={`h-0.5 w-full bg-gray-800 transition-all duration-300 ${menuOpen ? "rotate-45 translate-y-2.5" : ""}`} />
              <span className={`h-0.5 w-full bg-gray-800 transition-all duration-300 ${menuOpen ? "opacity-0" : ""}`} />
              <span className={`h-0.5 w-full bg-gray-800 transition-all duration-300 ${menuOpen ? "-rotate-45 -translate-y-2.5" : ""}`} />
            </button>
          </div>
        </nav>

        {/* Mobile Dropdown */}
        <div
          className={`absolute top-[calc(100%+8px)] left-0 right-0 mx-auto w-full max-w-md bg-white border border-gray-100 shadow-2xl rounded-3xl overflow-hidden pointer-events-auto transition-all duration-300 z-[1100] ${menuOpen ? "max-h-[500px] opacity-100" : "max-h-0 opacity-0 pointer-events-none"}`}
        >
          <div className="py-2">
            <div className="flex flex-col items-start gap-2 text-base font-medium px-4 pt-4">
              {user && (
                <>
                  <div className="px-4 py-3 mb-2 w-full bg-slate-50 rounded-xl border border-gray-100">
                    <p className="text-sm font-bold text-slate-900 truncate">{user.displayName || user.email}</p>
                    <p className="text-xs text-indigo-600 font-bold uppercase tracking-wider">{user.photoURL || "Researcher"}</p>
                  </div>

                  <Link href="/profile" onClick={() => setMenuOpen(false)} className="flex items-center gap-3 text-gray-700 hover:text-indigo-600 transition w-full py-2">
                    <User size={18} className="text-indigo-500" /> My Profile
                  </Link>
                  <Link href="/graph" onClick={() => setMenuOpen(false)} className="flex items-center gap-3 text-gray-700 hover:text-indigo-600 transition w-full py-2">
                    <Network size={18} className="text-indigo-500" /> Case Topology
                  </Link>
                  <Link href="/community" onClick={() => setMenuOpen(false)} className="flex items-center gap-3 text-gray-700 hover:text-indigo-600 transition w-full py-2">
                    <Users size={18} className="text-indigo-500" /> Community Blog
                  </Link>
                  <Link href="/dashboard" onClick={() => setMenuOpen(false)} className="flex items-center gap-3 text-gray-700 hover:text-indigo-600 transition w-full py-2">
                    <LayoutDashboard size={18} className="text-indigo-500" /> Dashboard
                  </Link>
                  <Link href="/bookmarks" onClick={() => setMenuOpen(false)} className="flex items-center gap-3 text-gray-700 hover:text-indigo-600 transition w-full py-2">
                    <BookmarkIcon size={18} className="text-indigo-500" /> Saved Cases
                  </Link>
                </>
              )}
              {!user && (
                <button 
                  onClick={() => { setAuthOpen(true); setMenuOpen(false); }}
                  className="flex items-center gap-3 text-gray-700 hover:text-indigo-600 transition w-full py-2"
                >
                  <User size={18} className="text-indigo-500" /> Researcher Login
                </button>
              )}
              <button onClick={toggleNotifications} className="flex items-center gap-3 text-gray-700 hover:text-indigo-600 transition w-full py-2">
                <Bell size={18} className="text-indigo-500" />
                <span className="flex-1 text-left">Push Notifications</span>
                <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${notificationsEnabled ? 'bg-indigo-100 text-indigo-700' : 'bg-gray-200 text-gray-600'}`}>
                  {notificationsEnabled ? 'ON' : 'OFF'}
                </span>
              </button>
            </div>

            {/* Auth Section - Only show logout when logged in */}
            <div className="mt-4 mb-4 px-4 flex justify-center">
              {user && (
                <button
                  onClick={handleLogout}
                  className="w-full px-8 py-3 rounded-xl bg-red-50 text-red-600 hover:bg-red-100 transition font-medium flex justify-center items-center gap-2"
                >
                  <LogOut size={18} /> Logout
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      <AuthModal isOpen={authOpen} onClose={() => setAuthOpen(false)} />
    </>
  );
}