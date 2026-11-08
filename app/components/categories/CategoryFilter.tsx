"use client";

import { useState, useRef, useEffect } from "react";
import {
  Globe,
  Landmark,
  Scale,
  BookOpen,
  Building2,
  Gavel,
  Users,
  Trophy,
  Menu,
  ChevronDown,
  Check,
  Layers,
} from "lucide-react";

export interface CategoryOption {
  name: string;
  label: string;
  description: string;
  icon: typeof Globe;
  badge?: string;
}

export const CATEGORIES: CategoryOption[] = [
  {
    name: "All",
    label: "All",
    description: "Complete legal intelligence & rulings across all benches",
    icon: Globe,
    badge: "Universal",
  },
  {
    name: "Supreme Court",
    label: "Supreme Court",
    description: "Apex Court orders, Constitution Bench judgments & writs",
    icon: Landmark,
    badge: "Apex",
  },
  {
    name: "High Court",
    label: "High Courts",
    description: "State High Courts rulings, appellate orders & bails",
    icon: Scale,
    badge: "Appellate",
  },
  {
    name: "Constitutional",
    label: "Constitutional Law",
    description: "Fundamental rights, basic structure & Article 32/226 matters",
    icon: BookOpen,
    badge: "Core",
  },
  {
    name: "Finance",
    label: "Finance & Corporate",
    description: "NCLT, insolvency, SEBI regulations, taxes & corporate disputes",
    icon: Building2,
    badge: "Corporate",
  },
  {
    name: "Criminal",
    label: "Criminal Jurisprudence",
    description: "CrPC, BNS, bail appeals, trials, evidence & forensics",
    icon: Gavel,
    badge: "Penal",
  },
  {
    name: "Family",
    label: "Family & Matrimonial",
    description: "Divorce, alimony, custody, guardianship & succession",
    icon: Users,
    badge: "Civil",
  },
  {
    name: "General & Global",
    label: "General & Global",
    description: "Unified national legal developments & international jurisprudence",
    icon: Layers,
    badge: "International",
  },
  {
    name: "Sports",
    label: "Sports Law",
    description: "Court of Arbitration for Sport, doping, league governance",
    icon: Trophy,
    badge: "Sports",
  },
];

interface Props {
  category: string;
  setCategory: (category: string) => void;
  subCategory?: "All" | "General" | "Global";
  setSubCategory?: (sub: "All" | "General" | "Global") => void;
}

