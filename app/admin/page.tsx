"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { onAuthStateChanged } from "firebase/auth";
import { auth } from "@/lib/firebase";
import Link from "next/link";
import {
  AlertCircle,
  ArrowLeft,
  Ban,
  Bell,
  CheckCircle2,
  Clock3,
  KeyRound,
  Loader2,
  RefreshCcw,
  Search,
  ShieldAlert,
  ShieldCheck,
  Trash2,
  Users,
} from "lucide-react";

type AdminUser = {
  uid: string;
  email: string;
  displayName: string;
  role: string;
  isBanned: boolean;
  lastSignInTime: string | null;
  createdAt: string | null;
  lastActivityDate: string | null;
  ipAddress: string | null;
  ipHistory: {
    ipAddress: string;
    seenAt: string;
    location: string;
    status: "Trusted" | "Observed";
  }[];
};

type Summary = {
  totalUsers: number;
  activeToday: number;
  activeSevenDays: number;
  bannedUsers: number;
  adminUsers: number;
};

type CardMetric = {
  badgeText: string;
  footerText: string;
  barPercent: number;
};

type CardMetrics = {
  totalUsers: CardMetric;
  activeSessions: CardMetric;
  flaggedUsers: CardMetric;
};

type AdminResponse = {
  users: AdminUser[];
  summary: Summary;
  cardMetrics: CardMetrics;
  generatedAt: string;
  ipTracking: boolean;
  ipNote: string;
};

type Message = { type: "success" | "error"; text: string } | null;
type AdminSection = "dashboard" | "userLogs";

function formatDate(value: string | null, withTime = false) {
  if (!value) return "N/A";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "N/A";
  return date.toLocaleString("en-IN", {
    month: "short",
    day: "numeric",
    year: "numeric",
    ...(withTime ? { hour: "2-digit", minute: "2-digit" } : {}),
  });
}

