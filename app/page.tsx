"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { useSearch } from "@/app/context/SearchContext";

import CategoryFilter from "./components/categories/CategoryFilter";
import NewsFeed from "./components/news/NewsFeed";
import NewsletterCTA from "./components/NewsLetterCTA";
import TrendingSidebar from "./components/TrendingSidebar";

export default function Home() {
  const { search, setSearch } = useSearch(); // ✅ use global search

  const [category, setCategory] = useState("All");

  const [stats, setStats] = useState({
    total: 0,
    uniqueSources: 0,
    lastUpdated: null as string | null,
  });

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const res = await fetch("/api/get-news?stats=true", {
          cache: "no-store",
        });

        const data = await res.json();

        if (data.success) {
          setStats({
            total: data.total,
            uniqueSources: data.uniqueSources,
            lastUpdated: data.lastUpdated,
          });
        }
      } catch (err) {
        console.error("Failed to fetch stats");
      }
    };

    fetchStats();
  }, []);

  const formattedDate = stats.lastUpdated
    ? new Date(stats.lastUpdated).toLocaleString("en-IN", {
        dateStyle: "medium",
        timeStyle: "short",
      })
    : "—";

  const statCards = [
    { label: "Articles Indexed", value: stats.total },
    { label: "Global Sources", value: stats.uniqueSources },
    { label: "Last Updated", value: formattedDate },
    { label: "Auto Refresh Cycle", value: "3h" },
  ];

  return (
    <div className="max-w-6xl mx-auto px-4 py-8 min-h-screen bg-gray-50 dark:bg-[#0f172a]">

      {/* STATUS STRIP */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mt-10 mb-12">
        {statCards.map((item, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 25 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1, duration: 0.4 }}
            whileHover={{ y: -6, scale: 1.02 }}
            className="relative group rounded-2xl overflow-hidden"
          >
            <div className="absolute inset-0 rounded-2xl p-[1px] bg-gradient-to-r from-cyan-400 via-blue-500 to-indigo-500 opacity-70 group-hover:opacity-100 transition-all duration-500"></div>

            <div className="absolute inset-0 rounded-2xl blur-2xl bg-gradient-to-r from-cyan-500/40 via-blue-500/40 to-indigo-500/40 opacity-0 group-hover:opacity-100 transition-all duration-500 hidden dark:block"></div>

            <div className="relative rounded-2xl p-6 transition-all duration-500 bg-white border border-gray-200 shadow-sm dark:bg-white/10 dark:border-white/20 dark:backdrop-blur-xl">
              <p className="text-2xl font-semibold tracking-wide text-gray-900 dark:text-white whitespace-nowrap">
                {item.value}
              </p>
              <p className="text-sm text-gray-500 dark:text-white/70 mt-2">
                {item.label}
              </p>
            </div>
          </motion.div>
        ))}
      </div>

      {/* CATEGORY FILTER */}
      <CategoryFilter
        category={category}
        setCategory={setCategory}
      />

      {/* NEWS + SIDEBAR */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-10 mt-10">

        <div className="lg:col-span-2">
          <NewsFeed category={category} search={search} />
        </div>

        <aside className="hidden lg:block">
          <TrendingSidebar setSearch={setSearch} />
        </aside>

      </div>

      <div className="mt-16">
        <NewsletterCTA />
      </div>

    </div>
  );
}