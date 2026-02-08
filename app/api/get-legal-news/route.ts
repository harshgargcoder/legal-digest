import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabse";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const filter = searchParams.get("category");

    let query = supabase.from("legal_news").select("*");

    if (filter && filter !== "All") {

      // 🌍 GLOBAL
      if (filter === "Global") {
        query = query.eq("region", "global");
      }

      // 🟢 ALL OTHER CATEGORIES
      else {
        query = query.eq("legal_category", filter);
      }
    }

    query = query
      .order("score", { ascending: false })
      .order("published_at", { ascending: false });

    const { data, error } = await query;

    if (error) throw error;

    return NextResponse.json({
      success: true,
      filter: filter || "All",
      count: data?.length || 0,
      articles: data,
    });

  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}
