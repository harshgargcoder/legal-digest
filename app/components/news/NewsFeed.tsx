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

  // Cache handling
  const getCacheKey = () => `news_cache_${category}_${search}_${region}`;

  useEffect(() => {
    // Load from cache first for instant UI
    const cached = localStorage.getItem(getCacheKey());
    if (cached) {
      try {
        const { data, timestamp } = JSON.parse(cached);
        // If cache is less than 1 hour old (matching cron), use it
        const isFresh = Date.now() - timestamp < 3600000;
        setArticles(data);
        if (isFresh) setInitialLoading(false);
      } catch (e) {
        localStorage.removeItem(getCacheKey());
      }
    }
  }, [category, search, region]);

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
      let finalArticles;
      if (reset) {
        finalArticles = newArticles;
      } else {
        const seen = new Set(prev.map((a: any) => a.id));
        const uniqueNew = newArticles.filter((a: any) => !seen.has(a.id));
        finalArticles = [...prev, ...uniqueNew];
      }

      // Update cache on first page load
      if (pageNumber === 1 && finalArticles.length > 0) {
        localStorage.setItem(getCacheKey(), JSON.stringify({
          data: finalArticles,
          timestamp: Date.now()
        }));
      }
      
      return finalArticles;
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
      <div className="flex flex-col items-center justify-center py-24">
        <span className="w-8 h-8 rounded-full border-2 border-indigo-500 border-t-transparent animate-spin" />
      </div>
    );
  }

  return (
    <>
      {articles.length > 0 && (
        <div className="mb-10">
          <NewsCard
            item={articles[0]}
            index={0}
            isFeatured={true}
            activeCategory={category}
          />
        </div>
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
            bg-white text-gray-900 border border-gray-200 hover:border-indigo-500 hover:bg-gray-50
            disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-3 shadow-md
          "
          >
            {loading && (
              <span className="w-4 h-4 rounded-full border-2 border-indigo-500 border-t-transparent animate-spin"></span>
            )}
            {loading ? "Loading..." : "Load Older Archives"}
          </button>
        </div>
      )}
    </>
  );
}