export default function CategoryFilter({
  category,
  setCategory,
  subCategory = "All",
  setSubCategory,
}: Props) {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const activeNormalized =
    category === "General" || category === "Global"
      ? "General & Global"
      : category;

  const activeOption =
    CATEGORIES.find((c) => c.name === activeNormalized) || CATEGORIES[0];
  const ActiveIcon = activeOption.icon;

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    }
    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, []);

  const handleSelect = (categoryName: string) => {
    setCategory(categoryName);
    setIsOpen(false);
  };

  const isMergedActive =
    activeNormalized === "General & Global" ||
    category === "General & Global" ||
    category === "General" ||
    category === "Global";

  return (
    <div className="w-full space-y-2.5 pb-2" ref={dropdownRef}>
      <div className="flex flex-wrap items-center justify-between gap-3">
        {/* THREE-LINES HAMBURGER TRIGGER BUTTON */}
        <div className="relative inline-block text-left">
          <button
            type="button"
            onClick={() => setIsOpen((prev) => !prev)}
            className={`
              flex items-center gap-3 px-3.5 py-2 rounded-xl border text-left shadow-xs transition-all duration-150
              ${
                isOpen
                  ? "bg-slate-900 text-white border-slate-900 dark:bg-slate-100 dark:text-slate-950 dark:border-slate-100"
                  : "bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-800 dark:text-slate-100 hover:border-slate-400 dark:hover:border-slate-600 hover:shadow-xs"
              }
            `}
            aria-haspopup="true"
            aria-expanded={isOpen}
          >
            {/* The 3 Lines Icon */}
            <div
              className={`flex items-center justify-center w-7 h-7 rounded-lg border transition-colors ${
                isOpen
                  ? "bg-white/10 border-white/20 text-white dark:bg-slate-900/10 dark:border-slate-900/20 dark:text-slate-950"
                  : "bg-slate-100 dark:bg-slate-800 border-slate-200/80 dark:border-slate-700/80 text-slate-700 dark:text-slate-300"
              }`}
            >
              <Menu size={15} strokeWidth={2.4} />
            </div>

            <div className="flex items-center gap-2">
              <ActiveIcon
                size={14}
                className={
                  isOpen
                    ? "text-indigo-400 dark:text-indigo-600 flex-shrink-0"
                    : "text-indigo-600 dark:text-indigo-400 flex-shrink-0"
                }
              />
              <span className="text-xs sm:text-sm font-bold truncate">
                {activeOption.label}
              </span>
            </div>

            <ChevronDown
              size={14}
              className={`transition-transform duration-200 ${
                isOpen ? "rotate-180" : ""
              } opacity-70 ml-1`}
            />
          </button>

          {/* DROPDOWN MENU */}
          {isOpen && (
            <div className="absolute left-0 mt-2 w-[320px] sm:w-[360px] rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-2xl z-[1200] overflow-hidden animate-in fade-in zoom-in-95 duration-150">
              <div className="px-4 py-2.5 bg-slate-50 dark:bg-slate-850 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
                <p className="text-xs font-bold text-slate-900 dark:text-slate-100 flex items-center gap-1.5">
                  <Menu size={13} className="text-indigo-600 dark:text-indigo-400" />
                  Select Legal Section
                </p>
                <span className="text-[10px] font-semibold text-slate-400 px-2 py-0.5 bg-slate-200/60 dark:bg-slate-800 rounded">
                  {CATEGORIES.length} options
                </span>
              </div>

              <div className="max-h-[340px] overflow-y-auto p-1.5 space-y-1 divide-y divide-slate-100/60 dark:divide-slate-800/60">
                {CATEGORIES.map((cat) => {
                  const Icon = cat.icon;
                  const isSelected = activeNormalized === cat.name;

                  return (
                    <button
                      key={cat.name}
                      type="button"
                      onClick={() => handleSelect(cat.name)}
                      className={`
                        w-full flex items-start gap-2.5 p-2 rounded-xl text-left transition-all duration-150
                        ${
                          isSelected
                            ? "bg-indigo-50/80 dark:bg-indigo-950/40 text-slate-900 dark:text-white font-medium"
                            : "hover:bg-slate-100/80 dark:hover:bg-slate-800/60 text-slate-700 dark:text-slate-300"
                        }
                      `}
                    >
                      <div
                        className={`
                          w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5 transition-colors
                          ${
                            isSelected
                              ? "bg-indigo-600 text-white shadow-xs"
                              : "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400"
                          }
                        `}
                      >
                        <Icon size={14} />
                      </div>

                      <div className="flex-1 min-w-0 pr-1">
                        <div className="flex items-center justify-between gap-1">
                          <span className="text-xs font-semibold truncate text-slate-900 dark:text-slate-100">
                            {cat.label}
                          </span>
                          {cat.badge && (
                            <span className="text-[8px] px-1.5 py-0.5 rounded font-bold uppercase tracking-wider flex-shrink-0 bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400 border border-slate-200/60 dark:border-slate-700/60">
                              {cat.badge}
                            </span>
                          )}
                        </div>
                        <p className="text-[10px] text-slate-500 dark:text-slate-400 line-clamp-1 mt-0.5">
                          {cat.description}
                        </p>
                      </div>

                      <div className="self-center">
                        {isSelected && (
                          <div className="w-4 h-4 rounded-full bg-indigo-600 text-white flex items-center justify-center">
                            <Check size={10} strokeWidth={3} />
                          </div>
                        )}
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        {/* FEED STATUS BADGE */}
        <div className="flex items-center gap-1.5 text-[11px] text-slate-500">
          <span className="inline-block w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
          <span className="font-semibold text-slate-600 dark:text-slate-400">Real-Time Judicial Feed</span>
        </div>
      </div>

      {/* MERGED GENERAL & GLOBAL SUB-FILTER (Mutual Hide/Show) */}
      {isMergedActive && setSubCategory && (
        <div className="flex items-center gap-1.5 p-1 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl shadow-xs overflow-x-auto">
          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 px-2 flex items-center gap-1">
            <Layers size={11} className="text-amber-500" /> Filter:
          </span>

          <button
            type="button"
            onClick={() => setSubCategory("All")}
            className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition-all ${
              subCategory === "All"
                ? "bg-slate-900 text-white dark:bg-white dark:text-slate-900 shadow-xs"
                : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800"
            }`}
          >
            Show All
          </button>

          <button
            type="button"
            onClick={() => setSubCategory("General")}
            className={`px-2.5 py-1 rounded-lg text-xs font-semibold flex items-center gap-1 transition-all ${
              subCategory === "General"
                ? "bg-indigo-600 text-white shadow-xs"
                : "text-slate-600 dark:text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-950/40"
            }`}
            title="Show only General (National) legal news, hide Global news"
          >
            <span>🇮🇳 General (National)</span>
            {subCategory === "General" && (
              <span className="text-[8px] bg-white/20 px-1 py-0.2 rounded font-mono">
                Global hidden
              </span>
            )}
          </button>

          <button
            type="button"
            onClick={() => setSubCategory("Global")}
            className={`px-2.5 py-1 rounded-lg text-xs font-semibold flex items-center gap-1 transition-all ${
              subCategory === "Global"
                ? "bg-purple-600 text-white shadow-xs"
                : "text-slate-600 dark:text-slate-400 hover:text-purple-600 dark:hover:text-purple-400 hover:bg-purple-50 dark:hover:bg-purple-950/40"
            }`}
            title="Show only Global (International) legal news, hide General news"
          >
            <span>🌐 Global (International)</span>
            {subCategory === "Global" && (
              <span className="text-[8px] bg-white/20 px-1 py-0.2 rounded font-mono">
                General hidden
              </span>
            )}
          </button>
        </div>
      )}
    </div>
  );
}
