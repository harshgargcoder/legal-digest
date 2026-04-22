"use client";

import React from "react";

/**
 * TokenMeter Component
 * Visualises token usage and session limits.
 */
export default function TokenMeter({ usedTokens, limit = 10000 }) {
  const percentage = Math.min((usedTokens / limit) * 100, 100);
  const isWarning = percentage > 80;
  const isBlocked = usedTokens >= limit;

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
      <div className="flex items-center justify-between mb-2">
        <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">
          Session Tokens
        </span>
        <span className={`text-xs font-bold ${isBlocked ? "text-red-600" : isWarning ? "text-amber-600" : "text-slate-900"}`}>
          {usedTokens.toLocaleString()} / {limit.toLocaleString()}
        </span>
      </div>

      <div className="relative h-2 w-full overflow-hidden rounded-full bg-slate-100">
        <div
          className={`h-full transition-all duration-500 ${
            isBlocked ? "bg-red-500" : isWarning ? "bg-amber-500" : "bg-indigo-500"
          }`}
          style={{ width: `${percentage}%` }}
        />
      </div>

      {isBlocked && (
        <p className="mt-2 text-[9px] font-bold text-red-500">
          LIMIT REACHED: Finalise trial or reset session.
        </p>
      )}
      {!isBlocked && isWarning && (
        <p className="mt-2 text-[9px] font-bold text-amber-500">
          WARNING: High token usage. Truncating context...
        </p>
      )}
    </div>
  );
}
