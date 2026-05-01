"use client";

import { useEffect, useRef, useState } from "react";
import type { NewsArticle, NewsFeedProps, UseNewsFeedResult } from "./types";

const PAGE_SIZE = 10;
const CACHE_TTL_MS = 60 * 60 * 1000;
const REFRESH_DELAY_MS = 300;

function buildQueryUrl(
  pageNumber: number,
  category: string,
  search: string,
  region: string | undefined,
  preferences: NewsFeedProps["preferences"],
) {
  let url = `/api/get-news?page=${pageNumber}&limit=${PAGE_SIZE}`;

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

  return url;
}

function getCacheKey(category: string, search: string, region?: string) {
  return `news_cache_${category}_${search}_${region ?? ""}`;
}

export function useNewsFeed({
  category,
  search,
  region,
  preferences,
}: NewsFeedProps): UseNewsFeedResult {
  const [articles, setArticles] = useState<NewsArticle[]>([]);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);
  const [hasMore, setHasMore] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const abortRef = useRef<AbortController | null>(null);

  useEffect(() => {
    const cacheKey = getCacheKey(category, search, region);
    const cached = window.localStorage.getItem(cacheKey);

    if (!cached) return;

    try {
      const { data, timestamp } = JSON.parse(cached) as {
        data: NewsArticle[];
        timestamp: number;
      };

      setArticles(data);
      if (Date.now() - timestamp < CACHE_TTL_MS) {
        setInitialLoading(false);
      }
    } catch {
      window.localStorage.removeItem(cacheKey);
    }
  }, [category, search, region]);

  useEffect(() => {
    const cacheKey = getCacheKey(category, search, region);
    const delay = window.setTimeout(() => {
      abortRef.current?.abort();
      const controller = new AbortController();
      abortRef.current = controller;

      const fetchNews = async (pageNumber = 1, reset = false) => {
        if (loading && !reset) return;

        setLoading(true);
        setError(null);

        try {
          const url = buildQueryUrl(
            pageNumber,
            category,
            search,
            region,
            preferences,
          );

          const res = await fetch(url, { signal: controller.signal });
          if (!res.ok) {
            const fallback =
              res.status === 500
                ? "We could not load cases right now."
                : "We could not load cases right now.";
            setError(fallback);
            if (reset) {
              setArticles([]);
              setHasMore(false);
              setInitialLoading(false);
            }
            return;
          }

          const data = await res.json();
          const newArticles: NewsArticle[] = data.articles || [];

          setArticles((prev) => {
            const finalArticles = reset
              ? newArticles
              : [
                  ...prev,
                  ...newArticles.filter(
                    (article) => !prev.some((existing) => existing.id === article.id),
                  ),
                ];

            if (pageNumber === 1 && finalArticles.length > 0) {
              window.localStorage.setItem(
                cacheKey,
                JSON.stringify({
                  data: finalArticles,
                  timestamp: Date.now(),
                }),
              );
            }

            return finalArticles;
          });

          setHasMore(newArticles.length === PAGE_SIZE);
          if (reset) setInitialLoading(false);
        } catch (error) {
          if ((error as Error).name !== "AbortError") {
            setError("We could not load cases right now.");
            if (reset) {
              setArticles([]);
              setHasMore(false);
              setInitialLoading(false);
            }
          }
        } finally {
          setLoading(false);
        }
      };

      setArticles([]);
      setPage(1);
      setHasMore(true);
      setInitialLoading(true);
      void fetchNews(1, true);
    }, REFRESH_DELAY_MS);

    return () => {
      window.clearTimeout(delay);
      abortRef.current?.abort();
    };
  }, [category, search, region, preferences]);

  const loadMore = () => {
    const nextPage = page + 1;
    setPage(nextPage);

    const controller = new AbortController();
    abortRef.current = controller;

    void (async () => {
      setLoading(true);
      try {
        const url = buildQueryUrl(
          nextPage,
          category,
          search,
          region,
          preferences,
        );

        const res = await fetch(url, { signal: controller.signal });
        if (!res.ok) {
          setError("We could not load more cases right now.");
          return;
        }

        const data = await res.json();
        const newArticles: NewsArticle[] = data.articles || [];

        setArticles((prev) =>
          [
            ...prev,
            ...newArticles.filter(
              (article) => !prev.some((existing) => existing.id === article.id),
            ),
          ],
        );

        setHasMore(newArticles.length === PAGE_SIZE);
      } catch (error) {
        if ((error as Error).name !== "AbortError") {
          setError("We could not load more cases right now.");
        }
      } finally {
        setLoading(false);
      }
    })();
  };

  const retry = () => {
    setError(null);
    setInitialLoading(true);
    setArticles([]);
    setPage(1);
    setHasMore(true);
    abortRef.current?.abort();
    abortRef.current = null;
    void (async () => {
      const controller = new AbortController();
      abortRef.current = controller;
      setLoading(true);
      try {
        const url = buildQueryUrl(1, category, search, region, preferences);
        const res = await fetch(url, { signal: controller.signal });
        if (!res.ok) {
          setError("We could not load cases right now.");
          return;
        }

        const data = await res.json();
        const newArticles: NewsArticle[] = data.articles || [];
        setArticles(newArticles);
        setHasMore(newArticles.length === PAGE_SIZE);
      } catch (retryError) {
        if ((retryError as Error).name !== "AbortError") {
          setError("We could not load cases right now.");
        }
      } finally {
        setLoading(false);
        setInitialLoading(false);
      }
    })();
  };

  return {
    articles,
    loading,
    initialLoading,
    hasMore,
    error,
    loadMore,
    retry,
  };
}
