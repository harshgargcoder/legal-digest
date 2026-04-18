import React from "react";

export function InfoBlock({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="text-[11px] uppercase tracking-wide text-slate-500 font-semibold">{label}</p>
      <p className="text-sm text-slate-800 font-semibold mt-1">{value}</p>
    </div>
  );
}

export function ToggleRow({
  title,
  subtitle,
  enabled,
}: {
  title: string;
  subtitle: string;
  enabled: boolean;
}) {
  return (
    <div className="flex items-center justify-between gap-3 py-2 border-b border-slate-200 last:border-b-0">
      <div>
        <p className="text-sm font-semibold text-slate-800">{title}</p>
        <p className="text-xs text-slate-500">{subtitle}</p>
      </div>
      <div
        className={`w-9 h-5 rounded-full relative ${enabled ? "bg-indigo-600" : "bg-slate-300"}`}
      >
        <div
          className={`absolute top-0.5 w-4 h-4 rounded-full bg-white transition-all ${enabled ? "left-4" : "left-0.5"
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
