import React, { useState } from "react";
import { AdminUser } from "../types";
import { InfoBlock, ToggleRow, formatDate, formatRelativeTime } from "../shared/shared";
import { Clock3, ChevronLeft, Mail, Ban, Trash2 } from "lucide-react";

export function UserLogsPanel({
  user,
  allUsers,
  onSelectUser,
  onBackToList,
  busyUid,
  handleResetPassword,
  handleBanToggle,
  handleDeleteUser,
}: {
  user: AdminUser;
  allUsers: AdminUser[];
  onSelectUser: (uid: string) => void;
  onBackToList: () => void;
  busyUid: string | null;
  handleResetPassword: (uid: string) => void;
  handleBanToggle: (user: AdminUser) => void;
  handleDeleteUser: (uid: string) => void;
}) {
  const [activityPage, setActivityPage] = useState(1);
  const [ipPage, setIpPage] = useState(1);
  const [sidebarPage, setSidebarPage] = useState(1);
  const itemsPerPage = 5;
  const sidebarLimit = 6;

  const ipRows = user.ipHistory || [];
  const highRiskCount = ipRows.filter(
    (r) => r.status === "Critical" || r.status === "Malicious",
  ).length;

  const activityHistory = user.activityHistory || [];
  const totalActivityPages = Math.ceil(activityHistory.length / itemsPerPage);
  const currentActivityItems = activityHistory.slice(
    (activityPage - 1) * itemsPerPage,
    activityPage * itemsPerPage,
  );

  const totalIpPages = Math.ceil(ipRows.length / itemsPerPage);
  const currentIpItems = ipRows.slice((ipPage - 1) * itemsPerPage, ipPage * itemsPerPage);

  // Status priority for sorting
  const statusPriority: Record<string, number> = {
    "Online": 0,
    "Offline": 1,
    "Logged Out": 2,
    "Inactive": 3,
    "Banned": 4
  };

  const sortedUsers = [...allUsers].sort((a, b) => {
    // Primary sort: Status
    const prioA = statusPriority[a.presenceStatus || "Offline"] ?? 10;
    const prioB = statusPriority[b.presenceStatus || "Offline"] ?? 10;
    
    if (prioA !== prioB) return prioA - prioB;
    
    // Secondary sort: Timestamp (Newest first)
    const timeA = new Date(a.createdAt || 0).getTime();
    const timeB = new Date(b.createdAt || 0).getTime();
    return timeB - timeA;
  });

  const totalSidebarPages = Math.ceil(sortedUsers.length / sidebarLimit);
  const currentSidebarUsers = sortedUsers.slice(
    (sidebarPage - 1) * sidebarLimit,
    sidebarPage * sidebarLimit
  );

  return (
    <div className="grid lg:grid-cols-[280px_1fr] gap-6">
      <aside className="bg-white border border-slate-200 rounded-2xl flex flex-col h-[calc(100vh-12rem)] overflow-hidden shadow-sm">
        <div className="p-4 border-b border-slate-100 bg-slate-50/50 flex items-center justify-between">
          <h3 className="text-xs font-black uppercase tracking-widest text-slate-400">Security Nodes</h3>
          <span className="text-[10px] font-bold text-slate-400 bg-slate-100 px-2 py-0.5 rounded-full">
            {sidebarPage}/{totalSidebarPages}
          </span>
        </div>
        <div className="flex-1 overflow-y-auto custom-scrollbar p-2 space-y-1">
          {currentSidebarUsers.map((u) => (
            <button
              key={u.uid}
              onClick={() => onSelectUser(u.uid)}
              className={`w-full text-left p-3 rounded-xl transition-all flex items-center gap-3 group ${u.uid === user.uid
                ? "bg-indigo-600 text-white shadow-md shadow-indigo-200"
                : "hover:bg-slate-50 text-slate-600"
                }`}
            >
              <div className={`w-8 h-8 rounded-lg flex-shrink-0 flex items-center justify-center text-[10px] font-black ${u.uid === user.uid ? "bg-white/20" : "bg-slate-100"
                }`}>
                {(u.displayName || "A").slice(0, 1).toUpperCase()}
              </div>
              <div className="overflow-hidden">
                <p className={`text-xs font-bold truncate ${u.uid === user.uid ? "text-white" : "text-slate-900"}`}>
                  {u.displayName || "Anonymous"}
                </p>
                <p className={`text-[10px] truncate ${u.uid === user.uid ? "text-white/60" : "text-slate-400"}`}>
                  {u.email || u.uid.slice(0, 8)}
                </p>
                <div className="flex items-center gap-1.5 mt-1">
                  <div className={`w-1.5 h-1.5 rounded-full ${u.presenceStatus === "Online" ? "bg-emerald-500 animate-pulse" :
                      u.presenceStatus === "Offline" ? "bg-slate-400" :
                        u.presenceStatus === "Logged Out" ? "bg-amber-500" : "bg-rose-400"
                    }`} />
                  <span className={`text-[9px] font-bold uppercase tracking-wider ${u.presenceStatus === "Online" ? "text-emerald-600" :
                      u.presenceStatus === "Offline" ? "text-slate-500" :
                        u.presenceStatus === "Logged Out" ? "text-amber-600" : "text-rose-500"
                    }`}>
                    {u.presenceStatus}
                  </span>
                </div>
              </div>
            </button>
          ))}
        </div>
      </aside>

      <div className="space-y-4">
        {highRiskCount > 0 && (
          <div className="rounded-xl border border-rose-200 bg-rose-50 text-rose-800 px-4 py-3 text-sm font-semibold">
            Security Warning: {highRiskCount} high-risk IP event(s) detected for this user.
          </div>
        )}

        <section className="bg-white border border-slate-200 rounded-2xl p-5 flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-xl bg-slate-200 flex items-center justify-center text-xl font-black text-slate-700">
              {(user.displayName || "A").slice(0, 1).toUpperCase()}
            </div>
            <div>
              <div className="flex items-center gap-3">
                <h2 className="text-3xl font-black text-slate-900">{user.displayName || "Anonymous User"}</h2>
                <span className={`px-2.5 py-1 rounded-lg text-[10px] font-black uppercase tracking-widest ${user.presenceStatus === "Online" ? "bg-emerald-100 text-emerald-700" :
                    user.presenceStatus === "Offline" ? "bg-slate-100 text-slate-600" :
                      user.presenceStatus === "Logged Out" ? "bg-amber-100 text-amber-700" : "bg-rose-100 text-rose-700"
                  }`}>
                  {user.presenceStatus}
                </span>
              </div>
              <p className="text-sm text-slate-600">{user.role} - Security Account</p>
              <div className="flex items-center gap-2 mt-2">
                <span className="px-3 py-1 rounded-full text-xs font-semibold bg-blue-100 text-blue-700">Tier 1 Access</span>
                <span className="px-3 py-1 rounded-full text-xs font-semibold bg-indigo-100 text-indigo-700">Remote Certified</span>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={() => onBackToList()}
              className="p-2.5 bg-slate-50 text-slate-600 rounded-xl hover:bg-indigo-600 hover:text-white transition-all border border-slate-100 shadow-sm"
              title="Return to Main Dashboard"
            >
              <ChevronLeft size={18} />
            </button>
            <button
              onClick={() => handleResetPassword(user.uid)}
              disabled={busyUid === user.uid}
              className="p-2.5 bg-indigo-50 text-indigo-600 rounded-xl hover:bg-indigo-600 hover:text-white transition-all border border-indigo-100 shadow-sm disabled:opacity-50"
              title="Send Official Password Reset Email"
            >
              <Mail size={18} />
            </button>
            <button
              onClick={() => handleBanToggle(user)}
              disabled={busyUid === user.uid}
              className={`p-2.5 rounded-xl transition-all border shadow-sm disabled:opacity-50 ${user.isBanned
                ? "bg-emerald-50 text-emerald-700 border-emerald-100 hover:bg-emerald-600 hover:text-white"
                : "bg-rose-50 text-rose-700 border-rose-100 hover:bg-rose-600 hover:text-white"
                }`}
              title={user.isBanned ? "Lift Ban (Unban User)" : "Apply Ban (Suspend User)"}
            >
              <Ban size={18} />
            </button>
            <button
              onClick={() => handleDeleteUser(user.uid)}
              disabled={busyUid === user.uid}
              className="p-2.5 bg-rose-600 text-white rounded-xl hover:bg-rose-700 transition-all border border-rose-700 shadow-lg shadow-rose-200"
              title="PERMANENTLY Delete User & Database Records"
            >
              <Trash2 size={18} />
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
              {activityHistory.length === 0 ? (
                <p className="text-xs text-slate-500">No real activity events available for this user yet.</p>
              ) : (
                <>
                  {currentActivityItems.map((log) => (
                    <div key={`${log.title}-${log.timestamp}`} className="border border-slate-100 rounded-xl p-3">
                      <div className="flex items-center justify-between gap-2">
                        <p className="text-sm font-semibold text-slate-800">{log.title}</p>
                        <p className="text-[11px] uppercase font-semibold text-slate-400">
                          {formatRelativeTime(log.timestamp)}
                        </p>
                      </div>
                      <p className="text-xs text-slate-500 mt-1">{log.description}</p>
                      <span
                        className={`inline-flex mt-2 px-2 py-0.5 rounded text-[10px] font-semibold ${log.status === "Malicious"
                          ? "bg-rose-100 text-rose-700"
                          : log.status === "Critical"
                            ? "bg-orange-100 text-orange-700"
                            : log.status === "Warning"
                              ? "bg-amber-100 text-amber-700"
                              : "bg-indigo-100 text-indigo-700"
                          }`}
                      >
                        {log.status}
                      </span>
                    </div>
                  ))}
                  {totalActivityPages > 1 && (
                    <div className="flex items-center justify-between mt-4">
                      <button
                        onClick={() => setActivityPage((p) => Math.max(1, p - 1))}
                        disabled={activityPage === 1}
                        className="px-3 py-1.5 rounded-lg border border-slate-200 text-xs font-semibold text-slate-600 disabled:opacity-50 hover:bg-slate-50"
                      >
                        Previous
                      </button>
                      <span className="text-xs font-semibold text-slate-500">
                        Page {activityPage} of {totalActivityPages}
                      </span>
                      <button
                        onClick={() => setActivityPage((p) => Math.min(totalActivityPages, p + 1))}
                        disabled={activityPage === totalActivityPages}
                        className="px-3 py-1.5 rounded-lg border border-slate-200 text-xs font-semibold text-slate-600 disabled:opacity-50 hover:bg-slate-50"
                      >
                        Next
                      </button>
                    </div>
                  )}
                </>
              )}
            </div>
          </section>
          <section className="bg-white border border-slate-200 rounded-2xl p-5">
            <h3 className="font-bold text-slate-900 mb-4">IP Access Log</h3>
            <div className="space-y-2">
              {ipRows.length === 0 ? (
                <p className="text-xs text-slate-500">No tracked IP sessions for this user yet.</p>
              ) : (
                <>
                  {currentIpItems.map((row) => (
                    <div key={`${row.ipAddress}-${row.seenAt}`} className="grid grid-cols-[1fr_1fr_auto] items-center gap-2 text-xs border border-slate-100 rounded-lg p-2.5">
                      <div>
                        <p className="font-mono text-slate-700">{row.ipAddress}</p>
                        <p className="text-[10px] text-slate-400 mt-0.5">{formatDate(row.seenAt, true)}</p>
                      </div>
                      <div>
                        <p className="text-slate-500">{row.location}</p>
                        {row.riskReason && row.status !== "Trusted" && (
                          <p className="text-[10px] text-slate-400 mt-0.5 line-clamp-2">{row.riskReason}</p>
                        )}
                      </div>
                      <span
                        className={`px-2 py-0.5 rounded font-semibold ${row.status === "Malicious"
                          ? "bg-rose-100 text-rose-700"
                          : row.status === "Critical"
                            ? "bg-orange-100 text-orange-700"
                            : row.status === "Warning"
                              ? "bg-amber-100 text-amber-700"
                              : "bg-indigo-100 text-indigo-700"
                          }`}
                      >
                        {row.status}
                      </span>
                    </div>
                  ))}
                  {totalIpPages > 1 && (
                    <div className="flex items-center justify-between mt-4">
                      <button
                        onClick={() => setIpPage((p) => Math.max(1, p - 1))}
                        disabled={ipPage === 1}
                        className="px-3 py-1.5 rounded-lg border border-slate-200 text-xs font-semibold text-slate-600 disabled:opacity-50 hover:bg-slate-50"
                      >
                        Previous
                      </button>
                      <span className="text-xs font-semibold text-slate-500">
                        Page {ipPage} of {totalIpPages}
                      </span>
                      <button
                        onClick={() => setIpPage((p) => Math.min(totalIpPages, p + 1))}
                        disabled={ipPage === totalIpPages}
                        className="px-3 py-1.5 rounded-lg border border-slate-200 text-xs font-semibold text-slate-600 disabled:opacity-50 hover:bg-slate-50"
                      >
                        Next
                      </button>
                    </div>
                  )}
                </>
              )}
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}
