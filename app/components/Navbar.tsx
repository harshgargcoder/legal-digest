"use client";

import { useEffect, useRef, useState } from "react";
import type { ReactNode } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter, usePathname } from "next/navigation";
import { onAuthStateChanged, signOut, type User as FirebaseUser } from "firebase/auth";
import { Bell, Bookmark as BookmarkIcon, Boxes, ChevronDown, ExternalLink, LayoutDashboard, LogOut, Moon, Network, Sun, User, Users, X } from "lucide-react";

import AuthModal from "./auth/AuthModal";
import { auth } from "@/lib/firebase";
import { useSearch } from "@/app/context/SearchContext";
import { useNotifications } from "@/app/context/NotificationContext";
import { useTheme } from "@/app/context/ThemeContext";

interface NewsResult {
  title: string;
  source: string;
  url: string;
}

interface NotificationItem {
  id: string;
  title: string;
  published_at: string;
  url: string;
  source: string;
}

export default function Navbar() {
  const router = useRouter();
  const pathname = usePathname();
  const { search, setSearch } = useSearch();
  const {
    notifications,
    unreadCount,
    loading: notificationsLoading,
    markAllAsRead,
    notificationsEnabled,
    toggleNotifications,
  } = useNotifications();
  const { theme, toggleTheme } = useTheme();

  const [mounted, setMounted] = useState(false);
  const [authOpen, setAuthOpen] = useState(false);
  const [user, setUser] = useState<FirebaseUser | null>(null);
  const [menuOpen, setMenuOpen] = useState(false);
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);
  const [notificationOpen, setNotificationOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const [results, setResults] = useState<NewsResult[]>([]);
  const [loading, setLoading] = useState(false);

  // Sync profile details state
  const [displayName, setDisplayName] = useState("");
  const [photoURL, setPhotoURL] = useState<string | null>(null);
  const [userEmail, setUserEmail] = useState("");
  const [userRole, setUserRole] = useState("Researcher");

  const desktopSearchRef = useRef<HTMLDivElement>(null);
  const mobileSearchRef = useRef<HTMLDivElement>(null);
  const userDropdownRef = useRef<HTMLDivElement>(null);
  const notificationRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setMounted(true);
    
    const checkHash = () => {
      if (window.location.hash === "#login") {
        setAuthOpen(true);
        // Clear hash after opening to allow re-triggering
        window.history.replaceState(null, "", window.location.pathname + window.location.search);
      }
    };

    window.addEventListener("hashchange", checkHash);
    checkHash(); // Check on initial load too

    return () => window.removeEventListener("hashchange", checkHash);
  }, []);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      setUser(currentUser);
      if (!currentUser) {
        setIsAdmin(false);
        setDisplayName("");
        setPhotoURL(null);
        setUserEmail("");
        setUserRole("Researcher");
        return;
      }

      setDisplayName(currentUser.displayName || "");
      setPhotoURL(currentUser.photoURL || null);
      setUserEmail(currentUser.email || "");

      try {
        const res = await fetch(`/api/user-preferences?userId=${currentUser.uid}`);
        const data = await res.json();
        setIsAdmin(data.preferences?.role === "Admin");
        if (data.preferences?.role) {
          setUserRole(data.preferences.role);
        } else {
          setUserRole("Researcher");
        }
      } catch (err) {
        console.error("Error fetching role for navbar:", err);
      }
    });

    return () => unsubscribe();
  }, []);

  // Listen to profile updates from profile page
  useEffect(() => {
    const handleProfileUpdate = async () => {
      const currentUser = auth.currentUser;
      if (currentUser) {
        setDisplayName(currentUser.displayName || "");
        setPhotoURL(currentUser.photoURL || null);
        setUserEmail(currentUser.email || "");
        
        try {
          const res = await fetch(`/api/user-preferences?userId=${currentUser.uid}`);
          const data = await res.json();
          setIsAdmin(data.preferences?.role === "Admin");
          if (data.preferences?.role) {
            setUserRole(data.preferences.role);
          }
        } catch (err) {
          console.error("Error updating role in navbar event:", err);
        }
      }
    };

    window.addEventListener("profileUpdate", handleProfileUpdate);
    return () => window.removeEventListener("profileUpdate", handleProfileUpdate);
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
        const res = await fetch(`/api/get-news?search=${encodeURIComponent(search)}&limit=5`);
        const data = await res.json();
        setResults(data.success ? data.articles || [] : []);
      } catch {
        setResults([]);
      } finally {
        setLoading(false);
      }
    };

    const debounce = setTimeout(fetchResults, 250);
    return () => clearTimeout(debounce);
  }, [search]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Node;

      if ((desktopSearchRef.current && !desktopSearchRef.current.contains(target)) && (mobileSearchRef.current && !mobileSearchRef.current.contains(target))) {
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
    return () => document.removeEventListener("click", handleClickOutside);
  }, []);

  const handleLogout = async () => {
    await signOut(auth);
    router.push("/");
    router.refresh();
  };

  if (!mounted) return null;

  return (
    <>
      <header
        className={`fixed z-[1000] transition-all duration-500 ease-out text-slate-900 dark:text-slate-100 ${
          scrolled
            ? "top-2 sm:top-3 inset-x-2 sm:inset-x-6 max-w-[1400px] mx-auto h-16 rounded-2xl sm:rounded-3xl bg-white/85 dark:bg-slate-900/85 backdrop-blur-2xl border border-white/60 dark:border-slate-700/60 shadow-[0_20px_50px_-10px_rgba(0,0,0,0.18),0_10px_25px_-5px_rgba(99,102,241,0.2)] dark:shadow-[0_25px_60px_-15px_rgba(0,0,0,0.85),0_0_30px_rgba(99,102,241,0.25)] ring-1 ring-black/5 dark:ring-white/10 px-4 sm:px-6"
            : "top-0 inset-x-0 w-full h-20 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md border-b border-slate-200/80 dark:border-slate-800 px-4 sm:px-8 shadow-xs"
        }`}
      >
        {/* Animated 3D Laser Accent Line on scroll */}
        {scrolled && (
          <div className="absolute -bottom-[1px] inset-x-12 h-[2px] bg-gradient-to-r from-transparent via-indigo-500 to-transparent opacity-85 blur-[0.5px] animate-pulse pointer-events-none" />
        )}

        <div className="mx-auto flex h-full max-w-[1440px] items-center justify-between gap-4">
          
          {/* 3D POP-OUT LOGO */}
          <div className="flex flex-shrink-0 items-center">
            <div
              onClick={() => {
                if (pathname === "/") window.scrollTo({ top: 0, behavior: "smooth" });
                else router.push("/");
              }}
              className="group/logo relative cursor-pointer flex items-center gap-2.5 py-1 px-1 rounded-2xl transition-all duration-300 transform-gpu hover:-translate-y-1 hover:scale-105 active:scale-95"
            >
              {/* 3D ambient radial glow behind logo */}
              <div className="absolute -inset-1 rounded-2xl bg-gradient-to-r from-indigo-500/25 via-purple-500/25 to-blue-500/25 blur-md opacity-0 group-hover/logo:opacity-100 transition-opacity duration-300" />

              <div className="relative transform-gpu transition-all duration-300 group-hover/logo:scale-110 group-hover/logo:rotate-[-2deg] drop-shadow-[0_10px_15px_rgba(99,102,241,0.35)]">
                <Image
                  src="/new_logo.png"
                  alt="Legal Digest"
                  width={scrolled ? 76 : 88}
                  height={scrolled ? 34 : 42}
                  className="h-auto transition-all duration-300"
                />
              </div>

              {/* 3D live badge that pops out when scrolled */}
              {scrolled && (
                <div className="hidden sm:flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-indigo-50/90 dark:bg-indigo-950/70 border border-indigo-200/80 dark:border-indigo-800/80 text-[10px] font-bold text-indigo-600 dark:text-indigo-400 shadow-xs animate-in fade-in zoom-in-75 duration-300">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                  <span className="tracking-wider uppercase">Live</span>
                </div>
              )}
            </div>
          </div>

          {/* DESKTOP NAV & CONTROLS */}
          <div className="hidden min-w-0 flex-1 items-center justify-end gap-4 xl:flex">
            {/* 3D Navigation Links */}
            <div className="flex items-center gap-3">
              <NavLink href="/graph" active={pathname === "/graph"} icon={<Network size={14} />} label="Topology" />
              <NavLink href="/community" active={pathname === "/community"} icon={<Users size={14} />} label="Community" />
              <NavLink href="/toolkit" active={pathname.startsWith("/toolkit")} icon={<Boxes size={14} />} label="Toolkit" />
            </div>

            {/* 3D Interactive Search Bar */}
            <div className="relative min-w-[240px] max-w-[340px] flex-1 group/search" ref={desktopSearchRef}>
              <div className="relative transform-gpu transition-all duration-300 group-hover/search:-translate-y-0.5 focus-within:-translate-y-1 focus-within:shadow-[0_12px_25px_-5px_rgba(99,102,241,0.25)] rounded-xl">
                <input
                  type="text"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Search archives..."
                  className="h-9 w-full rounded-xl border border-slate-200/90 bg-slate-50/90 dark:bg-slate-800/80 dark:border-slate-700/80 pl-9 pr-8 text-xs text-slate-900 dark:text-slate-100 outline-none transition-all placeholder:text-slate-400 shadow-inner focus:border-indigo-500 dark:focus:border-indigo-400 focus:bg-white dark:focus:bg-slate-900 focus:ring-2 focus:ring-indigo-500/20"
                />
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs opacity-70 group-hover/search:scale-110 transition-transform">🔎</span>
                {search && (
                  <button onClick={() => setSearch("")} className="absolute right-2.5 top-1/2 -translate-y-1/2 rounded-full p-0.5 transition hover:bg-slate-200 dark:hover:bg-slate-750">
                    <X size={12} className="text-slate-400" />
                  </button>
                )}
              </div>

              {search.trim() !== "" && (
                <div className="absolute left-0 top-[calc(100%+8px)] z-[1100] max-h-80 w-full overflow-y-auto rounded-xl border border-slate-200/90 bg-white/95 dark:border-slate-800 dark:bg-slate-900/95 backdrop-blur-xl shadow-2xl animate-in fade-in zoom-in-95 duration-150">
                  {loading && <div className="p-3 text-xs text-slate-500">Searching...</div>}
                  {!loading &&
                    results.map((item) => (
                      <div
                        key={item.url}
                        onClick={() => {
                          router.push(item.url);
                          setSearch("");
                          setResults([]);
                        }}
                        className="cursor-pointer px-4 py-2.5 text-xs text-slate-800 dark:text-slate-200 transition hover:bg-indigo-50/70 dark:hover:bg-indigo-950/40"
                      >
                        <p className="font-semibold">{item.title}</p>
                        <p className="text-[10px] text-slate-500">{item.source}</p>
                      </div>
                    ))}
                </div>
              )}
            </div>

            {/* 3D ACTION BUTTONS */}
            <div className="flex items-center gap-2.5">
              {/* Theme Toggle Button */}
              <button
                onClick={toggleTheme}
                className="flex h-9 w-9 items-center justify-center rounded-xl border border-slate-200/80 dark:border-slate-700/80 bg-white/90 dark:bg-slate-800/90 text-slate-700 dark:text-slate-300 shadow-xs transition-all duration-300 transform-gpu hover:-translate-y-1 hover:scale-110 hover:shadow-[0_8px_16px_rgba(0,0,0,0.12)] dark:hover:shadow-[0_8px_20px_rgba(245,158,11,0.3)] active:translate-y-0.5 active:scale-95"
                title={theme === "dark" ? "Switch to light mode" : "Switch to dark mode"}
              >
                {theme === "dark" ? <Sun size={15} className="text-amber-400 animate-spin-slow" /> : <Moon size={15} className="text-slate-700" />}
              </button>

              {/* Notification Bell */}
              <div className="relative" ref={notificationRef}>
                <button
                  onClick={() => {
                    setNotificationOpen(!notificationOpen);
                    if (!notificationOpen) markAllAsRead();
                  }}
                  className="relative flex h-9 w-9 items-center justify-center rounded-xl border border-slate-200/80 dark:border-slate-700/80 bg-white/90 dark:bg-slate-800/90 text-slate-700 dark:text-slate-300 shadow-xs transition-all duration-300 transform-gpu hover:-translate-y-1 hover:scale-110 hover:shadow-[0_8px_16px_rgba(0,0,0,0.12)] dark:hover:shadow-[0_8px_20px_rgba(99,102,241,0.35)] active:translate-y-0.5 active:scale-95"
                >
                  <Bell size={15} />
                  {unreadCount > 0 && (
                    <span className="absolute -right-1 -top-1 flex h-4 w-4">
                      <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-red-400 opacity-75" />
                      <span className="relative inline-flex h-4 w-4 items-center justify-center rounded-full bg-red-500 text-[10px] font-bold text-white shadow-xs">
                        {unreadCount}
                      </span>
                    </span>
                  )}
                </button>

                {notificationOpen && (
                  <div className="absolute right-0 top-[calc(100%+8px)] z-[1100] w-80 overflow-hidden rounded-2xl border border-slate-200/90 dark:border-slate-800 bg-white/95 dark:bg-slate-900/95 backdrop-blur-xl shadow-2xl animate-in fade-in zoom-in-95 duration-150">
                    <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/50 px-4 py-2.5">
                      <p className="text-xs font-bold text-slate-900 dark:text-white">Notifications</p>
                      <button
                        onClick={toggleNotifications}
                        className={`rounded px-1.5 py-0.5 text-[9px] font-bold transition ${
                          notificationsEnabled ? "bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300" : "bg-slate-100 text-slate-400 dark:bg-slate-800"
                        }`}
                      >
                        {notificationsEnabled ? "Push: ON" : "Push: OFF"}
                      </button>
                    </div>

                    <div className="max-h-[300px] overflow-y-auto">
                      {notificationsLoading && notifications.length === 0 ? (
                        <div className="flex flex-col items-center justify-center space-y-2 p-6 text-center">
                          <div className="h-6 w-6 animate-spin rounded-full border-2 border-slate-500 border-t-transparent" />
                          <p className="text-[10px] text-slate-500">Fetching updates...</p>
                        </div>
                      ) : notifications.length > 0 ? (
                        <div className="divide-y divide-slate-100 dark:divide-slate-800">
                          {notifications.map((notif: NotificationItem) => (
                            <div
                              key={notif.id}
                              onClick={() => {
                                router.push(notif.url);
                                setNotificationOpen(false);
                              }}
                              className="cursor-pointer px-4 py-3 transition hover:bg-slate-50 dark:hover:bg-slate-800"
                            >
                              <div className="mb-1 flex items-start justify-between gap-4">
                                <span className="text-[9px] font-bold uppercase tracking-wider text-slate-900 dark:text-white">{notif.source}</span>
                                <span className="text-[9px] text-slate-450">{new Date(notif.published_at).toLocaleDateString()}</span>
                              </div>
                              <h4 className="line-clamp-2 text-xs font-semibold text-slate-800 dark:text-slate-200 transition hover:text-slate-900">{notif.title}</h4>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <div className="flex flex-col items-center space-y-3 p-8 text-center">
                          <div className="flex h-10 w-10 items-center justify-center rounded-md border border-slate-200 bg-slate-50 dark:border-slate-800 dark:bg-slate-800">
                            <Bell size={20} className="text-slate-400" />
                          </div>
                          <div>
                            <h4 className="text-xs font-bold text-slate-900 dark:text-white">No new updates</h4>
                            <p className="mt-1 px-3 text-[10px] leading-relaxed text-slate-500">
                              We&apos;ll notify you here once new legal rulings or insights are available.
                            </p>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>

              {/* 3D User Dropdown / Login Button */}
              {user ? (
                <div className="relative" ref={userDropdownRef}>
                  <button
                    onClick={() => setUserDropdownOpen(!userDropdownOpen)}
                    className="flex items-center gap-2 rounded-xl border border-slate-200/80 dark:border-slate-700/80 bg-white/90 dark:bg-slate-900/90 p-1.5 pr-2.5 shadow-xs transition-all duration-300 transform-gpu hover:-translate-y-1 hover:scale-105 hover:shadow-[0_10px_20px_-4px_rgba(0,0,0,0.15)] dark:hover:shadow-[0_10px_20px_-4px_rgba(99,102,241,0.3)] active:translate-y-0.5 active:scale-95"
                  >
                    <div className="flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-lg bg-gradient-to-tr from-slate-900 to-indigo-900 text-[10px] font-bold text-white uppercase overflow-hidden relative shadow-xs">
                      {photoURL ? (
                        <img 
                          src={photoURL} 
                          alt={displayName || "User"} 
                          className="h-full w-full object-cover" 
                          onError={() => setPhotoURL(null)} 
                        />
                      ) : (
                        displayName ? displayName[0].toUpperCase() : userEmail ? userEmail[0].toUpperCase() : "?"
                      )}
                    </div>
                    <span className="hidden max-w-[120px] overflow-hidden whitespace-nowrap text-xs font-semibold text-slate-800 dark:text-slate-200 2xl:inline">
                      {displayName || userEmail?.split("@")[0]}
                    </span>
                    <ChevronDown size={12} className="text-slate-400" />
                  </button>

                  {userDropdownOpen && (
                    <div className="absolute right-0 top-[calc(100%+8px)] z-[1100] w-52 overflow-hidden rounded-2xl border border-slate-200/90 dark:border-slate-800 bg-white/95 dark:bg-slate-900/95 backdrop-blur-xl shadow-2xl animate-in fade-in zoom-in-95 duration-150">
                      <div className="border-b border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/50 px-4 py-2.5">
                        <p className="truncate text-xs font-bold text-slate-900 dark:text-white">{displayName || userEmail}</p>
                        <p className="text-[9px] font-bold uppercase tracking-wider text-indigo-600 dark:text-indigo-400">{isAdmin ? "Admin" : userRole}</p>
                      </div>
                      <div className="space-y-0.5 p-1">
                        <NavMenuLink href="/profile" label="My Profile" icon={<User size={14} className="text-slate-600" />} onClick={() => setUserDropdownOpen(false)} />
                        <NavMenuLink href="/dashboard" label="Dashboard" icon={<LayoutDashboard size={14} className="text-slate-600" />} onClick={() => setUserDropdownOpen(false)} />
                        <NavMenuLink href="/bookmarks" label="Saved Cases" icon={<BookmarkIcon size={14} className="text-slate-600" />} onClick={() => setUserDropdownOpen(false)} />
                      </div>
                      <div className="border-t border-slate-100 dark:border-slate-800 p-1">
                        <button onClick={handleLogout} className="flex w-full items-center gap-2 rounded-xl px-3 py-1.5 text-xs text-red-600 hover:bg-red-50 dark:hover:bg-red-950/20 transition-colors">
                          <LogOut size={14} /> Logout
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <button
                  onClick={() => setAuthOpen(true)}
                  className="group relative flex items-center gap-2 rounded-xl bg-gradient-to-r from-slate-950 via-slate-900 to-indigo-950 dark:from-white dark:via-slate-100 dark:to-indigo-50 px-4 py-2 text-xs font-bold text-white dark:text-slate-950 shadow-[0_4px_12px_rgba(15,23,42,0.25)] dark:shadow-[0_4px_15px_rgba(255,255,255,0.2)] transition-all duration-300 transform-gpu hover:-translate-y-1 hover:scale-105 hover:shadow-[0_10px_25px_-3px_rgba(99,102,241,0.4)] active:scale-95"
                >
                  <User size={13} className="transition-transform duration-300 group-hover:scale-125 text-indigo-400 dark:text-indigo-600" />
                  <span className="tracking-wide">Researcher Login</span>
                  <span className="absolute inset-0 rounded-xl bg-white/10 dark:bg-black/5 opacity-0 group-hover:opacity-100 transition-opacity" />
                </button>
              )}
            </div>
          </div>

          {/* MOBILE CONTROLS */}
          <div className="flex items-center gap-2 xl:hidden">
            <div className="relative w-36 sm:w-52" ref={mobileSearchRef}>
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search..."
                className="w-full rounded-xl border border-slate-200 bg-slate-50 dark:border-slate-800 dark:bg-slate-900 py-1.5 pl-8 pr-2 text-xs text-slate-900 dark:text-slate-100 placeholder:text-slate-400 outline-none shadow-inner"
              />
              <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-xs opacity-60">🔎</span>
              {search && (
                <button onClick={() => setSearch("")} className="absolute right-2 top-1/2 -translate-y-1/2 rounded-full p-0.5 hover:bg-slate-200">
                  <X size={10} className="text-slate-400" />
                </button>
              )}
            </div>

            <button
              onClick={() => setMenuOpen(!menuOpen)}
              className="flex h-9 w-9 flex-col items-center justify-center gap-1 rounded-xl border border-slate-200 bg-white/90 dark:border-slate-800 dark:bg-slate-900/90 shadow-xs transition-all duration-200 active:scale-90"
            >
              <span className={`h-0.5 w-3.5 bg-slate-700 transition-all duration-300 dark:bg-slate-300 ${menuOpen ? "translate-y-1.5 rotate-45" : ""}`} />
              <span className={`h-0.5 w-3.5 bg-slate-700 transition-all duration-300 dark:bg-slate-300 ${menuOpen ? "opacity-0" : ""}`} />
              <span className={`h-0.5 w-3.5 bg-slate-700 transition-all duration-300 dark:bg-slate-300 ${menuOpen ? "-translate-y-1.5 -rotate-45" : ""}`} />
            </button>
          </div>
        </div>

        {/* Mobile Dropdown Menu */}
        <div
          className={`absolute left-0 right-0 top-full mt-2 w-full rounded-2xl border border-slate-200/90 bg-white/95 backdrop-blur-xl shadow-2xl transition-all duration-300 dark:border-slate-800 dark:bg-slate-900/95 overflow-hidden ${
            menuOpen ? "max-h-[500px] opacity-100 pointer-events-auto" : "max-h-0 opacity-0 pointer-events-none"
          }`}
        >
          <div className="px-4 py-3 space-y-2">
            {user && (
              <>
                <div className="mb-2 flex items-center gap-2.5 rounded border border-slate-100 bg-slate-50 px-3 py-2 dark:border-slate-800 dark:bg-slate-900/50">
                  <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded bg-slate-950 text-xs font-bold text-white uppercase dark:bg-slate-800 overflow-hidden relative">
                    {photoURL ? (
                      <img 
                        src={photoURL} 
                        alt={displayName || "User"} 
                        className="h-full w-full object-cover" 
                        onError={() => setPhotoURL(null)} 
                      />
                    ) : (
                      displayName ? displayName[0].toUpperCase() : userEmail ? userEmail[0].toUpperCase() : "?"
                    )}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-xs font-bold text-slate-900 dark:text-white">{displayName || userEmail}</p>
                    <p className="text-[9px] font-bold uppercase tracking-wider text-indigo-650 dark:text-indigo-400">{isAdmin ? "Admin" : userRole}</p>
                  </div>
                </div>
                <NavMenuLink href="/profile" label="My Profile" icon={<User size={15} />} onClick={() => setMenuOpen(false)} />
                <NavMenuLink href="/graph" label="Case Topology" icon={<Network size={15} />} onClick={() => setMenuOpen(false)} />
                <NavMenuLink href="/community" label="Community Blog" icon={<Users size={15} />} onClick={() => setMenuOpen(false)} />
                <NavMenuLink href="/toolkit" label="Student Toolkit" icon={<Boxes size={15} />} onClick={() => setMenuOpen(false)} />
                <NavMenuLink href="/dashboard" label="Dashboard" icon={<LayoutDashboard size={15} />} onClick={() => setMenuOpen(false)} />
                <NavMenuLink href="/bookmarks" label="Saved Cases" icon={<BookmarkIcon size={15} />} onClick={() => setMenuOpen(false)} />
              </>
            )}
            {!user && (
              <button onClick={() => { setAuthOpen(true); setMenuOpen(false); }} className="flex w-full items-center gap-2 rounded px-3 py-2 text-xs text-slate-800 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800">
                <User size={15} /> Researcher Login
              </button>
            )}

            <button onClick={toggleNotifications} className="flex w-full items-center gap-2 rounded px-3 py-2 text-xs text-slate-800 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800">
              <Bell size={15} />
              <span className="flex-1 text-left">Push Notifications</span>
              <span className={`rounded px-1.5 py-0.5 text-[9px] font-bold ${notificationsEnabled ? "bg-slate-100 text-slate-700" : "bg-slate-100 text-slate-400"}`}>
                {notificationsEnabled ? "ON" : "OFF"}
              </span>
            </button>

            <button onClick={toggleTheme} className="flex w-full items-center gap-2 rounded px-3 py-2 text-xs text-slate-800 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800">
              {theme === "dark" ? <Sun size={15} className="text-amber-500" /> : <Moon size={15} />}
              <span className="flex-1 text-left">Theme</span>
              <span className={`rounded px-1.5 py-0.5 text-[9px] font-bold ${theme === "dark" ? "bg-slate-100 text-slate-700" : "bg-slate-100 text-slate-400"}`}>
                {theme === "dark" ? "Dark" : "Light"}
              </span>
            </button>

            {user && (
              <div className="pt-2">
                <button onClick={handleLogout} className="flex w-full items-center justify-center gap-2 rounded bg-red-50 py-2 text-xs font-semibold text-red-600 hover:bg-red-100">
                  <LogOut size={15} /> Logout
                </button>
              </div>
            )}
          </div>
        </div>
      </header>
      <AuthModal isOpen={authOpen} onClose={() => setAuthOpen(false)} />
    </>
  );
}

function NavLink({ href, active, icon, label }: { href: string; active: boolean; icon: ReactNode; label: string }) {
  return (
    <Link
      href={href}
      className={`group relative flex items-center gap-2 px-3 py-1.5 rounded-xl text-xs font-bold transition-all duration-300 transform-gpu ${
        active
          ? "bg-slate-950 text-white shadow-[0_8px_16px_-4px_rgba(15,23,42,0.4)] dark:bg-white dark:text-slate-950 dark:shadow-[0_8px_20px_-4px_rgba(255,255,255,0.3)] -translate-y-0.5 scale-102"
          : "text-slate-600 dark:text-slate-400 hover:text-slate-950 dark:hover:text-white hover:bg-slate-100/80 dark:hover:bg-slate-800/80 hover:-translate-y-1 hover:scale-105 hover:shadow-[0_10px_20px_-4px_rgba(99,102,241,0.25)] active:scale-95"
      }`}
    >
      <span
        className={`transition-transform duration-300 group-hover:scale-125 group-hover:rotate-6 ${
          active ? "text-indigo-400 dark:text-indigo-600" : "text-slate-400 group-hover:text-indigo-600 dark:group-hover:text-indigo-400"
        }`}
      >
        {icon}
      </span>
      <span className="tracking-wide">{label}</span>
      {active && (
        <span className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-1.5 h-1.5 rounded-full bg-indigo-500 shadow-[0_0_8px_#6366f1]" />
      )}
    </Link>
  );
}

function NavMenuLink({
  href,
  label,
  icon,
  onClick,
}: {
  href: string;
  label: string;
  icon: ReactNode;
  onClick?: () => void;
}) {
  return (
    <Link href={href} onClick={onClick} className="flex w-full items-center gap-2 rounded px-3 py-2 text-xs text-slate-800 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800">
      {icon}
      <span>{label}</span>
    </Link>
  );
}
