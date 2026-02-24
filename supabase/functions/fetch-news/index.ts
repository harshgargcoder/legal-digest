import { serve } from "https://deno.land/std@0.192.0/http/server.ts";
import Parser from "npm:rss-parser@3.13.0";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { detectCategory, detectRegion } from "../_shared/filter.ts";

const parser = new Parser({
  headers: { "User-Agent": "Mozilla/5.0" },
});

serve(async () => {
  const supabase = createClient(
    Deno.env.get("SUPABASE_URL")!,
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
  );

  const allFeeds = [
    { url: "https://indianexpress.com/section/india/feed/" },
    { url: "https://www.thehindu.com/news/national/feeder/default.rss" },
    { url: "https://feeds.bbci.co.uk/news/rss.xml" },
    { url: "https://timesofindia.indiatimes.com/rssfeeds/-2128936835.cms" },
    { url: "https://www.thehindu.com/news/feeder/default.rss" },
    { url:"https://economictimes.indiatimes.com/markets/rssfeeds/1977021501.cms"},
    { url: "https://www.moneycontrol.com/rss/latestnews.xml" },
    { url: "https://feeds.bbci.co.uk/news/business/rss.xml" },
    { url: "https://feeds.bbci.co.uk/sport/rss.xml" },
    { url: "https://timesofindia.indiatimes.com/rssfeeds/4719148.cms" },
    { url: "https://www.espncricinfo.com/rss/content/story/feeds/0.xml" },
    { url: "https://feeds.bbci.co.uk/news/world/rss.xml" },
    { url: "https://www.aljazeera.com/xml/rss/all.xml" },
    { url: "https://legalbites.in/feed/" },
    { url: "https://abovethelaw.com/feed/" },
    { url: "https://lawandcrime.com/feed/" },
    { url: "https://news.google.com/rss/search?q=GST+India" },
    { url: "https://news.google.com/rss/search?q=Chartered+Accountant+India" },
    { url: "https://news.google.com/rss/search?q=ICAI" },
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
      if (!parsed.items?.length) continue;

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

        const combinedText = `
          ${item.title ?? ""}
          ${item.contentSnippet ?? ""}
          ${item.content ?? ""}
        `;

        const category = detectCategory(combinedText);
        const region = detectRegion(combinedText);

        articles.push({
          title: item.title.trim(),
          summary: item.contentSnippet?.trim() || "",
          content: item.content ?? "",
          url: cleanUrl,
          image_url: item.enclosure?.url ||
            item["media:content"]?.$?.url ||
            item["media:thumbnail"]?.$?.url ||
            null,
          source,
          category,
          region,
          published_at: item.pubDate
            ? new Date(item.pubDate).toISOString()
            : new Date().toISOString(),
        });
      }

      if (articles.length > 0) {
        const { error } = await supabase
          .from("legal_news")
          .upsert(articles, { onConflict: "url" });

        if (!error) {
          totalInserted += articles.length;
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
