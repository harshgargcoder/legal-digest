import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabse";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const category = searchParams.get("category");
    const region = searchParams.get("region");

    let query = supabase.from("legal_news").select("*");

    // Category filter
    if (category && category !== "All") {
      query = query.eq("category", category);
    }

    // Region filter
    if (region) {
      query = query.eq("region", region);
    }

    // Latest first
    query = query.order("published_at", { ascending: false });

    const { data, error } = await query;

    if (error) throw error;

    return NextResponse.json({
      success: true,
      articles: data,
    });

  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}
