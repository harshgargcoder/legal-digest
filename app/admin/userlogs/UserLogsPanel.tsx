"use client";

import React, { useState } from "react";
import {
  History,
  Shield,
  Clock,
  ChevronLeft,
  Mail,
  Ban,
  Trash2,
  Lock,
  Search,
  Activity,
  Globe
} from "lucide-react";
import { AdminUser } from "../types";
import { InfoBlock, formatDate } from "../shared/shared";

interface UserLogsPanelProps {
  user: AdminUser;
  allUsers: AdminUser[];
  onSelectUser: (uid: string) => void;
  onBackToList: () => void;
  busyUid: string | null;
  handleResetPassword: (uid: string) => void;
  handleBanToggle: (user: AdminUser) => void;
  handleDeleteUser: (uid: string) => void;
  isDarkMode: boolean;
}

export default function UserLogsPanel({
  user,
  allUsers,
  onSelectUser,
  onBackToList,
  busyUid,
  handleResetPassword,
  handleBanToggle,
  handleDeleteUser,
  isDarkMode,
}: UserLogsPanelProps) {
  const [sidebarPage, setSidebarPage] = useState(1);
  const sidebarLimit = 5;

  const [historyPage, setHistoryPage] = useState(1);
  const historyLimit = 5;

  const [ipPage, setIpPage] = useState(1);
  const ipLimit = 5;

  const activityHistory = user.activityHistory || [];
  const ipRows = user.ipHistory || [];

  const totalHistoryPages = Math.max(1, Math.ceil(activityHistory.length / historyLimit));
  const currentHistoryItems = activityHistory.slice((historyPage - 1) * historyLimit, historyPage * historyLimit);

  const totalIpPages = Math.max(1, Math.ceil(ipRows.length / ipLimit));
  const currentIpItems = ipRows.slice((ipPage - 1) * ipLimit, ipPage * ipLimit);

  const sortedUsers = [...allUsers].sort((a, b) => {
    const statusPriority: Record<string, number> = { Online: 1, Inactive: 2, "Logged Out": 3, Offline: 4 };
    const prioA = statusPriority[a.presenceStatus || "Offline"] ?? 10;
    const prioB = statusPriority[b.presenceStatus || "Offline"] ?? 10;
    return prioA !== prioB ? prioA - prioB : new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime();
  });

  const totalSidebarPages = Math.ceil(sortedUsers.length / sidebarLimit);
  const currentSidebarUsers = sortedUsers.slice((sidebarPage - 1) * sidebarLimit, sidebarPage * sidebarLimit);

  // Common Container Component for uniformity
  const LogBox = ({ title, icon: Icon, children, currentPage, totalPages, onPrev, onNext, colorClass }: any) => (
    <div className={`flex flex-col border rounded-3xl overflow-hidden shadow-sm transition-all h-[520px] ${isDarkMode ? "bg-slate-900 border-slate-800" : "bg-white border-slate-200"}`}>
      <div className={`p-5 border-b flex items-center justify-between ${isDarkMode ? "bg-slate-800/50 border-slate-800" : "bg-slate-50/50 border-slate-100"}`}>
        <div className="flex items-center gap-3">
          <div className={`p-2 rounded-xl ${colorClass}`}>
            <Icon size={18} />
          </div>
          <h3 className={`text-[11px] font-black uppercase tracking-[0.2em] ${isDarkMode ? "text-slate-300" : "text-slate-600"}`}>{title}</h3>
        </div>
        <span className="text-[10px] font-black text-indigo-500 bg-indigo-50 dark:bg-indigo-500/10 px-2 py-1 rounded-lg">{currentPage} / {totalPages}</span>
      </div>
      <div className="flex-1 p-4 space-y-3 overflow-y-auto custom-scrollbar">
        {children}
      </div>
      {totalPages > 1 && (
        <div className={`p-4 border-t flex items-center justify-between ${isDarkMode ? "border-slate-800 bg-slate-800/20" : "border-slate-100 bg-slate-50/20"}`}>
          <button onClick={onPrev} disabled={currentPage === 1} className="p-2 rounded-xl border border-slate-200 dark:border-slate-700 disabled:opacity-30 cursor-pointer hover:bg-white dark:hover:bg-slate-800 transition-all shadow-sm"><ChevronLeft size={16} /></button>
          <span className="text-[9px] font-black uppercase tracking-widest text-slate-400">Navigation</span>
          <button onClick={onNext} disabled={currentPage === totalPages} className="p-2 rounded-xl border border-slate-200 dark:border-slate-700 disabled:opacity-30 rotate-180 cursor-pointer hover:bg-white dark:hover:bg-slate-800 transition-all shadow-sm"><ChevronLeft size={16} /></button>
        </div>
      )}
    </div>
  );

  return (
    <div className="flex flex-col gap-8 w-full max-w-[1500px] mx-auto animate-in fade-in slide-in-from-bottom-4 duration-500">
      {/* 1. Unified Profile Header */}
      <section className={`border rounded-[32px] p-8 flex flex-col lg:flex-row lg:items-center justify-between gap-8 transition-all shadow-md ${isDarkMode ? "bg-slate-900 border-slate-800" : "bg-white border-slate-200"}`}>
        <div className="flex items-center gap-8">
          <div className={`w-28 h-28 rounded-3xl flex items-center justify-center text-4xl font-black shadow-inner border-4 ${isDarkMode ? "bg-slate-800 border-slate-800/50 text-slate-500" : "bg-slate-50 border-white text-slate-700"}`}>
            {(user.displayName || "A").slice(0, 1).toUpperCase()}
          </div>
          <div>
            <div className="flex items-center gap-4">
              <h2 className={`text-4xl font-black tracking-tighter ${isDarkMode ? "text-white" : "text-slate-900"}`}>{user.displayName || "Anonymous"}</h2>
              <div className={`px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-[0.2em] flex items-center gap-2 ${user.presenceStatus === "Online" ? "bg-emerald-100 text-emerald-700" : "bg-slate-100 text-slate-500"}`}>
                <div className={`w-2 h-2 rounded-full ${user.presenceStatus === "Online" ? "bg-emerald-500 animate-pulse" : "bg-slate-400"}`} />
                {user.presenceStatus}
              </div>
            </div>
            <p className="text-sm font-bold text-slate-500 mt-2 uppercase tracking-widest">{user.role} — Security Access Member</p>
            <div className="flex items-center gap-3 mt-5">
              <span className={`px-4 py-2 rounded-2xl text-[10px] font-black uppercase tracking-widest ${isDarkMode ? "bg-indigo-500/10 text-indigo-400" : "bg-blue-50 text-blue-600 border border-blue-100 shadow-sm"}`}>Tier 1 Administrator</span>
              <span className={`px-4 py-2 rounded-2xl text-[10px] font-black uppercase tracking-widest ${isDarkMode ? "bg-emerald-500/10 text-emerald-400" : "bg-emerald-50 text-emerald-600 border border-emerald-100 shadow-sm"}`}>Verified Identity</span>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-3 bg-slate-50 dark:bg-slate-800/40 p-3 rounded-3xl border border-slate-100 dark:border-slate-800 shadow-inner">
          <button onClick={onBackToList} className={`p-4 rounded-2xl transition-all border font-black uppercase text-[10px] tracking-widest flex items-center gap-2 hover:scale-105 active:scale-95 ${isDarkMode ? "bg-slate-800 border-slate-700 text-slate-400 hover:text-white" : "bg-white border-slate-200 text-slate-600 hover:bg-slate-50 shadow-sm"}`}>
            <ChevronLeft size={20} /> Back
          </button>
          <div className={`h-10 w-[1px] mx-2 ${isDarkMode ? "bg-slate-700" : "bg-slate-200"}`} />
          <button onClick={() => handleResetPassword(user.uid)} disabled={busyUid === user.uid} className={`p-4 rounded-2xl transition-all border hover:scale-105 active:scale-95 ${isDarkMode ? "bg-indigo-900/40 border-indigo-500/30 text-indigo-400 hover:bg-indigo-600 hover:text-white" : "bg-indigo-50 border-indigo-100 text-indigo-600 hover:bg-indigo-600 hover:text-white shadow-sm"}`} title="Reset Password"><Mail size={22} /></button>
          <button onClick={() => handleBanToggle(user)} disabled={busyUid === user.uid} className={`p-4 rounded-2xl transition-all border hover:scale-105 active:scale-95 ${user.isBanned ? "bg-rose-600 text-white border-rose-700 shadow-rose-200 shadow-lg" : isDarkMode ? "bg-slate-800 border-slate-700 text-slate-400 hover:bg-rose-600 hover:text-white" : "bg-white border-slate-200 text-slate-600 hover:bg-rose-50 hover:text-rose-600 shadow-sm"}`} title={user.isBanned ? "Unban User" : "Ban User"}><Ban size={22} /></button>
          <button onClick={() => handleDeleteUser(user.uid)} disabled={busyUid === user.uid} className="p-4 bg-rose-600 text-white rounded-2xl hover:bg-rose-700 transition-all border border-rose-700 shadow-xl shadow-rose-200 hover:scale-105 active:scale-95" title="Delete Account"><Trash2 size={22} /></button>
        </div>
      </section>

      {/* 2. Log Containers - All Styled Identically */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
        {/* Security Nodes Container */}
        <LogBox 
          title="Security Nodes" 
          icon={Shield} 
          colorClass="bg-indigo-100 text-indigo-600 dark:bg-indigo-500/20 dark:text-indigo-400"
          currentPage={sidebarPage}
          totalPages={totalSidebarPages}
          onPrev={() => setSidebarPage(p => Math.max(1, p - 1))}
          onNext={() => setSidebarPage(p => Math.min(totalSidebarPages, p + 1))}
        >
          {currentSidebarUsers.map((u) => (
            <button key={u.uid} onClick={() => onSelectUser(u.uid)} className={`w-full text-left p-4 rounded-2xl transition-all flex items-center gap-4 group cursor-pointer ${u.uid === user.uid ? "bg-indigo-600 text-white shadow-xl shadow-indigo-200" : isDarkMode ? "hover:bg-slate-800 text-slate-400" : "hover:bg-slate-50 text-slate-600 border border-transparent hover:border-slate-200"}`}>
              <div className={`w-10 h-10 rounded-xl flex-shrink-0 flex items-center justify-center text-[12px] font-black ${u.uid === user.uid ? "bg-white/20" : isDarkMode ? "bg-slate-800 text-slate-500" : "bg-slate-100"}`}>
                {(u.displayName || "A").slice(0, 1).toUpperCase()}
              </div>
              <div className="overflow-hidden">
                <p className={`text-[11px] font-black truncate ${u.uid === user.uid ? "text-white" : isDarkMode ? "text-slate-200" : "text-slate-900"}`}>{u.displayName || "Anonymous"}</p>
                <p className={`text-[9px] font-medium truncate opacity-70 ${u.uid === user.uid ? "text-white/80" : "text-slate-500"}`}>{u.email || u.uid.slice(0, 8)}</p>
                <div className="flex items-center gap-2 mt-1">
                  <div className={`w-1.5 h-1.5 rounded-full ${u.presenceStatus === "Online" ? "bg-emerald-400 animate-pulse" : "bg-slate-400"}`} />
                  <span className="text-[9px] font-black uppercase tracking-widest opacity-60">{u.presenceStatus}</span>
                </div>
              </div>
            </button>
          ))}
        </LogBox>

        {/* Activity Log Container */}
        <LogBox 
          title="Activity Log" 
          icon={Activity} 
          colorClass="bg-amber-100 text-amber-600 dark:bg-amber-500/20 dark:text-amber-400"
          currentPage={historyPage}
          totalPages={totalHistoryPages}
          onPrev={() => setHistoryPage(p => Math.max(1, p - 1))}
          onNext={() => setHistoryPage(p => Math.min(totalHistoryPages, p + 1))}
        >
          {activityHistory.length === 0 ? (
            <div className="h-full flex flex-center items-center justify-center flex-col opacity-40 py-10">
              <Clock size={32} className="mb-2" />
              <p className="text-[10px] font-black uppercase tracking-widest">No Events</p>
            </div>
          ) : (
            currentHistoryItems.map((log: any, i: number) => (
              <div key={i} className={`p-4 rounded-2xl border transition-all ${isDarkMode ? "bg-slate-800/50 border-slate-700" : "bg-slate-50/50 border-slate-100"}`}>
                <div className="flex items-center justify-between gap-3">
                  <p className={`text-[10px] font-black uppercase tracking-wider ${isDarkMode ? "text-white" : "text-slate-800"}`}>{log.title}</p>
                  <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest whitespace-nowrap">{formatDate(log.timestamp, true)}</p>
                </div>
                <p className="text-[9px] font-bold text-slate-500 mt-1 line-clamp-1">{log.description}</p>
              </div>
            ))
          )}
        </LogBox>

        {/* IP Access Container */}
        <LogBox 
          title="IP History" 
          icon={Globe} 
          colorClass="bg-emerald-100 text-emerald-600 dark:bg-emerald-500/20 dark:text-emerald-400"
          currentPage={ipPage}
          totalPages={totalIpPages}
          onPrev={() => setIpPage(p => Math.max(1, p - 1))}
          onNext={() => setIpPage(p => Math.min(totalIpPages, p + 1))}
        >
          {ipRows.length === 0 ? (
            <div className="h-full flex flex-center items-center justify-center flex-col opacity-40 py-10">
              <Lock size={32} className="mb-2" />
              <p className="text-[10px] font-black uppercase tracking-widest">No IP Data</p>
            </div>
          ) : (
            currentIpItems.map((row: any, i: number) => (
              <div key={i} className={`p-4 rounded-2xl border ${isDarkMode ? "bg-slate-800/50 border-slate-700" : "bg-white border-slate-100 shadow-sm"}`}>
                <div className="flex items-center justify-between gap-3">
                  <p className={`font-mono text-[10px] font-black ${isDarkMode ? "text-slate-200" : "text-slate-900"}`}>{row.ipAddress}</p>
                  <span className={`px-2 py-0.5 rounded text-[8px] font-black uppercase tracking-widest ${row.status === 'Malicious' ? 'bg-rose-100 text-rose-700' : 'bg-emerald-100 text-emerald-700 shadow-sm'}`}>{row.status}</span>
                </div>
                <div className="flex items-center justify-between mt-2">
                  <p className="text-[9px] font-black text-slate-500 uppercase tracking-widest">{row.location}</p>
                  <p className="text-[8px] font-bold text-slate-400">{formatDate(row.seenAt, true)}</p>
                </div>
              </div>
            ))
          )}
        </LogBox>
      </div>

      {/* 3. Bottom Information Card */}
      <section className={`border rounded-[32px] p-8 transition-all shadow-sm ${isDarkMode ? "bg-slate-900 border-slate-800" : "bg-white border-slate-200"}`}>
        <h3 className={`text-xs font-black uppercase tracking-[0.3em] mb-10 text-center ${isDarkMode ? "text-slate-400" : "text-slate-500"}`}>Security Identification Matrix</h3>
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-y-12 gap-x-16">
          <InfoBlock label="Verification Email" value={user.email || "No contact data"} isDarkMode={isDarkMode} />
          <InfoBlock label="Security Department" value="Global Audit & Compliance" isDarkMode={isDarkMode} />
          <InfoBlock label="Administrative Rank" value={user.role} isDarkMode={isDarkMode} />
          <InfoBlock label="Node Registration" value={formatDate(user.createdAt)} isDarkMode={isDarkMode} />
          <InfoBlock label="Last Known Entry" value={user.ipAddress ?? "Internal Bridge"} isDarkMode={isDarkMode} />
          <InfoBlock label="Current Validity" value={user.isBanned ? "Revoked / Flagged" : "Active Clearance"} isDarkMode={isDarkMode} />
        </div>
      </section>
    </div>
  );
}
