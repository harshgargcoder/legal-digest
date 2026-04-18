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
}: DashboardSectionProps) {
  const filteredUsers = users.filter(
    (u) =>
      u.email.toLowerCase().includes(search.toLowerCase()) ||
      u.displayName?.toLowerCase().includes(search.toLowerCase()) ||
      u.uid.includes(search),
  );

  return (
    <>
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-10">
        <div>
          <h1 className="text-[2.5rem] leading-none font-black text-slate-900 tracking-tight">System Intel</h1>
          <p className="text-slate-500 mt-2 font-medium flex items-center gap-2">
            <ShieldCheck size={16} className="text-indigo-600" />
            Real-time administrative monitoring active. {summary.totalUsers} nodes detected.
          </p>
        </div>
        <div className="flex items-center gap-2 bg-white p-1.5 rounded-2xl border border-slate-200 shadow-sm">
          <button
            onClick={() => fetchUsers()}
            className="px-4 py-2 bg-indigo-600 text-white rounded-xl text-xs font-black uppercase tracking-widest shadow-lg shadow-indigo-100"
          >
            Live Feed
          </button>
          <button className="px-4 py-2 text-slate-500 text-xs font-black uppercase tracking-widest hover:bg-slate-50 rounded-xl">
            History
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
        <StatCard
          label="Total Registered Nodes"
          value={summary.totalUsers}
          tone="indigo"
          icon={<Users size={20} />}
          badgeText={cardMetrics.totalUsers.badgeText}
          footerText={cardMetrics.totalUsers.footerText}
          barPercent={cardMetrics.totalUsers.barPercent}
        />
        <StatCard
          label="Authorized Active Nodes"
          value={summary.activeUsers}
          tone="violet"
          icon={<Activity size={20} />}
          badgeText={cardMetrics.activeSessions.badgeText}
          footerText={cardMetrics.activeSessions.footerText}
          barPercent={cardMetrics.activeSessions.barPercent}
        />
        <StatCard
          label="Flagged Security Alerts"
          value={summary.bannedUsers}
          tone="rose"
          icon={<Shield size={20} />}
          badgeText={cardMetrics.flaggedUsers.badgeText}
          footerText={cardMetrics.flaggedUsers.footerText}
          barPercent={cardMetrics.flaggedUsers.barPercent}
        />
      </div>

      <div className="grid lg:grid-cols-[1fr_380px] gap-8 flex-1">
        <div className="space-y-8">
          <div className="bg-white border border-slate-200 rounded-[2.5rem] p-8 shadow-sm relative overflow-hidden">
            <div className="absolute top-0 right-0 w-64 h-64 bg-slate-50 rounded-full -mr-32 -mt-32 z-0" />
            <div className="relative z-10">
              <div className="flex items-center justify-between mb-8">
                <h2 className="text-2xl font-black text-slate-900 tracking-tight">Node Directory</h2>
                <div className="relative group">
                  <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 transition-colors group-focus-within:text-indigo-600" size={18} />
                  <input
                    type="text"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    placeholder="Filter by name, email or UID..."
                    className="pl-11 pr-5 py-3 bg-slate-50 border border-slate-200 rounded-2xl text-sm outline-none focus:bg-white focus:border-indigo-400 focus:ring-4 focus:ring-indigo-500/5 transition-all w-64 lg:w-80 font-medium"
                  />
                </div>
              </div>

              <div className="overflow-x-auto -mx-8 px-8">
                <table className="w-full text-left border-separate border-spacing-y-3">
                  <thead>
                    <tr className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">
                      <th className="px-4 pb-2">Identification</th>
                      <th className="px-4 pb-2">Authorization</th>
                      <th className="px-4 pb-2">Network State</th>
                      <th className="px-4 pb-2 text-right">Command</th>
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
                        <tr key={user.uid} className="group hover:scale-[1.005] transition-transform duration-200">
                          <td className="bg-white border-y border-l border-slate-100 first:rounded-l-[1.5rem] px-4 py-4 shadow-sm group-hover:border-indigo-100">
                            <div className="flex items-center gap-4">
                              <div className="w-12 h-12 bg-slate-50 rounded-xl flex items-center justify-center font-black text-slate-700 border border-slate-100 group-hover:bg-indigo-50 group-hover:text-indigo-600 transition-colors">
                                {(user.displayName || "A").slice(0, 1).toUpperCase()}
                              </div>
                              <div>
                                <p className="font-bold text-slate-900 truncate max-w-[150px]">{user.displayName || "Anonymous"}</p>
                                <p className="text-xs text-slate-400 font-medium">{user.email || "No email"}</p>
                              </div>
                            </div>
                          </td>
                          <td className="bg-white border-y border-slate-100 px-4 py-4 shadow-sm group-hover:border-indigo-100">
                            <span className={`px-3 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-widest ${user.role === "Admin" ? "bg-indigo-50 text-indigo-700" : "bg-slate-50 text-slate-600"}`}>
                              {user.role}
                            </span>
                          </td>
                          <td className="bg-white border-y border-slate-100 px-4 py-4 shadow-sm group-hover:border-indigo-100">
                            <div className="flex flex-col gap-1">
                              <div className="flex items-center gap-2">
                                <div className={`w-1.5 h-1.5 rounded-full ${user.presenceStatus === "Online" ? "bg-emerald-500 animate-pulse" :
                                  user.presenceStatus === "Offline" ? "bg-slate-400" :
                                    user.presenceStatus === "Logged Out" ? "bg-amber-500" : "bg-rose-400"
                                  }`} />
                                <span className={`text-[10px] font-bold uppercase tracking-wider ${user.presenceStatus === "Online" ? "text-emerald-600" :
                                  user.presenceStatus === "Offline" ? "text-slate-500" :
                                    user.presenceStatus === "Logged Out" ? "text-amber-600" : "text-rose-500"
                                  }`}>
                                  {user.presenceStatus}
                                </span>
                              </div>
                              <p className="text-[10px] text-slate-400 font-medium">Joined {formatDate(user.createdAt)}</p>
                            </div>
                          </td>
                          <td className="bg-white border-y border-r border-slate-100 last:rounded-r-[1.5rem] px-4 py-4 shadow-sm group-hover:border-indigo-100 text-right">
                            <div className="flex items-center justify-end gap-2 transition-all duration-200">
                              <button
                                onClick={() => {
                                  setSelectedUserId(user.uid);
                                  setActiveSection("userLogs");
                                }}
                                className="p-2.5 bg-slate-50 text-slate-600 rounded-xl hover:bg-slate-900 hover:text-white transition-all border border-slate-100 shadow-sm"
                                title="Audit User Activity Logs"
                              >
                                <History size={16} />
                              </button>

                              <button
                                onClick={() => handleResetPassword(user.uid)}
                                disabled={busyUid === user.uid}
                                className="p-2.5 bg-indigo-50 text-indigo-600 rounded-xl hover:bg-indigo-600 hover:text-white transition-all border border-indigo-100 shadow-sm disabled:opacity-50"
                                title="Send Password Reset Email"
                              >
                                <Mail size={16} />
                              </button>

                              <button
                                onClick={() => handleBanToggle(user)}
                                disabled={busyUid === user.uid}
                                className={`p-2.5 rounded-xl transition-all border shadow-sm disabled:opacity-50 ${
                                  user.isBanned
                                    ? "bg-emerald-50 text-emerald-600 border-emerald-100 hover:bg-emerald-600 hover:text-white"
                                    : "bg-rose-50 text-rose-600 border-rose-100 hover:bg-rose-600 hover:text-white"
                                }`}
                                title={user.isBanned ? "Unban Node/User" : "Ban Node/User"}
                              >
                                <Ban size={16} />
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

        <aside className="space-y-6 h-fit sticky top-8">
          <div className="bg-slate-900 rounded-[2rem] p-8 text-white shadow-2xl relative overflow-hidden group">
            <div className="absolute bottom-0 right-0 w-32 h-32 bg-indigo-500/20 rounded-full -mr-16 -mb-16 blur-3xl transition-all group-hover:scale-150" />
            <div className="relative z-10">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center">
                  <Shield className="text-indigo-400" size={20} />
                </div>
                <h3 className="text-lg font-black tracking-tight">Security Intel</h3>
              </div>
              
              <div className="space-y-3">
                <div className="flex items-center justify-between p-4 bg-white/5 rounded-2xl border border-white/10 group-hover:bg-white/10 transition-all">
                  <span className="text-xs font-bold uppercase tracking-widest text-indigo-200">Firewall</span>
                  <span className="text-xs font-black text-emerald-400">Active</span>
                </div>
                <div className="flex items-center justify-between p-4 bg-white/5 rounded-2xl border border-white/10 group-hover:bg-white/10 transition-all">
                  <span className="text-xs font-bold uppercase tracking-widest text-indigo-200">Database</span>
                  <span className="text-xs font-black text-emerald-400">Stable</span>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white border border-slate-200 rounded-[2rem] p-8 shadow-sm">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-black text-slate-900 tracking-tight">Activity Stream</h3>
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            </div>
            <div className="space-y-5">
              {users.length === 0 ? (
                <div className="py-10 text-center">
                  <p className="text-xs text-slate-400 font-bold uppercase tracking-widest">No Activity Yet</p>
                </div>
              ) : (
                users.slice(0, 4).map((item, idx) => (
                  <div key={idx} className="flex gap-4 group">
                    <div className="flex flex-col items-center">
                      <div className="w-10 h-10 rounded-xl bg-slate-50 flex items-center justify-center font-black text-slate-400 text-[10px] border border-slate-100 group-hover:bg-indigo-50 group-hover:text-indigo-600 transition-colors">
                        {(item.displayName || "A").slice(0, 1).toUpperCase()}
                      </div>
                      {idx !== 3 && <div className="w-0.5 h-full bg-slate-50 my-1" />}
                    </div>
                    <div className="pb-4">
                      <p className="text-xs font-black text-slate-900">
                        {item.presenceStatus === "Online"
                          ? "Authenticated node active"
                          : (item.isBanned ? "Flagged user event" : "Login activity")}
                      </p>
                      <p className="text-xs text-slate-500 mt-1">{item.displayName || item.email || item.uid}</p>
                      <p className="text-xs text-slate-400 mt-1 inline-flex items-center gap-1">
                        <Activity size={12} />
                        {item.activityHistory && item.activityHistory.length > 0
                          ? formatDate(item.activityHistory[0].timestamp, true)
                          : formatDate(item.lastSignInTime, true)}
                      </p>
                    </div>
                  </div>
                ))
              )}
            </div>
            <button className="w-full mt-4 py-2 rounded-lg bg-white border border-slate-200 text-xs font-semibold text-slate-600">
              Archive Feed Data
            </button>
          </div>
        </aside>
      </div>
    </>
  );
}
