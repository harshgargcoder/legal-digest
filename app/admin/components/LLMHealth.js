import React from 'react';
import { Shield, AlertCircle, Cpu } from 'lucide-react';

export default function LLMHealth({ groqTpm, lastError, stats }) {
  const limit = 6000;
  const percentage = Math.min((groqTpm / limit) * 100, 100);
  const isYellow = groqTpm >= 4500 && groqTpm < 5500;
  const isRed = groqTpm >= 5500;

  // Mock health status based on success rate
  const successRate = stats.apiCallsToday.success / (stats.apiCallsToday.success + stats.apiCallsToday.failure || 1);
  const isHealthy = successRate > 0.95;

  return (
    <div className="bg-slate-900/50 rounded-3xl border border-slate-800 p-8 flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className={`w-10 h-10 rounded-2xl flex items-center justify-center ${isHealthy ? 'bg-emerald-500/10 text-emerald-500' : 'bg-rose-500/10 text-rose-500'}`}>
            <Shield size={24} />
          </div>
          <div>
            <h3 className="text-sm font-black uppercase tracking-widest text-white">System Integrity</h3>
            <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">
              {isHealthy ? 'All systems operational' : 'Degraded performance detected'}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
          <span className="text-[10px] font-black uppercase tracking-widest text-emerald-500">Stable DB</span>
        </div>
      </div>

      <div className="space-y-4">
        {/* Groq TPM Meter */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <Cpu size={14} className="text-indigo-400" />
              <span className="text-xs font-black uppercase tracking-widest text-slate-300">Groq Rate Limit (TPM)</span>
            </div>
            <span className={`text-xs font-black ${isRed ? 'text-rose-500' : isYellow ? 'text-amber-500' : 'text-slate-400'}`}>
              {groqTpm.toLocaleString()} / {limit.toLocaleString()}
            </span>
          </div>
          <div className="h-3 w-full bg-slate-950 rounded-full border border-slate-800 overflow-hidden relative">
            <div 
              className={`h-full transition-all duration-500 ${isRed ? 'bg-rose-500 shadow-[0_0_10px_rgba(244,63,94,0.5)]' : isYellow ? 'bg-amber-500' : 'bg-indigo-500'}`} 
              style={{ width: `${percentage}%` }}
            />
          </div>
          {isRed && <p className="text-[9px] font-black uppercase tracking-widest text-rose-500 mt-1 flex items-center gap-1"><AlertCircle size={10} /> Critical: Throttle imminent</p>}
          {isYellow && !isRed && <p className="text-[9px] font-black uppercase tracking-widest text-amber-500 mt-1 flex items-center gap-1"><AlertCircle size={10} /> Warning: Near capacity</p>}
        </div>

        {/* Status Pills */}
        <div className="grid grid-cols-2 gap-4">
          <div className="p-4 rounded-2xl bg-slate-950/50 border border-slate-800">
            <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1">Last System Error</p>
            <p className="text-[11px] font-medium text-slate-400 truncate italic">
              {lastError ? lastError.error_message : 'No recent errors logged'}
            </p>
          </div>
          <div className="p-4 rounded-2xl bg-slate-950/50 border border-slate-800">
            <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1">DeepSeek Fallback</p>
            <p className="text-lg font-black text-white">
              {((stats.apiCallsToday.failure / (stats.apiCallsToday.success + stats.apiCallsToday.failure || 1)) * 100).toFixed(1)}%
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