export default function AdminPage() {
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [busyUid, setBusyUid] = useState<string | null>(null);
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [summary, setSummary] = useState<Summary>({
    totalUsers: 0,
    activeToday: 0,
    activeSevenDays: 0,
    bannedUsers: 0,
    adminUsers: 0,
  });
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

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, async (user) => {
      if (!user) {
        window.location.href = "/";
        return;
      }
      const idToken = await user.getIdToken();
      setToken(idToken);
    });
    return () => unsub();
  }, []);

  const apiFetch = useCallback(async (
    path: string,
    options: RequestInit = {},
    tokenOverride?: string,
  ) => {
    const authToken = tokenOverride ?? token;
    const headers = new Headers(options.headers);
    if (authToken) headers.set("Authorization", `Bearer ${authToken}`);
    if (options.body) headers.set("Content-Type", "application/json");
    const res = await fetch(path, { ...options, headers });
    return res;
  }, [token]);

  const fetchUsers = useCallback(async (tokenValue?: string) => {
    setLoading(true);
    setMessage(null);
    try {
      const res = await apiFetch("/api/admin/users", {}, tokenValue);
      if (res.status === 403) {
        setIsForbidden(true);
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
    } catch (err) {
      const text = err instanceof Error ? err.message : "Unknown error";
      setMessage({ type: "error", text });
    } finally {
      setLoading(false);
    }
  }, [apiFetch]);

  useEffect(() => {
    if (!token) return;
    void fetchUsers(token);
  }, [token, fetchUsers]);

  useEffect(() => {
    if (!token || activeSection !== "dashboard") return;
    const timer = setInterval(() => {
      void fetchUsers();
    }, 30000);
    return () => clearInterval(timer);
  }, [activeSection, fetchUsers, token]);

  async function handleResetPassword(targetUserId: string) {
    setBusyUid(targetUserId);
    try {
      const res = await apiFetch("/api/admin/users", {
        method: "POST",
        body: JSON.stringify({ targetUserId }),
      });
      const data = (await res.json()) as
        | { success: true; resetLink: string }
        | { error: string };
      if (!res.ok || !("success" in data)) {
        throw new Error("error" in data ? data.error : "Could not generate reset link");
      }

      setResetLinkMap((prev) => ({ ...prev, [targetUserId]: data.resetLink }));
      await navigator.clipboard.writeText(data.resetLink);
      setMessage({
        type: "success",
        text: "Password reset link generated and copied to clipboard.",
      });
    } catch (err) {
      const text = err instanceof Error ? err.message : "Failed to reset password";
      setMessage({ type: "error", text });
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
      if (!res.ok || !data.success) {
        throw new Error(data.error ?? "Could not update user status");
      }

      setUsers((prev) =>
        prev.map((u) =>
          u.uid === user.uid ? { ...u, isBanned: action === "ban" } : u,
        ),
      );
      setSummary((prev) => ({
        ...prev,
        bannedUsers: prev.bannedUsers + (action === "ban" ? 1 : -1),
      }));
      setMessage({
        type: "success",
        text: action === "ban" ? "User banned." : "User unbanned.",
      });
    } catch (err) {
      const text = err instanceof Error ? err.message : "Failed to update ban";
      setMessage({ type: "error", text });
    } finally {
      setBusyUid(null);
    }
  }

  async function handleDeleteUser(user: AdminUser) {
    if (!window.confirm(`Delete ${user.email || user.uid}? This cannot be undone.`)) {
      return;
    }

    setBusyUid(user.uid);
    try {
      const res = await apiFetch("/api/admin/users", {
        method: "DELETE",
        body: JSON.stringify({ targetUserId: user.uid }),
      });
      const data = (await res.json()) as { success?: boolean; error?: string };
      if (!res.ok || !data.success) {
        throw new Error(data.error ?? "Could not delete user");
      }

      setUsers((prev) => prev.filter((u) => u.uid !== user.uid));
      setSummary((prev) => ({
        ...prev,
        totalUsers: Math.max(prev.totalUsers - 1, 0),
        bannedUsers: user.isBanned
          ? Math.max(prev.bannedUsers - 1, 0)
          : prev.bannedUsers,
        adminUsers:
          user.role === "Admin" ? Math.max(prev.adminUsers - 1, 0) : prev.adminUsers,
      }));
      setMessage({ type: "success", text: "User deleted successfully." });
    } catch (err) {
      const text = err instanceof Error ? err.message : "Failed to delete user";
      setMessage({ type: "error", text });
    } finally {
      setBusyUid(null);
    }
  }

  const filteredUsers = useMemo(() => {
    const q = search.toLowerCase().trim();
    if (!q) return users;
    return users.filter((user) => {
      return (
        user.uid.toLowerCase().includes(q) ||
        user.email.toLowerCase().includes(q) ||
        user.displayName.toLowerCase().includes(q) ||
        user.role.toLowerCase().includes(q)
      );
    });
  }, [search, users]);

  const activityFeed = useMemo(() => {
    return [...users]
      .sort((a, b) => {
        const aTime = a.lastSignInTime ? new Date(a.lastSignInTime).getTime() : 0;
        const bTime = b.lastSignInTime ? new Date(b.lastSignInTime).getTime() : 0;
        return bTime - aTime;
      })
      .slice(0, 6);
  }, [users]);

  const selectedUser = useMemo(() => {
    if (!selectedUserId) return users[0] ?? null;
    return users.find((u) => u.uid === selectedUserId) ?? users[0] ?? null;
  }, [users, selectedUserId]);

  useEffect(() => {
    if (!selectedUserId && users.length) {
      setSelectedUserId(users[0].uid);
    }
  }, [users, selectedUserId]);

  if (isForbidden) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-6">
        <div className="max-w-md w-full bg-white border border-slate-200 rounded-3xl p-8 text-center shadow-sm">
          <AlertCircle className="mx-auto text-rose-600 mb-4" size={36} />
          <h1 className="text-2xl font-black text-slate-900">Access Denied</h1>
          <p className="text-slate-600 mt-3">
            Your account is not marked as Admin. Ask an existing admin to set your role.
          </p>
          <Link
            href="/"
            className="mt-6 inline-flex items-center gap-2 px-5 py-3 rounded-xl bg-slate-900 text-white font-semibold"
          >
            <ArrowLeft size={16} /> Go Home
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#f3f6fb] pt-20">
      <div className="flex min-h-[calc(100vh-5rem)]">
        <aside className="hidden lg:flex w-64 bg-[#eef3fa] border-r border-slate-200/70 p-5 flex-col">
          <div className="pb-6 border-b border-slate-200/70">
            <h2 className="text-xl font-black text-slate-900">Admin Ledger</h2>
            <p className="text-[11px] uppercase tracking-[0.18em] text-slate-500 mt-1">Institutional Panel</p>
          </div>
          <nav className="mt-5 space-y-1 text-sm">
            <button
              onClick={() => setActiveSection("dashboard")}
              className={`w-full text-left px-3 py-2 rounded-lg font-semibold ${activeSection === "dashboard" ? "bg-indigo-600 text-white" : "text-slate-600 hover:bg-white"
                }`}
            >
              Dashboard
            </button>
            <button
              onClick={() => setActiveSection("userLogs")}
              className={`w-full text-left px-3 py-2 rounded-lg font-semibold ${activeSection === "userLogs" ? "bg-indigo-600 text-white" : "text-slate-600 hover:bg-white"
                }`}
            >
              User Logs
            </button>
            <div className="px-3 py-2 rounded-lg text-slate-600">Permissions</div>
            <div className="px-3 py-2 rounded-lg text-slate-600">Security</div>
            <div className="px-3 py-2 rounded-lg text-slate-600">Audit Trail</div>
          </nav>
          <div className="mt-auto bg-white border border-slate-200 rounded-xl p-3">
            <p className="text-xs font-semibold text-slate-500">System Health</p>
            <div className="w-full h-2 bg-slate-200 rounded-full mt-2 overflow-hidden">
              <div className="h-full w-[84%] bg-indigo-600 rounded-full" />
            </div>
          </div>
        </aside>

        <div className="flex-1 p-4 md:p-6 xl:p-8">
          <div className="bg-white border border-slate-200 rounded-2xl px-4 py-3 flex items-center justify-between gap-3">
            <div className="relative w-full max-w-md">
              <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search logs, IPs or users..."
                className="w-full pl-9 pr-3 py-2.5 bg-[#f4f7fc] border border-slate-200 rounded-xl text-sm outline-none focus:border-indigo-300"
              />
            </div>
            <div className="flex items-center gap-2">
              <button className="w-9 h-9 rounded-lg bg-[#f4f7fc] border border-slate-200 flex items-center justify-center text-slate-500">
                <Bell size={15} />
              </button>
              <button
                onClick={() => void fetchUsers()}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-indigo-600 text-white text-sm font-semibold hover:bg-indigo-700"
                disabled={loading}
              >
                <RefreshCcw size={14} className={loading ? "animate-spin" : ""} />
                Refresh
              </button>
            </div>
          </div>

          <div className="mt-5 mb-4 flex items-center gap-3 text-sm">
            <Link href="/dashboard" className="inline-flex items-center gap-1 text-slate-500 hover:text-slate-800">
              <ArrowLeft size={14} /> Back
            </Link>
            <span className="text-slate-300">/</span>
            <p className="font-semibold text-slate-900">
              {activeSection === "dashboard" ? "Dashboard Overview" : "User Log Session"}
            </p>
          </div>

          {activeSection === "dashboard" && (
            <>
              <div className="grid md:grid-cols-3 gap-4">
                <StatCard
                  label="Total Users"
                  value={summary.totalUsers}
                  tone="indigo"
                  icon={<Users size={16} />}
                  badgeText={cardMetrics.totalUsers.badgeText}
                  footerText={cardMetrics.totalUsers.footerText}
                  barPercent={cardMetrics.totalUsers.barPercent}
                />
                <StatCard
                  label="Active Sessions"
                  value={summary.activeSevenDays}
                  tone="violet"
                  icon={<ShieldCheck size={16} />}
                  badgeText={cardMetrics.activeSessions.badgeText}
                  footerText={cardMetrics.activeSessions.footerText}
                  barPercent={cardMetrics.activeSessions.barPercent}
                />
                <StatCard
                  label="Flagged Users"
                  value={summary.bannedUsers}
                  tone="rose"
                  icon={<ShieldAlert size={16} />}
                  badgeText={cardMetrics.flaggedUsers.badgeText}
                  footerText={cardMetrics.flaggedUsers.footerText}
                  barPercent={cardMetrics.flaggedUsers.barPercent}
                />
              </div>

              {message && (
                <div
                  className={`mt-4 rounded-xl border px-4 py-3 flex items-center gap-2 ${message.type === "success"
                      ? "bg-emerald-50 border-emerald-200 text-emerald-800"
                      : "bg-rose-50 border-rose-200 text-rose-800"
                    }`}
                >
                  {message.type === "success" ? <CheckCircle2 size={16} /> : <AlertCircle size={16} />}
                  <span className="text-sm font-medium">{message.text}</span>
                  <button onClick={() => setMessage(null)} className="ml-auto text-xs opacity-70">
                    Dismiss
                  </button>
                </div>
              )}

              <div className="mt-5 grid xl:grid-cols-[1fr_300px] gap-4">
                <section className="bg-white border border-slate-200 rounded-2xl overflow-hidden">
                  <div className="px-5 py-4 border-b border-slate-200">
                    <h2 className="text-2xl font-black text-slate-900 flex items-center gap-2">
                      <Users size={20} className="text-indigo-600" />
                      Active User Directory
                    </h2>

                    <p className="text-xs text-slate-400 mt-1">{ipNote}</p>
                  </div>
                  <div className="overflow-x-auto">
                    <table className="w-full min-w-[980px]">
                      <thead className="bg-gradient-to-b from-[#f6f8ff] to-[#eef2fa] border-y border-slate-200">
                        <tr>
                          <th className="px-5 py-3 text-left text-[12px] tracking-[0.08em] uppercase text-indigo-900 font-black">User Name</th>
                          <th className="px-5 py-3 text-left text-[12px] tracking-[0.08em] uppercase text-indigo-900 font-black">Email Address</th>
                          <th className="px-5 py-3 text-left text-[12px] tracking-[0.08em] uppercase text-indigo-900 font-black">Last Active</th>
                          <th className="px-5 py-3 text-left text-[12px] tracking-[0.08em] uppercase text-indigo-900 font-black">IP Address</th>
                          <th className="px-5 py-3 text-left text-[12px] tracking-[0.08em] uppercase text-indigo-900 font-black">Status</th>
                          <th className="px-5 py-3 text-center text-[12px] tracking-[0.08em] uppercase text-indigo-900 font-black">Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {loading ? (
                          <tr>
                            <td colSpan={6} className="px-5 py-16 text-center text-slate-500">
                              <Loader2 size={20} className="animate-spin mx-auto mb-2" />
                              Loading users...
                            </td>
                          </tr>
                        ) : filteredUsers.length === 0 ? (
                          <tr>
                            <td colSpan={6} className="px-5 py-16 text-center text-slate-500">
                              No users found.
                            </td>
                          </tr>
                        ) : (
                          filteredUsers.map((user) => {
                            const isBusy = busyUid === user.uid;
                            return (
                              <tr key={user.uid} className="border-t border-slate-100">
                                <td className="px-5 py-4">
                                  <div className="flex items-center gap-3">
                                    <div className="w-8 h-8 rounded-md bg-indigo-100 text-indigo-700 text-xs font-bold flex items-center justify-center">
                                      {user.displayName ? user.displayName.slice(0, 2).toUpperCase() : "AN"}
                                    </div>
                                    <div>
                                      <p className="text-sm font-bold text-slate-900">
                                        {user.displayName || "Anonymous User"}
                                      </p>
                                      <p className="text-xs text-slate-400">{user.uid.slice(0, 14)}...</p>
                                    </div>
                                  </div>
                                </td>
                                <td className="px-5 py-4 text-sm text-slate-600">{user.email || "No email"}</td>
                                <td className="px-5 py-4 text-sm text-slate-600">
                                  {formatDate(user.lastActivityDate) || formatDate(user.lastSignInTime)}
                                </td>
                                <td className="px-5 py-4 text-sm text-slate-600 font-mono">
                                  {user.ipAddress ?? "Not tracked"}
                                </td>
                                <td className="px-5 py-4">
                                  <span
                                    className={`inline-flex px-2.5 py-1 rounded-md text-xs font-semibold ${user.isBanned
                                        ? "bg-rose-100 text-rose-700"
                                        : "bg-emerald-100 text-emerald-700"
                                      }`}
                                  >
                                    {user.isBanned ? "Banned" : "Active"}
                                  </span>
                                </td>
                                <td className="px-5 py-4">
                                  <div className="flex justify-center items-center gap-2">
                                    <button
                                      className="p-2 rounded-lg border border-slate-200 hover:bg-slate-50 disabled:opacity-50"
                                      onClick={() => void handleResetPassword(user.uid)}
                                      disabled={isBusy}
                                      title="Reset password"
                                    >
                                      <KeyRound size={14} className="text-indigo-700" />
                                    </button>
                                    <button
                                      className="px-2.5 rounded-lg border border-indigo-200 text-xs text-indigo-700 hover:bg-indigo-50"
                                      onClick={() => {
                                        setSelectedUserId(user.uid);
                                        setActiveSection("userLogs");
                                      }}
                                    >
                                      Logs
                                    </button>
                                    <button
                                      className={`p-2 rounded-lg border disabled:opacity-50 ${user.isBanned
                                          ? "border-emerald-200 hover:bg-emerald-50"
                                          : "border-amber-200 hover:bg-amber-50"
                                        }`}
                                      onClick={() => void handleBanToggle(user)}
                                      disabled={isBusy}
                                      title={user.isBanned ? "Unban user" : "Ban user"}
                                    >
                                      <Ban size={14} className={user.isBanned ? "text-emerald-700" : "text-amber-700"} />
                                    </button>
                                    <button
                                      className="p-2 rounded-lg border border-rose-200 hover:bg-rose-50 disabled:opacity-50"
                                      onClick={() => void handleDeleteUser(user)}
                                      disabled={isBusy}
                                      title="Delete user"
                                    >
                                      <Trash2 size={14} className="text-rose-700" />
                                    </button>
                                  </div>
                                  {resetLinkMap[user.uid] && (
                                    <p className="text-[11px] text-slate-400 text-center mt-1">Reset link copied.</p>
                                  )}
                                </td>
                              </tr>
                            );
                          })
                        )}
                      </tbody>
                    </table>
                  </div>
                </section>

                <aside className="bg-[#eaf1fb] border border-slate-200 rounded-2xl p-4">
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="text-sm font-black uppercase tracking-[0.16em] text-slate-700">Live Activity Feed</h3>
                    <div className="w-2 h-2 rounded-full bg-emerald-500" />
                  </div>
                  <div className="space-y-3">
                    {activityFeed.length === 0 ? (
                      <p className="text-sm text-slate-500">No recent user activity.</p>
                    ) : (
                      activityFeed.map((item) => (
                        <div key={item.uid} className="bg-white/70 border border-white rounded-xl p-3">
                          <p className="text-sm font-semibold text-slate-800">
                            {item.isBanned ? "Flagged user event" : "Login activity"}
                          </p>
                          <p className="text-xs text-slate-500 mt-1">{item.displayName || item.email || item.uid}</p>
                          <p className="text-xs text-slate-400 mt-1 inline-flex items-center gap-1">
                            <Clock3 size={12} />
                            {formatDate(item.lastSignInTime, true)}
                          </p>
                        </div>
                      ))
                    )}
                  </div>
                  <button className="w-full mt-4 py-2 rounded-lg bg-white border border-slate-200 text-xs font-semibold text-slate-600">
                    Archive Feed Data
                  </button>
                </aside>
              </div>
            </>
          )}

          {activeSection === "userLogs" && selectedUser && (
            <UserLogsPanel
              user={selectedUser}
              onBackToList={() => setActiveSection("dashboard")}
            />
          )}
        </div>
      </div>
    </div>
  );
}

