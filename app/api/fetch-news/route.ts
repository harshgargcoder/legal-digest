import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabse";
import { filterArticles, RawArticle } from "@/lib/filter";

export async function POST() {
  try {
    const response = await fetch(
      `https://newsapi.org/v2/top-headlines?country=in&language=en&apiKey=${process.env.NEWS_API_KEY}`
    );

    if (!response.ok) {
      throw new Error("Failed to fetch news");
    }

    const data = await response.json();

    const processed = filterArticles(data.articles as RawArticle[]);

    let insertedCount = 0;

    for (const article of processed) {
      const { error } = await supabase
        .from("legal_news") // table name same rakho
        .upsert(article, { onConflict: "url" });

      if (!error) insertedCount++;
    }

    return NextResponse.json({
      success: true,
      inserted: insertedCount,
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}

export async function GET() {
  const { data } = await supabase
    .from("news")
    .select("*")
    .order("score", { ascending: false })
    .order("published_at", { ascending: false })
    .limit(30);

  return NextResponse.json({ success: true, data });
}
