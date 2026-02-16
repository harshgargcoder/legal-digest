"use client";

import { useEffect, useState } from "react";
import NewsCard from "./NewsCard";

interface Props {
  category: string;
  search: string;
  region?: string;
}

export default function NewsFeed({ category, search, region }: Props) {
  const [articles, setArticles] = useState<any[]>([]);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(false);
  const [hasMore, setHasMore] = useState(true);

  async function fetchNews(pageNumber = 1, reset = false) {
    if (loading && !reset) return;

    setLoading(true);

    let url = `/api/get-news?page=${pageNumber}&limit=10`;

    if (category && category !== "All") {
      url += `&category=${encodeURIComponent(category)}`;
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
  }, [category, search, region]);

  const handleLoadMore = () => {
    const nextPage = page + 1;
    setPage(nextPage);
    fetchNews(nextPage);
  };

  const slicedArticles = articles.slice(1);

  return (
    <>
      {articles.length > 0 && (
        <div
          className="
          mb-10 p-6 sm:p-8 rounded-2xl transition-all duration-500

          /* Light Mode */
          bg-white border border-gray-200 shadow-md

          /* Dark Mode */
          dark:bg-gradient-to-br
        dark:from-indigo-900/60
        dark:to-purple-900/60
        dark:border-indigo-500/30
          dark:shadow-lg
          dark:backdrop-blur-xl
          hover:shadow-xl
        "
        >
          <span className="text-xs px-3 py-1 rounded-full font-medium bg-indigo-600 text-white">
            🔥 Breaking Intelligence
          </span>

          <h2 className="text-xl sm:text-2xl font-bold mt-4 text-gray-900 dark:text-white leading-snug">
            {articles[0].title}
          </h2>

          <p className="mt-3 text-sm sm:text-base text-gray-600 dark:text-gray-300 leading-relaxed">
            {articles[0].summary}
          </p>

          <a
            href={articles[0].url}
            target="_blank"
            rel="noopener noreferrer"
            className="
            inline-block mt-5 font-medium transition

            text-indigo-600 hover:text-indigo-800
            dark:text-indigo-300 dark:hover:text-white
          "
          >
            Read Full →
          </a>
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
        <div className="flex justify-center mt-12">
          <button
            onClick={handleLoadMore}
            disabled={loading}
            className="
            px-6 py-3 rounded-xl font-medium transition-all duration-300

            /* Light */
            bg-indigo-600 text-white hover:bg-indigo-700 shadow-md

            /* Dark */
            dark:bg-indigo-500 dark:hover:bg-indigo-600

            disabled:opacity-50 disabled:cursor-not-allowed
          "
          >
            {loading ? "Loading..." : "Load More"}
          </button>
        </div>
      )}
    </>
  );

}
