import React from "react";

export function StatCard({
  label,
  value,
  tone,
  icon,
  badgeText,
  footerText,
  barPercent,
  isDarkMode,
}: {
  label: string;
  value: number;
  tone: "indigo" | "violet" | "rose";
  icon: React.ReactNode;
  badgeText: string;
  footerText: string;
  barPercent: number;
  isDarkMode?: boolean;
}) {
  const toneStyles = tone === "rose"
    ? {
      icon: isDarkMode ? "text-rose-400 bg-rose-900/30 border border-rose-500/20" : "text-rose-700 bg-rose-100",
      badge: isDarkMode ? "text-rose-400 bg-rose-900/20" : "text-rose-600 bg-rose-50",
      bar: "bg-rose-500",
    }
    : tone === "violet"
      ? {
        icon: isDarkMode ? "text-violet-400 bg-violet-900/30 border border-violet-500/20" : "text-violet-700 bg-violet-100",
        badge: isDarkMode ? "text-violet-400 bg-violet-900/20" : "text-violet-600 bg-violet-50",
        bar: "bg-violet-600",
      }
      : {
        icon: isDarkMode ? "text-indigo-400 bg-indigo-900/30 border border-indigo-500/20" : "text-indigo-700 bg-indigo-100",
        badge: isDarkMode ? "text-emerald-400 bg-emerald-900/20" : "text-emerald-600 bg-emerald-50",
        bar: "bg-indigo-600",
      };

  return (
    <div className={`border rounded-3xl p-6 transition-colors ${isDarkMode ? "bg-slate-900 border-slate-800" : "bg-white border-slate-200 shadow-sm"}`}>
      <div className="flex items-start justify-between">
        <span className={`w-10 h-10 rounded-xl flex items-center justify-center ${toneStyles.icon}`}>{icon}</span>
        <span className={`text-[10px] px-2 py-1 rounded-md font-bold uppercase tracking-widest ${toneStyles.badge}`}>{badgeText}</span>
      </div>
      <p className={`text-xs mt-6 font-bold uppercase tracking-widest ${isDarkMode ? "text-slate-500" : "text-slate-400"}`}>{label}</p>
      <p className={`text-4xl font-black mt-1 ${isDarkMode ? "text-white" : "text-slate-900"}`}>{value}</p>
      <p className="text-[10px] mt-4 uppercase tracking-[0.2em] font-bold text-slate-500">{footerText}</p>
      <div className={`h-1 rounded-full mt-3 ${isDarkMode ? "bg-slate-800" : "bg-slate-100"}`}>
        <div className={`h-1 rounded-full transition-all duration-1000 ${toneStyles.bar}`} style={{ width: `${barPercent}%` }} />
      </div>
    </div>
  );
}