function StatCard({
  label,
  value,
  tone,
  icon,
  badgeText,
  footerText,
  barPercent,
}: {
  label: string;
  value: number;
  tone: "indigo" | "violet" | "rose";
  icon: React.ReactNode;
  badgeText: string;
  footerText: string;
  barPercent: number;
}) {
  const toneStyles = tone === "rose"
    ? {
      icon: "text-rose-700 bg-rose-100",
      badge: "text-rose-600 bg-rose-50",
      bar: "bg-rose-500",
    }
    : tone === "violet"
      ? {
        icon: "text-violet-700 bg-violet-100",
        badge: "text-violet-600 bg-violet-50",
        bar: "bg-violet-600",
      }
      : {
        icon: "text-indigo-700 bg-indigo-100",
        badge: "text-emerald-600 bg-emerald-50",
        bar: "bg-indigo-600",
      };

  return (
    <div className="bg-white border border-slate-200 rounded-2xl p-5 min-h-[196px]">
      <div className="flex items-start justify-between">
        <span className={`w-10 h-10 rounded-xl flex items-center justify-center ${toneStyles.icon}`}>{icon}</span>
        <span className={`text-[11px] px-2.5 py-1 rounded-md font-semibold ${toneStyles.badge}`}>{badgeText}</span>
      </div>
      <p className="text-sm text-slate-500 mt-8">{label}</p>
      <p className="text-[46px] leading-none font-black text-slate-900 mt-1">{value}</p>
      <p className="text-[11px] mt-5 uppercase tracking-[0.14em] font-bold text-slate-400">{footerText}</p>
      <div className="h-1 bg-slate-100 rounded-full mt-3">
        <div className={`h-1 rounded-full ${toneStyles.bar}`} style={{ width: `${barPercent}%` }} />
      </div>
    </div>
  );
}

