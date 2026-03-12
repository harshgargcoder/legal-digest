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
  { name: "Corporate & Finance", icon: Building2 },
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
    <div className="flex gap-3 mb-8 overflow-x-auto no-scrollbar">
      {categories.map((cat) => {
        const Icon = cat.icon;
        return (
          <button
            key={cat.name}
            onClick={() => setCategory(cat.name)}
            className={`
            flex items-center gap-2 px-4 py-2 rounded-xl text-xs whitespace-nowrap font-medium
            transition-all duration-300 border
            ${category === cat.name
                ? "bg-indigo-600 border-indigo-500 text-white shadow-lg shadow-indigo-500/25"
                : "bg-white/5 border-gray-200 dark:border-white/10 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-white/10 hover:border-gray-300 dark:hover:border-white/20 hover:shadow-md"
              }
          `}
          >
            <Icon size={14} className={category === cat.name ? "text-indigo-200" : "text-gray-400 dark:text-gray-500"} />
            {cat.name}
          </button>
        )
      })}
    </div>
  );
}
