import Parser from "rss-parser";
import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const parser = new Parser();

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
);

// ─── NATIONAL (Indian) LEGAL FEEDS ───────────────────────────────────────────
const supremeCourtFeeds = [
  { url: "https://www.barandbench.com/stories.rss", category: "Supreme Court", region: "National" },
  { url: "https://www.scconline.com/blog/feed/", category: "Supreme Court", region: "National" },
];

const highCourtFeeds = [
  { url: "https://indianexpress.com/section/india/feed/", category: "High Court", region: "National" },
  { url: "https://www.thehindu.com/news/national/feeder/default.rss", category: "High Court", region: "National" },
];

const constitutionalFeeds = [
  { url: "https://www.thehindu.com/news/national/feeder/default.rss", category: "Constitutional", region: "National" },
];

const criminalFeeds = [
  { url: "https://criminallawstudiesnluj.wordpress.com/feed", category: "Criminal", region: "National" },
  { url: "https://www.barandbench.com/stories.rss", category: "Criminal", region: "National" },
];

const familyFeeds = [
  { url: "https://lawctopus.com/feed", category: "Family", region: "National" },
  { url: "https://www.scconline.com/blog/feed/", category: "Family", region: "National" },
];

// ─── GENERAL FEEDS (National) ─────────────────────────────────────────────────
const generalFeeds = [
  { url: "https://timesofindia.indiatimes.com/rssfeeds/-2128936835.cms", category: "General", region: "National" },
  { url: "https://www.thehindu.com/news/feeder/default.rss", category: "General", region: "National" },
  { url: "https://www.indialegallive.com/feed", category: "General", region: "National" },
];

// ─── FINANCE FEEDS (50% National, 50% International) ─────────────────────────
const financeFeeds = [
  // National
  { url: "https://economictimes.indiatimes.com/markets/rssfeeds/1977021501.cms", category: "Finance", region: "National" },
  { url: "https://www.moneycontrol.com/rss/latestnews.xml", category: "Finance", region: "National" },
  { url: "https://www.livemint.com/rss/news", category: "Finance", region: "National" },
  // International
  { url: "https://feeds.bbci.co.uk/news/business/rss.xml", category: "Finance", region: "International" },
  { url: "https://www.cnbc.com/id/10001147/device/rss/rss.xml", category: "Finance", region: "International" },
];

// ─── SPORTS FEEDS (50% National, 50% International) ───────────────────────────
const sportsFeeds = [
  // National
  { url: "https://timesofindia.indiatimes.com/rssfeeds/4719148.cms", category: "Sports", region: "National" },
  { url: "https://www.espncricinfo.com/rss/content/story/feeds/0.xml", category: "Sports", region: "National" },
  // International
  { url: "https://feeds.bbci.co.uk/sport/rss.xml", category: "Sports", region: "International" },
];

// ─── GLOBAL / INTERNATIONAL FEEDS ────────────────────────────────────────────
const globalFeeds = [
  { url: "https://feeds.bbci.co.uk/news/world/rss.xml", category: "Global", region: "International" },
  { url: "https://www.aljazeera.com/xml/rss/all.xml", category: "Global", region: "International" },
  { url: "https://www.jurist.org/news/feed/", category: "Global", region: "International" },
];

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    let totalInserted = 0;
    const feedStats: any[] = [];

    const allFeeds = [
      ...supremeCourtFeeds,
      ...highCourtFeeds,
      ...constitutionalFeeds,
      ...criminalFeeds,
      ...familyFeeds,
      ...generalFeeds,
      ...financeFeeds,
      ...sportsFeeds,
      ...globalFeeds,
    ];

    for (const feed of allFeeds) {
      try {
        // Append timestamp to bypass caching at the source
        const cacheBusterUrl = feed.url + (feed.url.includes("?") ? "&" : "?") + `t=${Date.now()}`;
        const rss = await parser.parseURL(cacheBusterUrl);

        let insertedForFeed = 0;

        for (const item of rss.items) {
          const title = item.title?.trim();
          const description = item.contentSnippet?.trim() || "";
          const link = item.link?.trim();

          if (!title || !link) continue;

          const payload = {
            title,
            url: link,
            category: feed.category,
            summary: description,
            region: feed.region,
            published_at: item.pubDate
              ? new Date(item.pubDate).toISOString()
              : new Date().toISOString(),
          };

          const { data, error } = await supabase
            .from("legal_news")
            .upsert(payload, { onConflict: "url" })
            .select();

          if (error) {
            console.error("INSERT ERROR:", error.message);
          } else {
            insertedForFeed++;
            totalInserted++;
          }
        }

        feedStats.push({
          feed: feed.url,
          category: feed.category,
          region: feed.region,
          totalItems: rss.items.length,
          inserted: insertedForFeed,
        });
      } catch (feedError: any) {
        console.error(`Error parsing feed ${feed.url}:`, feedError.message);
        feedStats.push({
          feed: feed.url,
          category: feed.category,
          region: feed.region,
          error: feedError.message,
        });
      }
    }

    // Update settings last_updated timestamp
    await supabase
      .from("settings")
      .upsert({ id: 1, last_updated: new Date().toISOString() });

    return NextResponse.json({
      success: true,
      totalInserted,
      feeds: feedStats,
    });
  } catch (error: any) {
    return NextResponse.json({
      success: false,
      message: error?.message,
    });
  }
}
