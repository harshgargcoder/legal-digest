import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabse";

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

    // 🔥 STATS MODE (No Articles Fetch)
    if (statsOnly) {
      const { count } = await supabase
        .from("legal_news")
        .select("*", { count: "exact", head: true });

      const { data: sources } = await supabase
        .from("legal_news")
        .select("source");

      const uniqueSources = [
        ...new Set(sources?.map((s) => s.source).filter(Boolean))
      ].length;

      const { data: settingsData } = await supabase
        .from("settings")
        .select("last_updated")
        .eq("id", 1)
        .single();

      return NextResponse.json({
        success: true,
        total: count || 0,
        uniqueSources,
        lastUpdated: settingsData?.last_updated || null,
      });
    }

    // 🔥 NORMAL NEWS FETCH
    let query = supabase
      .from("legal_news")
      .select("*", { count: "exact" });

    if (category && category !== "All") {
      query = query.eq("category", category);
    }

    if (region) {
      query = query.eq("region", region);
    }

    if (search && search.trim() !== "") {
      query = query.or(
        `title.ilike.%${search}%,summary.ilike.%${search}%`
      );
    }

    query = query.order("published_at", { ascending: false });

    const { data, error, count } = await query.range(from, to);

    if (error) throw error;

    const { data: settingsData } = await supabase
      .from("settings")
      .select("last_updated")
      .eq("id", 1)
      .single();

    return NextResponse.json({
      success: true,
      articles: data || [],
      total: count || 0,
      page,
      limit,
      hasMore: count ? to + 1 < count : false,
      lastUpdated: settingsData?.last_updated || null,
    });

  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}
