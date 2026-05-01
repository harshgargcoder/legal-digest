import { serve } from "https://deno.land/std@0.192.0/http/server.ts";
import Parser from "npm:rss-parser@3.13.0";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import {
  chunkArray,
  detectCategories,
  detectRegion,
  normalizeHttpUrl,
  sanitizeText,
} from "../_shared/filter.ts";

type Category =
  | "Constitutional"
  | "Supreme Court"
  | "High Court"
  | "Criminal"
  | "Family"
  | "Finance"
  | "Sports"
  | "General"
  | "Global";

type FeedConfig = {
  url: string;
  category?: Category;
};

const parser = new Parser({
  headers: { "User-Agent": "Mozilla/5.0" },
});

function getBearerToken(req: Request) {
  const header = req.headers.get("authorization");
  if (!header || !header.startsWith("Bearer ")) return null;
  return header.slice("Bearer ".length).trim();
}

function requireScraperSecret(req: Request) {
  const configuredSecret = Deno.env.get("SCRAPER_ACCESS_TOKEN")?.trim();
  const provided =
    getBearerToken(req) ?? req.headers.get("x-scraper-token")?.trim() ?? "";

  if (!configuredSecret) {
    const host = req.headers.get("host")?.toLowerCase() ?? "";
    const isLocal = host.includes("localhost") || host.includes("127.0.0.1");

    if (isLocal) return;

    throw new Error("SCRAPER_ACCESS_TOKEN is not configured");
  }

  if (provided !== configuredSecret) {
    throw new Error("Unauthorized scraper request");
  }
}

