"use client";

interface Props {
  category: string;
  setCategory: React.Dispatch<React.SetStateAction<string>>;
}

import { Globe, Shield, Landmark, Scale, BookOpen, Building2, Activity, Trophy, Users, Gavel } from "lucide-react";

const categories = [
  { name: "All", icon: Globe },
  { name: "Supreme Court", icon: Landmark },
  { name: "High Court", icon: Scale },
  { name: "Constitutional", icon: BookOpen },
  { name: "Finance", icon: Building2 },
  { name: "Criminal", icon: Gavel },
  { name: "Family", icon: Users },
  { name: "General", icon: Activity },
  { name: "Sports", icon: Trophy },
  { name: "Global", icon: Shield }
];

export default function CategoryFilter({
  category,
  setCategory,
}: Props) {
  return (
    <div className="flex gap-2 overflow-x-auto thin-scrollbar pb-1">
      {categories.map((cat) => {
        const Icon = cat.icon;
        return (
          <button
            key={cat.name}
            onClick={() => setCategory(cat.name)}
            className={`
            flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs whitespace-nowrap font-semibold
            transition-colors border
            ${category === cat.name
                ? "bg-slate-900 border-slate-900 text-white dark:bg-slate-100 dark:border-slate-100 dark:text-slate-900"
                : "bg-white border-slate-200 text-slate-600 dark:bg-slate-800 dark:border-slate-700 dark:text-slate-350 hover:bg-slate-50 dark:hover:bg-slate-700"
              }
          `}
          >
            <Icon size={13} className={category === cat.name ? "text-white dark:text-slate-900" : "text-slate-400"} />
            {cat.name}
          </button>
        )
      })}
    </div>
  );
}
