import { priorityKeywords } from "./scoring";

export interface RawArticle {
  title: string;
  description?: string;
  content?: string;
  url: string;
  urlToImage?: string;
  source?: { name: string };
  publishedAt?: string;
}

export interface ProcessedArticle {
  title: string;
  summary: string;
  content: string;
  source: string;
  url: string;
  image_url: string | null;
  category: string;
  score: number;
  region: string;
  published_at: string;
}

/* ---------------- SCORE ---------------- */

function calculateScore(text: string): number {
  let totalScore = 0;
  const lower = text.toLowerCase();

  priorityKeywords.forEach(({ keyword, score }) => {
    if (lower.includes(keyword.toLowerCase())) {
      totalScore += score;
    }
  });

  if (totalScore === 0) {
    totalScore = 10;
  }

  return totalScore;
}

/* ---------------- REGION ---------------- */

function detectRegion(text: string): string {
  const lower = text.toLowerCase();

  if (
    lower.includes("india") ||
    lower.includes("delhi") ||
    lower.includes("mumbai") ||
    lower.includes("kolkata") ||
    lower.includes("chennai") ||
    lower.includes("bengaluru")
  ) {
    return "india";
  }

  return "global";
}

/* ---------------- CATEGORY ---------------- */

function detectCategory(text: string): string {
  const lower = text.toLowerCase();

  // 🔥 Legal
  if (
    lower.includes("supreme court") ||
    lower.includes("high court") ||
    lower.includes("pil") ||
    lower.includes("constitution") ||
    lower.includes("tribunal") ||
    lower.includes("amendment") ||
    lower.includes("bill") ||
    lower.includes("ews") ||
    lower.includes("judgement") ||
    lower.includes("article 14") ||
    lower.includes("article 19") ||
    lower.includes("article 21") ||
    lower.includes("court")
  ) {
    return "Legal";
  }

  // 🏛 Political
  if (
    lower.includes("parliament") ||
    lower.includes("election") ||
    lower.includes("government") ||
    lower.includes("minister") ||
    lower.includes("cabinet")
  ) {
    return "Political";
  }

  // 🏏 Sports
  if (
    lower.includes("cricket") ||
    lower.includes("football") ||
    lower.includes("chess") ||
    lower.includes("match") ||
    lower.includes("olympics") ||
    lower.includes("world cup")
  ) {
    return "Sports";
  }

  // 🌍 Global Affairs
  if (
    lower.includes("united states") ||
    lower.includes("us ") ||
    lower.includes("uk ") ||
    lower.includes("china") ||
    lower.includes("russia") ||
    lower.includes("nato") ||
    lower.includes("ukraine")
  ) {
    return "Global";
  }

  return "General";
}

/* ---------------- MAIN PROCESSOR ---------------- */

export function filterArticles(
  articles: RawArticle[]
): ProcessedArticle[] {
  return articles.map((article) => {
    const combinedText = `${article.title ?? ""} ${
      article.description ?? ""
    } ${article.content ?? ""}`;

    return {
      title: article.title,
      summary: article.description ?? "",
      content: article.content ?? "",
      source: article.source?.name ?? "Unknown",
      url: article.url,
      image_url: article.urlToImage ?? null,
      category: detectCategory(combinedText),
      score: calculateScore(combinedText),
      region: detectRegion(combinedText),
      published_at:
        article.publishedAt ?? new Date().toISOString(),
    };
  });
}
