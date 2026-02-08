import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabse";
import { filterArticles, RawArticle } from "@/lib/filter";

export async function POST() {
  try {
    const response = await fetch(
      `https://newsapi.org/v2/everything?q=Supreme Court OR High Court OR Constitution OR EWS&language=en&sortBy=publishedAt&apiKey=${process.env.NEWS_API_KEY}`
    );

    if (!response.ok) {
      throw new Error("Failed to fetch news");
    }

    const data = await response.json();

    const processed = filterArticles(data.articles as RawArticle[]);

    let insertedCount = 0;

    for (const article of processed) {
      const articleData = {
        title: article.title,
        summary: article.summary,
        content: article.content,
        source: article.source,
        url: article.url,
        image_url: article.image_url,
        legal_category: article.category,
        region: article.region,
        score: article.score,
        published_at: article.published_at,
      };

      const { error } = await supabase
        .from("legal_news")
        .upsert(articleData, { onConflict: "url" });

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
  return POST();
}
