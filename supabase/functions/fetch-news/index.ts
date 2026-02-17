import { serve } from "https://deno.land/std@0.192.0/http/server.ts";
import Parser from "npm:rss-parser@3.13.0";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const parser = new Parser({
  headers: {
    "User-Agent": "Mozilla/5.0",
  },
});

serve(async (req) => {
  const supabase = createClient(
    Deno.env.get("SUPABASE_URL")!,
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
  );

  const allFeeds = [
    { url: "https://indianexpress.com/section/india/feed/", category: "Legal" },
    {
      url: "https://www.thehindu.com/news/national/feeder/default.rss",
      category: "Legal",
    },
    { url: "https://feeds.bbci.co.uk/news/rss.xml", category: "General" },
    {
      url: "https://timesofindia.indiatimes.com/rssfeeds/-2128936835.cms",
      category: "General",
    },
    {
      url: "https://www.thehindu.com/news/feeder/default.rss",
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
    {
      url: "https://timesofindia.indiatimes.com/rssfeeds/4719148.cms",
      category: "Sports",
    },
    {
      url: "https://www.espncricinfo.com/rss/content/story/feeds/0.xml",
      category: "Sports",
    },
    { url: "https://feeds.bbci.co.uk/news/world/rss.xml", category: "Global" },
    { url: "https://www.aljazeera.com/xml/rss/all.xml", category: "Global" },
  ];

  let totalInserted = 0;

  for (const feed of allFeeds) {
    try {
      const response = await fetch(feed.url + `?t=${Date.now()}`, {
        headers: {
          "User-Agent": "Mozilla/5.0",
          "Cache-Control": "no-cache",
          "Pragma": "no-cache",
        },
      });

      if (!response.ok) continue;

      const xml = await response.text();
      const parsed = await parser.parseString(xml);

      if (!parsed.items || parsed.items.length === 0) continue;

      const articles: any[] = [];

      for (const item of parsed.items) {
        if (!item.title || !item.link) continue;

        const cleanUrl = item.link.split("?")[0];

        let source = "";
        try {
          source = new URL(cleanUrl).hostname;
        } catch {
          source = feed.url;
        }

        articles.push({
          title: item.title.trim(),
          summary: item.contentSnippet?.trim() || "",
          url: cleanUrl,
          image_url: item.enclosure?.url ||
            item["media:content"]?.$?.url ||
            item["media:thumbnail"]?.$?.url ||
            null,
          source,
          category: feed.category,
          region: feed.url.includes("thehindu.com") ||
              feed.url.includes("timesofindia") ||
              feed.url.includes("economictimes") ||
              feed.url.includes("moneycontrol") ||
              feed.url.includes("indianexpress.com")
            ? "National"
            : "International",
          published_at: item.pubDate
            ? new Date(item.pubDate).toISOString()
            : new Date().toISOString(),
        });
      }

      if (articles.length > 0) {
        const { data, error } = await supabase
          .from("legal_news")
          .upsert(articles, { onConflict: "url" });

        if (!error && data) {
          totalInserted += (data as any[]).length;
        }
      }
    } catch (err) {
      console.error("Feed error:", feed.url, err);
    }
  }

  const sevenDaysAgo = new Date();
  sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

  await supabase
    .from("legal_news")
    .delete()
    .lt("published_at", sevenDaysAgo.toISOString());

  await supabase
    .from("settings")
    .update({ last_updated: new Date().toISOString() })
    .eq("id", 1);

  return new Response(
    JSON.stringify({ success: true, totalInserted }),
    { headers: { "Content-Type": "application/json" } },
  );
});
