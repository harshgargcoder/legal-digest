"use client";

import { useEffect, useState } from "react";
import { Lock, X, LogIn, Sparkles } from "lucide-react";

type Props = {
  isOpen: boolean;
  onClose: () => void;
  onLogin: () => void;
  message?: string;
};

export default function LoginPromptModal({
  isOpen,
  onClose,
  onLogin,
  message = "Sign in to save cases, track your research, and personalize your experience.",
}: Props) {
  const [mounted, setMounted] = useState(false);
  const [animateOut, setAnimateOut] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (isOpen) {
      setAnimateOut(false);
      const handleKeyDown = (e: KeyboardEvent) => {
        if (e.key === "Escape") handleClose();
      };
      window.addEventListener("keydown", handleKeyDown);
      return () => window.removeEventListener("keydown", handleKeyDown);
    }
  }, [isOpen]);

  const handleClose = () => {
    setAnimateOut(true);
    setTimeout(() => {
      onClose();
      setAnimateOut(false);
    }, 200);
  };

  const handleLogin = () => {
    setAnimateOut(true);
    setTimeout(() => {
      onClose();
      setAnimateOut(false);
      onLogin();
    }, 200);
  };

  if (!isOpen || !mounted) return null;

  return (
    <div
      className={`fixed inset-0 flex items-center justify-center z-[300] p-4 transition-all duration-300 ${
        animateOut ? "opacity-0" : "opacity-100"
      }`}
      onClick={handleClose}
    >
      {/* Backdrop */}
      <div className="absolute inset-0 bg-slate-900/30 backdrop-blur-sm" />

      {/* Modal Card */}
      <div
        onClick={(e) => e.stopPropagation()}
        className={`relative w-full max-w-[380px] bg-white dark:bg-slate-900 border border-gray-200/60 dark:border-slate-700/60 rounded-3xl overflow-hidden shadow-[0_25px_60px_rgba(0,0,0,0.15)] transition-all duration-300 ${
          animateOut
            ? "scale-95 opacity-0 translate-y-2"
            : "scale-100 opacity-100 translate-y-0"
        }`}
        style={{
          animation: animateOut ? "none" : "loginPromptIn 0.4s cubic-bezier(0.16, 1, 0.3, 1)",
        }}
      >
        {/* Decorative gradient header */}
        <div className="relative h-32 bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500 flex items-center justify-center overflow-hidden">
          {/* Animated circles */}
          <div className="absolute top-2 left-6 w-16 h-16 bg-white/10 rounded-full blur-xl animate-pulse" />
          <div className="absolute bottom-4 right-8 w-20 h-20 bg-white/10 rounded-full blur-xl animate-pulse" style={{ animationDelay: "0.5s" }} />
          <div className="absolute top-8 right-12 w-8 h-8 bg-white/20 rounded-full blur-lg animate-pulse" style={{ animationDelay: "1s" }} />

          {/* Lock Icon */}
          <div className="relative z-10 w-16 h-16 bg-white/20 backdrop-blur-md rounded-2xl flex items-center justify-center border border-white/30 shadow-lg">
            <Lock size={28} className="text-white" strokeWidth={2.5} />
          </div>

          {/* Close button */}
          <button
            onClick={handleClose}
            className="absolute top-3 right-3 p-1.5 rounded-full bg-white/10 hover:bg-white/20 backdrop-blur-sm transition-all border border-white/20"
          >
            <X size={16} className="text-white" />
          </button>
        </div>

        {/* Content */}
        <div className="px-8 pt-6 pb-8 text-center">
          <div className="flex items-center justify-center gap-1.5 mb-2">
            <Sparkles size={14} className="text-amber-500" />
            <span className="text-[11px] font-bold text-amber-600 dark:text-amber-400 uppercase tracking-widest">
              Account Required
            </span>
            <Sparkles size={14} className="text-amber-500" />
          </div>

          <h3 className="text-xl font-black text-slate-900 dark:text-white mb-2 tracking-tight">
            Login to Continue
          </h3>

          <p className="text-sm text-slate-500 dark:text-slate-400 leading-relaxed mb-6 max-w-[280px] mx-auto">
            {message}
          </p>

          {/* CTA Button */}
          <button
            onClick={handleLogin}
            className="w-full py-3.5 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white rounded-2xl text-sm font-bold flex items-center justify-center gap-2 transition-all transform active:scale-[0.97] shadow-lg shadow-indigo-500/25 hover:shadow-indigo-500/40"
          >
            <LogIn size={18} />
            Sign In Now
          </button>

          {/* Secondary dismiss */}
          <button
            onClick={handleClose}
            className="mt-3 text-xs font-semibold text-slate-400 dark:text-slate-500 hover:text-slate-600 dark:hover:text-slate-300 transition-colors"
          >
            Maybe later
          </button>
        </div>
      </div>

      {/* Animation keyframes */}
      <style jsx>{`
        @keyframes loginPromptIn {
          0% {
            opacity: 0;
            transform: scale(0.9) translateY(20px);
          }
          100% {
            opacity: 1;
            transform: scale(1) translateY(0);
          }
        }
      `}</style>
    </div>
  );
}
