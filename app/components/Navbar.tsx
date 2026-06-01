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
        className={`fixed inset-x-0 top-0 z-[1000] w-full border-b border-slate-200 bg-white px-4 py-0 text-slate-900 shadow-sm transition-all duration-300 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-100 ${
          scrolled ? "h-16" : "h-20"
        }`}
      >
        <div className="mx-auto flex h-full max-w-[1440px] items-center justify-between gap-4">
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

          <div className="hidden min-w-0 flex-1 items-center justify-end gap-4 xl:flex">
            <div className="flex items-center gap-6">
              <NavLink href="/graph" active={pathname === "/graph"} icon={<Network size={14} />} label="Topology" />
              <NavLink href="/community" active={pathname === "/community"} icon={<Users size={14} />} label="Community" />
              <NavLink href="/toolkit" active={pathname.startsWith("/toolkit")} icon={<Boxes size={14} />} label="Toolkit" />
            </div>

            <div className="relative min-w-[240px] max-w-[340px] flex-1" ref={desktopSearchRef}>
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search archives..."
                className="h-9 w-full rounded-md border border-slate-300 bg-white dark:bg-slate-800 dark:border-slate-700 pl-9 pr-8 text-xs text-slate-900 dark:text-slate-100 outline-none transition-all placeholder:text-slate-400 focus:border-slate-800 dark:focus:border-slate-400 focus:ring-1 focus:ring-slate-900/10"
              />
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs opacity-60">🔎</span>
              {search && (
                <button onClick={() => setSearch("")} className="absolute right-2.5 top-1/2 -translate-y-1/2 rounded-full p-0.5 transition hover:bg-slate-100 dark:hover:bg-slate-700">
                  <X size={12} className="text-slate-400" />
                </button>
              )}

              {search.trim() !== "" && (
                <div className="absolute left-0 top-[calc(100%+8px)] z-[1100] max-h-80 w-full overflow-y-auto rounded-md border border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900 shadow-xl">
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
                        className="cursor-pointer px-4 py-2.5 text-xs text-slate-800 dark:text-slate-200 transition hover:bg-slate-50 dark:hover:bg-slate-800"
                      >
                        <p className="font-semibold">{item.title}</p>
                        <p className="text-[10px] text-slate-500">{item.source}</p>
                      </div>
                    ))}
                </div>
              )}
            </div>

            <div className="flex items-center gap-3">
              <button
                onClick={toggleTheme}
                className="flex h-9 w-9 items-center justify-center rounded-md border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 transition hover:bg-slate-50 dark:hover:bg-slate-700"
                title={theme === "dark" ? "Switch to light mode" : "Switch to dark mode"}
              >
                {theme === "dark" ? <Sun size={15} className="text-amber-400" /> : <Moon size={15} className="text-slate-700" />}
              </button>

              <div className="relative" ref={notificationRef}>
                <button
                  onClick={() => {
                    setNotificationOpen(!notificationOpen);
                    if (!notificationOpen) markAllAsRead();
                  }}
                  className="relative flex h-9 w-9 items-center justify-center rounded-md border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 transition hover:bg-slate-50 dark:hover:bg-slate-700"
                >
                  <Bell size={15} />
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
                  <div className="absolute right-0 top-[calc(100%+8px)] z-[1100] w-80 overflow-hidden rounded-md border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-xl">
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

              {user ? (
                <div className="relative" ref={userDropdownRef}>
                  <button
                    onClick={() => setUserDropdownOpen(!userDropdownOpen)}
                    className="flex items-center gap-2 rounded-md border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-1.5 transition hover:bg-slate-50 dark:hover:bg-slate-850"
                  >
                    <div className="flex h-7 w-7 flex-shrink-0 items-center justify-center rounded bg-slate-950 text-[10px] font-bold text-white uppercase dark:bg-slate-800 overflow-hidden relative">
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
                    <div className="absolute right-0 top-[calc(100%+8px)] z-[1100] w-52 overflow-hidden rounded-md border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-xl">
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
                        <button onClick={handleLogout} className="flex w-full items-center gap-2 rounded px-3 py-1.5 text-xs text-red-600 hover:bg-red-50 dark:hover:bg-red-950/20">
                          <LogOut size={14} /> Logout
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <button
                  onClick={() => setAuthOpen(true)}
                  className="flex items-center gap-1.5 rounded-md bg-slate-950 dark:bg-slate-100 dark:text-slate-950 px-4 py-2 text-xs font-bold text-white hover:bg-slate-850 dark:hover:bg-white transition"
                >
                  <User size={13} /> Researcher Login
                </button>
              )}
            </div>
          </div>

          <div className="flex items-center gap-2 xl:hidden">
            <div className="relative w-36 sm:w-52" ref={mobileSearchRef}>
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search..."
                className="w-full rounded-md border border-slate-200 bg-slate-50 dark:border-slate-800 dark:bg-slate-900 py-1.5 pl-8 pr-2 text-xs text-slate-900 dark:text-slate-100 placeholder:text-slate-400 outline-none"
              />
              <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-xs opacity-60">🔎</span>
              {search && (
                <button onClick={() => setSearch("")} className="absolute right-2 top-1/2 -translate-y-1/2 rounded-full p-0.5 hover:bg-slate-200">
                  <X size={10} className="text-slate-400" />
                </button>
              )}
            </div>

            <button onClick={() => setMenuOpen(!menuOpen)} className="flex h-9 w-9 flex-col items-center justify-center gap-1 rounded-md border border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900">
              <span className={`h-0.5 w-3.5 bg-slate-700 transition-all duration-300 dark:bg-slate-300 ${menuOpen ? "translate-y-1.5 rotate-45" : ""}`} />
              <span className={`h-0.5 w-3.5 bg-slate-700 transition-all duration-300 dark:bg-slate-300 ${menuOpen ? "opacity-0" : ""}`} />
              <span className={`h-0.5 w-3.5 bg-slate-700 transition-all duration-300 dark:bg-slate-300 ${menuOpen ? "-translate-y-1.5 -rotate-45" : ""}`} />
            </button>
          </div>
        </div>

        {/* Mobile Dropdown Menu */}
        <div
          className={`absolute left-0 right-0 top-full w-full border-b border-slate-200 bg-white shadow-lg transition-all duration-300 dark:border-slate-800 dark:bg-slate-900 ${
            menuOpen ? "max-h-[500px] opacity-100 pointer-events-auto" : "max-h-0 opacity-0 pointer-events-none overflow-hidden"
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
      className={`flex items-center gap-1.5 px-1 py-1.5 text-xs font-semibold transition border-b-2 ${
        active 
          ? "border-slate-950 text-slate-950 dark:border-white dark:text-white" 
          : "border-transparent text-slate-555 hover:text-slate-950 dark:text-slate-450 dark:hover:text-white"
      }`}
    >
      <span className={active ? "text-slate-950 dark:text-white" : "text-slate-400"}>{icon}</span>
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
    <Link href={href} onClick={onClick} className="flex w-full items-center gap-2 rounded px-3 py-2 text-xs text-slate-800 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800">
      {icon}
      <span>{label}</span>
    </Link>
  );
}
