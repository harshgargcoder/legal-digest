import { serve } from "https://deno.land/std@0.192.0/http/server.ts";
import Parser from "npm:rss-parser@3.13.0";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const parser = new Parser();

const supabase = createClient(
  Deno.env.get("PROJECT_URL")!,
  Deno.env.get("SERVICE_ROLE_KEY")!
);

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

const allFeeds = [
  ...legalFeeds,
  ...generalFeeds,
  ...financeFeeds,
  ...sportsFeeds,
  ...globalFeeds,
];

serve(async () => {
  let inserted = 0;

  for (const feed of allFeeds) {
    try {
      const parsed = await parser.parseURL(feed.url);

      for (const item of parsed.items) {
        if (!item.title || !item.link) continue;

        const article = {
          title: item.title,
          summary: item.contentSnippet || "",
          url: item.link,
          image_url:
            item.enclosure?.url ||
            item["media:content"]?.$?.url ||
            item["media:thumbnail"]?.$?.url ||
            null,
          source: new URL(item.link).hostname,
          category: feed.category,
          region:
            feed.url.includes("thehindu.com") ||
            feed.url.includes("timesofindia") ||
            feed.url.includes("economictimes") ||
            feed.url.includes("moneycontrol")
              ? "National"
              : "International",
          published_at: item.pubDate
            ? new Date(item.pubDate).toISOString()
            : new Date().toISOString(),
        };

        const { error } = await supabase
          .from("legal_news")
          .upsert(article, { onConflict: "url" });

        if (!error) inserted++;
      }
    } catch {}
  }

  await supabase
    .from("settings")
    .update({ last_updated: new Date().toISOString() })
    .eq("id", 1);

  return new Response(
    JSON.stringify({ success: true, inserted }),
    { headers: { "Content-Type": "application/json" } }
  );
});
