import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";
import {
  processArticles,
  RawArticle,
} from "@/supabase/functions/_shared/filter";

export async function POST() {
  try {
    if (!process.env.NEWS_API_KEY) {
      throw new Error("NEWS_API_KEY missing");
    }

    const response = await fetch(
      `https://newsapi.org/v2/top-headlines?country=in&language=en&apiKey=${process.env.NEWS_API_KEY}`,
      {
        headers: {
          "User-Agent": "Mozilla/5.0",
        },
      }
    );

    if (!response.ok) {
      throw new Error(`NewsAPI error: ${response.status}`);
    }

    const data = await response.json();

    if (!data.articles) {
      throw new Error("No articles received");
    }

    const processed = processArticles(
      data.articles as RawArticle[]
    );

    let insertedCount = 0;

    for (const article of processed) {
      const { error } = await supabase
        .from("legal_news")
        .upsert(article, { onConflict: "url" });

      if (!error) insertedCount++;
      else console.error("Insert error:", error);
    }

    return NextResponse.json({
      success: true,
      fetched: data.articles.length,
      inserted: insertedCount,
    });
  } catch (error: any) {
    console.error("FETCH ERROR:", error);

    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}

export async function GET() {
  const { data, error } = await supabase
    .from("legal_news")
    .select("*")
    .order("published_at", { ascending: false })
    .limit(30);

  if (error) {
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }

  return NextResponse.json({ success: true, data });
}