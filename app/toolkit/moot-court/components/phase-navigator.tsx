"use client";

import { Scale } from "lucide-react";

import type { TrialPhase } from "../types";

interface PhaseNavigatorProps {
  currentPhase: TrialPhase;
  progress: number;
}

export function PhaseNavigator({ currentPhase, progress }: PhaseNavigatorProps) {
  const phases: TrialPhase[] = ["Opening Statements", "Witness Examination", "Closing Arguments", "Verdict Deliberation"];

  return (
    <div className="sticky top-0 z-50 w-full border-b border-slate-200/60 bg-white/90 px-4 py-3 backdrop-blur-2xl sm:px-6 xl:px-8 shadow-sm">
      <div className="mx-auto flex w-full max-w-[2200px] items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-indigo-600 text-white shadow-lg shadow-indigo-200">
            <Scale size={24} />
          </div>
          <div className="hidden sm:block">
            <div className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-400">Courtroom Flow</div>
            <div className="text-sm font-black text-slate-900 leading-tight">{currentPhase}</div>
          </div>
        </div>

        <div className="flex flex-1 items-center justify-center gap-2 sm:gap-6">
          {phases.map((p, i) => {
            const isComplete = phases.indexOf(currentPhase) > i;
            const isCurrent = currentPhase === p;

            return (
              <div key={p} className="flex items-center gap-2 sm:gap-4">
                <div className="flex flex-col items-center gap-1.5">
                  <div
                    className={`flex h-8 w-8 items-center justify-center rounded-xl text-[10px] font-black transition-all duration-500 ${
                      isCurrent ? "bg-slate-900 text-white shadow-xl scale-110" : isComplete ? "bg-emerald-500 text-white" : "bg-slate-100 text-slate-400"
                    }`}
                  >
                    {isComplete ? <Scale size={12} /> : i + 1}
                  </div>
                  <span className={`hidden md:block text-[9px] font-black uppercase tracking-widest ${isCurrent ? "text-slate-900" : "text-slate-400 opacity-60"}`}>{p.split(' ')[0]}</span>
                </div>
                {i < phases.length - 1 && (
                  <div className="h-[2px] w-6 sm:w-10 md:w-16 bg-slate-100 rounded-full overflow-hidden">
                    <div className={`h-full bg-indigo-600 transition-all duration-1000 ease-out ${isComplete ? "w-full" : "w-0"}`} />
                  </div>
                )}
              </div>
            );
          })}
        </div>

        <div className="flex items-center gap-4">
          <div className="hidden lg:block text-right">
            <div className="text-[9px] font-black uppercase tracking-widest text-slate-400">Step</div>
            <div className="text-sm font-black text-slate-900">
              {Math.min(progress + 1, phases.length)}<span className="text-slate-300 mx-0.5">/</span>{phases.length}
            </div>
          </div>
          <div className="h-10 w-px bg-slate-100 hidden lg:block" />
          <div className="px-3 py-1.5 bg-indigo-50 border border-indigo-100 rounded-xl text-[10px] font-black text-indigo-700 uppercase tracking-widest shadow-sm">
            Live
          </div>
        </div>
      </div>
    </div>
  );
}
