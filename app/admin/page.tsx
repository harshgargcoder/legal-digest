"use client";

import { useEffect, useState } from "react";
import { auth } from "@/lib/firebase";
import { onAuthStateChanged, User, sendPasswordResetEmail } from "firebase/auth";
import { 
  Users, 
  Trash2, 
  Mail, 
  ShieldCheck, 
  Search, 
  ArrowLeft,
  Loader2,
  RefreshCcw,
  CheckCircle2,
  AlertCircle
} from "lucide-react";
import Link from "next/link";

interface UserProfile {
  user_id: string;
  role: string;
  categories: string[];
  topics: string[];
  created_at: string;
  email: string;
  displayName?: string;
  lastSignInTime?: string;
}

export default function AdminDashboard() {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);
  const [isForbidden, setIsForbidden] = useState(false);
  const [search, setSearch] = useState("");
  const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        setCurrentUser(user);
        checkAdminStatus(user.uid);
      } else {
        window.location.href = "/";
      }
    });
    return () => unsubscribe();
  }, []);

  async function checkAdminStatus(uid: string) {
    try {
      const res = await fetch(`/api/user-preferences?userId=${uid}`);
      if (!res.ok) throw new Error(`Status: ${res.status}`);
      const contentType = res.headers.get("content-type");
      if (!contentType || !contentType.includes("application/json")) {
        throw new Error("Invalid response from server (expected JSON)");
      }
      const data = await res.json();
      if (data.preferences?.role === "Admin") {
        setIsAdmin(true);
        fetchUsers(uid);
      } else {
        setIsForbidden(true);
      }
    } catch (err) {
      console.error("Admin check failed", err);
      // Fallback: stay on page but show error if we can't verify
      setMessage({ type: 'error', text: 'Identity verification failed. Please check your connection.' });
    }
  }

  async function fetchUsers(adminId: string) {
    setLoading(true);
    try {
      const res = await fetch(`/api/admin/users?adminId=${adminId}`);
      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        throw new Error(errorData.error || `Server returned ${res.status}`);
      }
      const data = await res.json();
      if (data.users) {
        setUsers(data.users);
      }
    } catch (err: any) {
      console.error("Fetch users error", err);
      setMessage({ type: 'error', text: err.message || 'Failed to sync with user database.' });
    } finally {
      setLoading(false);
    }
  }

  async function handleDeleteUser(targetUserId: string) {
    if (!confirm("Are you sure you want to delete this user? This action cannot be undone.")) return;
    
    try {
      const res = await fetch("/api/admin/users", {
        method: "DELETE",
        body: JSON.stringify({ adminId: currentUser?.uid, targetUserId }),
      });
      const data = await res.json();
      if (data.success) {
        setUsers(users.filter(u => u.user_id !== targetUserId));
        setMessage({ type: 'success', text: 'User deleted successfully.' });
      } else {
        setMessage({ type: 'error', text: data.error || 'Failed to delete user.' });
      }
    } catch (err) {
      setMessage({ type: 'error', text: 'An error occurred during deletion.' });
    }
  }

  async function handleResetPassword(targetUserId: string, email: string) {
    try {
      // Trigger native Firebase email. 
      // IMPORTANT: Only generate one link to prevent invalidating previous ones.
      await sendPasswordResetEmail(auth, email);
      
      setMessage({ type: 'success', text: `Success! Professional reset email dispatched to ${email}.` });
    } catch (err: any) {
      console.error("Reset Error:", err);
      setMessage({ type: 'error', text: err.message || 'Failed to trigger reset flow.' });
    }
  }

  const filteredUsers = users.filter(u => 
    u.user_id.toLowerCase().includes(search.toLowerCase()) || 
    u.role.toLowerCase().includes(search.toLowerCase()) ||
    u.email.toLowerCase().includes(search.toLowerCase()) ||
    (u.displayName || "").toLowerCase().includes(search.toLowerCase())
  );

  if (isForbidden) {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-6 text-center">
        <div className="w-20 h-20 bg-rose-100 text-rose-600 rounded-3xl flex items-center justify-center mb-6 animate-bounce">
          <AlertCircle size={40} />
        </div>
        <h1 className="text-3xl font-black text-slate-900 mb-2">Access Denied</h1>
        <p className="text-slate-500 font-medium max-w-md mb-8 leading-relaxed">
          Your account does not have administrative privileges. Please ensure your role is set to <span className="text-indigo-600 font-bold">"Admin"</span> in the database.
        </p>
        <div className="flex flex-col gap-3 w-full max-w-xs">
          <Link href="/" className="w-full bg-slate-900 text-white py-3.5 rounded-2xl font-bold flex items-center justify-center gap-2 hover:bg-black transition">
            <ArrowLeft size={18} /> Return to Home
          </Link>
          <button 
            onClick={() => window.location.reload()} 
            className="w-full py-3.5 rounded-2xl font-bold text-slate-500 hover:bg-slate-100 transition"
          >
            Retry Verification
          </button>
        </div>
      </div>
    );
  }

  if (!isAdmin) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <Loader2 className="w-8 h-8 text-indigo-600 animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 p-6 md:p-12 pt-28 lg:pt-32">
      <div className="max-w-7xl mx-auto space-y-8">
        
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1">
            <Link href="/" className="inline-flex items-center gap-2 text-indigo-600 font-bold text-sm mb-4 hover:gap-3 transition-all">
              <ArrowLeft size={16} /> Back to Dashboard
            </Link>
            <h1 className="text-3xl font-black text-slate-900 flex items-center gap-3">
              <ShieldCheck className="text-indigo-600" /> Admin Command Center
            </h1>
            <p className="text-slate-500 font-medium italic">Manage judicial platform users and system settings</p>
          </div>

          <div className="flex items-center gap-3">
            <div className="bg-white border border-slate-200 px-6 py-3 rounded-2xl shadow-sm flex items-center gap-6">
              <div className="text-center">
                <span className="block text-xl font-black text-indigo-600">{users.length}</span>
                <span className="text-[10px] uppercase font-bold tracking-widest text-slate-400">Total Users</span>
              </div>
              <div className="w-px h-8 bg-slate-100"></div>
              <button 
                onClick={() => fetchUsers(currentUser?.uid || "")}
                className="p-2 hover:bg-slate-50 rounded-xl transition text-slate-400 hover:text-indigo-600"
              >
                <RefreshCcw size={20} className={loading ? "animate-spin" : ""} />
              </button>
            </div>
          </div>
        </div>

        {/* Feedback Messages */}
        {message && (
          <div className={`p-4 rounded-2xl border flex items-center gap-3 animate-in fade-in slide-in-from-top-4 duration-300 ${
            message.type === 'success' ? 'bg-emerald-50 border-emerald-100 text-emerald-700' : 'bg-rose-50 border-rose-100 text-rose-700'
          }`}>
            {message.type === 'success' ? <CheckCircle2 size={20} /> : <AlertCircle size={20} />}
            <span className="text-sm font-bold tracking-tight">{message.text}</span>
            <button onClick={() => setMessage(null)} className="ml-auto text-xs uppercase font-black opacity-50 hover:opacity-100">Dismiss</button>
          </div>
        )}

        {/* User Management Section */}
        <div className="bg-white border border-slate-200 rounded-[2.5rem] shadow-xl shadow-slate-200/50 overflow-hidden flex flex-col">
          <div className="p-8 border-b border-slate-100 bg-slate-50/50 flex flex-col md:flex-row md:items-center justify-between gap-6">
            <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
              <Users size={24} className="text-indigo-600" /> User Database
            </h2>
            
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
              <input 
                type="text" 
                placeholder="Search by ID or Role..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-12 pr-6 py-3 bg-white border border-slate-200 rounded-2xl text-sm font-medium focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 transition-all outline-none"
              />
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="bg-slate-50/50 border-b border-slate-100">
                  <th className="px-8 py-5 text-[10px] uppercase font-black tracking-widest text-slate-400">Identity / ID</th>
                  <th className="px-8 py-5 text-[10px] uppercase font-black tracking-widest text-slate-400">Judicial Role</th>
                  <th className="px-8 py-5 text-[10px] uppercase font-black tracking-widest text-slate-400">Engagement Date</th>
                  <th className="px-8 py-5 text-[10px] uppercase font-black tracking-widest text-slate-400">Last Active</th>
                  <th className="px-8 py-5 text-[10px] uppercase font-black tracking-widest text-slate-400 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {loading ? (
                  <tr>
                    <td colSpan={4} className="px-8 py-20 text-center">
                      <div className="flex flex-col items-center gap-4">
                        <Loader2 className="w-8 h-8 text-indigo-400 animate-spin" />
                        <p className="text-xs uppercase font-black tracking-widest text-slate-300">Syncing Directory...</p>
                      </div>
                    </td>
                  </tr>
                ) : filteredUsers.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="px-8 py-20 text-center">
                      <p className="text-slate-400 font-medium italic">No matches found in the judicial archives.</p>
                    </td>
                  </tr>
                ) : filteredUsers.map((user, idx) => (
                  <tr key={user.user_id} className="hover:bg-slate-50/50 transition-colors">
                    <td className="px-8 py-6">
                      <div className="flex items-center gap-4">
                        <div className="w-10 h-10 rounded-xl bg-indigo-50 flex items-center justify-center text-[10px] font-black text-indigo-600 shadow-sm border border-indigo-100/50">
                          {idx + 1}
                        </div>
                        <div className="flex flex-col">
                          <span className="text-sm font-bold text-slate-900 leading-none mb-1">
                            {user.displayName || "Anonymous User"}
                          </span>
                          <span className="text-[11px] font-medium text-slate-400 truncate max-w-[180px]">
                            {user.email}
                          </span>
                        </div>
                      </div>
                    </td>
                    <td className="px-8 py-6">
                      <span className={`inline-flex items-center px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest border ${
                        user.role === 'Admin' ? 'bg-indigo-600 text-white border-indigo-700 shadow-md shadow-indigo-600/20' : 'bg-slate-50 text-slate-600 border-slate-200'
                      }`}>
                        {user.role}
                      </span>
                    </td>
                    <td className="px-8 py-6">
                      <span className="text-xs font-bold text-slate-600">
                        {new Date(user.created_at).toLocaleDateString("en-IN", { month: "short", day: "numeric", year: "numeric" })}
                      </span>
                    </td>
                    <td className="px-8 py-6">
                      <span className="text-[11px] font-medium text-slate-400 italic">
                        {user.lastSignInTime ? new Date(user.lastSignInTime).toLocaleDateString("en-IN", { month: "short", day: "numeric" }) : 'Never'}
                      </span>
                    </td>
                    <td className="px-8 py-6">
                      <div className="flex items-center justify-end gap-2">
                        <button 
                          onClick={() => handleResetPassword(user.user_id, user.email)}
                          className="p-2.5 bg-white border border-slate-200 rounded-xl text-slate-400 hover:text-indigo-600 hover:border-indigo-100 transition shadow-sm"
                          title="Generate Reset Link"
                        >
                          <Mail size={16} />
                        </button>
                        <button 
                          onClick={() => handleDeleteUser(user.user_id)}
                          className={`p-2.5 bg-white border border-slate-200 rounded-xl text-slate-400 hover:text-rose-600 hover:border-rose-100 transition shadow-sm ${user.role === 'Admin' ? 'opacity-20 cursor-not-allowed' : ''}`}
                          title="Purge User"
                          disabled={user.role === 'Admin'}
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Admin Footer */}
        <div className="flex items-center justify-center pt-8 opacity-40">
           <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.3em] text-slate-900">
             <ShieldCheck size={12} /> Judicial Digest Administration Panel
           </div>
        </div>
      </div>
    </div>
  );
}
