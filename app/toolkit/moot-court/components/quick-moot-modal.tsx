"use client";

import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Zap, Settings2, ShieldCheck, User, X } from "lucide-react";

interface QuickMootModalProps {
  isOpen: boolean;
  onClose: () => void;
  onQuickMoot: (role: "Plaintiff" | "Defendant") => void;
  onCustomTrial: () => void;
}

export function QuickMootModal({ isOpen, onClose, onQuickMoot, onCustomTrial }: QuickMootModalProps) {
  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[1000] flex items-center justify-center p-4">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-slate-900/60 backdrop-blur-md"
          />

          {/* Modal Content */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="relative w-full max-w-4xl overflow-hidden rounded-[3rem] border border-white/20 bg-white/90 p-8 shadow-2xl backdrop-blur-xl sm:p-12"
          >
            <button
              onClick={onClose}
              className="absolute right-8 top-8 rounded-full p-2 text-slate-400 hover:bg-slate-100 hover:text-slate-600 transition-all"
            >
              <X size={24} />
            </button>

            <div className="text-center mb-12">
              <span className="inline-flex items-center gap-2 rounded-full bg-indigo-50 px-4 py-1.5 text-[10px] font-black uppercase tracking-[0.3em] text-indigo-600 mb-4">
                <ShieldCheck size={14} />
                Trial Mode Selection
              </span>
              <h2 className="text-4xl font-black text-slate-950 sm:text-5xl">How would you like to proceed?</h2>
              <p className="mt-4 text-slate-500 font-medium max-w-xl mx-auto">
                Jump into a pre-configured battle or build your own custom legal scenario from scratch.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {/* Quick Moot Card */}
              <div className="group relative flex flex-col rounded-[2.5rem] border border-indigo-100 bg-white p-8 shadow-xl shadow-indigo-100/20 transition-all hover:-translate-y-2 hover:border-indigo-300 hover:shadow-2xl hover:shadow-indigo-200/40">
                <div className="mb-6 flex h-16 w-16 items-center justify-center rounded-2xl bg-indigo-600 text-white shadow-lg shadow-indigo-200">
                  <Zap size={32} />
                </div>
                <h3 className="text-2xl font-black text-slate-900">⚡ Quick Moot</h3>
                <p className="mt-3 text-sm font-medium leading-relaxed text-slate-500">
                  Pre-loaded: <strong>Contract Dispute</strong> (Software Breach). Perfect for a 5-minute training session.
                </p>
                
                <div className="mt-8 space-y-4">
                  <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Pick your role to start</p>
                  <div className="flex gap-3">
                    <button
                      onClick={() => onQuickMoot("Plaintiff")}
                      className="flex-1 flex items-center justify-center gap-2 rounded-2xl bg-slate-950 py-4 text-xs font-black uppercase tracking-widest text-white transition-all hover:bg-indigo-600 active:scale-95"
                    >
                      <User size={14} />
                      Petitioner
                    </button>
                    <button
                      onClick={() => onQuickMoot("Defendant")}
                      className="flex-1 flex items-center justify-center gap-2 rounded-2xl border-2 border-slate-950 py-4 text-xs font-black uppercase tracking-widest text-slate-950 transition-all hover:bg-slate-50 active:scale-95"
                    >
                      Respondent
                    </button>
                  </div>
                </div>
              </div>

              {/* Custom Trial Card */}
              <button
                onClick={onCustomTrial}
                className="group relative flex flex-col text-left rounded-[2.5rem] border border-slate-200 bg-slate-50 p-8 transition-all hover:-translate-y-2 hover:border-slate-300 hover:bg-white hover:shadow-2xl hover:shadow-slate-200/40"
              >
                <div className="mb-6 flex h-16 w-16 items-center justify-center rounded-2xl bg-white border border-slate-200 text-slate-600 shadow-sm transition-colors group-hover:bg-slate-900 group-hover:text-white group-hover:border-slate-900">
                  <Settings2 size={32} />
                </div>
                <h3 className="text-2xl font-black text-slate-900">🎛️ Custom Trial</h3>
                <p className="mt-3 text-sm font-medium leading-relaxed text-slate-500">
                  Full control over jurisdiction, case type, witness personas, and counsel strategies. Upload your own briefs.
                </p>
                
                <div className="mt-auto pt-8">
                  <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-indigo-600 group-hover:gap-4 transition-all">
                    Open Setup Studio
                    <span className="text-lg">→</span>
                  </div>
                </div>
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
