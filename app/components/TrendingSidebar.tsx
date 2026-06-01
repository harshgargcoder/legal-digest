"use client";

import { useEffect, useState } from "react";
import { TrendingUp, Hash, Layers, Zap } from "lucide-react";
import { sanitizeText } from "@/supabase/functions/_shared/filter";
import type { TrendingTopicsResponse } from "@/lib/api-types";

type Props = {
  setSearch: (value: string) => void;
};

export default function TrendingSidebar({ setSearch }: Props) {
  const [topics, setTopics] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [notificationsEnabled, setNotificationsEnabled] = useState(false);

  useEffect(() => {
    setNotificationsEnabled(localStorage.getItem("notifications") === "true");

    const fetchTopics = async () => {
      try {
        const res = await fetch("/api/summarize");
        const data = (await res.json()) as TrendingTopicsResponse;
        if (data.trendingTopics) {
          const formatted = data.trendingTopics.map((t) =>
            sanitizeText(t, 60)
          );
          setTopics(formatted);
        }
      } catch (err) {
        console.error("Failed to fetch trending topics");
      } finally {
        setLoading(false);
      }
    };
    fetchTopics();
  }, []);

  const toggleNotifications = async () => {
    if (!notificationsEnabled) {
      if (typeof window !== "undefined" && "Notification" in window) {
        if (Notification.permission === "granted") {
          setNotificationsEnabled(true);
          localStorage.setItem("notifications", "true");
        } else {
          try {
            const permission = await Notification.requestPermission();
            if (permission === "granted") {
              setNotificationsEnabled(true);
              localStorage.setItem("notifications", "true");
            }
          } catch (e) {
            console.error("Notification permission denied", e);
          }
        }
      } else {
        setNotificationsEnabled(true);
        localStorage.setItem("notifications", "true");
      }
    } else {
      setNotificationsEnabled(false);
      localStorage.setItem("notifications", "false");
    }
    window.dispatchEvent(new Event("storage"));
  };

  const categories = [
    "Supreme Court",
    "High Court",
    "Constitutional",
    "Finance",
    "Sports"
  ];

  return (
    <div className="sticky top-32 flex flex-col gap-5">

      {/* 1. Trending Topics Section */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg p-5 shadow-sm relative overflow-hidden">
        <div className="flex items-center gap-2.5 mb-4">
          <div className="w-8 h-8 rounded bg-slate-100 dark:bg-slate-800 flex items-center justify-center border border-slate-200 dark:border-slate-700">
            <TrendingUp size={16} className="text-slate-700 dark:text-slate-300 animate-bounce" />
          </div>
          <div>
            <h3 className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider">Explore Trends</h3>
            <p className="text-[9px] font-medium text-slate-500 uppercase tracking-wider">Active Search Keywords</p>
          </div>
        </div>

        <div className="space-y-2">
          {loading && (
            <div className="flex items-center gap-2 px-3 py-2 bg-slate-50 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800 rounded animate-pulse">
              <div className="w-3.5 h-3.5 rounded-full border-2 border-slate-500 border-t-transparent animate-spin"></div>
              <span className="text-xs font-semibold text-slate-500">Loading trends...</span>
            </div>
          )}

          {!loading && topics.length === 0 && (
            <div className="text-xs text-slate-500 italic px-1">No trending topics detected.</div>
          )}

          {!loading && topics.map((topic, index) => (
            <div
              key={index}
              onClick={() => setSearch(topic)}
              className="flex items-center gap-2 px-3 py-2 rounded cursor-pointer transition-colors bg-slate-50 dark:bg-slate-800/20 border border-slate-100 dark:border-slate-800 hover:bg-slate-100 dark:hover:bg-slate-800"
            >
              <div className="w-5 h-5 rounded bg-white dark:bg-slate-800 flex items-center justify-center flex-shrink-0 text-slate-400 border border-slate-200 dark:border-slate-700">
                <Hash size={10} />
              </div>
              <span className="text-xs font-semibold text-slate-700 dark:text-slate-300 line-clamp-2">
                {topic}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* 2. Popular Categories Section */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg p-5 shadow-sm relative overflow-hidden">
        <div className="flex items-center gap-2.5 mb-4">
          <div className="w-8 h-8 rounded bg-slate-100 dark:bg-slate-800 flex items-center justify-center border border-slate-200 dark:border-slate-700">
            <Layers size={16} className="text-slate-700 dark:text-slate-300 animate-bounce" />
          </div>
          <div>
            <h3 className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider">Legal Domains</h3>
            <p className="text-[9px] font-medium text-slate-500 uppercase tracking-wider">Primary Categories</p>
          </div>
        </div>

        <div className="flex flex-wrap gap-1.5">
          {categories.map((cat, index) => (
            <div
              key={index}
              onClick={() => setSearch(cat)}
              className="px-2.5 py-1 rounded border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/40 text-xs text-slate-700 dark:text-slate-300 font-medium cursor-pointer hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors"
            >
              {cat}
            </div>
          ))}
        </div>
      </div>

      {/* 3. Quick Highlights Section */}
      <div className="bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg p-5 shadow-sm">
        <div className="flex items-center gap-2 mb-3">
          <div className="w-7 h-7 rounded-full bg-slate-200 dark:bg-slate-800 flex items-center justify-center">
            <Zap size={14} className="text-slate-750 dark:text-slate-300" />
          </div>
          <h3 className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider">Latest Intelligence</h3>
        </div>
        <p className="text-[11px] text-slate-655 text-slate-600 dark:text-slate-400 leading-relaxed mb-4">
          Enable push notifications to receive real-time alerts for major Supreme Court rulings and precedent-setting judgments.
        </p>
        <button
          onClick={toggleNotifications}
          className={`w-full py-2 rounded text-xs font-bold border transition-colors shadow-sm active:scale-95 ${notificationsEnabled
              ? 'bg-red-50 text-red-650 border-red-100 hover:bg-red-100 dark:bg-red-950/20 dark:text-red-400 dark:border-red-900'
              : 'bg-slate-900 text-white border-slate-950 hover:bg-slate-800 dark:bg-slate-100 dark:text-slate-950 dark:border-slate-100'
            }`}
        >
          {notificationsEnabled ? "Disable Alerts" : "Enable Alerts"}
        </button>
      </div>

    </div>
  );
}
