import React from "react";
import { Users, Search, Activity, Shield, ShieldCheck, History, Mail, Ban } from "lucide-react";
import { AdminUser, Summary, CardMetrics } from "../types";
import { formatDate } from "../shared/shared";
import { StatCard } from "./StatCard";

interface DashboardSectionProps {
  summary: Summary;
  cardMetrics: CardMetrics;
  users: AdminUser[];
  loading: boolean;
  search: string;
  setSearch: (v: string) => void;
  fetchUsers: () => void;
  ipNote: string;
  setSelectedUserId: (v: string | null) => void;
  setActiveSection: (v: "dashboard" | "userLogs" | "permissions" | "security" | "auditTrail") => void;
  busyUid: string | null;
  handleResetPassword: (uid: string) => void;
  handleBanToggle: (user: AdminUser) => void;
  isDarkMode: boolean;
  recentActivityLimit?: number;
}

export function DashboardSection({
  summary,
  cardMetrics,
  users,
  loading,
  search,
  setSearch,
  fetchUsers,
  ipNote,
  setSelectedUserId,
  setActiveSection,
  busyUid,
  handleResetPassword,
  handleBanToggle,
  isDarkMode,
  recentActivityLimit = 5,
}: DashboardSectionProps) {
  const filteredUsers = users.filter(
    (u) =>
      u.email?.toLowerCase().includes(search.toLowerCase()) ||
      u.displayName?.toLowerCase().includes(search.toLowerCase()) ||
      u.uid.includes(search),
  );

  return (
    <>
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-10">
        <div>
          <h1 className={`text-4xl font-black tracking-tight ${isDarkMode ? "text-white" : "text-slate-900"}`}>Overview</h1>
          <p className={`${isDarkMode ? "text-slate-400" : "text-slate-500"} mt-2 text-base font-medium flex items-center gap-2`}>
            <ShieldCheck size={18} className="text-indigo-500" />
            System is active. {summary.totalUsers} total users registered.
          </p>
        </div>
        <div className={`flex items-center gap-2 p-1 rounded-xl border shadow-sm ${isDarkMode ? "bg-slate-900 border-slate-800" : "bg-white border-slate-200"}`}>
          <button
            onClick={() => fetchUsers()}
            className="px-4 py-2 bg-indigo-600 text-white rounded-lg text-[10px] font-bold uppercase tracking-widest hover:bg-indigo-700 transition-all cursor-pointer"
          >
            Refresh Data
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
        <StatCard
          label="Total Users"
          value={summary.totalUsers}
          tone="indigo"
          icon={<Users size={18} />}
          badgeText={cardMetrics.totalUsers.badgeText}
          footerText={cardMetrics.totalUsers.footerText}
          barPercent={cardMetrics.totalUsers.barPercent}
          isDarkMode={isDarkMode}
        />
        <StatCard
          label="Active Today"
          value={summary.activeUsers}
          tone="violet"
          icon={<Activity size={18} />}
          badgeText={cardMetrics.activeSessions.badgeText}
          footerText={cardMetrics.activeSessions.footerText}
          barPercent={cardMetrics.activeSessions.barPercent}
          isDarkMode={isDarkMode}
        />
        <StatCard
          label="Flagged Accounts"
          value={summary.bannedUsers}
          tone="rose"
          icon={<Shield size={18} />}
          badgeText={cardMetrics.flaggedUsers.badgeText}
          footerText={cardMetrics.flaggedUsers.footerText}
          barPercent={cardMetrics.flaggedUsers.barPercent}
          isDarkMode={isDarkMode}
        />
      </div>

      <div className="grid lg:grid-cols-[1fr_350px] gap-6 flex-1">
        <div className="space-y-6">
          <div className={`border rounded-3xl p-6 shadow-sm relative overflow-hidden transition-colors ${isDarkMode ? "bg-slate-900 border-slate-800 text-white" : "bg-white border-slate-200"}`}>
            <div className="relative z-10">
              <div className="flex items-center justify-between mb-8">
                <h2 className="text-2xl font-black tracking-tight">User Management</h2>
                <div className="relative">
                  <Search className={`absolute left-4 top-1/2 -translate-y-1/2 ${isDarkMode ? "text-slate-500" : "text-slate-400"}`} size={18} />
                  <input
                    type="text"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    placeholder="Search users..."
                    className={`pl-11 pr-5 py-2.5 border rounded-xl text-sm outline-none transition-all w-64 lg:w-80 ${isDarkMode ? "bg-slate-800 border-slate-700 focus:border-indigo-500" : "bg-slate-50 border-slate-200 focus:bg-white focus:border-indigo-400"}`}
                  />
                </div>
              </div>

              <div className="overflow-x-auto -mx-8 px-8">
                <table className="w-full text-left border-separate border-spacing-y-3">
                  <thead>
                    <tr className={`text-[11px] font-black uppercase tracking-widest ${isDarkMode ? "text-slate-500" : "text-slate-400"}`}>
                      <th className="px-4 pb-3">User</th>
                      <th className="px-4 pb-3">Role</th>
                      <th className="px-4 pb-3">Status</th>
                      <th className="px-4 pb-3 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {loading ? (
                      Array.from({ length: 5 }).map((_, i) => (
                        <tr key={i} className="animate-pulse">
                          <td colSpan={4} className="h-16 bg-slate-50 rounded-2xl mb-2" />
                        </tr>
                      ))
                    ) : filteredUsers.length === 0 ? (
                      <tr>
                        <td colSpan={4} className="py-20 text-center">
                          <div className="inline-flex flex-col items-center">
                            <div className="w-16 h-16 bg-slate-100 rounded-2xl flex items-center justify-center mb-4">
                              <Search size={24} className="text-slate-400" />
                            </div>
                            <p className="text-slate-900 font-bold">No results matching search</p>
                            <p className="text-slate-500 text-sm mt-1">Try a different name, email or UID.</p>
                          </div>
                        </td>
                      </tr>
                    ) : (
                        filteredUsers.map((user) => (
                        <tr key={user.uid} className="transition-transform duration-200">
                          <td className={`border-y border-l first:rounded-l-2xl px-4 py-4 shadow-sm transition-colors ${isDarkMode ? "bg-slate-800 border-slate-700" : "bg-white border-slate-100"}`}>
                            <div className="flex items-center gap-4">
                              <div className={`w-12 h-12 rounded-xl flex items-center justify-center font-black text-sm transition-colors ${isDarkMode ? "bg-slate-700 text-slate-300" : "bg-slate-50 text-slate-700"}`}>
                                {(user.displayName || "A").slice(0, 1).toUpperCase()}
                              </div>
                              <div className="min-w-0">
                                <p className={`text-sm font-black truncate max-w-[150px] ${isDarkMode ? "text-white" : "text-slate-900"}`}>{user.displayName || "Anonymous"}</p>
                                <p className="text-xs text-slate-500 font-medium truncate max-w-[150px]">{user.email || "No email"}</p>
                              </div>
                            </div>
                          </td>
                          <td className={`border-y px-4 py-4 shadow-sm transition-colors ${isDarkMode ? "bg-slate-800 border-slate-700" : "bg-white border-slate-100"}`}>
                            <span className={`px-2.5 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-widest whitespace-nowrap ${user.role === "Admin" ? (isDarkMode ? "bg-indigo-900/40 text-indigo-400" : "bg-indigo-50 text-indigo-700") : (isDarkMode ? "bg-slate-700 text-slate-400" : "bg-slate-50 text-slate-600")}`}>
                              {user.role}
                            </span>
                          </td>
                          <td className={`border-y px-4 py-4 shadow-sm transition-colors ${isDarkMode ? "bg-slate-800 border-slate-700" : "bg-white border-slate-100"}`}>
                            <div className="flex flex-col gap-1">
                              <div className="flex items-center gap-2">
                                <div className={`w-1.5 h-1.5 rounded-full ${user.presenceStatus === "Online" ? "bg-emerald-500" : "bg-slate-400"}`} />
                                <span className={`text-[11px] font-black uppercase tracking-wide ${user.presenceStatus === "Online" ? "text-emerald-500" : "text-slate-500"}`}>
                                  {user.presenceStatus}
                                </span>
                              </div>
                              <p className="text-[10px] text-slate-500 font-medium whitespace-nowrap">Joined {formatDate(user.createdAt)}</p>
                            </div>
                          </td>
                          <td className={`border-y border-r last:rounded-r-2xl px-4 py-4 shadow-sm transition-colors text-right ${isDarkMode ? "bg-slate-800 border-slate-700" : "bg-white border-slate-100"}`}>
                            <div className="flex items-center justify-end gap-2">
                              <button
                                onClick={() => {
                                  setSelectedUserId(user.uid);
                                  setActiveSection("userLogs");
                                }}
                                className={`p-2.5 rounded-xl transition-all border cursor-pointer ${isDarkMode ? "bg-slate-700 border-slate-600 text-slate-300 hover:bg-slate-600" : "bg-slate-50 border-slate-100 text-slate-600 hover:bg-slate-200"}`}
                                title="Logs"
                              >
                                <History size={18} />
                              </button>

                              <button
                                onClick={() => handleResetPassword(user.uid)}
                                disabled={busyUid === user.uid}
                                className={`p-2.5 rounded-xl transition-all border cursor-pointer ${isDarkMode ? "bg-indigo-900/40 border-indigo-500/30 text-indigo-400 hover:bg-indigo-600 hover:text-white" : "bg-indigo-50 border-indigo-100 text-indigo-600 hover:bg-indigo-600 hover:text-white"}`}
                                title="Reset"
                              >
                                <Mail size={18} />
                              </button>

                              <button
                                onClick={() => handleBanToggle(user)}
                                disabled={busyUid === user.uid}
                                className={`p-2.5 rounded-xl transition-all border cursor-pointer ${
                                  user.isBanned
                                    ? (isDarkMode ? "bg-emerald-900/40 border-emerald-500/30 text-emerald-400 hover:bg-emerald-600 hover:text-white" : "bg-emerald-50 border-emerald-100 text-emerald-600 hover:bg-emerald-600 hover:text-white")
                                    : (isDarkMode ? "bg-rose-900/40 border-rose-500/30 text-rose-400 hover:bg-rose-600 hover:text-white" : "bg-rose-50 border-rose-100 text-rose-600 hover:bg-rose-600 hover:text-white")
                                }`}
                                title={user.isBanned ? "Unban" : "Ban"}
                              >
                                <Ban size={18} />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>

        <aside className="space-y-6 h-fit sticky top-6">
          <div className={`rounded-3xl p-6 transition-colors ${isDarkMode ? "bg-slate-900 border border-slate-800 text-white" : "bg-slate-900 text-white shadow-xl"}`}>
            <div className="flex items-center gap-3 mb-4">
              <Shield className="text-indigo-400" size={18} />
              <h3 className="text-sm font-bold uppercase tracking-widest">System Health</h3>
            </div>
            <div className="space-y-2">
              <div className={`flex items-center justify-between p-3 rounded-xl border ${isDarkMode ? "bg-slate-800 border-slate-700" : "bg-white/5 border-white/10"}`}>
                <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Database</span>
                <span className="text-[10px] font-black text-emerald-400">Stable</span>
              </div>
            </div>
          </div>

          <div className={`border rounded-3xl p-6 shadow-sm transition-colors ${isDarkMode ? "bg-slate-900 border-slate-800" : "bg-white border-slate-200"}`}>
            <div className="flex items-center justify-between mb-6">
              <h3 className={`text-sm font-black uppercase tracking-widest ${isDarkMode ? "text-white" : "text-slate-900"}`}>Recent Activity</h3>
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
            </div>
            <div className="space-y-4">
              {users.length === 0 ? (
                <p className="text-[10px] text-slate-500 font-bold uppercase text-center">No logs</p>
              ) : (
                users.slice(0, recentActivityLimit).map((item, idx) => (
                  <div key={idx} className="flex gap-3">
                    <div className={`w-8 h-8 rounded-lg flex items-center justify-center font-black text-[10px] border ${isDarkMode ? "bg-slate-800 border-slate-700 text-slate-400" : "bg-slate-50 border-slate-100 text-slate-400"}`}>
                      {(item.displayName || "A").slice(0, 1).toUpperCase()}
                    </div>
                    <div>
                      <p className={`text-[10px] font-bold ${isDarkMode ? "text-slate-200" : "text-slate-900"}`}>Login recorded</p>
                      <p className="text-[9px] text-slate-500 truncate max-w-[150px]">{item.email || item.uid}</p>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </aside>
      </div>
    </>
  );
}
