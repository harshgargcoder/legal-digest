"use client";

import { useState } from "react";
import { useSearch } from "@/app/context/SearchContext";

import CategoryFilter from "./components/categories/CategoryFilter";
import NewsFeed from "./components/news/NewsFeed";
import NewsletterCTA from "./components/NewsLetterCTA";
import TrendingSidebar from "./components/TrendingSidebar";

export default function Home() {
  const { search, setSearch } = useSearch();

  const [category, setCategory] = useState("All");

  return (
    <div className="max-w-6xl mx-auto px-4 py-8 min-h-screen bg-gray-50 dark:bg-[#0f172a]">

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

      {/* NEWSLETTER */}
      <div className="mt-16">
        <NewsletterCTA />
      </div>

    </div>
  );
}