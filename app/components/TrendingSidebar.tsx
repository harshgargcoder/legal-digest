"use client";

import { useEffect, useState } from "react";
import { TrendingUp, Hash, Layers, Zap } from "lucide-react";

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
        const data = await res.json();
        if (data.trendingTopics) {
          const formatted = data.trendingTopics.map((t: any) =>
            Array.isArray(t) ? t[0] : t
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
    "Corporate & Finance",
    "Sports"
  ];

  return (
    <div className="sticky top-32 flex flex-col gap-6">
      
      {/* 1. Trending Topics Section */}
      <div className="bg-white dark:bg-[#0B1221] border border-gray-100 dark:border-indigo-500/20 rounded-3xl p-6 shadow-sm dark:shadow-2xl relative overflow-hidden group">
        <div className="absolute -top-24 -right-24 w-48 h-48 bg-indigo-500/5 dark:bg-indigo-500/10 rounded-full blur-[80px] pointer-events-none group-hover:bg-purple-500/10 transition-colors duration-1000"></div>

        <div className="flex items-center gap-3 mb-6 relative z-10">
          <div className="w-10 h-10 rounded-xl bg-indigo-50 dark:bg-indigo-500/10 flex items-center justify-center border border-indigo-100 dark:border-indigo-500/20">
            <TrendingUp size={20} className="text-indigo-600 dark:text-indigo-400" />
          </div>
          <h3 className="text-lg font-bold text-gray-900 dark:text-white tracking-wide">
            Explore Trends
          </h3>
        </div>

        <div className="space-y-3 relative z-10">
          {loading && (
            <div className="flex items-center gap-3 px-4 py-3 bg-gray-50 dark:bg-white/5 border border-gray-100 dark:border-white/10 rounded-xl animate-pulse">
              <div className="w-4 h-4 rounded-full border-2 border-indigo-500 dark:border-indigo-400 border-t-transparent animate-spin"></div>
              <span className="text-sm font-medium text-indigo-600 dark:text-indigo-300">Decrypting trends...</span>
            </div>
          )}

          {!loading && topics.length === 0 && (
            <div className="text-sm text-gray-500 italic px-2">No trending topics detected.</div>
          )}

          {!loading && topics.map((topic, index) => (
            <div
              key={index}
              onClick={() => setSearch(topic)}
              className="group/item flex items-center gap-3 px-4 py-3 rounded-xl cursor-pointer transition-all duration-300 bg-gray-50 dark:bg-white/5 border border-gray-100 dark:border-white/5 hover:bg-indigo-50 dark:hover:bg-indigo-500/10 hover:border-indigo-200 dark:hover:border-indigo-500/30"
            >
              <div className="w-6 h-6 rounded-md bg-white dark:bg-black/40 flex items-center justify-center flex-shrink-0 group-hover/item:bg-indigo-600 dark:group-hover/item:bg-indigo-500 group-hover/item:text-white text-gray-400 border border-gray-200 dark:border-transparent transition-colors">
                <Hash size={12} />
              </div>
              <span className="text-sm font-medium text-gray-600 dark:text-gray-300 group-hover/item:text-gray-900 dark:group-hover/item:text-white line-clamp-2">
                {topic}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* 2. Popular Categories Section */}
      <div className="bg-white dark:bg-[#0B1221] border border-gray-100 dark:border-indigo-500/20 rounded-3xl p-6 shadow-sm dark:shadow-2xl relative overflow-hidden group">
        <div className="absolute -bottom-24 -left-24 w-48 h-48 bg-blue-500/5 dark:bg-blue-500/10 rounded-full blur-[80px] pointer-events-none transition-colors duration-1000"></div>

        <div className="flex items-center gap-3 mb-6 relative z-10">
          <div className="w-10 h-10 rounded-xl bg-blue-50 dark:bg-blue-500/10 flex items-center justify-center border border-blue-100 dark:border-blue-500/20">
            <Layers size={20} className="text-blue-600 dark:text-blue-400" />
          </div>
          <h3 className="text-lg font-bold text-gray-900 dark:text-white tracking-wide">
            Legal Domains
          </h3>
        </div>

        <div className="flex flex-wrap gap-2 relative z-10">
          {categories.map((cat, index) => (
            <div
              key={index}
              onClick={() => setSearch(cat)}
              className="px-3 py-1.5 rounded-lg border border-gray-200 dark:border-white/10 bg-gray-50 dark:bg-white/5 text-xs text-gray-600 dark:text-gray-300 cursor-pointer hover:bg-blue-100 dark:hover:bg-blue-500/20 hover:border-blue-300 dark:hover:border-blue-500/40 hover:text-blue-700 dark:hover:text-white transition-colors"
            >
              {cat}
            </div>
          ))}
        </div>
      </div>

      {/* 3. Quick Highlights Section */}
      <div className="bg-indigo-50 dark:bg-gradient-to-br dark:from-indigo-900/40 dark:to-purple-900/40 border border-indigo-100 dark:border-indigo-500/30 rounded-3xl p-6 shadow-sm dark:shadow-2xl">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-8 h-8 rounded-full bg-yellow-500/10 dark:bg-yellow-500/20 flex items-center justify-center">
            <Zap size={16} className="text-yellow-600 dark:text-yellow-400" />
          </div>
          <h3 className="text-base font-bold text-gray-900 dark:text-white">Latest Intelligence</h3>
        </div>
        <p className="text-xs text-gray-600 dark:text-gray-300 leading-relaxed mb-4">
          Enable push notifications to receive real-time alerts for major Supreme Court rulings and precedent-setting judgments.
        </p>
        <button 
          onClick={toggleNotifications}
          className={`w-full py-2.5 rounded-xl text-xs font-semibold border transition-colors shadow-lg active:scale-95 ${
            notificationsEnabled 
              ? 'bg-red-50 text-red-600 border-red-100 hover:bg-red-100 dark:bg-red-500/10 dark:border-red-500/20 dark:text-red-400 dark:shadow-none' 
              : 'bg-indigo-600 text-white border-indigo-500 hover:bg-indigo-700 shadow-indigo-600/20 dark:shadow-none'
          }`}
        >
          {notificationsEnabled ? "Disable Alerts" : "Enable Alerts"}
        </button>
      </div>

    </div>
  );
}