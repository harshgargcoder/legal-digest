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
} from "lucide-react";
import { auth } from "@/lib/firebase";
import { onAuthStateChanged, signOut, signInWithEmailAndPassword, sendPasswordResetEmail } from "firebase/auth";
import { useAuth } from "../hooks/useAuth";

import { AdminUser, CardMetrics, Summary } from "./types";
import { AdminLoginGate } from "./auth/AdminLoginGate";
import { DashboardSection } from "./dashboard/DashboardSection";
import { UserLogsPanel } from "./userlogs/UserLogsPanel";
import { AuditTrailPanel } from "./audit/AuditTrailPanel";

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
  const [isAuthorized, setIsAuthorized] = useState<boolean>(false);
  const [isMounted, setIsMounted] = useState(false);
  const [adminId, setAdminId] = useState("");
  const [adminPass, setAdminPass] = useState("");
  const [loginError, setLoginError] = useState("");
  const [isLoggingIn, setIsLoggingIn] = useState(false);
  const [busyUid, setBusyUid] = useState<string | null>(null);
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

  const fetchUsers = useCallback(async (tokenValue?: string) => {
    setLoading(true);
    setMessage(null);
    try {
      const actualToken = tokenValue || localToken || (await auth.currentUser?.getIdToken());
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
      const text = err instanceof Error ? err.message : "Unknown error";
      setMessage({ type: "error", text });
    } finally {
      setLoading(false);
    }
  }, [apiFetch, localToken]);

  useEffect(() => {
    if (!localToken || !isAuthorized) return;
    void fetchUsers(localToken);
  }, [localToken, fetchUsers, isAuthorized]);

  useEffect(() => {
    if (!localToken || !isAuthorized) return;
    const timer = setInterval(() => {
      void fetchUsers();
    }, 3000);
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
    if (!window.confirm("CRITICAL ACTION: Are you sure you want to PERMANENTLY delete this user? This will erase all their data from Firebase and Database. This cannot be undone.")) return;

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
      await fetchUsers();
    } catch (err) {
      console.error("Delete Error:", err);
      setMessage({ type: "error", text: "Failed to delete user records." });
    } finally {
      setBusyUid(null);
    }
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
          <Link href="/" className="mt-6 inline-flex items-center gap-2 px-5 py-3 rounded-xl bg-slate-900 text-white font-semibold">
            Go Home
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="h-screen bg-[#f3f6fb] flex flex-col font-sans overflow-hidden">
      <header className="h-20 bg-white/80 backdrop-blur-md border-b border-slate-200 flex items-center justify-between px-8 sticky top-0 z-50">
        <Link href="/" className="flex items-center gap-3">
          <Image src="/new_logo.png" alt="Legal Digest" width={120} height={40} className="h-auto w-auto" priority />
          <span className="h-6 w-[1px] bg-slate-200 mx-1" />
          <span className="text-sm font-bold text-slate-400 uppercase tracking-widest">Admin</span>
        </Link>
        <div className="flex items-center gap-4">
          <div className="px-3 py-1.5 bg-indigo-50 text-indigo-700 rounded-full text-xs font-bold uppercase tracking-widest border border-indigo-100">
            Secure Session
          </div>
        </div>
      </header>

      <div className="flex flex-1 overflow-hidden">
        <aside className={`${isSidebarVisible ? "w-72 p-6" : "w-0 overflow-hidden p-0"} transition-all duration-300 bg-white border-r border-slate-200 flex flex-col relative`}>
          <div className="pb-6 border-b border-slate-100">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-black text-slate-900 tracking-tight">Admin Ledger</h2>
              <button onClick={() => setIsSidebarVisible(false)} className="p-1.5 rounded-xl hover:bg-slate-50 text-slate-400 hover:text-slate-600 transition-all border border-transparent hover:border-slate-200">
                <PanelLeftClose size={18} />
              </button>
            </div>
            <p className="text-[10px] uppercase font-bold tracking-[0.2em] text-slate-400 mt-2">Institutional Dashboard</p>
          </div>
          <nav className="mt-5 space-y-1 text-sm flex-1 overflow-y-auto pr-1 custom-scrollbar">
            <button onClick={() => setActiveSection("dashboard")} className={`w-full text-left px-3 py-2 rounded-lg font-semibold ${activeSection === "dashboard" ? "bg-indigo-600 text-white shadow-md shadow-indigo-100" : "text-slate-600 hover:bg-white"}`}>Dashboard</button>
            <button onClick={() => setActiveSection("userLogs")} className={`w-full text-left px-3 py-2 rounded-lg font-semibold ${activeSection === "userLogs" ? "bg-indigo-600 text-white shadow-md shadow-indigo-100" : "text-slate-600 hover:bg-white"}`}>User Logs</button>
            <button onClick={() => setActiveSection("auditTrail")} className={`w-full text-left px-3 py-2 rounded-lg font-semibold ${activeSection === "auditTrail" ? "bg-indigo-600 text-white shadow-md shadow-indigo-100" : "text-slate-600 hover:bg-white"}`}>Audit Trail</button>
          </nav>

          <div className="mt-auto pt-6 border-t border-slate-100">
            <div className="p-4 bg-slate-50 rounded-[2rem] border border-slate-100 mb-4 shadow-sm relative group overflow-hidden">
              <div className="flex items-center gap-3 relative z-10">
                <div className="w-10 h-10 rounded-2xl bg-indigo-600 flex items-center justify-center text-white font-black shadow-lg shadow-indigo-100">
                  {(authUser?.displayName || "A").slice(0, 1).toUpperCase()}
                </div>
                <div className="overflow-hidden">
                  <p className="text-sm font-black text-slate-900 truncate">{authUser?.displayName || "Admin"}</p>
                  <p className="text-[10px] font-bold text-indigo-600 uppercase tracking-widest">System Admin</p>
                </div>
              </div>
              <button onClick={handleLogout} className="w-full mt-4 py-2.5 rounded-xl bg-white border border-slate-200 text-rose-600 text-xs font-bold flex items-center justify-center gap-2 hover:bg-rose-50 transition-all shadow-sm">
                <LogOut size={14} /> Sign Out
              </button>
            </div>
            <div className="flex items-center justify-center gap-2 py-1">
              <div className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
              <span className="text-[9px] font-black text-slate-400 uppercase tracking-[0.2em]">Live System V1.2</span>
            </div>
          </div>
        </aside>

        {!isSidebarVisible && (
          <button onClick={() => setIsSidebarVisible(true)} className="fixed bottom-8 left-8 p-3 bg-slate-900 text-white rounded-2xl shadow-2xl z-50 hover:scale-110 transition-all border border-white/20">
            <PanelLeft size={20} />
          </button>
        )}

        <main className="flex-1 overflow-y-auto custom-scrollbar bg-[#f3f6fb] relative">
          <div className="p-8 max-w-[1400px] mx-auto min-h-full flex flex-col">
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
              />
            )}

            {activeSection === "auditTrail" && (
              <AuditTrailPanel users={users} onRefresh={() => void fetchUsers()} />
            )}

            {activeSection === "userLogs" && (
              users.length > 0 ? (
                <UserLogsPanel
                  key={selectedUserId || users[0].uid}
                  user={users.find(u => u.uid === selectedUserId) || users[0]}
                  allUsers={users}
                  onSelectUser={(uid) => setSelectedUserId(uid)}
                  onBackToList={() => setActiveSection("dashboard")}
                  busyUid={busyUid}
                  handleResetPassword={handleResetPassword}
                  handleBanToggle={handleBanToggle}
                  handleDeleteUser={handleDeleteUser}
                />
              ) : (
                <div className="flex-1 flex items-center justify-center p-20 text-center text-slate-400">
                  <p className="font-bold">No Users Detected</p>
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
      </div>
    </div>
  );
}
