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

  const desktopSearchRef = useRef<HTMLDivElement>(null);
  const mobileSearchRef = useRef<HTMLDivElement>(null);
  const userDropdownRef = useRef<HTMLDivElement>(null);
  const notificationRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setMounted(true);
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
        return;
      }

      try {
        const res = await fetch(`/api/user-preferences?userId=${currentUser.uid}`);
        const data = await res.json();
        setIsAdmin(data.preferences?.role === "Admin");
      } catch (err) {
        console.error("Error fetching role for navbar:", err);
      }
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
      <div className="pointer-events-none fixed inset-x-0 top-0 z-[1000] flex justify-center px-3 pt-3 sm:px-4 sm:pt-4">
        <nav
          className={`pointer-events-auto flex w-full items-center justify-between gap-3 rounded-[1.5rem] border border-slate-200/80 bg-white/90 px-3 py-3 text-slate-900 shadow-[0_14px_40px_rgba(15,23,42,0.08)] backdrop-blur-xl transition-all duration-500 ease-[cubic-bezier(0.25,1,0.5,1)] ${
            scrolled ? "max-w-[1360px]" : "max-w-[1480px]"
          }`}
        >
          <div className="flex flex-shrink-0 items-center">
            <Image
              src="/new_logo.png"
              alt="Legal Digest"
              width={scrolled ? 72 : 84}
              height={scrolled ? 32 : 40}
              className="h-auto cursor-pointer transition-all duration-300"
              onClick={() => {
                if (pathname === "/") window.scrollTo({ top: 0, behavior: "smooth" });
                else router.push("/");
              }}
            />
          </div>

          <div className="hidden min-w-0 flex-1 items-center justify-end gap-3 xl:flex">
            <div className="flex items-center gap-1 rounded-full border border-slate-200 bg-slate-50 p-1">
              <NavLink href="/graph" active={pathname === "/graph"} icon={<Network size={16} />} label="Topology" />
              <NavLink href="/community" active={pathname === "/community"} icon={<Users size={16} />} label="Community" />
              <NavLink href="/toolkit" active={pathname.startsWith("/toolkit")} icon={<Boxes size={16} />} label="Toolkit" />
            </div>

            <div className="relative min-w-[260px] max-w-[380px] flex-1" ref={desktopSearchRef}>
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search cases, judgments, briefs..."
                className="h-11 w-full rounded-full border border-slate-200 bg-slate-50 pl-11 pr-10 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-indigo-400 focus:ring-2 focus:ring-indigo-500/20"
              />
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-sm opacity-80">🔎</span>
              {search && (
                <button onClick={() => setSearch("")} className="absolute right-3 top-1/2 -translate-y-1/2 rounded-full p-1 transition hover:bg-slate-200">
                  <X size={14} className="text-slate-400" />
                </button>
              )}

              {search.trim() !== "" && (
                <div className="absolute left-0 top-[calc(100%+10px)] z-[1100] max-h-80 w-full overflow-y-auto rounded-2xl border border-slate-200 bg-white shadow-2xl">
                  {loading && <div className="p-4 text-sm text-slate-500">Searching...</div>}
                  {!loading &&
                    results.map((item) => (
                      <div
                        key={item.url}
                        onClick={() => {
                          router.push(item.url);
                          setSearch("");
                          setResults([]);
                        }}
                        className="cursor-pointer px-4 py-3 text-sm text-slate-800 transition hover:bg-slate-50"
                      >
                        <p className="font-semibold">{item.title}</p>
                        <p className="text-xs text-slate-500">{item.source}</p>
                      </div>
                    ))}
                </div>
              )}
            </div>

            <div className="flex items-center gap-2 rounded-full border border-slate-200 bg-slate-50 p-1.5">
              <button
                onClick={toggleTheme}
                className="flex h-10 w-10 items-center justify-center rounded-full border border-slate-200 bg-white transition hover:bg-slate-100"
                title={theme === "dark" ? "Switch to light mode" : "Switch to dark mode"}
              >
                {theme === "dark" ? <Sun size={17} className="text-amber-400" /> : <Moon size={17} className="text-indigo-600" />}
              </button>

              <div className="relative" ref={notificationRef}>
                <button
                  onClick={() => {
                    setNotificationOpen(!notificationOpen);
                    if (!notificationOpen) markAllAsRead();
                  }}
                  className="relative flex h-10 w-10 items-center justify-center rounded-full border border-slate-200 bg-white transition hover:bg-slate-100"
                >
                  <Bell size={17} className="text-slate-600" />
                  {unreadCount > 0 && (
                    <span className="absolute -right-1 -top-1 flex h-4 w-4">
                      <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-red-400 opacity-75" />
                      <span className="relative inline-flex h-4 w-4 items-center justify-center rounded-full bg-red-500 text-[10px] font-bold text-white">
                        {unreadCount}
                      </span>
                    </span>
                  )}
                </button>

                {notificationOpen && (
                  <div className="absolute right-0 top-[calc(100%+12px)] z-[1100] w-80 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-2xl">
                    <div className="flex items-center justify-between border-b border-slate-100 bg-slate-50 px-4 py-3">
                      <p className="text-sm font-bold text-slate-900">Notifications</p>
                      <button
                        onClick={toggleNotifications}
                        className={`rounded-full px-2 py-0.5 text-[10px] font-bold transition ${
                          notificationsEnabled ? "bg-indigo-100 text-indigo-700" : "bg-slate-100 text-slate-500"
                        }`}
                      >
                        {notificationsEnabled ? "Push: ON" : "Push: OFF"}
                      </button>
                    </div>

                    <div className="max-h-[350px] overflow-y-auto">
                      {notificationsLoading && notifications.length === 0 ? (
                        <div className="flex flex-col items-center justify-center space-y-3 p-8 text-center">
                          <div className="h-8 w-8 animate-spin rounded-full border-2 border-indigo-500 border-t-transparent" />
                          <p className="text-xs text-slate-500">Fetching updates...</p>
                        </div>
                      ) : notifications.length > 0 ? (
                        <div className="divide-y divide-slate-100">
                          {notifications.map((notif: NotificationItem) => (
                            <div
                              key={notif.id}
                              onClick={() => {
                                router.push(notif.url);
                                setNotificationOpen(false);
                              }}
                              className="cursor-pointer px-4 py-4 transition hover:bg-slate-50"
                            >
                              <div className="mb-1 flex items-start justify-between gap-4">
                                <span className="text-[10px] font-bold uppercase tracking-widest text-indigo-600">{notif.source}</span>
                                <span className="text-[10px] text-slate-400">{new Date(notif.published_at).toLocaleDateString()}</span>
                              </div>
                              <h4 className="line-clamp-2 text-sm font-semibold text-slate-800 transition hover:text-indigo-600">{notif.title}</h4>
                              <div className="mt-2 flex items-center text-indigo-600 opacity-0 transition-opacity hover:opacity-100">
                                <span className="text-[10px] font-bold">Read details</span>
                                <ExternalLink size={10} className="ml-1" />
                              </div>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <div className="flex flex-col items-center space-y-4 p-10 text-center">
                          <div className="flex h-12 w-12 items-center justify-center rounded-full border border-slate-200 bg-slate-50">
                            <Bell size={24} className="text-slate-400" />
                          </div>
                          <div>
                            <h4 className="text-sm font-bold text-slate-900">No new updates</h4>
                            <p className="mt-1 px-4 text-xs leading-relaxed text-slate-500">
                              We&apos;ll notify you here once new legal rulings or insights are available.
                            </p>
                          </div>
                          {!notificationsEnabled && (
                            <button onClick={toggleNotifications} className="text-xs font-bold text-indigo-600 transition hover:text-indigo-700">
                              Enable push alerts
                            </button>
                          )}
                        </div>
                      )}
                    </div>

                    {notifications.length > 0 && (
                      <div className="border-t border-slate-100 bg-slate-50 p-2">
                        <button onClick={() => router.push("/dashboard")} className="w-full rounded-xl py-2 text-xs font-bold text-indigo-600 transition hover:bg-white">
                          View Dashboard
                        </button>
                      </div>
                    )}
                  </div>
                )}
              </div>

              {user ? (
                <div className="relative" ref={userDropdownRef}>
                  <button
                    onClick={() => setUserDropdownOpen(!userDropdownOpen)}
                    className="flex items-center gap-2 rounded-full border border-slate-200 bg-white py-1.5 pl-1.5 pr-3 transition hover:bg-slate-50"
                  >
                    <div className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-full bg-gradient-to-tr from-indigo-500 to-violet-500 text-sm font-bold text-white shadow-inner">
                      {user.displayName ? user.displayName[0].toUpperCase() : user.email ? user.email[0].toUpperCase() : "?"}
                    </div>
                    <span className="hidden max-w-[120px] overflow-hidden whitespace-nowrap text-sm font-semibold text-slate-800 2xl:inline">
                      {user.displayName || user.email?.split("@")[0]}
                    </span>
                    <ChevronDown size={14} className="text-slate-400 transition hover:text-slate-600" />
                  </button>

                  {userDropdownOpen && (
                    <div className="absolute right-0 top-[calc(100%+10px)] z-[1100] w-56 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-2xl">
                      <div className="border-b border-slate-100 bg-slate-50 px-4 py-3">
                        <p className="truncate text-sm font-bold text-slate-900">{user.displayName || user.email}</p>
                        <p className="text-xs font-bold uppercase tracking-wider text-indigo-600">{isAdmin ? "Admin" : user.photoURL || "Researcher"}</p>
                      </div>
                      <div className="space-y-1 p-2">
                        <NavMenuLink href="/profile" label="My Profile" icon={<User size={16} className="text-indigo-500" />} onClick={() => setUserDropdownOpen(false)} />
                        <NavMenuLink href="/dashboard" label="Dashboard" icon={<LayoutDashboard size={16} className="text-indigo-500" />} onClick={() => setUserDropdownOpen(false)} />
                        <NavMenuLink href="/bookmarks" label="My Saved Cases" icon={<BookmarkIcon size={16} className="text-indigo-500" />} onClick={() => setUserDropdownOpen(false)} />
                      </div>
                      <div className="border-t border-slate-100 p-2">
                        <button onClick={handleLogout} className="flex w-full items-center gap-3 rounded-xl px-3 py-2 text-sm text-red-600 transition hover:bg-red-50">
                          <LogOut size={16} /> Logout
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <button
                  onClick={() => setAuthOpen(true)}
                  className="flex items-center gap-2 rounded-full bg-gradient-to-r from-indigo-600 to-violet-600 px-5 py-2.5 text-sm font-semibold text-white transition hover:shadow-lg hover:shadow-indigo-500/20"
                >
                  <User size={16} /> Researcher Login
                </button>
              )}
            </div>
          </div>

          <div className="flex items-center gap-2 xl:hidden">
            <div className="relative w-36 sm:w-52 md:w-64" ref={mobileSearchRef}>
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search..."
                className="w-full rounded-full border border-slate-200 bg-slate-50 py-2 pl-8 pr-2 text-sm text-slate-900 placeholder:text-slate-400 outline-none"
              />
              <span className="absolute left-2 top-1/2 -translate-y-1/2 text-sm opacity-70">🔎</span>
              {search && (
                <button onClick={() => setSearch("")} className="absolute right-2 top-1/2 -translate-y-1/2 rounded-full p-0.5 transition hover:bg-slate-200">
                  <X size={12} className="text-slate-400" />
                </button>
              )}
            </div>

            <button onClick={() => setMenuOpen(!menuOpen)} className="flex h-10 w-10 flex-col items-center justify-center gap-1.5 rounded-full border border-slate-200 bg-white md:h-11 md:w-11">
              <span className={`h-0.5 w-4 bg-slate-700 transition-all duration-300 ${menuOpen ? "translate-y-2 rotate-45" : ""}`} />
              <span className={`h-0.5 w-4 bg-slate-700 transition-all duration-300 ${menuOpen ? "opacity-0" : ""}`} />
              <span className={`h-0.5 w-4 bg-slate-700 transition-all duration-300 ${menuOpen ? "-translate-y-2 -rotate-45" : ""}`} />
            </button>
          </div>
        </nav>

        <div
          className={`pointer-events-auto absolute left-0 right-0 top-[calc(100%+8px)] mx-auto w-full max-w-md overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-2xl transition-all duration-300 ${
            menuOpen ? "max-h-[560px] opacity-100" : "max-h-0 opacity-0 pointer-events-none"
          }`}
        >
          <div className="py-2">
            <div className="flex flex-col items-start gap-2 px-4 pt-4 text-base font-medium">
              {user && (
                <>
                  <div className="mb-2 w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3">
                    <p className="truncate text-sm font-bold text-slate-900">{user.displayName || user.email}</p>
                    <p className="text-xs font-bold uppercase tracking-wider text-indigo-600">{user.photoURL || "Researcher"}</p>
                  </div>
                  <NavMenuLink href="/profile" label="My Profile" icon={<User size={18} className="text-indigo-500" />} onClick={() => setMenuOpen(false)} />
                  <NavMenuLink href="/graph" label="Case Topology" icon={<Network size={18} className="text-indigo-500" />} onClick={() => setMenuOpen(false)} />
                  <NavMenuLink href="/community" label="Community Blog" icon={<Users size={18} className="text-indigo-500" />} onClick={() => setMenuOpen(false)} />
                  <NavMenuLink href="/toolkit" label="Student Toolkit" icon={<Boxes size={18} className="text-indigo-500" />} onClick={() => setMenuOpen(false)} />
                  <NavMenuLink href="/dashboard" label="Dashboard" icon={<LayoutDashboard size={18} className="text-indigo-500" />} onClick={() => setMenuOpen(false)} />
                  <NavMenuLink href="/bookmarks" label="Saved Cases" icon={<BookmarkIcon size={18} className="text-indigo-500" />} onClick={() => setMenuOpen(false)} />
                </>
              )}
              {!user && (
                <button onClick={() => { setAuthOpen(true); setMenuOpen(false); }} className="flex w-full items-center gap-3 rounded-2xl px-4 py-3 text-slate-800 transition hover:bg-slate-50">
                  <User size={18} className="text-indigo-500" /> Researcher Login
                </button>
              )}

              <button onClick={toggleNotifications} className="flex w-full items-center gap-3 rounded-2xl px-4 py-3 text-slate-800 transition hover:bg-slate-50">
                <Bell size={18} className="text-indigo-500" />
                <span className="flex-1 text-left">Push Notifications</span>
                <span className={`rounded-full px-2 py-0.5 text-[10px] font-bold ${notificationsEnabled ? "bg-indigo-100 text-indigo-700" : "bg-slate-100 text-slate-500"}`}>
                  {notificationsEnabled ? "ON" : "OFF"}
                </span>
                {unreadCount > 0 && <span className="ml-2 flex h-5 w-5 items-center justify-center rounded-full bg-red-500 text-[10px] font-bold text-white">{unreadCount}</span>}
              </button>

              <button onClick={toggleTheme} className="flex w-full items-center gap-3 rounded-2xl px-4 py-3 text-slate-800 transition hover:bg-slate-50">
                {theme === "dark" ? <Sun size={18} className="text-amber-500" /> : <Moon size={18} className="text-indigo-500" />}
                <span className="flex-1 text-left">Theme</span>
                <span className={`rounded-full px-2 py-0.5 text-[10px] font-bold ${theme === "dark" ? "bg-indigo-100 text-indigo-700" : "bg-slate-100 text-slate-500"}`}>
                  {theme === "dark" ? "Dark" : "Light"}
                </span>
              </button>
            </div>

            <div className="mb-4 mt-4 flex justify-center px-4">
              {user && (
                <button onClick={handleLogout} className="flex w-full items-center justify-center gap-2 rounded-xl bg-red-50 px-8 py-3 font-medium text-red-600 transition hover:bg-red-100">
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

function NavLink({ href, active, icon, label }: { href: string; active: boolean; icon: ReactNode; label: string }) {
  return (
    <Link
      href={href}
      className={`flex items-center gap-2 rounded-full px-4 py-2 text-sm font-semibold transition ${
        active ? "bg-white text-slate-950 shadow-sm" : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"
      }`}
    >
      <span className={active ? "text-indigo-600" : "text-slate-400"}>{icon}</span>
      {label}
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
    <Link href={href} onClick={onClick} className="flex w-full items-center gap-3 rounded-2xl px-4 py-3 text-slate-800 transition hover:bg-slate-50">
      {icon}
      <span>{label}</span>
    </Link>
  );
}
