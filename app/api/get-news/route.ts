import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";
import type { GetNewsResponse } from "@/lib/api-types";

type NewsArticleRow = {
  id: string;
  title: string;
  summary: string | null;
  content?: string | null;
  url: string;
  published_at: string;
  created_at?: string;
  category: string | null;
  region: string | null;
  source: string | null;
  image_url?: string | null;
  score?: number | null;
  tags?: string[] | string | null;
};

// Standard column selection (omit heavy content column for feed list to prevent timeouts)
const SELECT_COLUMNS =
  "id, title, summary, url, source, published_at, created_at, category, region, score, image_url, tags";

// Short in-memory response cache (TTL: 5 seconds) to prevent redundant concurrent queries while keeping news fresh
type CacheEntry = {
  data: GetNewsResponse<NewsArticleRow>;
  expiresAt: number;
};
const memoryCache = new Map<string, CacheEntry>();

// Categories that should prioritize National (Indian) news
const NATIONAL_ONLY_CATEGORIES = [
  "Supreme Court",
  "High Court",
  "Constitutional",
  "Family",
  "Criminal",
];

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);

    const statsOnly = searchParams.get("stats") === "true";
    const category = searchParams.get("category");
    const subCategory = searchParams.get("subCategory");
    const region = searchParams.get("region");
    const search = searchParams.get("search");

    const page = Number(searchParams.get("page")) || 1;
    const limit = Number(searchParams.get("limit")) || 10;

    const from = (page - 1) * limit;
    const to = from + limit - 1;

    // Fast memory cache check
    const cacheKey = `${category || "All"}_${subCategory || "All"}_${region || ""}_${search || ""}_${page}_${limit}`;
    const cached = memoryCache.get(cacheKey);
    if (cached && Date.now() < cached.expiresAt) {
      return NextResponse.json(cached.data);
    }

    let lastUpdated: string | null = null;
    try {
      const { data: settingsData } = await supabase
        .from("settings")
        .select("last_updated")
        .eq("id", 1)
        .maybeSingle();
      lastUpdated = settingsData?.last_updated || null;
    } catch {
      // Ignore settings error
    }

    if (statsOnly) {
      const { data: sourcesData, count } = await supabase
        .from("legal_news")
        .select("source", { count: "exact", head: false })
        .limit(200);

      const uniqueSources = new Set(
        (sourcesData || []).map((item) => item.source).filter(Boolean),
      ).size;

      return NextResponse.json({
        success: true,
        total: count || 0,
        uniqueSources,
        lastUpdated,
      });
    }

    const categories = searchParams.get("categories")?.split(",");
    const topics = searchParams.get("topics")?.split(",");

    const isAllCategory =
      (!category || category === "All") &&
      !search &&
      (!topics || topics.length === 0) &&
      (!categories || categories.includes("All"));

    // ── 1. BALANCED HOME FEED (ALL CATEGORIES) ──────────────────────────────────
    if (isAllCategory) {
      let balanced: NewsArticleRow[] = [];
      let queryError: unknown = null;

      try {
        // Parallel fetch: High-priority legal court news (60) + General & Global world news (30)
        const [legalRes, generalRes] = await Promise.all([
          supabase
            .from("legal_news")
            .select(SELECT_COLUMNS)
            .in("category", [
              "Supreme Court",
              "High Court",
              "Constitutional",
              "Criminal",
              "Family",
              "Finance",
            ])
            .order("published_at", { ascending: false, nullsFirst: false })
            .limit(60),
          supabase
            .from("legal_news")
            .select(SELECT_COLUMNS)
            .or('category.eq."General & Global",category.eq.General,category.eq.Global')
            .order("published_at", { ascending: false, nullsFirst: false })
            .limit(30),
        ]);

        const legalArticles = (legalRes.data as NewsArticleRow[]) || [];
        const generalArticles = (generalRes.data as NewsArticleRow[]) || [];

        // Interleave: 2 Legal court cases for every 1 General/Global news item
        let legalIdx = 0;
        let generalIdx = 0;

        while (legalIdx < legalArticles.length || generalIdx < generalArticles.length) {
          if (legalIdx < legalArticles.length) balanced.push(legalArticles[legalIdx++]);
          if (legalIdx < legalArticles.length) balanced.push(legalArticles[legalIdx++]);
          if (generalIdx < generalArticles.length) balanced.push(generalArticles[generalIdx++]);
        }
      } catch (err) {
        queryError = err;
      }

      // Fallback if parallel fetch failed or returned empty
      if (balanced.length === 0) {
        const fallbackRes = await supabase
          .from("legal_news")
          .select(SELECT_COLUMNS)
          .order("created_at", { ascending: false, nullsFirst: false })
          .limit(60);

        if (fallbackRes.error) {
          throw queryError || fallbackRes.error;
        }
        balanced = (fallbackRes.data as NewsArticleRow[]) || [];
      }

      const slicedArticles = balanced.slice(from, from + limit);
      const hasMore = balanced.length > from + limit;

      const payload: GetNewsResponse<NewsArticleRow> = {
        success: true,
        articles: slicedArticles,
        total: slicedArticles.length,
        page,
        limit,
        hasMore,
        lastUpdated,
      };

      if (page === 1) {
        memoryCache.set(cacheKey, {
          data: payload,
          expiresAt: Date.now() + 15_000,
        });
      }

      return NextResponse.json(payload);
    }

    // ── 2. MERGED GENERAL & GLOBAL CATEGORY ───────────────────────────────────
    const isGeneralGlobalCategory =
      category === "General & Global" ||
      category === "General/Global" ||
      category === "General" ||
      category === "Global";

    if (isGeneralGlobalCategory && !search && (!topics || topics.length === 0)) {
      let query = supabase.from("legal_news").select(SELECT_COLUMNS);

      if (subCategory === "General") {
        query = query
          .or('category.eq."General & Global",category.eq.General')
          .or("region.eq.India,region.eq.National");
      } else if (subCategory === "Global") {
        query = query
          .or('category.eq."General & Global",category.eq.Global')
          .or("region.eq.Global,region.eq.International");
      } else {
        query = query.or(
          'category.eq."General & Global",category.eq.General,category.eq.Global',
        );
      }

      query = query.order("published_at", { ascending: false, nullsFirst: false });
      const queryTo = from + limit;
      let { data, error } = await query.range(from, queryTo);

      if (error) {
        // Fallback: order by created_at
        const fallback = await supabase
          .from("legal_news")
          .select(SELECT_COLUMNS)
          .or('category.eq."General & Global",category.eq.General,category.eq.Global')
          .order("created_at", { ascending: false, nullsFirst: false })
          .range(from, queryTo);

        if (!fallback.error) {
          data = fallback.data;
          error = null;
        }
      }

      if (error) throw error;

      const fetchedArticles = (data as NewsArticleRow[]) || [];
      const hasMore = fetchedArticles.length > limit;
      const slicedArticles = fetchedArticles.slice(0, limit);

      const payload: GetNewsResponse<NewsArticleRow> = {
        success: true,
        articles: slicedArticles,
        total: slicedArticles.length,
        page,
        limit,
        hasMore,
        lastUpdated,
      };

      if (page === 1) {
        memoryCache.set(cacheKey, {
          data: payload,
          expiresAt: Date.now() + 15_000,
        });
      }

      return NextResponse.json(payload);
    }

    // ── 3. STANDARD / SPECIFIC CATEGORY QUERIES ──────────────────────────────
    let query = supabase.from("legal_news").select(SELECT_COLUMNS);

    if (category && category !== "All") {
      if (category === "Finance") {
        query = query.or('category.eq.Finance,category.eq."Corporate & Finance"');
      } else {
        query = query.eq("category", category.trim());
      }
    } else if (categories && categories.length > 0 && !categories.includes("All")) {
      query = query.in("category", categories);
    }

    // Apply region constraint safely ONLY if explicitly passed by client
    if (region) {
      query = query.eq("region", region);
    }

    // Search filter if provided
    if (search && search.trim() !== "") {
      const formatted = `%${search.trim()}%`;
      query = query.or(`title.ilike.${formatted},summary.ilike.${formatted}`);
    } else if ((!category || category === "All") && topics && topics.length > 0) {
      // Apply topics filter ONLY on All category when explicitly requested
      const topicFilters = topics
        .map((t) => `title.ilike.%${t.trim()}%`)
        .join(",");
      query = query.or(topicFilters);
    }

    // Order strictly by published_at DESC (nulls last)
    query = query.order("published_at", { ascending: false, nullsFirst: false });

    const queryTo = from + limit;
    let { data, error } = await query.range(from, queryTo);

    // If query timed out with statement timeout, fallback to created_at DESC (chronological)
    if (error && (error.code === "57014" || error.message?.includes("timeout"))) {
      let fallbackQuery = supabase
        .from("legal_news")
        .select(SELECT_COLUMNS);

      if (category && category !== "All") {
        if (category === "Finance") {
          fallbackQuery = fallbackQuery.or('category.eq.Finance,category.eq."Corporate & Finance"');
        } else {
          fallbackQuery = fallbackQuery.eq("category", category.trim());
        }
      }
      fallbackQuery = fallbackQuery.order("created_at", { ascending: false, nullsFirst: false });

      const fallbackRes = await fallbackQuery.range(from, queryTo);
      if (!fallbackRes.error) {
        data = fallbackRes.data;
        error = null;
      }
    }

    if (error) throw error;

    const fetchedArticles = (data as NewsArticleRow[]) || [];
    const hasMore = fetchedArticles.length > limit;
    const slicedArticles = fetchedArticles.slice(0, limit);

    const payload: GetNewsResponse<NewsArticleRow> = {
      success: true,
      articles: slicedArticles,
      total: slicedArticles.length,
      page,
      limit,
      hasMore,
      lastUpdated,
    };

    if (page === 1) {
      memoryCache.set(cacheKey, {
        data: payload,
        expiresAt: Date.now() + 15_000,
      });
    }

    return NextResponse.json(payload);
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Something went wrong";
    console.error("GET /api/get-news error:", error);

    return NextResponse.json(
      { success: false, error: message },
      { status: 500 },
    );
  }
}
