import Parser from "rss-parser";
import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const parser = new Parser();

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
);
console.log("URL:", process.env.NEXT_PUBLIC_SUPABASE_URL);
console.log(
  "SERVICE KEY:",
  process.env.SUPABASE_SERVICE_ROLE_KEY ? "EXISTS" : "MISSING",
);

const legalFeeds = [
  { url: "https://indianexpress.com/section/india/feed/", category: "Legal" },
  {
    url: "https://www.thehindu.com/news/national/feeder/default.rss",
    category: "Legal",
  },
];

const generalFeeds = [
  { url: "https://feeds.bbci.co.uk/news/rss.xml", category: "General" },
  {
    url: "https://timesofindia.indiatimes.com/rssfeeds/-2128936835.cms",
    category: "General",
  },
  {
    url: "https://www.thehindu.com/news/feeder/default.rss",
    category: "General",
  },
];

const financeFeeds = [
  {
    url: "https://economictimes.indiatimes.com/markets/rssfeeds/1977021501.cms",
    category: "Finance",
  },
  {
    url: "https://www.moneycontrol.com/rss/latestnews.xml",
    category: "Finance",
  },
  {
    url: "https://feeds.bbci.co.uk/news/business/rss.xml",
    category: "Finance",
  },
];

const sportsFeeds = [
  { url: "https://feeds.bbci.co.uk/sport/rss.xml", category: "Sports" },
  {
    url: "https://timesofindia.indiatimes.com/rssfeeds/4719148.cms",
    category: "Sports",
  },
  {
    url: "https://www.espncricinfo.com/rss/content/story/feeds/0.xml",
    category: "Sports",
  },
];

const globalFeeds = [
  { url: "https://feeds.bbci.co.uk/news/world/rss.xml", category: "Global" },
  { url: "https://www.aljazeera.com/xml/rss/all.xml", category: "Global" },
];

export async function GET() {
  try {
    let totalInserted = 0;
    const feedStats: any[] = [];

    const allFeeds = [
      ...legalFeeds,
      ...generalFeeds,
      ...financeFeeds,
      ...sportsFeeds,
      ...globalFeeds,
    ];

    for (const feed of allFeeds) {
      const rss = await parser.parseURL(feed.url);

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
          region: feed.url.includes("thehindu.com") ||
              feed.url.includes("timesofindia") ||
              feed.url.includes("economictimes") ||
              feed.url.includes("moneycontrol") ||
              feed.url.includes("bbci.in") ||
              feed.url.includes("indianexpress.com")
            ? "National"
            : "International",
          published_at: item.pubDate
            ? new Date(item.pubDate).toISOString()
            : new Date().toISOString(),
        };

        const { data, error } = await supabase
          .from("legal_news")
          .insert(payload)
          .select();

        if (error) {
          console.error("INSERT ERROR:", error.message);
        } else {
          console.log("Inserted row:", data);
          insertedForFeed++;
          totalInserted++;
        }
      }

      feedStats.push({
        feed: feed.url,
        totalItems: rss.items.length,
        inserted: insertedForFeed,
      });
    }

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
