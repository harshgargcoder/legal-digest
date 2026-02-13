"use client";

import { useEffect, useState } from "react";
import CategoryFilter from "./components/categories/CategoryFilter";
import NewsFeed from "./components/news/NewsFeed";
import HeroSection from "./components/HeroSection";
import NewsletterCTA from "./components/NewsLetterCTA";
import TrendingSidebar from "./components/TrendingSidebar";

export default function Home() {
  const [category, setCategory] = useState("All");
  const [search, setSearch] = useState("");
  const [lastUpdated, setLastUpdated] = useState<string | null>(null);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const res = await fetch("/api/get-news?stats=true", { cache: "no-store" });
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


  const lastUpdateText = lastUpdated
    ? new Date(lastUpdated).toLocaleString()
    : "—";

  const [stats, setStats] = useState({
    total: 0,
    uniqueSources: 0,
    lastUpdated: null as string | null,
  });


  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8 sm:py-10">

      <HeroSection search={search} setSearch={setSearch} />

      {/*STATUS STRIP */}
       <div className="grid grid-cols-2 sm:grid-cols-4 gap-6 mb-14">

        <div className="bg-white rounded-2xl p-6 border border-gray-200 hover:shadow-md transition">
          <p className="text-2xl font-semibold text-[#2f4a63]">
            {stats.total}
          </p>
          <p className="text-sm text-gray-500 mt-1">
            Articles Indexed
          </p>
        </div>

        <div className="bg-white rounded-2xl p-6 border border-gray-200 hover:shadow-md transition">
          <p className="text-2xl font-semibold text-[#2f4a63]">
            {stats.uniqueSources}
          </p>
          <p className="text-sm text-gray-500 mt-1">
            Global Sources
          </p>
        </div>

        <div className="bg-white rounded-2xl p-6 border border-gray-200 hover:shadow-md transition">
          <p className="text-2xl font-semibold text-[#2f4a63]">
            {stats.lastUpdated ? new Date(stats.lastUpdated).toLocaleString() : "—"}
          </p>
          <p className="text-sm text-gray-500 mt-1">
            Last Updated
          </p>
        </div>

        <div className="bg-white rounded-2xl p-6 border border-gray-200 hover:shadow-md transition">
          <p className="text-2xl font-semibold text-[#2f4a63]">
            3h
          </p>
          <p className="text-sm text-gray-500 mt-1">
            Auto Refresh Cycle
          </p>
        </div>

      </div>

      <CategoryFilter
        category={category}
        setCategory={setCategory}
      />

      {/* NEWS + SIDEBAR */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-12 mt-10">

        <div className="lg:col-span-2">
          <NewsFeed category={category} search={search} />
        </div>

        <aside className="hidden lg:block">
          <TrendingSidebar setSearch={setSearch} />
        </aside>

      </div>

      <NewsletterCTA />

    </div>
  );
}
