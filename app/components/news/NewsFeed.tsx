"use client";

import NewsCard from "./NewsCard";
import { useNewsFeed } from "./useNewsFeed";
import type { NewsFeedProps } from "./types";

export default function NewsFeed(props: NewsFeedProps) {
  const { category } = props;
  const { articles, loading, initialLoading, hasMore, error, loadMore, retry } =
    useNewsFeed(props);

  const featuredArticle = articles[0];
  const slicedArticles = articles.slice(1);

  if (initialLoading) {
    return (
      <div className="flex flex-col items-center justify-center py-24">
        <span className="w-8 h-8 rounded-full border-2 border-indigo-500 border-t-transparent animate-spin" />
      </div>
    );
  }

  if (error && articles.length === 0) {
    return (
      <div className="rounded-2xl border border-white/10 bg-white/5 p-6 text-sm text-slate-300">
        <p className="font-medium text-white">{error}</p>
        <p className="mt-1 text-slate-400">
          Please try again in a moment.
        </p>
        <button
          type="button"
          onClick={retry}
          className="mt-4 rounded-full bg-indigo-500 px-4 py-2 text-sm font-semibold text-white transition hover:bg-indigo-400"
        >
          Retry
        </button>
      </div>
    );
  }

  return (
    <>
      {featuredArticle && (
        <div className="mb-10">
          <NewsCard
            item={featuredArticle}
            index={0}
            isFeatured={true}
            activeCategory={category}
          />
        </div>
      )}

      <div className="grid gap-6 sm:gap-8">
        {slicedArticles.map((item, index) => (
          <NewsCard
            key={item.id}
            item={item}
            index={index + 1}
            activeCategory={category}
          />
        ))}
      </div>

      {hasMore && (
        <div className="flex justify-center mt-8 pb-8">
          <button
            onClick={loadMore}
            disabled={loading}
            className="
            px-6 py-2.5 rounded-md font-semibold transition-colors text-xs uppercase tracking-wider
            bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-200 border border-slate-300 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700
            disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 shadow-sm
          "
          >
            {loading && (
              <span className="w-3.5 h-3.5 rounded-full border-2 border-slate-500 border-t-transparent animate-spin" />
            )}
            {loading ? "Loading..." : "Load Older Archives"}
          </button>
        </div>
      )}

      {error && articles.length > 0 && (
        <div className="mt-6 rounded-2xl border border-amber-400/20 bg-amber-400/10 px-4 py-3 text-sm text-amber-100">
          {error}
        </div>
      )}
    </>
  );
}
