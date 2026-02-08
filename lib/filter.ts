// ===============================
// Types
// ===============================

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
  region: string;
  published_at: string;
}

// ===============================
// Reject unwanted entertainment noise
// ===============================

export function isAllowed(title: string): boolean {
  const lower = title.toLowerCase();

  const rejectWords = [
    "box office",
    "movie review",
    "celebrity",
    "tv show",
    "reality show",
    "fashion week"
  ];

  return !rejectWords.some(word => lower.includes(word));
}

// ===============================
// Smart Category Detection
// Order matters (most distinct first)
// ===============================

export function detectCategory(text: string): string {
  const lower = text.toLowerCase();

  // 1️⃣ Sports
  if (
  lower.includes("cricket") ||
  lower.includes("football") ||
  lower.includes("match") ||
  lower.includes("ipl") ||
  lower.includes("olympics") ||
  lower.includes("tournament") ||
  lower.includes("league") ||
  lower.includes("final") ||
  lower.includes("goal") ||
  lower.includes("coach") ||
  lower.includes("championship") ||
  lower.includes("injury")
) {
  return "Sports";
}

  // 2️⃣ Finance
  if (
    lower.includes("stock") ||
    lower.includes("market") ||
    lower.includes("share price") ||
    lower.includes("economy") ||
    lower.includes("sensex") ||
    lower.includes("nifty") ||
    lower.includes("inflation") ||
    lower.includes("gdp")
  ) {
    return "Finance";
  }

  // 3️⃣ Political
  if (
    lower.includes("parliament") ||
    lower.includes("election") ||
    lower.includes("minister") ||
    lower.includes("government") ||
    lower.includes("bill") ||
    lower.includes("policy") ||
    lower.includes("cabinet")
  ) {
    return "Political";
  }

  // 4️⃣ Global
  if (
    lower.includes("united states") ||
    lower.includes("china") ||
    lower.includes("russia") ||
    lower.includes("ukraine") ||
    lower.includes("europe") ||
    lower.includes("israel") ||
    lower.includes("gaza")
  ) {
    return "Global";
  }

  // 5️⃣ Legal (moved lower to avoid over-classification)
  if (
    lower.includes("supreme court") ||
    lower.includes("high court") ||
    lower.includes("judgment") ||
    lower.includes("judgement") ||
    lower.includes("constitutional") ||
    lower.includes("tribunal") ||
    lower.includes("petition") ||
    lower.includes("verdict") ||
    lower.includes("bail plea") ||
    lower.includes("bench") ||
    lower.includes("justice ")
  ) {
    return "Legal";
  }

  return "General";
}

// ===============================
// Region Detection
// ===============================

export function detectRegion(text: string): string {
  const lower = text.toLowerCase();

  if (
    lower.includes("india") ||
    lower.includes("delhi") ||
    lower.includes("mumbai") ||
    lower.includes("supreme court of india")
  ) {
    return "India";
  }

  return "Global";
}

// ===============================
// Main Processing Function
// ===============================

export function filterArticles(
  articles: RawArticle[]
): ProcessedArticle[] {
  return articles
    .filter(article => article.title && article.url)
    .filter(article => isAllowed(article.title))
    .map(article => {
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
        region: detectRegion(combinedText),
        published_at:
          article.publishedAt ?? new Date().toISOString(),
      };
    })
    .sort((a, b) => {
      // Legal priority on top
      if (a.category === "Legal") return -1;
      if (b.category === "Legal") return 1;
      return 0;
    });
}