function UserLogsPanel({
  user,
  onBackToList,
}: {
  user: AdminUser;
  onBackToList: () => void;
}) {
  const recentLogs = [
    {
      title: "Password Change Success",
      desc: "Initiated from admin portal from authenticated session.",
      time: "2 hours ago",
      status: "Trusted",
    },
    {
      title: "Login from Flagged Device",
      desc: "Verification required for unknown IP/device combination.",
      time: "Yesterday",
      status: "Requires review",
    },
    {
      title: "Audit Record Updated",
      desc: "Profile details were modified by admin action.",
      time: "3 days ago",
      status: "Trusted",
    },
  ];

  const ipRows = user.ipHistory;

  return (
    <div className="space-y-4">
      <button
        onClick={onBackToList}
        className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-slate-500 hover:text-slate-800"
      >
        <ArrowLeft size={14} />
        Back to user list
      </button>

      <section className="bg-white border border-slate-200 rounded-2xl p-5 flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 rounded-xl bg-slate-200 flex items-center justify-center text-xl font-black text-slate-700">
            {(user.displayName || "A").slice(0, 1).toUpperCase()}
          </div>
          <div>
            <h2 className="text-3xl font-black text-slate-900">{user.displayName || "Anonymous User"}</h2>
            <p className="text-sm text-slate-600">{user.role} - Security Account</p>
            <div className="flex items-center gap-2 mt-2">
              <span className="px-3 py-1 rounded-full text-xs font-semibold bg-blue-100 text-blue-700">Tier 1 Access</span>
              <span className="px-3 py-1 rounded-full text-xs font-semibold bg-indigo-100 text-indigo-700">Remote Certified</span>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button className="px-4 py-2 rounded-lg border border-rose-200 text-rose-700 text-sm font-semibold hover:bg-rose-50">
            Revoke Access
          </button>
          <button className="px-4 py-2 rounded-lg bg-rose-600 text-white text-sm font-semibold hover:bg-rose-700">
            Ban User
          </button>
        </div>
      </section>

      <div className="grid lg:grid-cols-[1fr_280px] gap-4">
        <section className="bg-white border border-slate-200 rounded-2xl p-5">
          <h3 className="font-bold text-slate-900 mb-4">Detailed Information</h3>
          <div className="grid md:grid-cols-2 gap-y-5 gap-x-8 text-sm">
            <InfoBlock label="Email Address" value={user.email || "No email"} />
            <InfoBlock label="Department" value="Global Internal Audit & Compliance" />
            <InfoBlock label="Administrative Role" value={user.role} />
            <InfoBlock label="Date Joined" value={formatDate(user.createdAt)} />
            <InfoBlock label="Last Log In IP" value={user.ipAddress ?? "Not tracked"} />
            <InfoBlock label="Credential Status" value={user.isBanned ? "Suspended" : "MFA Enabled"} />
          </div>
        </section>
        <section className="bg-[#eaf1fb] border border-slate-200 rounded-2xl p-5">
          <h3 className="font-bold text-slate-900 mb-4">Access Controls</h3>
          <ToggleRow title="Write Permissions" subtitle="Allow edits to audit logs" enabled />
          <ToggleRow title="Sensitive Data Export" subtitle="Allow bulk CSV downloads" enabled={false} />
          <ToggleRow title="Terminal Access" subtitle="Enable command-line interface" enabled />
          <button className="w-full mt-5 py-2.5 rounded-lg bg-white border border-slate-200 text-xs font-semibold text-indigo-700">
            Apply Changes
          </button>
        </section>
      </div>

      <div className="grid lg:grid-cols-[1fr_320px] gap-4">
        <section className="bg-white border border-slate-200 rounded-2xl p-5">
          <h3 className="font-bold text-slate-900 mb-4">Security & Activity History</h3>
          <div className="space-y-3">
            {recentLogs.map((log) => (
              <div key={log.title} className="border border-slate-100 rounded-xl p-3">
                <div className="flex items-center justify-between gap-2">
                  <p className="text-sm font-semibold text-slate-800">{log.title}</p>
                  <p className="text-[11px] uppercase font-semibold text-slate-400">{log.time}</p>
                </div>
                <p className="text-xs text-slate-500 mt-1">{log.desc}</p>
                <span className={`inline-flex mt-2 px-2 py-0.5 rounded text-[10px] font-semibold ${log.status === "Flagged" || log.status === "Requires review" ? "bg-rose-100 text-rose-700" : "bg-indigo-100 text-indigo-700"}`}>
                  {log.status}
                </span>
              </div>
            ))}
          </div>
        </section>
        <section className="bg-white border border-slate-200 rounded-2xl p-5">
          <h3 className="font-bold text-slate-900 mb-4">IP Access Log</h3>
          <div className="space-y-2">
            {ipRows.length === 0 ? (
              <p className="text-xs text-slate-500">No tracked IP sessions for this user yet.</p>
            ) : (
              ipRows.map((row) => (
                <div key={`${row.ipAddress}-${row.seenAt}`} className="grid grid-cols-[1fr_1fr_auto] items-center gap-2 text-xs border border-slate-100 rounded-lg p-2.5">
                  <div>
                    <p className="font-mono text-slate-700">{row.ipAddress}</p>
                    <p className="text-[10px] text-slate-400 mt-0.5">{formatDate(row.seenAt, true)}</p>
                  </div>
                  <p className="text-slate-500">{row.location}</p>
                  <span className={`px-2 py-0.5 rounded font-semibold ${row.status === "Observed" ? "bg-amber-100 text-amber-700" : "bg-indigo-100 text-indigo-700"}`}>
                    {row.status}
                  </span>
                </div>
              ))
            )}
          </div>
        </section>
      </div>
    </div>
  );
}

function InfoBlock({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="text-[11px] uppercase tracking-wide text-slate-500 font-semibold">{label}</p>
      <p className="text-sm text-slate-800 font-semibold mt-1">{value}</p>
    </div>
  );
}

function ToggleRow({
  title,
  subtitle,
  enabled,
}: {
  title: string;
  subtitle: string;
  enabled: boolean;
}) {
  return (
    <div className="flex items-center justify-between gap-3 py-2 border-b border-slate-200 last:border-b-0">
      <div>
        <p className="text-sm font-semibold text-slate-800">{title}</p>
        <p className="text-xs text-slate-500">{subtitle}</p>
      </div>
      <div
        className={`w-9 h-5 rounded-full relative ${enabled ? "bg-indigo-600" : "bg-slate-300"}`}
      >
        <div
          className={`absolute top-0.5 w-4 h-4 rounded-full bg-white transition-all ${enabled ? "left-4" : "left-0.5"
            }`}
        />
      </div>
    </div>
  );
}
