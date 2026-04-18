"use client";

import { motion } from "framer-motion";
import { FileText, Loader2 } from "lucide-react";

interface LoadingScreenProps {
  label: string;
}

export function LoadingScreen({ label }: LoadingScreenProps) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="relative min-h-screen overflow-hidden bg-slate-950 px-6 text-white"
    >
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,_rgba(99,102,241,0.28),_transparent_30%),radial-gradient(circle_at_top_right,_rgba(14,165,233,0.22),_transparent_26%),radial-gradient(circle_at_bottom,_rgba(251,191,36,0.16),_transparent_28%)]" />
      <div className="absolute left-1/2 top-1/2 h-[44rem] w-[44rem] -translate-x-1/2 -translate-y-1/2 rounded-full border border-white/5 bg-white/5 blur-3xl" />

      <div className="relative z-10 flex min-h-screen items-center justify-center">
        <div className="w-full max-w-2xl rounded-[2.75rem] border border-white/10 bg-white/6 p-10 text-center shadow-2xl backdrop-blur-2xl">
          <div className="mx-auto mb-8 flex h-24 w-24 items-center justify-center rounded-[2rem] border border-indigo-400/20 bg-indigo-500/15">
            <Loader2 size={40} className="animate-spin text-indigo-200" />
          </div>
          <div className="mb-4 text-[10px] font-black uppercase tracking-[0.3em] text-indigo-300">Preparing the courtroom</div>
          <h2 className="text-3xl font-black uppercase tracking-[0.18em]">Loading Case Brief</h2>
          <p className="mx-auto mt-4 max-w-xl text-sm leading-relaxed text-slate-300">
            The bench is reading the brief, preparing the context, and activating the courtroom workflow.
          </p>

          <div className="mt-8 grid gap-3 sm:grid-cols-3">
            {["Brief Ingest", "Jurisdiction Routing", "AI Persona Setup"].map((step, index) => (
              <div key={step} className="rounded-2xl border border-white/10 bg-white/5 px-4 py-4 text-left">
                <div className="text-[9px] font-black uppercase tracking-[0.26em] text-indigo-200/70">Step 0{index + 1}</div>
                <div className="mt-2 text-sm font-bold text-white">{step}</div>
              </div>
            ))}
          </div>

          <div className="mt-8 rounded-[2rem] border border-white/10 bg-white/5 p-5 text-left">
            <div className="mb-2 flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.26em] text-indigo-200">
              <FileText size={14} /> Brief Source
            </div>
            <p className="text-sm leading-relaxed text-slate-200">{label}</p>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
