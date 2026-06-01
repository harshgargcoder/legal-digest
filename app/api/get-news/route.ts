import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";
import type { GetNewsResponse } from "@/lib/api-types";

type NewsArticleRow = {
  id: string;
  title: string;
  summary: string | null;
  content: string | null;
  url: string;
  published_at: string;
  category: string | null;
  region: string | null;
  source: string | null;
};

// Categories that should only show National (Indian) news
const NATIONAL_ONLY_CATEGORIES = [
  "Supreme Court",
  "High Court",
  "Constitutional",
  "General",
  "Family",
  "Criminal",
];

// Categories with 50/50 National vs International split
const MIXED_CATEGORIES = ["Finance", "Sports"];

// Categories that show only International news
const INTERNATIONAL_ONLY_CATEGORIES = ["Global"];

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);

    const statsOnly = searchParams.get("stats") === "true";
    const category = searchParams.get("category");
    const region = searchParams.get("region");
    const search = searchParams.get("search");

    const page = Number(searchParams.get("page")) || 1;
    const limit = Number(searchParams.get("limit")) || 10;

    const from = (page - 1) * limit;
    const to = from + limit - 1;

    const { data: settingsData } = await supabase
      .from("settings")
      .select("last_updated")
      .eq("id", 1)
      .single();

    const lastUpdated = settingsData?.last_updated || null;

    if (statsOnly) {
      const { data: sourcesData, count } = await supabase
        .from("legal_news")
        .select("source", { count: "exact" });

      const uniqueSources = new Set(
        (sourcesData || [])
          .map((item) => item.source)
          .filter(Boolean),
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

    // ── BALANCED HOME FEED (ALL CATEGORIES) ──────────────────────────────────
    if ((!category || category === "All") && !search && (!topics || topics.length === 0) && (!categories || categories.includes("All"))) {
      const { data: rawArticles, error } = await supabase
        .from("legal_news")
        .select("*")
        .order("published_at", { ascending: false })
        .order("id", { ascending: false })
        .limit(120);

      if (error) throw error;

      const articles = rawArticles || [];

      const legalBucket: NewsArticleRow[] = [];
      const nonLegalBucket: NewsArticleRow[] = [];

      articles.forEach((art) => {
        const catClean = (art.category || "").trim().toLowerCase();
        if (catClean === "sports" || catClean === "global") {
          nonLegalBucket.push(art as NewsArticleRow);
        } else {
          legalBucket.push(art as NewsArticleRow);
        }
      });

      const balanced: NewsArticleRow[] = [];
      let legalIdx = 0;
      let nonLegalIdx = 0;

      while (legalIdx < legalBucket.length || nonLegalIdx < nonLegalBucket.length) {
        for (let i = 0; i < 3 && legalIdx < legalBucket.length; i++) {
          balanced.push(legalBucket[legalIdx++]);
        }
        if (nonLegalIdx < nonLegalBucket.length) {
          balanced.push(nonLegalBucket[nonLegalIdx++]);
        }
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

      return NextResponse.json(payload);
    }

    // Determine if we need special regional handling
    const isMixedCategory = category && MIXED_CATEGORIES.includes(category);
    const isNationalOnly = category && NATIONAL_ONLY_CATEGORIES.includes(category);
    const isInternationalOnly = category && INTERNATIONAL_ONLY_CATEGORIES.includes(category);

    // Override region filter if the user provided one explicitly
    const explicitRegion = region;

    // ── MIXED CATEGORY (50/50 split) ──────────────────────────────────────────
    if (isMixedCategory && !explicitRegion && !search && !topics) {
      const half = Math.ceil(limit / 2);

      const categoryStr = category as string;
      const buildMixedQuery = (regionFilter: string) => {
        let q = supabase.from("legal_news").select("*");
        
        if (categoryStr === "Finance") {
          q = q.or('category.ilike."Corporate & Finance",category.ilike.Finance');
        } else {
          q = q.ilike("category", categoryStr.trim());
        }
        
        q = q.eq("region", regionFilter);
        q = q.order("published_at", { ascending: false }).order("id", { ascending: false });
        return q.range(0, half); // Fetch half + 1 items (range 0 to half) to check if more exist
      };

      const [nationalResult, intlResult] = await Promise.all([
        buildMixedQuery("National"),
        buildMixedQuery("International"),
      ]);

      // Also fetch articles with old region values ('India'/'Global') for backwards compatibility
      const [oldNationalResult, oldIntlResult] = await Promise.all([
        buildMixedQuery("India"),
        buildMixedQuery("Global"),
      ]);

      const nationalArticles = [...(nationalResult.data || []), ...(oldNationalResult.data || [])];
      const intlArticles = [...(intlResult.data || []), ...(oldIntlResult.data || [])];

      // Interleave results: N, I, N, I, ...
      const interleaved: NewsArticleRow[] = [];
      const maxLen = Math.max(nationalArticles.length, intlArticles.length);
      for (let i = 0; i < maxLen; i++) {
        if (nationalArticles[i]) interleaved.push(nationalArticles[i]);
        if (intlArticles[i]) interleaved.push(intlArticles[i]);
      }

      const sliced = interleaved.slice(0, limit);
      const hasMore = interleaved.length > limit;

      return NextResponse.json({
        success: true,
        articles: sliced,
        total: sliced.length,
        page,
        limit,
        hasMore,
        lastUpdated,
        regionInfo: { national: nationalArticles.length, international: intlArticles.length },
      });
    }

    // ── STANDARD QUERY ────────────────────────────────────────────────────────
    let query = supabase
      .from("legal_news")
      .select("*");

    if (category && category !== "All") {
      if (category === "Finance") {
        query = query.or('category.ilike."Corporate & Finance",category.ilike.Finance');
      } else {
        query = query.ilike("category", category.trim());
      }
    } else if (categories && categories.length > 0 && !categories.includes("All")) {
      // Handle multiple categories with potential "Finance" selection
      if (categories.includes("Finance") || categories.includes("Corporate & Finance")) {
        const modifiedCategories = [...categories];
        if (!modifiedCategories.includes("Finance")) modifiedCategories.push("Finance");
        if (!modifiedCategories.includes("Corporate & Finance")) modifiedCategories.push("Corporate & Finance");
        query = query.in("category", modifiedCategories);
      } else {
        query = query.in("category", categories);
      }
    }

    // Apply region constraint — support both old ('India'/'Global') and new ('National'/'International') values
    if (explicitRegion) {
      // Explicit override takes priority
      query = query.eq("region", explicitRegion);
    } else if (isNationalOnly) {
      // Match both 'National' (new RSS) and 'India' (old fetch-news articles)
      query = query.or("region.eq.National,region.eq.India");
    } else if (isInternationalOnly) {
      // Match both 'International' (new RSS) and 'Global' (old fetch-news articles)
      query = query.or("region.eq.International,region.eq.Global");
    }

    // Build topics filter
    if (topics && topics.length > 0) {
      const topicFilters = topics.map(topic => `title.ilike.%${topic.trim()}%`).join(",");
      const summaryFilters = topics.map(topic => `summary.ilike.%${topic.trim()}%`).join(",");
      const contentFilters = topics.map(topic => `content.ilike.%${topic.trim()}%`).join(",");
      const orFilter = `${topicFilters},${summaryFilters},${contentFilters}`;
      query = query.or(orFilter);
    }

    if (search && search.trim() !== "") {
      const formatted = `%${search.trim()}%`;
      query = query.or(
        `title.ilike.${formatted},summary.ilike.${formatted},content.ilike.${formatted}`,
      );
    }

    query = query
      .order("published_at", { ascending: false })
      .order("id", { ascending: false });

    // Query limit + 1 items to see if there is another page
    const queryTo = from + limit;
    const { data, error } = await query.range(from, queryTo);

    if (error) throw error;

    const fetchedArticles = data || [];
    const hasMore = fetchedArticles.length > limit;
    const slicedArticles = fetchedArticles.slice(0, limit);

    const payload: GetNewsResponse<NewsArticleRow> = {
      success: true,
      articles: slicedArticles as NewsArticleRow[],
      total: slicedArticles.length,
      page,
      limit,
      hasMore,
      lastUpdated,
    };

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
