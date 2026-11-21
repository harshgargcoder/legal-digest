"use client";

import { useEffect, useRef, useState } from "react";
import type { NewsArticle, NewsFeedProps, UseNewsFeedResult } from "./types";

const PAGE_SIZE = 10;
const CACHE_TTL_MS = 5 * 60 * 1000;
const REFRESH_DELAY_MS = 250;

function buildQueryUrl(
  pageNumber: number,
  category: string,
  subCategory: "All" | "General" | "Global" | undefined,
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

  if (subCategory && subCategory !== "All") {
    url += `&subCategory=${encodeURIComponent(subCategory)}`;
  }

  // Only pass background preference topics on general/all feed without specific search
  if ((!category || category === "All") && !search && preferences?.topics && preferences.topics.length > 0) {
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

function getCacheKey(
  category: string,
  subCategory?: string,
  search?: string,
  region?: string,
) {
  return `news_cache_v6_${category}_${subCategory ?? "All"}_${search ?? ""}_${region ?? ""}`;
}

// Helper to filter articles client-side when in General & Global mode
function filterArticlesBySubCategory(
  list: NewsArticle[],
  category: string,
  subCategory?: "All" | "General" | "Global",
): NewsArticle[] {
  if (
    category !== "General & Global" &&
    category !== "General/Global" &&
    category !== "General" &&
    category !== "Global"
  ) {
    return list;
  }

  if (!subCategory || subCategory === "All") {
    return list;
  }

  if (subCategory === "General") {
    // Show only General/National, hide Global
    return list.filter((art) => {
      const cat = (art.category || "").toLowerCase();
      const reg = (art.region || "").toLowerCase();
      const tags = Array.isArray(art.tags) ? art.tags.join(" ").toLowerCase() : (art.tags || "").toLowerCase();

      // If explicitly Global, hide it
      if (cat === "global" || tags.includes("global")) return false;
      if (reg === "global" || reg === "international") return false;

      return true;
    });
  }

  if (subCategory === "Global") {
    // Show only Global/International, hide General
    return list.filter((art) => {
      const cat = (art.category || "").toLowerCase();
      const reg = (art.region || "").toLowerCase();
      const tags = Array.isArray(art.tags) ? art.tags.join(" ").toLowerCase() : (art.tags || "").toLowerCase();

      // If explicitly India/National or General, hide it unless marked Global
      if (cat === "global" || reg === "global" || reg === "international" || tags.includes("global")) {
        return true;
      }
      return false;
    });
  }

  return list;
}

export function useNewsFeed({
  category,
  subCategory = "All",
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

  // Load from local storage cache
  useEffect(() => {
    const cacheKey = getCacheKey(category, subCategory, search, region);
    const cached = window.localStorage.getItem(cacheKey);

    if (!cached) return;

    try {
      const { data, timestamp } = JSON.parse(cached) as {
        data: NewsArticle[];
        timestamp: number;
      };

      const filtered = filterArticlesBySubCategory(data, category, subCategory);
      setArticles(filtered);
      if (Date.now() - timestamp < CACHE_TTL_MS) {
        setInitialLoading(false);
      }
    } catch {
      window.localStorage.removeItem(cacheKey);
    }
  }, [category, subCategory, search, region]);

  // Fetch data with auto-retry
  useEffect(() => {
    const cacheKey = getCacheKey(category, subCategory, search, region);
    const delay = window.setTimeout(() => {
      abortRef.current?.abort();
      const controller = new AbortController();
      abortRef.current = controller;

      const fetchNewsWithRetry = async (
        pageNumber = 1,
        reset = false,
        retryCount = 0,
      ) => {
        if (loading && !reset) return;

        setLoading(true);
        setError(null);

        try {
          const url = buildQueryUrl(
            pageNumber,
            category,
            subCategory,
            search,
            region,
            preferences,
          );

          const res = await fetch(url, { signal: controller.signal });
          if (!res.ok) {
            // Auto retry once if status 500 or timeout
            if (retryCount < 1) {
              await new Promise((r) => setTimeout(r, 600));
              return fetchNewsWithRetry(pageNumber, reset, retryCount + 1);
            }

            const fallback = "We could not load cases right now.";
            setError(fallback);
            if (reset) {
              setArticles([]);
              setHasMore(false);
              setInitialLoading(false);
            }
            return;
          }

          const data = await res.json();
          const rawArticles: NewsArticle[] = data.articles || [];
          const newArticles = filterArticlesBySubCategory(
            rawArticles,
            category,
            subCategory,
          );

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
              try {
                window.localStorage.setItem(
                  cacheKey,
                  JSON.stringify({
                    data: finalArticles,
                    timestamp: Date.now(),
                  }),
                );
              } catch {
                // Ignore quota exceeded
              }
            }

            return finalArticles;
          });

          setHasMore(data.hasMore ?? newArticles.length === PAGE_SIZE);
          if (reset) setInitialLoading(false);
        } catch (fetchError) {
          if ((fetchError as Error).name !== "AbortError") {
            if (retryCount < 1) {
              await new Promise((r) => setTimeout(r, 600));
              return fetchNewsWithRetry(pageNumber, reset, retryCount + 1);
            }
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
      void fetchNewsWithRetry(1, true, 0);
    }, REFRESH_DELAY_MS);

    return () => {
      window.clearTimeout(delay);
      abortRef.current?.abort();
    };
  }, [category, subCategory, search, region, preferences]);

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
          subCategory,
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
        const rawArticles: NewsArticle[] = data.articles || [];
        const newArticles = filterArticlesBySubCategory(
          rawArticles,
          category,
          subCategory,
        );

        setArticles((prev) => [
          ...prev,
          ...newArticles.filter(
            (article) => !prev.some((existing) => existing.id === article.id),
          ),
        ]);

        setHasMore(data.hasMore ?? newArticles.length === PAGE_SIZE);
      } catch (err) {
        if ((err as Error).name !== "AbortError") {
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
        const url = buildQueryUrl(
          1,
          category,
          subCategory,
          search,
          region,
          preferences,
        );
        const res = await fetch(url, { signal: controller.signal });
        if (!res.ok) {
          setError("We could not load cases right now.");
          return;
        }

        const data = await res.json();
        const rawArticles: NewsArticle[] = data.articles || [];
        const newArticles = filterArticlesBySubCategory(
          rawArticles,
          category,
          subCategory,
        );
        setArticles(newArticles);
        setHasMore(data.hasMore ?? newArticles.length === PAGE_SIZE);
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
