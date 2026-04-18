import React from "react";

export function StatCard({
  label,
  value,
  tone,
  icon,
  badgeText,
  footerText,
  barPercent,
}: {
  label: string;
  value: number;
  tone: "indigo" | "violet" | "rose";
  icon: React.ReactNode;
  badgeText: string;
  footerText: string;
  barPercent: number;
}) {
  const toneStyles = tone === "rose"
    ? {
      icon: "text-rose-700 bg-rose-100",
      badge: "text-rose-600 bg-rose-50",
      bar: "bg-rose-500",
    }
    : tone === "violet"
      ? {
        icon: "text-violet-700 bg-violet-100",
        badge: "text-violet-600 bg-violet-50",
        bar: "bg-violet-600",
      }
      : {
        icon: "text-indigo-700 bg-indigo-100",
        badge: "text-emerald-600 bg-emerald-50",
        bar: "bg-indigo-600",
      };

  return (
    <div className="bg-white border border-slate-200 rounded-2xl p-5 min-h-[196px]">
      <div className="flex items-start justify-between">
        <span className={`w-10 h-10 rounded-xl flex items-center justify-center ${toneStyles.icon}`}>{icon}</span>
        <span className={`text-[11px] px-2.5 py-1 rounded-md font-semibold ${toneStyles.badge}`}>{badgeText}</span>
      </div>
      <p className="text-sm text-slate-500 mt-8">{label}</p>
      <p className="text-[46px] leading-none font-black text-slate-900 mt-1">{value}</p>
      <p className="text-[11px] mt-5 uppercase tracking-[0.14em] font-bold text-slate-400">{footerText}</p>
      <div className="h-1 bg-slate-100 rounded-full mt-3">
        <div className={`h-1 rounded-full ${toneStyles.bar}`} style={{ width: `${barPercent}%` }} />
      </div>
    </div>
  );
}
