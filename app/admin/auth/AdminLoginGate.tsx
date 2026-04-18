import React from "react";
import { Lock } from "lucide-react";

export function AdminLoginGate({
  adminId,
  setAdminId,
  adminPass,
  setAdminPass,
  onLogin,
  loginError,
  isLoggingIn,
}: {
  adminId: string;
  setAdminId: (v: string) => void;
  adminPass: string;
  setAdminPass: (v: string) => void;
  onLogin: (e: React.FormEvent) => void;
  loginError: string;
  isLoggingIn: boolean;
}) {
  return (
    <div className="min-h-screen bg-[#f3f6fb] flex items-center justify-center p-6 font-sans">
      <div className="max-w-md w-full bg-white border border-slate-200 rounded-[2.5rem] p-10 shadow-[0_20px_50px_rgba(0,0,0,0.05)] text-center">
        <div className="mb-8 flex flex-col items-center">
          <div className="w-16 h-16 bg-indigo-50 rounded-2xl flex items-center justify-center mb-4">
            <Lock className="text-indigo-600" size={32} />
          </div>
          <h1 className="text-3xl font-black text-slate-900 tracking-tight">Admin Gate</h1>
          <p className="text-slate-500 mt-2 font-medium">Restricted Access Area</p>
        </div>

        <form onSubmit={onLogin} className="space-y-5 text-left">
          <div>
            <label className="text-xs font-bold uppercase tracking-widest text-slate-400 mb-2 block ml-1">Admin ID</label>
            <div className="relative">
              <input
                type="text"
                value={adminId}
                onChange={(e) => setAdminId(e.target.value)}
                placeholder="Enter admin ID"
                className="w-full pl-4 pr-4 py-3.5 bg-slate-50 border border-slate-200 rounded-2xl outline-none focus:border-indigo-400 focus:ring-4 focus:ring-indigo-500/5 transition-all font-medium text-slate-900"
                required
              />
            </div>
          </div>

          <div>
            <label className="text-xs font-bold uppercase tracking-widest text-slate-400 mb-2 block ml-1">Password</label>
            <div className="relative">
              <input
                type="password"
                value={adminPass}
                onChange={(e) => setAdminPass(e.target.value)}
                placeholder="••••••••"
                className="w-full pl-4 pr-4 py-3.5 bg-slate-50 border border-slate-200 rounded-2xl outline-none focus:border-indigo-400 focus:ring-4 focus:ring-indigo-500/5 transition-all font-medium text-slate-900"
                required
              />
            </div>
          </div>

          {loginError && (
            <div className="p-3.5 bg-rose-50 border border-rose-100 rounded-xl text-rose-600 text-xs font-bold flex items-center gap-2">
              <div className="w-1.5 h-1.5 rounded-full bg-rose-500" />
              {loginError}
            </div>
          )}

          <button
            type="submit"
            disabled={isLoggingIn}
            className="w-full py-4 bg-indigo-600 hover:bg-indigo-700 disabled:bg-slate-300 text-white rounded-2xl font-bold transition-all shadow-lg shadow-indigo-100 flex items-center justify-center gap-2 group"
          >
            {isLoggingIn ? (
              <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            ) : (
              <>
                Unlock Dashboard
                <div className="w-2 h-2 rounded-full bg-white/30 group-hover:bg-white transition-all" />
              </>
            )}
          </button>
        </form>

        <p className="mt-8 text-[10px] text-slate-400 font-bold uppercase tracking-widest">
          Institutional Security Protocols Active
        </p>
      </div>
    </div>
  );
}