serve(async (req) => {
  try {
    if (req.method !== "POST") {
      return new Response(
        JSON.stringify({
          success: false,
          error: "Method Not Allowed. Use POST with the scraper token.",
        }),
        {
          status: 405,
          headers: { "Content-Type": "application/json", Allow: "POST" },
        },
      );
    }

    requireScraperSecret(req);

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
    );

    const allFeeds: FeedConfig[] = [
    {
      url:
        "https://news.google.com/rss/search?q=Supreme+Court+India&hl=en-IN&gl=IN&ceid=IN:en",
    },
    {
      url:
        "https://news.google.com/rss/search?q=High+Court+India&hl=en-IN&gl=IN&ceid=IN:en",
    },
    {
      url:
        "https://news.google.com/rss/search?q=Constitutional+Law+India&hl=en-IN&gl=IN&ceid=IN:en",
    },
    {
      url:
        "https://news.google.com/rss/search?q=Constitution+Bench+India&hl=en-IN&gl=IN&ceid=IN:en",
    },
    { url: "https://legalbites.in/feed/", category: "General" },
    { url: "https://abovethelaw.com/feed/", category: "General" },
    { url: "https://lawandcrime.com/feed/", category: "General" },
    {
      url: "https://indianexpress.com/section/india/feed/",
      category: "General",
    },
    {
      url: "https://www.thehindu.com/news/national/feeder/default.rss",
      category: "General",
    },
    {
      url: "https://timesofindia.indiatimes.com/rssfeeds/-2128936835.cms",
      category: "General",
    },
    {
      url:
        "https://economictimes.indiatimes.com/markets/rssfeeds/1977021501.cms",
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
    { url: "https://feeds.bbci.co.uk/sport/rss.xml", category: "Sports" },
    { url: "https://www.espn.com/espn/rss/news", category: "Sports" },
    {
      url:
        "https://news.google.com/rss/search?q=criminal+law+India&hl=en-IN&gl=IN&ceid=IN:en",
      category: "Criminal",
    },
    {
      url:
        "https://news.google.com/rss/search?q=bail+India+court&hl=en-IN&gl=IN&ceid=IN:en",
      category: "Criminal",
    },
    {
      url:
        "https://news.google.com/rss/search?q=NDPS+India+court&hl=en-IN&gl=IN&ceid=IN:en",
      category: "Criminal",
    },
    {
      url:
        "https://news.google.com/rss/search?q=family+law+India&hl=en-IN&gl=IN&ceid=IN:en",
      category: "Family",
    },
    {
      url:
        "https://news.google.com/rss/search?q=divorce+custody+India+court&hl=en-IN&gl=IN&ceid=IN:en",
      category: "Family",
    },
    {
      url:
        "https://news.google.com/rss/search?q=maintenance+adoption+India+court&hl=en-IN&gl=IN&ceid=IN:en",
      category: "Family",
    },
    {
      url:
        "https://news.google.com/rss/search?q=divorce+alimony+maintenance+custody+India&hl=en-IN&gl=IN&ceid=IN:en",
      category: "Family",
    },
    {
      url:
        "https://news.google.com/rss/search?q=domestic+violence+India+court&hl=en-IN&gl=IN&ceid=IN:en",
      category: "Family",
    },
    {
      url:
        "https://news.google.com/rss/search?q=mutual+consent+divorce+India+court&hl=en-IN&gl=IN&ceid=IN:en",
      category: "Family",
    },
    {
      url:
        "https://news.google.com/rss/search?q=alimony+maintenance+custody+divorce+petition+India&hl=en-IN&gl=IN&ceid=IN:en",
      category: "Family",
    },
    {
      url:
        "https://news.google.com/rss/search?q=judicial+separation+annulment+India+court&hl=en-IN&gl=IN&ceid=IN:en",
      category: "Family",
    },
    {
      url:
        "https://news.google.com/rss/search?q=inheritance+succession+partition+streedhan+India+court&hl=en-IN&gl=IN&ceid=IN:en",
      category: "Family",
    },
    { url: "https://feeds.bbci.co.uk/news/rss.xml", category: "Global" },
    { url: "https://feeds.bbci.co.uk/news/world/rss.xml", category: "Global" },
    { url: "https://www.aljazeera.com/xml/rss/all.xml", category: "Global" },
  ];

    let totalInserted = 0;

    for (const feed of allFeeds) {
      try {
        const cacheBusterUrl = feed.url + (feed.url.includes("?") ? "&" : "?") +
          `t=${Date.now()}`;
        const response = await fetch(cacheBusterUrl, {
          headers: {
            "User-Agent": "Mozilla/5.0",
            "Cache-Control": "no-cache",
            "Pragma": "no-cache",
          },
        });

        if (!response.ok) continue;

        const xml = await response.text();
        const parsed = await parser.parseString(xml);
        if (!parsed.items?.length) continue;

        type IngestedArticle = {
          title: string;
          summary: string;
          content: string;
          url: string;
          image_url: string | null;
          source: string;
          category: Category;
          region: "India" | "Global";
          published_at: string;
        };
        const articles: IngestedArticle[] = [];

        for (const item of parsed.items) {
          const cleanUrl = normalizeHttpUrl(item.link);
          const title = sanitizeText(item.title, 300);
          if (!title || !cleanUrl) continue;

        let source = "";
        try {
          source = new URL(cleanUrl).hostname;
        } catch {
          source = feed.url;
        }

        const combinedText = [
          item.title,
          item.contentSnippet,
          item.content,
        ]
          .filter(Boolean)
          .join(" ");

        const categories = detectCategories(
          combinedText,
          feed.category,
        );

        const region = detectRegion(
          combinedText,
          feed.category,
        );

        articles.push({
          title,
          summary: sanitizeText(item.contentSnippet || "", 5000),
          content: sanitizeText(item.content ?? "", 5000),
          url: cleanUrl,
          image_url: normalizeHttpUrl(
            item.enclosure?.url ||
              item["media:content"]?.$?.url ||
              item["media:thumbnail"]?.$?.url ||
              null,
          ),
          source,
          category: feed.category ?? categories[0] ?? "General",
          region,
          published_at: item.pubDate
            ? new Date(item.pubDate).toISOString()
            : new Date().toISOString(),
        });
      }

        if (articles.length > 0) {
          for (const chunk of chunkArray(articles, 25)) {
            const { error } = await supabase
              .from("legal_news")
              .upsert(chunk, { onConflict: "url" });

            if (!error) {
              totalInserted += chunk.length;
            }
          }
        }
      } catch (err) {
        console.error("Feed error:", feed.url, err);
      }
    }
    // const sevenDaysAgo = new Date();
    // sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

  // await supabase
  //   .from("legal_news")
  //   .delete()
  //   .lt("published_at", sevenDaysAgo.toISOString());

  // await supabase
  //   .from("settings")
  //   .update({ last_updated: new Date().toISOString() })
  //   .eq("id", 1);

    return new Response(
      JSON.stringify({ success: true, totalInserted }),
      { headers: { "Content-Type": "application/json" } },
    );
  } catch (err) {
    console.error("fetch-news fatal error:", err);
    const message = err instanceof Error ? err.message : "Internal server error";
    const status = message.includes("Unauthorized") ? 401 : 500;
    return new Response(
      JSON.stringify({ success: false, error: message }),
      {
        status,
        headers: { "Content-Type": "application/json" },
      },
    );
  }
});
