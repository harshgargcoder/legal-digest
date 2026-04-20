"use client";

import React from "react";
import { motion } from "framer-motion";
import { Zap, AlertTriangle, ShieldAlert } from "lucide-react";

interface TokenMeterProps {
  usedTokens: number;
  maxTokens?: number;
}

export function TokenMeter({ usedTokens, maxTokens = 10000 }: TokenMeterProps) {
  const percentage = Math.min((usedTokens / maxTokens) * 100, 100);
  const isWarning = percentage > 80;
  const isBlocked = usedTokens >= maxTokens;

  return (
    <div className="flex flex-col gap-2 rounded-2xl border border-slate-200 bg-white/80 p-4 shadow-sm backdrop-blur-sm">
      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-2">
          <div className={`rounded-lg p-1.5 ${isBlocked ? 'bg-red-100 text-red-600' : isWarning ? 'bg-amber-100 text-amber-600' : 'bg-indigo-100 text-indigo-600'}`}>
            {isBlocked ? <ShieldAlert size={14} /> : isWarning ? <AlertTriangle size={14} /> : <Zap size={14} />}
          </div>
          <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">Token Usage</span>
        </div>
        <span className={`text-xs font-bold ${isBlocked ? 'text-red-600' : isWarning ? 'text-amber-600' : 'text-slate-900'}`}>
          {usedTokens.toLocaleString()} / {maxTokens.toLocaleString()}
        </span>
      </div>

      <div className="relative h-2 w-full overflow-hidden rounded-full bg-slate-100">
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${percentage}%` }}
          transition={{ duration: 1, ease: "easeOut" }}
          className={`h-full transition-colors ${
            isBlocked ? 'bg-red-500' : isWarning ? 'bg-amber-500' : 'bg-indigo-500'
          }`}
        />
      </div>

      {isBlocked ? (
        <p className="text-[9px] font-bold text-red-500 flex items-center gap-1">
           Session limit reached. Save or export transcript.
        </p>
      ) : isWarning ? (
        <p className="text-[9px] font-bold text-amber-500 flex items-center gap-1">
           Approaching token limit. Summarize context now.
        </p>
      ) : null}
    </div>
  );
}
