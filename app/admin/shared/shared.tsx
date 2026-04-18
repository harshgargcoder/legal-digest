import React from "react";

export function InfoBlock({ 
  label, 
  value, 
  isDarkMode 
}: { 
  label: string; 
  value: string; 
  isDarkMode?: boolean 
}) {
  return (
    <div>
      <p className={`text-[11px] uppercase tracking-wide font-black ${isDarkMode ? "text-slate-500" : "text-slate-400"}`}>{label}</p>
      <p className={`text-sm font-black mt-1 ${isDarkMode ? "text-slate-200" : "text-slate-800"}`}>{value}</p>
    </div>
  );
}

export function ToggleRow({
  title,
  subtitle,
  enabled,
  isDarkMode,
}: {
  title: string;
  subtitle: string;
  enabled: boolean;
  isDarkMode?: boolean;
}) {
  return (
    <div className={`flex items-center justify-between gap-3 py-3 border-b last:border-b-0 ${isDarkMode ? "border-slate-800" : "border-slate-200"}`}>
      <div>
        <p className={`text-sm font-black ${isDarkMode ? "text-slate-200" : "text-slate-800"}`}>{title}</p>
        <p className={`text-[10px] font-bold ${isDarkMode ? "text-slate-500" : "text-slate-500"}`}>{subtitle}</p>
      </div>
      <div
        className={`w-9 h-5 rounded-full relative shadow-inner ${enabled ? "bg-indigo-600" : isDarkMode ? "bg-slate-800" : "bg-slate-300"}`}
      >
        <div
          className={`absolute top-0.5 w-4 h-4 rounded-full bg-white transition-all shadow-sm ${enabled ? "left-4" : "left-0.5"
            }`}
        />
      </div>
    </div>
  );
}

export function formatDate(value: string | null, withTime = false) {
  if (!value) return "N/A";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "N/A";
  return date.toLocaleString("en-IN", {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: withTime ? "2-digit" : undefined,
    minute: withTime ? "2-digit" : undefined,
  });
}

export function formatRelativeTime(timestamp: string) {
  const diff = Date.now() - new Date(timestamp).getTime();
  const mins = Math.floor(diff / 60000);
  const hours = Math.floor(mins / 60);
  const days = Math.floor(hours / 24);

  if (mins < 1) return "Just now";
  if (mins < 60) return `${mins} min ago`;
  if (hours < 24) return `${hours} hours ago`;
  return `${days} days ago`;
}
