import Parser from "rss-parser";
import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { detectCategory } from "@/lib/filter";

const parser = new Parser();

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

const feeds = [
  {
    url: "https://www.thehindu.com/news/national/feeder/default.rss",
    category: "Legal",
  },
  {
    url: "https://feeds.bbci.co.uk/news/rss.xml",
    category: "General",
  }, {
    url: "https://feeds.bbci.co.uk/sport/rss.xml",
    category: "Sports",
  },
  {
    url: "https://economictimes.indiatimes.com/rssfeedsdefault.cms",
    category: "Finance",
  },
  { url: "https://feeds.bbci.co.uk/news/world/rss.xml" , category: "Global"},
];


export async function GET() {
  try {

    let totalInserted = 0;
    const feedStats: any[] = [];

    for (const feed of feeds) {

      const rss = await parser.parseURL(feed.url);
      console.log("Fetching feed:", feed.url);
      console.log("Items count:", rss.items.length);

      let insertedForFeed = 0;

      console.log("RSS items count:", rss.items.length);

      for (const item of rss.items) {
        const title = item.title?.trim();
        const description = item.contentSnippet?.trim() || "";
        const link = item.link?.trim();

        if (!title || !link) continue;

        let finalCategory;

        if (feed.url.includes("thehindu.com")) {
          finalCategory = "Legal";
        } else {
          finalCategory = detectCategory(`${title} ${description}`);
        }

        const payload = {
          title,
          url: link,
          category: finalCategory,
          description,
          published_at: item.pubDate
            ? new Date(item.pubDate).toISOString()
            : new Date().toISOString(),
        };

        const { data, error } = await supabase
          .from("legal_news")
          .insert(payload)
          .select();

        console.log("Insert result:", data);
        console.log("Insert error:", error);

        if (!error) {
          insertedForFeed++;
          totalInserted++;
        }

      }

      feedStats.push({
        feed: feed.url,
        totalItems: rss.items.length,
        inserted: insertedForFeed,
        latestPubDate: rss.items[0]?.pubDate || null,
      });
    }

    return NextResponse.json({
      success: true,
      totalInserted,
      feeds: feedStats,
    });
  } catch (error: any) {
    console.error("FULL ERROR:", error);

    return NextResponse.json({
      success: false,
      message: error?.message,
    });
  }
}
