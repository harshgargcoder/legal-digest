import { serve } from "https://deno.land/std@0.192.0/http/server.ts";
import Parser from "npm:rss-parser@3.13.0";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import {
  categorizeArticle,
  detectCategory,
  detectRegion,
} from "../_shared/filter.ts";

const parser = new Parser({
  headers: { "User-Agent": "Mozilla/5.0" },
});

serve(async () => {
  const supabase = createClient(
    Deno.env.get("SUPABASE_URL")!,
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
  );

  const allFeeds = [
    // 🟣 INDIA / GENERAL
    { url: "https://indianexpress.com/section/india/feed/", type: "general" },
    {
      url: "https://www.thehindu.com/news/national/feeder/default.rss",
      type: "general",
    },
    {
      url: "https://timesofindia.indiatimes.com/rssfeeds/-2128936835.cms",
      type: "general",
    },

    // 🌍 GLOBAL
    { url: "https://feeds.bbci.co.uk/news/rss.xml", type: "global" },
    { url: "https://feeds.bbci.co.uk/news/world/rss.xml", type: "global" },
    { url: "https://www.aljazeera.com/xml/rss/all.xml", type: "global" },

    // 💰 FINANCE
    {
      url:
        "https://economictimes.indiatimes.com/markets/rssfeeds/1977021501.cms",
      type: "finance",
    },
    { url: "https://www.moneycontrol.com/rss/latestnews.xml", type: "finance" },
    { url: "https://feeds.bbci.co.uk/news/business/rss.xml", type: "finance" },

    // 🏏 SPORTS
    { url: "https://feeds.bbci.co.uk/sport/rss.xml", type: "sports" },
    {
      url: "https://timesofindia.indiatimes.com/rssfeeds/4719148.cms",
      type: "sports",
    },
    {
      url: "https://www.espncricinfo.com/rss/content/story/feeds/0.xml",
      type: "sports",
    },

    // ⚖️ LEGAL
    { url: "https://legalbites.in/feed/", type: "legal" },
    { url: "https://abovethelaw.com/feed/", type: "legal" },
    { url: "https://lawandcrime.com/feed/", type: "legal" },

    // 🧾 CA / GST (Finance-Legal Hybrid)
    { url: "https://news.google.com/rss/search?q=GST+India", type: "finance" },
    {
      url: "https://news.google.com/rss/search?q=Chartered+Accountant+India",
      type: "finance",
    },
    { url: "https://news.google.com/rss/search?q=ICAI", type: "finance" },
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

        const combinedText = [
          item.title,
          item.contentSnippet,
          item.content,
        ]
          .filter(Boolean)
          .join(" ");

        const { category, region } = categorizeArticle(
          item.title ?? "",
          `${item.contentSnippet ?? ""} ${item.content ?? ""}`,
          feed.type,
        );

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
          .upsert(articles, {
            onConflict: "url",
            ignoreDuplicates: false,
          });

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
