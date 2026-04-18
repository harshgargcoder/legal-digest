"use client";

import React, { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import {
  Users,
  LogOut,
  AlertCircle,
  PanelLeftClose,
  PanelLeft,
  ShieldCheck,
  Moon,
  Sun,
  Search,
  Shield,
  CheckCircle2,
  History,
} from "lucide-react";
import { auth } from "@/lib/firebase";
import { onAuthStateChanged, signOut, signInWithEmailAndPassword, sendPasswordResetEmail } from "firebase/auth";
import { useAuth } from "../hooks/useAuth";

import { AdminUser, CardMetrics, Summary } from "./types";
import { AdminLoginGate } from "./auth/AdminLoginGate";
import { DashboardSection } from "./dashboard/DashboardSection";
import UserLogsPanel from "./userlogs/UserLogsPanel";
import { AuditTrailPanel } from "./audit/AuditTrailPanel";
import ConfirmModal from "./shared/ConfirmModal";

type AdminSection = "dashboard" | "userLogs" | "permissions" | "security" | "auditTrail";

type AdminResponse = {
  users: AdminUser[];
  summary: Summary;
  cardMetrics: CardMetrics;
  ipNote: string;
};

type Message = { type: "success" | "error"; text: string } | null;

export default function AdminPage() {
  const { token, apiFetch, user: authUser } = useAuth();
  const [localToken, setToken] = useState<string | null>(null);
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [summary, setSummary] = useState<Summary>({ totalUsers: 0, activeUsers: 0, bannedUsers: 0, adminUsers: 0 });
  const [cardMetrics, setCardMetrics] = useState<CardMetrics>({
    totalUsers: { badgeText: "+0%", footerText: "7d signups 0", barPercent: 6 },
    activeSessions: { badgeText: "Stable", footerText: "Avg 0/day", barPercent: 6 },
    flaggedUsers: { badgeText: "Healthy", footerText: "0.0% flagged", barPercent: 6 },
  });
  const [message, setMessage] = useState<Message>(null);
  const [search, setSearch] = useState("");
  const [isForbidden, setIsForbidden] = useState(false);
  const [ipNote, setIpNote] = useState("");
  const [resetLinkMap, setResetLinkMap] = useState<Record<string, string>>({});
  const [activeSection, setActiveSection] = useState<AdminSection>("dashboard");
  const [selectedUserId, setSelectedUserId] = useState<string | null>(null);
  const [isSidebarVisible, setIsSidebarVisible] = useState(true);
  const [isDarkMode, setIsDarkMode] = useState(true);
  const [isAuthorized, setIsAuthorized] = useState<boolean>(false);
  const [isMounted, setIsMounted] = useState(false);
  const [adminId, setAdminId] = useState("");
  const [adminPass, setAdminPass] = useState("");
  const [loginError, setLoginError] = useState("");
  const [isLoggingIn, setIsLoggingIn] = useState(false);
  const [busyUid, setBusyUid] = useState<string | null>(null);
  
  // Modal State
  const [confirmModal, setConfirmModal] = useState<{
    isOpen: boolean;
    title: string;
    message: string;
    onConfirm: () => void;
    isDestructive?: boolean;
  }>({
    isOpen: false,
    title: "",
    message: "",
    onConfirm: () => {},
    isDestructive: false,
  });

  const router = useRouter();

  useEffect(() => {
    setIsMounted(true);
    const authFlag = sessionStorage.getItem("admin_authorized") === "true";
    if (authFlag) setIsAuthorized(true);

    const cachedUsers = sessionStorage.getItem("admin_users_cache");
    if (cachedUsers) setUsers(JSON.parse(cachedUsers));

    const cachedSummary = sessionStorage.getItem("admin_summary_cache");
    if (cachedSummary) setSummary(JSON.parse(cachedSummary));

    const cachedMetrics = sessionStorage.getItem("admin_metrics_cache");
    if (cachedMetrics) setCardMetrics(JSON.parse(cachedMetrics));
  }, []);

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, async (user) => {
      if (!user) {
        setToken(null);
        setIsAuthorized(false);
        sessionStorage.clear();
        return;
      }
      const idToken = await user.getIdToken();
      setToken(idToken);
    });
    return () => unsub();
  }, []);

  const fetchUsers = useCallback(async (options: { silent?: boolean } = {}) => {
    if (!options.silent) {
      setLoading(true);
      setMessage(null);
    }

    try {
      const actualToken = localToken || (await auth.currentUser?.getIdToken());
      const res = await apiFetch("/api/admin/users", {}, actualToken || undefined);

      if (res.status === 403) {
        setIsForbidden(true);
        setIsAuthorized(false);
        sessionStorage.clear();
        setUsers([]);
        return;
      }

      const data = (await res.json()) as AdminResponse | { error: string };
      if (!res.ok || !("users" in data)) {
        throw new Error("error" in data ? data.error : "Failed to fetch users");
      }

      setUsers(data.users);
      setSummary(data.summary);
      setCardMetrics(data.cardMetrics);
      setIpNote(data.ipNote);
      setIsForbidden(false);

      sessionStorage.setItem("admin_users_cache", JSON.stringify(data.users));
      sessionStorage.setItem("admin_summary_cache", JSON.stringify(data.summary));
      sessionStorage.setItem("admin_metrics_cache", JSON.stringify(data.cardMetrics));

    } catch (err) {
      if (!options.silent) {
        const text = err instanceof Error ? err.message : "Unknown error";
        setMessage({ type: "error", text });
      }
    } finally {
      if (!options.silent) {
        setLoading(false);
      }
    }
  }, [apiFetch, localToken]);

  useEffect(() => {
    if (!localToken || !isAuthorized) return;
    void fetchUsers();
  }, [localToken, fetchUsers, isAuthorized]);

  useEffect(() => {
    if (!localToken || !isAuthorized) return;
    const timer = setInterval(() => {
      void fetchUsers({ silent: true });
    }, 10000); 
    return () => clearInterval(timer);
  }, [fetchUsers, localToken, isAuthorized]);

  const handleAdminLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoggingIn(true);
    setLoginError("");

    try {
      let emailToLogin = "";
      const currentUser = auth.currentUser;

      if (currentUser && currentUser.email) {
        emailToLogin = currentUser.email;
      } else {
        const res = await fetch("/api/admin/resolve", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ adminId }),
        });
        const data = await res.json();
        if (data.email) {
          emailToLogin = data.email;
        } else {
          setLoginError(data.error || "Could not resolve admin account.");
          setIsLoggingIn(false);
          return;
        }
      }

      await signInWithEmailAndPassword(auth, emailToLogin, adminPass);
      setIsAuthorized(true);
      sessionStorage.setItem("admin_authorized", "true");
    } catch (err) {
      setLoginError("Invalid password or authentication failed.");
    } finally {
      setIsLoggingIn(false);
    }
  };

  const handleLogout = async () => {
    await signOut(auth);
    setIsAuthorized(false);
    sessionStorage.removeItem("admin_authorized");
    router.push("/");
  };

  async function handleResetPassword(targetUserId: string) {
    setBusyUid(targetUserId);
    try {
      const userToReset = users.find(u => u.uid === targetUserId);
      if (!userToReset?.email) throw new Error("User email not found");

      await sendPasswordResetEmail(auth, userToReset.email);

      const res = await apiFetch("/api/admin/users", {
        method: "POST",
        body: JSON.stringify({ targetUserId }),
      });
      const data = (await res.json()) as { success: true; resetLink: string } | { error: string };

      if (res.ok && "success" in data) {
        await navigator.clipboard.writeText(data.resetLink);
        setMessage({ type: "success", text: "Reset email sent & link copied." });
      } else {
        setMessage({ type: "success", text: "Reset email sent successfully." });
      }
    } catch (err) {
      console.error("Reset Error:", err);
      setMessage({ type: "error", text: "Failed to send reset email." });
    } finally {
      setBusyUid(null);
    }
  }

  async function handleBanToggle(user: AdminUser) {
    setBusyUid(user.uid);
    try {
      const action = user.isBanned ? "unban" : "ban";
      const res = await apiFetch("/api/admin/users", {
        method: "PATCH",
        body: JSON.stringify({ targetUserId: user.uid, action }),
      });
      const data = (await res.json()) as { success?: boolean; error?: string };
      if (!res.ok || !data.success) throw new Error("Update failed");
      setUsers(prev => prev.map(u => u.uid === user.uid ? { ...u, isBanned: action === "ban" } : u));
      setMessage({ type: "success", text: "Status updated." });
    } catch (err) {
      setMessage({ type: "error", text: "Ban toggle failed." });
    } finally {
      setBusyUid(null);
    }
  }

  async function handleDeleteUser(targetUserId: string) {
    setConfirmModal({
      isOpen: true,
      title: "Delete User Permanently?",
      message: "CRITICAL ACTION: This will erase all their data from Firebase and Database. This cannot be undone.",
      isDestructive: true,
      onConfirm: async () => {
        setBusyUid(targetUserId);
        try {
          const res = await apiFetch("/api/admin/users", {
            method: "DELETE",
            body: JSON.stringify({ targetUserId }),
          });
          const data = await res.json();
          if (!res.ok) throw new Error(data.error || "Delete failed");

          setMessage({ type: "success", text: "User & Database records deleted." });
          setSelectedUserId(null);
          setActiveSection("dashboard");
          fetchUsers();
        } catch (err: any) {
          setMessage({ type: "error", text: err.message });
        } finally {
          setBusyUid(null);
        }
      }
    });
  }

  if (!isMounted) {
    return <div className="min-h-screen bg-[#f3f6fb]" />;
  }

  if (!isAuthorized) {
    return (
      <AdminLoginGate
        adminId={adminId}
        setAdminId={setAdminId}
        adminPass={adminPass}
        setAdminPass={setAdminPass}
        onLogin={handleAdminLogin}
        loginError={loginError}
        isLoggingIn={isLoggingIn}
      />
    );
  }

  if (isForbidden) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-6">
        <div className="max-w-md w-full bg-white border border-slate-200 rounded-3xl p-8 text-center shadow-sm">
          <AlertCircle className="mx-auto text-rose-600 mb-4" size={36} />
          <h1 className="text-2xl font-black text-slate-900">Access Denied</h1>
          <p className="text-slate-600 mt-3">Your account is not marked as Admin.</p>
          <div className="mt-6 flex flex-col gap-3">
            <Link href="/" className="inline-flex items-center justify-center gap-2 px-5 py-3 rounded-xl bg-slate-900 text-white font-semibold transition-all hover:bg-slate-800">
              Go Home
            </Link>
            <button
              onClick={async () => {
                await signOut(auth);
                sessionStorage.clear();
                window.location.reload();
              }}
              className="inline-flex items-center justify-center gap-2 px-5 py-3 rounded-xl border border-slate-200 text-slate-600 font-semibold hover:bg-slate-50 transition-all shadow-sm"
            >
              Switch Account / Logout
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={`h-screen flex flex-col font-sans overflow-hidden transition-colors duration-300 ${isDarkMode ? "dark bg-slate-950 text-slate-200" : "bg-[#f8fafc] text-slate-900"}`}>
      <header className={`h-16 border-b flex items-center justify-between px-8 sticky top-0 z-50 transition-colors ${isDarkMode ? "bg-slate-900 border-slate-800" : "bg-white/80 backdrop-blur-md border-slate-200"}`}>
        <div className="flex items-center gap-4">
          <Link href="/" className="flex items-center gap-3">
            <Image src="/new_logo.png" alt="Legal Digest" width={110} height={35} className="h-auto w-auto" priority />
            <span className={`h-5 w-[1px] mx-1 ${isDarkMode ? "bg-slate-700" : "bg-slate-200"}`} />
            <span className={`text-[10px] font-bold uppercase tracking-[0.2em] ${isDarkMode ? "text-slate-400" : "text-slate-400"}`}>Management</span>
          </Link>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={() => setIsDarkMode(!isDarkMode)}
            className={`p-2 rounded-lg border transition-all cursor-pointer ${isDarkMode ? "bg-slate-800 border-slate-700 text-amber-400" : "bg-slate-50 border-slate-200 text-slate-500 hover:bg-slate-100"}`}
          >
            {isDarkMode ? <Sun size={20} /> : <Moon size={20} />}
          </button>
          <div className={`px-3 py-1.5 rounded-lg text-[9px] font-black uppercase tracking-widest border ${isDarkMode ? "bg-indigo-900/30 border-indigo-500/30 text-indigo-400" : "bg-indigo-50 border-indigo-100 text-indigo-700"}`}>
            Secure Auth
          </div>
        </div>
      </header>

      <div className="flex flex-1 overflow-hidden">
        <aside className={`${isSidebarVisible ? "w-64 p-5" : "w-0 overflow-hidden p-0"} transition-all duration-300 border-r flex flex-col relative ${isDarkMode ? "bg-slate-900 border-slate-800" : "bg-white border-slate-200"}`}>
          <div className={`pb-4 border-b ${isDarkMode ? "border-slate-800" : "border-slate-100"}`}>
            <h2 className="text-sm font-black uppercase tracking-widest px-1">Dashboard</h2>
          </div>
          <nav className="mt-6 space-y-2 text-[13px] flex-1 overflow-y-auto pr-1 custom-scrollbar">
            <button onClick={() => setActiveSection("dashboard")} className={`w-full text-left px-4 py-2.5 rounded-lg font-black uppercase tracking-widest cursor-pointer ${activeSection === "dashboard" ? "bg-indigo-600 text-white shadow-lg shadow-indigo-500/20" : isDarkMode ? "text-slate-400 hover:bg-slate-800" : "text-slate-600 hover:bg-slate-50"}`}>Overview</button>
            <button onClick={() => setActiveSection("userLogs")} className={`w-full text-left px-4 py-2.5 rounded-lg font-black uppercase tracking-widest cursor-pointer ${activeSection === "userLogs" ? "bg-indigo-600 text-white shadow-lg shadow-indigo-500/20" : isDarkMode ? "text-slate-400 hover:bg-slate-800" : "text-slate-600 hover:bg-slate-50"}`}>User Log</button>
            <button onClick={() => setActiveSection("auditTrail")} className={`w-full text-left px-4 py-2.5 rounded-lg font-black uppercase tracking-widest cursor-pointer ${activeSection === "auditTrail" ? "bg-indigo-600 text-white shadow-lg shadow-indigo-500/20" : isDarkMode ? "text-slate-400 hover:bg-slate-800" : "text-slate-600 hover:bg-slate-50"}`}>Audit Log</button>
          </nav>

          <div className={`mt-auto pt-4 border-t ${isDarkMode ? "border-slate-800" : "border-slate-100"}`}>
            <div className="px-2 py-4">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-indigo-600 flex items-center justify-center text-white font-black text-xs">
                  {(authUser?.displayName || "A").slice(0, 1).toUpperCase()}
                </div>
                <div className="overflow-hidden">
                  <p className="text-xs font-bold truncate">{authUser?.displayName || "Admin"}</p>
                  <p className="text-[9px] font-bold text-indigo-500 uppercase tracking-widest">Master</p>
                </div>
              </div>
              <button 
                onClick={handleLogout} 
                className={`w-full mt-4 flex items-center gap-2 text-xs font-black transition-all cursor-pointer ${isDarkMode ? "text-rose-400 hover:text-rose-300" : "text-rose-600 hover:text-rose-700"}`}
              >
                <LogOut size={16} /> LOG OUT ACCOUNT
              </button>
            </div>
          </div>
        </aside>

        <button 
          onClick={() => setIsSidebarVisible(!isSidebarVisible)} 
          className={`fixed top-32 p-2.5 rounded-r-xl shadow-2xl z-50 border-y border-r transition-all duration-300 cursor-pointer hover:pr-4 active:scale-95 ${
            isSidebarVisible ? "left-64" : "left-0"
          } ${isDarkMode ? "bg-slate-800 border-slate-700 text-white" : "bg-slate-900 border-white/20 text-white"}`}
          title={isSidebarVisible ? "Collapse Sidebar" : "Expand Sidebar"}
        >
          {isSidebarVisible ? <PanelLeftClose size={20} /> : <PanelLeft size={20} />}
        </button>

        <main className={`flex-1 overflow-y-auto custom-scrollbar relative transition-colors ${isDarkMode ? "bg-slate-950" : "bg-[#f8fafc]"}`}>
          <div className="p-6 lg:p-10 max-w-[1440px] mx-auto min-h-full flex flex-col gap-8">
            {activeSection === "dashboard" && (
              <DashboardSection
                summary={summary}
                cardMetrics={cardMetrics}
                users={users}
                loading={loading}
                search={search}
                setSearch={setSearch}
                fetchUsers={() => void fetchUsers()}
                ipNote={ipNote}
                setSelectedUserId={setSelectedUserId}
                setActiveSection={setActiveSection}
                busyUid={busyUid}
                handleResetPassword={handleResetPassword}
                handleBanToggle={handleBanToggle}
                isDarkMode={isDarkMode}
                recentActivityLimit={5}
              />
            )}

            {activeSection === "auditTrail" && (
              <AuditTrailPanel users={users} onRefresh={() => void fetchUsers()} />
            )}

            {activeSection === "userLogs" && (
              users.length > 0 ? (
                <UserLogsPanel
                  user={users.find(u => u.uid === selectedUserId) || users[0]}
                  allUsers={users}
                  onSelectUser={(uid: string) => setSelectedUserId(uid)}
                  onBackToList={() => {
                    setSelectedUserId(null);
                    setActiveSection("dashboard");
                  }}
                  busyUid={busyUid}
                  handleResetPassword={handleResetPassword}
                  handleBanToggle={handleBanToggle}
                  handleDeleteUser={handleDeleteUser}
                  isDarkMode={isDarkMode}
                />
              ) : (
                <div className={`flex-1 flex flex-col items-center justify-center p-20 text-center ${isDarkMode ? "text-slate-500" : "text-slate-400"}`}>
                  <div className={`w-20 h-20 rounded-3xl flex items-center justify-center mb-6 ${isDarkMode ? "bg-slate-900" : "bg-slate-100"}`}>
                    <Search size={32} />
                  </div>
                  <p className="font-black uppercase tracking-widest text-sm">No Users Detected</p>
                  <p className="text-xs mt-2 font-medium opacity-60 text-slate-500">Wait for user data to sync or check database connection.</p>
                </div>
              )
            )}

            <footer className="py-6 px-8 text-center mt-12 border-t border-slate-100">
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                © {new Date().getFullYear()} Legal Digest Institutional Portal.
              </p>
            </footer>
          </div>
        </main>

        <ConfirmModal
          isOpen={confirmModal.isOpen}
          onClose={() => setConfirmModal({ ...confirmModal, isOpen: false })}
          onConfirm={confirmModal.onConfirm}
          title={confirmModal.title}
          message={confirmModal.message}
          isDarkMode={isDarkMode}
          isDestructive={confirmModal.isDestructive}
          confirmText="Yes, Delete User"
        />
      </div>
    </div>
  );
}
