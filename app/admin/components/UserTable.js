import React, { useState, useEffect } from 'react';
import { Search, User, ChevronRight, X, Shield, Globe, Terminal, Activity, ChevronLeft } from 'lucide-react';
import { supabase } from '@/lib/supabase';

export default function UserTable({ users, revealEmails, search, setSearch }) {
  const [selectedUser, setSelectedUser] = useState(null);
  const [userIps, setUserIps] = useState([]);
  const [userSessions, setUserSessions] = useState([]);
  const [loadingDetails, setLoadingDetails] = useState(false);
  
  const [ipPage, setIpPage] = useState(0);
  const [sessionPage, setSessionPage] = useState(0);

  const maskEmail = (email) => {
    if (!email || email === 'No Email' || !email.includes('@')) return email || 'N/A';
    if (revealEmails) return email;
    const [name, domain] = email.split('@');
    if (!domain) return name;
    return `${name.charAt(0)}***@${domain}`;
  };

  const fetchUserDetails = async (user, iPage = 0, sPage = 0) => {
    setLoadingDetails(true);
    try {
      const res = await fetch("/api/admin/users/profile", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId: user.id, ipPage: iPage, sessionPage: sPage })
      });
      const data = await res.json();
      setUserIps(data.ips || []);
      setUserSessions(data.sessions || []);
    } catch (e) {
      console.error("Error fetching details:", e);
    } finally {
      setLoadingDetails(false);
    }
  };

  const handleOpenProfile = (user) => {
    setSelectedUser(user);
    setIpPage(0);
    setSessionPage(0);
    fetchUserDetails(user, 0, 0);
  };

  const changeIpPage = (delta) => {
    const next = Math.max(0, ipPage + delta);
    setIpPage(next);
    fetchUserDetails(selectedUser, next, sessionPage);
  };

  const changeSessionPage = (delta) => {
    const next = Math.max(0, sessionPage + delta);
    setSessionPage(next);
    fetchUserDetails(selectedUser, ipPage, next);
  };

  return (
    <div className="bg-slate-900/50 rounded-3xl border border-slate-800 flex flex-col h-full overflow-hidden relative">
      {/* HEADER */}
      <div className="p-6 border-b border-slate-800 flex items-center justify-between">
        <h3 className="text-sm font-black uppercase tracking-widest text-white">Platform Users</h3>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" size={14} />
          <input 
            type="text" 
            placeholder="Search Identity..."
            className="bg-slate-950 border border-slate-800 rounded-xl py-2 pl-9 pr-4 text-xs text-slate-300 focus:outline-none focus:border-indigo-500 transition-all w-64"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
      </div>

      {/* TABLE */}
      <div className="flex-1 overflow-y-auto custom-scrollbar">
        <table className="w-full text-left border-collapse">
          <thead className="bg-slate-950/50 sticky top-0 z-10">
            <tr className="text-[10px] font-black uppercase tracking-widest text-slate-500 border-b border-slate-800">
              <th className="px-6 py-4">Identity</th>
              <th className="px-6 py-4">Status</th>
              <th className="px-6 py-4">Moot Count</th>
              <th className="px-6 py-4"></th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800/50">
            {users.map((user) => (
              <tr 
                key={user.id} 
                onClick={() => handleOpenProfile(user)}
                className="hover:bg-indigo-500/5 transition-colors group cursor-pointer"
              >
                <td className="px-6 py-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-slate-800 flex items-center justify-center text-slate-400 group-hover:bg-indigo-600 group-hover:text-white transition-all">
                      <User size={20} />
                    </div>
                    <div>
                      <p className="text-sm font-bold text-slate-200">{user.name}</p>
                      <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">{maskEmail(user.email)}</p>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4">
                  <span className={`px-2 py-1 rounded-md text-[9px] font-black uppercase tracking-widest ${user.is_admin ? 'bg-indigo-500/10 text-indigo-500' : 'bg-slate-800 text-slate-500'}`}>
                    {user.is_admin ? 'Admin' : 'Member'}
                  </span>
                </td>
                <td className="px-6 py-4 text-xs font-black text-slate-400">
                  {user.sessionCount} Trials
                </td>
                <td className="px-6 py-4 text-right">
                  <ChevronRight size={18} className="text-slate-700 group-hover:text-indigo-500 transition-all inline" />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* DETAIL MODAL OVERLAY */}
      {selectedUser && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-slate-950/80 backdrop-blur-sm">
          <div className="bg-slate-900 border border-slate-800 w-full max-w-4xl max-h-[85vh] rounded-[2.5rem] overflow-hidden flex flex-col shadow-2xl">
            {/* Modal Header */}
            <div className="p-8 border-b border-slate-800 flex items-center justify-between bg-gradient-to-r from-slate-900 to-slate-950">
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 rounded-2xl bg-indigo-600 flex items-center justify-center text-white shadow-xl shadow-indigo-500/20">
                  <User size={32} />
                </div>
                <div>
                  <h2 className="text-2xl font-black text-white tracking-tight">{selectedUser.name}</h2>
                  <p className="text-sm font-bold text-slate-500">{selectedUser.email}</p>
                </div>
              </div>
              <button onClick={() => setSelectedUser(null)} className="p-3 rounded-full bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition-all">
                <X size={20} />
              </button>
            </div>

            {/* Modal Content */}
            <div className="flex-1 overflow-y-auto p-8 custom-scrollbar grid grid-cols-1 md:grid-cols-2 gap-8">
              {/* Left Column: Stats & IPs */}
              <div className="space-y-6">
                <div className="grid grid-cols-2 gap-4">
                  <div className="p-6 rounded-3xl bg-slate-950/50 border border-slate-800">
                    <Activity className="text-indigo-500 mb-2" size={20} />
                    <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Total Trials</p>
                    <p className="text-2xl font-black text-white">{selectedUser.sessionCount}</p>
                  </div>
                  <div className="p-6 rounded-3xl bg-slate-950/50 border border-slate-800">
                    <Globe className="text-blue-500 mb-2" size={20} />
                    <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Total Tokens</p>
                    <p className="text-2xl font-black text-white">{selectedUser.totalTokens?.toLocaleString()}</p>
                  </div>
                </div>

                <div className="bg-slate-950/30 rounded-3xl border border-slate-800 overflow-hidden flex flex-col">
                  <div className="px-6 py-4 border-b border-slate-800 bg-slate-950/50 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Shield size={14} className="text-indigo-400" />
                      <h4 className="text-[10px] font-black uppercase tracking-widest text-slate-400">Recent IP Logs</h4>
                    </div>
                    <div className="flex items-center gap-2">
                      <button onClick={() => changeIpPage(-1)} disabled={ipPage === 0 || loadingDetails} className="p-1 rounded bg-slate-800 text-slate-400 disabled:opacity-30"><ChevronLeft size={12} /></button>
                      <span className="text-[9px] font-black text-slate-500">P{ipPage + 1}</span>
                      <button onClick={() => changeIpPage(1)} disabled={userIps.length < 5 || loadingDetails} className="p-1 rounded bg-slate-800 text-slate-400 disabled:opacity-30"><ChevronRight size={12} /></button>
                    </div>
                  </div>
                  <div className="divide-y divide-slate-800/50 min-h-[250px]">
                    {userIps.map((ip, i) => (
                      <div key={i} className="px-6 py-3 flex items-center justify-between text-xs">
                        <div className="flex flex-col">
                          <span className="font-mono text-indigo-400 font-bold">{ip.ip_address}</span>
                          <span className="text-[9px] text-slate-500">{ip.isp || 'Internal Network'}</span>
                        </div>
                        <div className="text-right">
                          <p className="text-slate-300 font-bold">{ip.city || 'Unknown'}, {ip.country || 'N/A'}</p>
                          <p className="text-[9px] text-slate-600 uppercase font-black">{new Date(ip.seen_at).toLocaleString()}</p>
                        </div>
                      </div>
                    ))}
                    {userIps.length === 0 && <p className="p-6 text-center text-[10px] text-slate-600 uppercase font-black">No IP logs recorded</p>}
                  </div>
                </div>
              </div>

              {/* Right Column: Session Activity */}
              <div className="bg-slate-950/30 rounded-3xl border border-slate-800 flex flex-col overflow-hidden">
                <div className="px-6 py-4 border-b border-slate-800 bg-slate-950/50 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Terminal size={14} className="text-emerald-400" />
                    <h4 className="text-[10px] font-black uppercase tracking-widest text-slate-400">Moot Activity History</h4>
                  </div>
                  <div className="flex items-center gap-2">
                    <button onClick={() => changeSessionPage(-1)} disabled={sessionPage === 0 || loadingDetails} className="p-1 rounded bg-slate-800 text-slate-400 disabled:opacity-30"><ChevronLeft size={12} /></button>
                    <span className="text-[9px] font-black text-slate-500">P{sessionPage + 1}</span>
                    <button onClick={() => changeSessionPage(1)} disabled={userSessions.length < 5 || loadingDetails} className="p-1 rounded bg-slate-800 text-slate-400 disabled:opacity-30"><ChevronRight size={12} /></button>
                  </div>
                </div>
                <div className="flex-1 overflow-y-auto divide-y divide-slate-800/50 min-h-[350px]">
                  {userSessions.map((session, i) => (
                    <div key={i} className="px-6 py-4 hover:bg-white/5 transition-all">
                      <div className="flex justify-between items-start mb-1">
                        <p className="text-xs font-bold text-slate-200">Model: {session.primary_model || 'Standard'}</p>
                        <span className={`text-[8px] px-1.5 py-0.5 rounded font-black uppercase ${session.status === 'error' ? 'bg-rose-500/20 text-rose-500' : 'bg-emerald-500/20 text-emerald-500'}`}>
                          {session.status || 'Active'}
                        </span>
                      </div>
                      <div className="flex justify-between items-center text-[9px] font-black text-slate-600 uppercase tracking-widest">
                        <span>{new Date(session.start_time).toLocaleString()}</span>
                        <span className="text-indigo-500">{session.total_tokens || 0} Tokens</span>
                      </div>
                    </div>
                  ))}
                  {userSessions.length === 0 && <p className="p-8 text-center text-[10px] text-slate-600 uppercase font-black">No trial sessions found</p>}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
