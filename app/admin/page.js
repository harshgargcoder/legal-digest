"use client";

import React, { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { auth } from "@/lib/firebase";
import { signOut } from "firebase/auth";
import { 
  RefreshCw, 
  LogOut, 
  Lock, 
  ChevronRight,
  ChevronLeft
} from "lucide-react";

// Components
import SummaryCards from "./components/SummaryCards";
import LLMHealth from "./components/LLMHealth";
import UserTable from "./components/UserTable";
import LogTabs from "./components/LogTabs";
import TokenUsageChart from "./components/TokenUsageChart";
import ApiHealthChart from "./components/ApiHealthChart";

const PAGE_SIZE = 5;

export default function AdminDashboard() {
  const router = useRouter();
  const [isAuthorized, setIsAuthorized] = useState(false);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [revealEmails, setRevealEmails] = useState(false);
  
  // Login State
  const [adminId, setAdminId] = useState("");
  const [adminPass, setAdminPass] = useState("");
  const [loginError, setLoginError] = useState("");
  const [isLoggingIn, setIsLoggingIn] = useState(false);

  // Pagination & Search State
  const [userPage, setUserPage] = useState(0);
  const [logPage, setLogPage] = useState(0);
  const [userSearch, setUserSearch] = useState("");
  const [totalUsersCount, setTotalUsersCount] = useState(0);

  // Data States
  const [stats, setStats] = useState({
    totalUsers: 0,
    newSignups7d: 0,
    dailyActiveUsers: 0,
    sessionsToday: { started: 0, completed: 0 },
    apiCallsToday: { success: 0, failure: 0 },
    tokensToday: 0,
    estimatedCost: 0
  });

  const [users, setUsers] = useState([]);
  const [activityLog, setActivityLog] = useState([]);
  const [errorLog, setErrorLog] = useState([]);
  const [bugReports, setBugReports] = useState([]);
  const [mostUsedBriefs, setMostUsedBriefs] = useState([]);
  const [groqTpm, setGroqTpm] = useState(0);

  const fetchStats = useCallback(async () => {
    try {
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const todayISO = today.toISOString();
      const last7d = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString();
      const last60s = new Date(Date.now() - 60 * 1000).toISOString();

      // Use user_preferences for counts as it has created_at
      const { count: totalPrefs } = await supabase.from('user_preferences').select('*', { count: 'exact', head: true });
      setTotalUsersCount(totalPrefs || 0);
      
      const { count: newSignups } = await supabase.from('user_preferences').select('*', { count: 'exact', head: true }).gte('created_at', last7d);

      const { data: dauData } = await supabase.from('moot_court_sessions').select('user_id').gte('created_at', todayISO);
      const dau = new Set(dauData?.map(d => d.user_id)).size;

      const { data: sessionsToday } = await supabase.from('moot_court_sessions').select('end_time, error_flag, case_id').gte('created_at', todayISO);
      const started = sessionsToday?.length || 0;
      const completed = sessionsToday?.filter(s => s.end_time && !s.error_flag).length || 0;

      const { data: apiCalls } = await supabase.from('api_calls').select('success, input_tokens, output_tokens, model').gte('timestamp', todayISO);
      const success = apiCalls?.filter(c => c.success).length || 0;
      const failure = apiCalls?.filter(c => !c.success).length || 0;
      const totalTokens = apiCalls?.reduce((acc, curr) => acc + (curr.input_tokens || 0) + (curr.output_tokens || 0), 0) || 0;

      const cost = apiCalls?.reduce((acc, curr) => {
        const t = (curr.input_tokens || 0) + (curr.output_tokens || 0);
        if (curr.model === 'groq') return acc + t * 0.00000027;
        if (curr.model === 'gemini') return acc + t * 0.000000075;
        return acc;
      }, 0) || 0;

      setStats({
        totalUsers: totalPrefs || 0,
        newSignups7d: newSignups || 0,
        dailyActiveUsers: dau || 0,
        sessionsToday: { started, completed },
        apiCallsToday: { success, failure },
        tokensToday: totalTokens,
        estimatedCost: cost
      });

      const briefCounts = {};
      sessionsToday?.forEach(s => briefCounts[s.case_id] = (briefCounts[s.case_id] || 0) + 1);
      setMostUsedBriefs(Object.entries(briefCounts).sort((a,b) => b[1] - a[1]).slice(0, 5).map(([id, count]) => ({ id, count })));

      const { data: groqCalls } = await supabase.from('api_calls').select('input_tokens, output_tokens').eq('model', 'groq').gte('timestamp', last60s);
      setGroqTpm(groqCalls?.reduce((acc, curr) => acc + (curr.input_tokens || 0) + (curr.output_tokens || 0), 0) || 0);
    } catch (e) { console.error("Stats error:", e); }
  }, []);

  const fetchUsers = useCallback(async (page, search = "") => {
    const from = page * PAGE_SIZE;
    const to = from + PAGE_SIZE - 1;

    // Primarily fetch from user_preferences because it has 'created_at' and 'role'
    let prefQuery = supabase.from('user_preferences').select('*');
    if (search) {
      prefQuery = prefQuery.or(`email.ilike.%${search}%,user_id.ilike.%${search}%,role.ilike.%${search}%`);
    }
    const { data: prefData } = await prefQuery.order('created_at', { ascending: false }).range(from, to);

    // Fetch corresponding data from users table if it exists
    const userIds = prefData?.map(p => p.user_id) || [];
    const { data: userData } = await supabase.from('users').select('*').in('id', userIds);

    const { data: userSessions } = await supabase.from('moot_court_sessions').select('user_id, tokens_used').in('user_id', userIds);

    const combinedUsers = prefData?.map(p => {
      const u = userData?.find(x => x.id === p.user_id) || {};
      const sessions = userSessions?.filter(s => s.user_id === p.user_id) || [];
      
      return {
        id: p.user_id,
        email: p.email || u.email || 'No Email',
        name: u.full_name || p.role || 'User',
        created_at: p.created_at || new Date().toISOString(),
        sessionCount: sessions.length,
        totalTokens: sessions.reduce((acc, curr) => acc + (curr.tokens_used || 0), 0)
      };
    }) || [];

    // Resolve missing emails from Firebase
    const missingEmailIds = combinedUsers
      .filter(u => !u.email || u.email === 'No Email')
      .map(u => u.id);

    if (missingEmailIds.length > 0) {
      try {
        const syncRes = await fetch("/api/admin/users/sync", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ userIds: missingEmailIds })
        });
        const syncData = await syncRes.json();
        if (syncData.emails) {
          combinedUsers.forEach(user => {
            if (syncData.emails[user.id]) {
              user.email = syncData.emails[user.id];
            }
          });
        }
      } catch (e) { console.error("Firebase sync failed:", e); }
    }

    setUsers(combinedUsers);
  }, []);

  const fetchLogs = useCallback(async (page) => {
    const from = page * PAGE_SIZE;
    const to = from + PAGE_SIZE - 1;

    const { data: activity } = await supabase.from('user_activity_logs').select('*').order('created_at', { ascending: false }).range(from, to);
    const uniqueUserIds = [...new Set(activity?.map(l => l.user_id))];
    const { data: logPrefs } = await supabase.from('user_preferences').select('user_id, email, role').in('user_id', uniqueUserIds);

    const formattedActivity = activity?.map(log => {
      const pref = logPrefs?.find(p => p.user_id === log.user_id);
      return {
        ...log,
        user_email: pref?.email || 'N/A',
        user_name: pref?.role || 'N/A'
      };
    }) || [];
    
    setActivityLog(formattedActivity);
    const { data: errors } = await supabase.from('api_calls').select('*').eq('success', false).order('timestamp', { ascending: false }).limit(20);
    const { data: bugs } = await supabase.from('bug_reports').select('*').order('timestamp', { ascending: false }).limit(20);
    setErrorLog(errors || []);
    setBugReports(bugs || []);
  }, []);

  const fetchAllData = useCallback(async () => {
    if (!isAuthorized) return;
    setRefreshing(true);
    await Promise.all([fetchStats(), fetchUsers(userPage, userSearch), fetchLogs(logPage)]);
    setRefreshing(false);
    setLoading(false);
  }, [isAuthorized, userPage, logPage, userSearch, fetchStats, fetchUsers, fetchLogs]);

  useEffect(() => {
    if (isAuthorized) fetchAllData();
  }, [isAuthorized, userPage, logPage, userSearch, fetchAllData]);

  const handleLogin = async (e) => {
    e.preventDefault();
    setIsLoggingIn(true);
    setLoginError("");
    try {
      const response = await fetch("/api/admin/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username: adminId, password: adminPass }),
      });
      const result = await response.json();
      if (!response.ok) throw new Error(result.error || "Login failed");
      setIsAuthorized(true);
      document.cookie = `admin_session=active; path=/; max-age=3600`;
    } catch (err) {
      setLoginError(err.message || "Authentication failed.");
    } finally {
      setIsLoggingIn(false);
    }
  };

  const handleLogout = async () => {
    document.cookie = "admin_session=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT";
    setIsAuthorized(false);
    router.push('/');
  };

  if (!isAuthorized) {
    return (
      <div className="min-h-screen bg-[#0f1117] flex items-center justify-center p-6">
        <div className="max-w-md w-full bg-slate-900 border border-slate-800 rounded-[3rem] p-12 shadow-2xl text-center">
          <div className="w-20 h-20 bg-indigo-600 rounded-3xl mx-auto flex items-center justify-center mb-8"><Lock className="text-white" size={36} /></div>
          <h2 className="text-3xl font-black text-white tracking-tight mb-2">Admin Shield</h2>
          <p className="text-xs font-bold text-slate-500 uppercase tracking-[0.3em] mb-10">Access Verification Required</p>
          <form onSubmit={handleLogin} className="space-y-6 text-left">
            <input type="text" value={adminId} onChange={(e) => setAdminId(e.target.value)} placeholder="Username" className="w-full bg-slate-950 border border-slate-800 rounded-2xl px-5 py-4 text-white focus:border-indigo-500 outline-none" required />
            <input type="password" value={adminPass} onChange={(e) => setAdminPass(e.target.value)} placeholder="••••••••" className="w-full bg-slate-950 border border-slate-800 rounded-2xl px-5 py-4 text-white focus:border-indigo-500 outline-none" required />
            {loginError && <div className="p-4 bg-rose-500/10 text-rose-500 text-[10px] font-black uppercase rounded-2xl">{loginError}</div>}
            <button type="submit" disabled={isLoggingIn} className="w-full py-5 bg-indigo-600 text-white rounded-2xl font-black uppercase text-xs shadow-xl flex items-center justify-center gap-3">
              {isLoggingIn ? <RefreshCw className="animate-spin" size={18} /> : "Unlock System"}
            </button>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0f1117] text-slate-200 font-sans p-6">
      <header className="flex items-center justify-between mb-8 border-b border-slate-800 pb-6">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center text-white font-black">LD</div>
          <div><h1 className="text-xl font-black tracking-tight">Legal Digest</h1><p className="text-[10px] font-bold text-indigo-500 uppercase tracking-widest">Corrected Database View</p></div>
        </div>
        <div className="flex items-center gap-4">
          <button onClick={() => setRevealEmails(!revealEmails)} className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase transition-all border ${revealEmails ? 'bg-indigo-600 text-white' : 'bg-slate-800 text-slate-400'}`}>{revealEmails ? 'Emails Revealed' : 'Mask Emails'}</button>
          <button onClick={fetchAllData} disabled={refreshing} className="p-2 rounded-xl bg-slate-800 text-slate-400"><RefreshCw size={20} className={refreshing ? 'animate-spin' : ''} /></button>
          <button onClick={handleLogout} className="px-4 py-2 rounded-xl bg-rose-600/10 text-rose-500 text-[10px] font-black uppercase hover:bg-rose-600 hover:text-white transition-all"><LogOut size={16} className="inline mr-2" /> Logout</button>
        </div>
      </header>

      <SummaryCards stats={stats} />

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 mt-8">
        <div className="lg:col-span-7 space-y-8">
          <LLMHealth groqTpm={groqTpm} lastError={errorLog[0]} stats={stats} />
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <TokenUsageChart />
            <ApiHealthChart />
          </div>
        </div>

        <div className="lg:col-span-5 flex flex-col gap-4">
          <UserTable users={users} revealEmails={revealEmails} search={userSearch} setSearch={setUserSearch} />
          <div className="flex items-center justify-between bg-slate-950/50 p-4 rounded-2xl border border-slate-800">
            <span className="text-[10px] font-black text-slate-500 uppercase">Page {userPage + 1}</span>
            <div className="flex gap-2">
              <button onClick={() => setUserPage(p => Math.max(0, p - 1))} disabled={userPage === 0} className="p-2 bg-slate-800 rounded-lg disabled:opacity-30"><ChevronLeft size={16} /></button>
              <button onClick={() => setUserPage(p => p + 1)} className="p-2 bg-slate-800 rounded-lg"><ChevronRight size={16} /></button>
            </div>
          </div>
        </div>
      </div>

      <div className="mt-8">
        <LogTabs activityLog={activityLog} errorLog={errorLog} bugReports={bugReports} revealEmails={revealEmails} />
        <div className="flex items-center justify-end gap-4 mt-4 px-6">
          <span className="text-[10px] font-black text-slate-500 uppercase">Activity Log Page {logPage + 1}</span>
          <div className="flex gap-2">
            <button onClick={() => setLogPage(p => Math.max(0, p - 1))} disabled={logPage === 0} className="px-4 py-2 bg-slate-800 text-[10px] font-black uppercase rounded-lg disabled:opacity-30">Prev</button>
            <button onClick={() => setLogPage(p => p + 1)} className="px-4 py-2 bg-slate-800 text-[10px] font-black uppercase rounded-lg">Next</button>
          </div>
        </div>
      </div>
    </div>
  );
}
