import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";

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
      const { count } = await supabase
        .from("legal_news")
        .select("*", { count: "exact", head: true });

      const { data: sourcesData } = await supabase
        .from("legal_news")
        .select("source");

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

    let query = supabase
      .from("legal_news")
      .select("*", { count: "exact" });

    if (category && category !== "All") {
      query = query.ilike("category", category.trim());
    }

    if (region) {
      query = query.eq("region", region);
    }

    if (search && search.trim() !== "") {
      const formatted = `%${search.trim()}%`;
      query = query.or(
        `title.ilike.${formatted},summary.ilike.${formatted},content.ilike.${formatted}`,
      );
    }

    query = query.order("published_at", { ascending: false });

    const { data, error, count } = await query.range(from, to);

    if (error) throw error;

    return NextResponse.json({
      success: true,
      articles: data || [],
      total: count || 0,
      page,
      limit,
      hasMore: count ? to + 1 < count : false,
      lastUpdated,
    });
  } catch (error: any) {
    console.error("GET /api/get-news error:", error);

    return NextResponse.json(
      { success: false, error: error.message || "Something went wrong" },
      { status: 500 },
    );
  }
}
