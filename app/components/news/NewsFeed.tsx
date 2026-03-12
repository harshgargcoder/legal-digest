"use client";

import { useEffect, useState } from "react";
import NewsCard from "./NewsCard";
import { ArrowUpRight } from "lucide-react";

interface Props {
  category: string;
  search: string;
  region?: string;
  preferences?: {
    categories: string[];
    topics: string[];
  } | null;
}

export default function NewsFeed({ category, search, region, preferences }: Props) {
  const [articles, setArticles] = useState<any[]>([]);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);
  const [hasMore, setHasMore] = useState(true);

  async function fetchNews(pageNumber = 1, reset = false) {
    if (loading && !reset) return;

    setLoading(true);

    let url = `/api/get-news?page=${pageNumber}&limit=10`;

    if (category && category !== "All") {
      url += `&category=${encodeURIComponent(category)}`;
    } else if (preferences?.categories && preferences.categories.length > 0) {
      url += `&categories=${encodeURIComponent(preferences.categories.join(","))}`;
    }

    if (preferences?.topics && preferences.topics.length > 0) {
      url += `&topics=${encodeURIComponent(preferences.topics.join(","))}`;
    }

    if (region) {
      url += `&region=${encodeURIComponent(region)}`;
    }

    if (search) {
      url += `&search=${encodeURIComponent(search)}`;
    }

    const res = await fetch(url);
    const data = await res.json();
    const newArticles = data.articles || [];

    setArticles((prev) => {
      if (reset) return newArticles;
      const seen = new Set(prev.map((a: any) => a.id));
      const uniqueNew = newArticles.filter((a: any) => !seen.has(a.id));
      return [...prev, ...uniqueNew];
    });

    setHasMore(newArticles.length === 10);
    setLoading(false);
    if (reset) setInitialLoading(false);
  }

  useEffect(() => {
    setInitialLoading(true);
    const delay = setTimeout(() => {
      setArticles([]);
      setPage(1);
      setHasMore(true);
      fetchNews(1, true);
    }, 300);

    return () => clearTimeout(delay);
  }, [category, search, region, preferences]);

  const handleLoadMore = () => {
    const nextPage = page + 1;
    setPage(nextPage);
    fetchNews(nextPage);
  };

  const slicedArticles = articles.slice(1);

  // Show a single centered spinner while the first page of results is loading
  if (initialLoading) {
    return (
      <div className="flex flex-col items-center justify-center py-24 gap-4">
        <span className="w-10 h-10 rounded-full border-2 border-indigo-400 border-t-transparent animate-spin" />
        <p className="text-sm text-gray-400 tracking-widest uppercase font-medium animate-pulse">
          Decrypting Feed…
        </p>
      </div>
    );
  }

  return (
    <>
      {articles.length > 0 && (
        <a 
          href={articles[0].url} 
          target="_blank" 
          rel="noopener noreferrer"
          className="block mb-10 group"
        >
          <div
            className="
            relative overflow-hidden p-8 sm:p-10 rounded-3xl transition-all duration-500
            bg-[#0B1221] border border-indigo-500/20 shadow-2xl
            dark:bg-gradient-to-br dark:from-[#0B1221] dark:to-[#111827]
            hover:border-indigo-500/40 hover:shadow-indigo-500/10
          "
          >
            {/* Background Map / Glow Decoration */}
            <div className="absolute top-0 right-0 w-full h-full bg-gradient-to-l from-indigo-500/10 to-transparent opacity-50 pointer-events-none mix-blend-screen"></div>
            <div className="absolute -top-32 -right-32 w-64 h-64 bg-indigo-600 rounded-full blur-[100px] opacity-20 pointer-events-none group-hover:bg-purple-600 transition-colors duration-1000"></div>

            <div className="relative z-10 flex flex-col h-full justify-between">
              <div>
                <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full font-bold text-[10px] tracking-widest uppercase bg-indigo-500/20 text-indigo-400 border border-indigo-500/30 mb-6 backdrop-blur-md">
                  <span className="w-1.5 h-1.5 rounded-full bg-indigo-400 animate-pulse"></span>
                  Top Story
                </span>

                <h2 className="text-2xl sm:text-4xl font-bold mt-2 text-white leading-tight group-hover:text-indigo-200 transition-colors duration-300">
                  {articles[0].title}
                </h2>

                <p className="mt-5 text-base sm:text-lg text-gray-300 leading-relaxed max-w-2xl">
                  {articles[0].summary}
                </p>
              </div>

              <div className="mt-8 flex items-center justify-between border-t border-white/10 pt-6">
                <div className="flex items-center gap-4 text-xs font-medium text-gray-400">
                  <span className="px-3 py-1 bg-white/5 rounded-lg border border-white/10 text-indigo-300">{articles[0].category}</span>
                  <span>{new Date(articles[0].published_at).toLocaleDateString("en-IN", { month: "long", day: "numeric", year: "numeric" })}</span>
                </div>
                
                <div className="w-10 h-10 rounded-full bg-white/5 border border-white/10 flex items-center justify-center group-hover:bg-indigo-600 group-hover:border-indigo-500 transition-colors duration-300 text-white">
                  <ArrowUpRight size={18} className="group-hover:rotate-12 transition-transform duration-300" />
                </div>
              </div>
            </div>
          </div>
        </a>
      )}

      <div className="grid gap-6 sm:gap-8">
        {slicedArticles.map((item: any, index: number) => (
          <NewsCard
            key={item.id}
            item={item}
            index={index + 1}
            activeCategory={category}
          />
        ))}
      </div>

      {hasMore && (
        <div className="flex justify-center mt-12 pb-12">
          <button
            onClick={handleLoadMore}
            disabled={loading}
            className="
            px-8 py-3.5 rounded-full font-semibold transition-all duration-300 text-sm tracking-wide
            bg-[#111827] text-white border border-white/10 hover:border-white/20 hover:bg-[#1f2937]
            disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-3
          "
          >
            {loading && (
              <span className="w-4 h-4 rounded-full border-2 border-indigo-400 border-t-transparent animate-spin"></span>
             )}
            {loading ? "Decrypting Feed..." : "Load Older Archives"}
          </button>
        </div>
      )}
    </>
  );
}
