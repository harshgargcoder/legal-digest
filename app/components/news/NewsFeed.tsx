"use client";

import { useEffect, useState } from "react";
import NewsCard from "./NewsCard";

interface Props {
  category: string;
  search: string;
}

export default function NewsFeed({ category, search }: Props) {
  const [articles, setArticles] = useState<any[]>([]);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(false);
  const [hasMore, setHasMore] = useState(true);

  async function fetchNews(pageNumber = 1, reset = false) {
    if (loading && !reset) return;

    setLoading(true);

    const baseUrl =
      category === "All"
        ? `/api/get-news?page=${pageNumber}&limit=10`
        : `/api/get-news?category=${category}&page=${pageNumber}&limit=10`;

    const finalUrl = search
      ? `${baseUrl}&search=${encodeURIComponent(search)}`
      : baseUrl;

    const res = await fetch(finalUrl);

    const data = await res.json();
    const newArticles = data.articles || [];

    setArticles((prev) =>
      reset ? newArticles : [...prev, ...newArticles]
    );

    setHasMore(newArticles.length === 10);
    setLoading(false);
  }

  useEffect(() => {
    const delay = setTimeout(() => {
      setArticles([]);
      setPage(1);
      setHasMore(true);
      fetchNews(1, true);
    }, 300);

    return () => clearTimeout(delay);
  }, [category, search]);

  const handleLoadMore = () => {
    const nextPage = page + 1;
    setPage(nextPage);
    fetchNews(nextPage);
  };

  const slicedArticles = articles.slice(1);

  return (
    <>
      {/* FEATURED BIG CARD */}
      {articles.length > 0 && (
        <div className="mb-10 p-6 sm:p-8 rounded-2xl bg-gradient-to-br from-indigo-600/20 to-purple-600/20 border border-indigo-500/30 backdrop-blur-xl">
          <span className="text-xs bg-indigo-600 text-white px-3 py-1 rounded-full">
            🔥 Breaking Intelligence
          </span>

          <h2 className="text-xl sm:text-2xl font-bold text-white mt-4">
            {articles[0].title}
          </h2>

          <p className="text-gray-300 mt-3 text-sm sm:text-base">
            {articles[0].summary}
          </p>

          <a
            href={articles[0].url}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-block mt-4 text-indigo-300 hover:text-white transition"
          >
            Read Full →
          </a>
        </div>
      )}

      {/* GRID */}
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

      {/* LOAD MORE BUTTON */}
      {hasMore && (
        <div className="flex justify-center mt-10">
          <button
            onClick={handleLoadMore}
            disabled={loading}
            className="px-6 py-3 cursor-pointer rounded-xl bg-indigo-600 text-white font-medium hover:bg-indigo-700 transition disabled:opacity-50"
          >
            {loading ? "Loading..." : "Load More"}
          </button>
        </div>
      )}
    </>
  );
}
