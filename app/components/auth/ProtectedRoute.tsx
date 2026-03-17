"use client";

import { useEffect, useState } from "react";
import { auth } from "@/lib/firebase";
import { onAuthStateChanged } from "firebase/auth";
import { Scale, Lock } from "lucide-react";
import AuthModal from "./AuthModal";

export default function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [authOpen, setAuthOpen] = useState(false);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  if (loading) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center p-8 space-y-4">
        <div className="w-10 h-10 border-4 border-indigo-500/30 border-t-indigo-500 rounded-full animate-spin"></div>
        <p className="text-slate-500 font-medium animate-pulse text-sm">Authenticating Researcher...</p>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center p-6 text-center animate-in fade-in zoom-in-95 duration-500">
        <div className="w-20 h-20 bg-indigo-50 rounded-3xl flex items-center justify-center mb-8 ring-1 ring-indigo-500/10">
          <Lock size={40} className="text-indigo-600" />
        </div>
        <h1 className="text-3xl font-black text-slate-900 mb-3 tracking-tight">Researcher Login Required</h1>
        <p className="text-slate-600 max-w-sm mb-10 font-medium leading-relaxed">
          The Student Toolkit contains specialized judicial tools reserved for registered researchers. Please login to continue.
        </p>
        <button 
          onClick={() => setAuthOpen(true)}
          className="px-10 py-4 bg-indigo-600 text-white rounded-2xl hover:bg-indigo-700 transition-all font-bold shadow-xl shadow-indigo-600/20 active:scale-95 flex items-center gap-3"
        >
          <Lock size={18} /> Launch Terminal Access
        </button>
        
        <AuthModal isOpen={authOpen} onClose={() => setAuthOpen(false)} />
      </div>
    );
  }

  return <>{children}</>;
}
