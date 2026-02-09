import { NextResponse } from "next/server";
import { headers } from "next/headers";
import { supabase } from "@/lib/supabse";
import Parser from "rss-parser";

const parser = new Parser();

// ==========================
// 🔥 YOUR RSS FEEDS
// ==========================

const legalFeeds = [
  { url: "https://www.thehindu.com/news/national/feeder/default.rss", category: "Legal" },
];

const generalFeeds = [
  { url: "https://feeds.bbci.co.uk/news/rss.xml", category: "General" },
  { url: "https://timesofindia.indiatimes.com/rssfeedsdefault.cms", category: "General" },
  { url: "https://www.thehindu.com/news/feeder/default.rss", category: "General" },
];

const financeFeeds = [
  { url: "https://economictimes.indiatimes.com/markets/rssfeeds/1977021501.cms", category: "Finance" },
  { url: "https://www.moneycontrol.com/rss/latestnews.xml", category: "Finance" },
  { url: "https://feeds.bbci.co.uk/news/business/rss.xml", category: "Finance" },
];

const sportsFeeds = [
  { url: "https://feeds.bbci.co.uk/sport/rss.xml", category: "Sports" },
  { url: "https://timesofindia.indiatimes.com/rssfeeds/4719148.cms", category: "Sports" },
  { url: "https://www.espncricinfo.com/rss/content/story/feeds/0.xml", category: "Sports" },
];

const globalFeeds = [
  { url: "https://feeds.bbci.co.uk/news/world/rss.xml", category: "Global" },
  { url: "https://www.aljazeera.com/xml/rss/all.xml", category: "Global" },
];

// Combine all feeds
const allFeeds = [
  ...legalFeeds,
  ...generalFeeds,
  ...financeFeeds,
  ...sportsFeeds,
  ...globalFeeds,
];

export async function GET() {
  try {
    // ==========================
    // 🔒 CRON SECURITY CHECK
    // ==========================
    const CRON_SECRET = process.env.CRON_SECRET;

    if (CRON_SECRET) {
      const authHeader = headers().get("authorization");

      if (!authHeader || authHeader !== `Bearer ${CRON_SECRET}`) {
        return NextResponse.json(
          { success: false, message: "Unauthorized" },
          { status: 401 }
        );
      }
    }

    console.log("⏳ Cron started...");

    let insertedCount = 0;

    // ==========================
    // 🔥 FETCH & INSERT LOGIC
    // ==========================

    for (const feed of allFeeds) {
      try {
        const parsedFeed = await parser.parseURL(feed.url);

        for (const item of parsedFeed.items) {
          if (!item.title || !item.link) continue;

          const article = {
            title: item.title,
            summary: item.contentSnippet || "",
            url: item.link,
            source: parsedFeed.title || feed.url,
            category: feed.category,
            region: "Global",
            published_at: item.pubDate
              ? new Date(item.pubDate).toISOString()
              : new Date().toISOString(),
          };

          // Insert safely (no duplicates)
          const { error } = await supabase
            .from("legal_news")
            .upsert(article, { onConflict: "url", ignoreDuplicates: true });
          if (!error) insertedCount++;
        }
      } catch (err) {
        console.error(`❌ Failed feed: ${feed.url}`);
      }
    }

    // ==========================
    // 🔥 UPDATE LAST UPDATED
    // ==========================

    await supabase
      .from("settings")
      .update({ last_updated: new Date().toISOString() })
      .eq("id", 1);

    console.log(`✅ Inserted ${insertedCount} new articles`);

    return NextResponse.json({
      success: true,
      inserted: insertedCount,
    });

  } catch (error: any) {
    console.error("❌ Cron error:", error.message);

    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}
