"use client";

import Image from "next/image";
import { useState, useEffect } from "react";
import { auth, googleProvider } from "@/lib/firebase";
import { 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword, 
  signInWithPopup,
  sendPasswordResetEmail,
  getAdditionalUserInfo
} from "firebase/auth";
import { Mail, Lock, User, ArrowRight, Eye, EyeOff, X } from "lucide-react";

type Props = {
  isOpen: boolean;
  onClose: () => void;
};

export default function AuthModal({ isOpen, onClose }: Props) {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Clear fields strictly when modal opens/closes to ensure privacy
  useEffect(() => {
    if (!isOpen) {
      setEmail("");
      setPassword("");
      setError("");
      setIsLogin(true); // Reset to login mode whenever closed
    } else {
      // Add escape key listener
      const handleKeyDown = (e: KeyboardEvent) => {
        if (e.key === "Escape") onClose();
      };
      window.addEventListener("keydown", handleKeyDown);
      return () => window.removeEventListener("keydown", handleKeyDown);
    }
  }, [isOpen, onClose]);

  if (!isOpen || !mounted) return null;

  async function handleAuth(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      if (isLogin) {
        await signInWithEmailAndPassword(auth, email, password);
      } else {
        const userCredential = await createUserWithEmailAndPassword(auth, email, password);
        // Sync with user preferences if needed
        await fetch("/api/user-preferences", {
          method: "POST",
          body: JSON.stringify({ userId: userCredential.user.uid }),
        });
      }
      onClose();
    } catch (err: any) {
      console.error("Auth Error:", err.code);
      if (err.code === 'auth/invalid-credential' || err.code === 'auth/user-not-found' || err.code === 'auth/wrong-password') {
        setError("Invalid identity. The email or password entered does not match our records.");
      } else if (err.code === 'auth/email-already-in-use') {
        setError("This email is already registered. Please sign in instead.");
      } else if (err.code === 'auth/weak-password') {
        setError("Security risk: Password should be at least 6 characters.");
      } else {
        setError(err.message);
      }
    } finally {
      setLoading(false);
    }
  }

  async function handleGoogleLogin() {
    setError("");
    setLoading(true);
    try {
      const result = await signInWithPopup(auth, googleProvider);
      const additionalInfo = getAdditionalUserInfo(result);
      
      // If new user, trigger password reset email so they can set a password
      if (additionalInfo?.isNewUser && result.user.email) {
        await sendPasswordResetEmail(auth, result.user.email);
        alert("Welcome! Since you logged in with Google, we've sent you a password reset email so you can also set a password for your account.");
      }
      
      onClose();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-md flex items-center justify-center z-[200] p-4 animate-in fade-in duration-300">
      <div className="w-full max-w-[450px] bg-white border border-gray-200 rounded-[2.5rem] p-10 shadow-[0_20px_60px_rgba(0,0,0,0.15)] relative overflow-hidden transform transition-all animate-in zoom-in-95 duration-300">
        
        {/* Decorative Glow */}
        <div className="absolute top-0 right-0 w-40 h-40 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-40 h-40 bg-purple-500/10 rounded-full blur-3xl pointer-events-none" />

        <button onClick={onClose} className="absolute top-6 right-6 p-2 hover:bg-slate-100 rounded-full transition text-slate-400">
          <X size={20} />
        </button>

        {/* Logo */}
        <div className="flex flex-col items-center mb-10 text-center">
          <Image src="/new_logo.png" alt="Legal Digest" width={140} height={50} className="h-auto mb-4" />
          <h2 className="text-2xl font-black text-slate-900 tracking-tight">
            {isLogin ? "Welcome Back" : "Create Account"}
          </h2>
          <p className="text-slate-500 text-sm font-medium mt-1">
            {isLogin ? "Access your judicial research terminal" : "Join the premium judicial platform"}
          </p>
        </div>

        {error && (
          <div className="bg-rose-50 border border-rose-100 p-4 rounded-2xl mb-6 text-rose-600 text-xs font-bold animate-in slide-in-from-top-2">
            {error}
          </div>
        )}

        <form onSubmit={handleAuth} className="space-y-4">
          <div className="relative group">
            <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-indigo-600 transition-colors" size={18} />
            <input 
              type="email" 
              placeholder="Email Address" 
              required
              className="w-full pl-12 pr-6 py-3.5 bg-slate-50 border border-slate-100 rounded-2xl text-sm font-bold focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 focus:bg-white transition-all outline-none"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>

          <div className="relative group">
            <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-indigo-600 transition-colors" size={18} />
            <input 
              type={showPassword ? "text" : "password"} 
              placeholder="Password" 
              required
              className="w-full pl-12 pr-12 py-3.5 bg-slate-50 border border-slate-100 rounded-2xl text-sm font-bold focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 focus:bg-white transition-all outline-none"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
            <button 
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-indigo-600 transition"
            >
              {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
            </button>
          </div>

          <button 
            type="submit" 
            disabled={loading}
            className="w-full bg-slate-900 hover:bg-black text-white py-4 rounded-2xl text-sm font-black flex items-center justify-center gap-2 transition-all transform active:scale-[0.98] disabled:opacity-50"
          >
            {loading ? "Processing..." : isLogin ? "Launch Terminal" : "Initialize Account"}
            <ArrowRight size={18} />
          </button>
        </form>

        <div className="relative my-8">
          <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-slate-100"></div></div>
          <div className="relative flex justify-center text-[10px] uppercase font-black tracking-widest text-slate-400">
            <span className="bg-white px-4">Or Secure Access with</span>
          </div>
        </div>

        <button
          type="button"
          onClick={handleGoogleLogin}
          disabled={loading}
          className="w-full py-4 border border-slate-200 rounded-2xl text-sm font-bold text-slate-700 flex items-center justify-center gap-3 hover:bg-slate-50 hover:border-indigo-300 transition-all active:scale-[0.98] disabled:opacity-50"
        >
          <Image src="https://www.svgrepo.com/show/475656/google-color.svg" alt="Google" width={20} height={20} />
          Google Identity
        </button>

        <div className="mt-8 text-center space-y-2">
          <p className="text-slate-500 text-xs font-medium">
            {isLogin ? "Don't have an account?" : "Already joined the digest?"}
            <button 
              onClick={() => {
                setIsLogin(!isLogin);
                setEmail("");
                setPassword("");
                setError("");
              }} 
              className="ml-2 text-indigo-600 font-black hover:underline underline-offset-4"
            >
              {isLogin ? "Register Now" : "Sign In"}
            </button>
          </p>
          <p className="text-[10px] text-slate-400 max-w-[280px] mx-auto leading-relaxed italic">
            By proceeding, you agree to our Terms of Service & Judicial Professional Conduct Guidelines.
          </p>
        </div>
      </div>
    </div>
  );
}
