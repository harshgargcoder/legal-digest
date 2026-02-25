export interface RawArticle {
  title: string;
  description?: string;
  content?: string;
  url: string;
  urlToImage?: string;

  source?: {
    name: string;
    type?: "general" | "legal" | "finance" | "sports" | "global";
  };

  publishedAt?: string;
}

export interface ProcessedArticle {
  title: string;
  summary: string;
  content: string;
  url: string;
  image_url: string | null;
  source: string;
  category:
    | "Supreme Court"
    | "High Court"
    | "Constitutional"
    | "Legal"
    | "Finance"
    | "Sports"
    | "Global"
    | "General";
  region: string;
  published_at: string;
}

const buildRegex = (keywords: string[]) => {
  const escaped = keywords.map((k) => k.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"));
  return new RegExp(`\\b(${escaped.join("|")})\\b`, "i");
};

const rejectRegex = buildRegex([
  "box office",
  "movie review",
  "celebrity",
  "tv show",
  "reality show",
  "fashion week",
  "entertainment",
  "gossip",
  "red carpet",
]);

export function isAllowed(title: string, description?: string): boolean {
  const text = `${title} ${description ?? ""}`.toLowerCase();
  return !rejectRegex.test(text);
}

const sportsRegex = buildRegex([
  "cricket",
  "football",
  "soccer",
  "tennis",
  "basketball",
  "badminton",
  "hockey",
  "chess",
  "kabaddi",
  "golf",
  "formula 1",
  "f1",
  "boxing",
  "wrestling",
  "world cup",
  "olympics",
  "ipl",
  "t20",
  "champions league",
  "premier league",
  "grand slam",
  "wimbledon",
  "us open",
  "french open",
]);

const financeRegex = buildRegex([
  "stock market",
  "share market",
  "stocks",
  "trading",
  "ipo",
  "sensex",
  "nifty",
  "gdp",
  "inflation",
  "interest rate",
  "repo rate",
  "currency",
  "forex",
  "rupee",
  "dollar",
  "audit",
  "chartered accountant",
  "icai",
  "gst",
  "income tax",
  "tds",
  "itr",
  "balance sheet",
  "financial statements",
  "tax audit",
  "capital gains",
  "finance minister",
  "economic survey",
  "monetary policy",
  "fiscal policy",
  "fdi",
]);

const supremeCourtRegex = buildRegex([
  "supreme court of india",
  "supreme court",
  "chief justice of india",
  "cji",
  "sc verdict",
  "sc order",
  "sc judgment",
]);

const highCourtRegex = buildRegex([
  "high court",
  "division bench",
  "single judge bench",
  "delhi high court",
  "bombay high court",
  "madras high court",
  "calcutta high court",
  "karnataka high court",
  "allahabad high court",
]);

const constitutionalRegex = buildRegex([
  "article 14",
  "article 19",
  "article 21",
  "article 32",
  "article 226",
  "constitutional validity",
  "basic structure doctrine",
  "fundamental rights",
  "constitutional challenge",
]);

const legalRegex = buildRegex([
  "tribunal",
  "national green tribunal",
  "nclt",
  "nclat",
  "pil",
  "writ petition",
  "special leave petition",
  "bail plea",
  "stay order",
  "bar council",
]);

const globalRegex = buildRegex([
  "united states",
  "china",
  "russia",
  "ukraine",
  "israel",
  "gaza",
  "iran",
  "north korea",
  "nato",
  "united nations",
  "world health organization",
  "european union",
  "g20",
  "climate summit",
  "climate crisis",
  "carbon emission",
  "renewable energy",
]);

const indiaRegex = buildRegex([
  "india",
  "delhi",
  "mumbai",
  "kolkata",
  "chennai",
  "bengaluru",
  "hyderabad",
  "supreme court of india",
  "rbi",
  "sebi",
  "parliament of india",
]);

export function detectCategory(
  text: string,
  sourceType: string
): ProcessedArticle["category"] {
  const lower = text.toLowerCase();

  // 🏛 Courts ALWAYS highest priority
  if (supremeCourtRegex.test(lower)) return "Supreme Court";
  if (highCourtRegex.test(lower)) return "High Court";

  // 📜 Constitutional
  if (constitutionalRegex.test(lower)) return "Constitutional";

  // ⚖ Legal
  if (legalRegex.test(lower)) return "Legal";

  // 🎯 Then feed shortcuts
  if (sourceType === "sports") return "Sports";
  if (sourceType === "finance") return "Finance";
  if (sourceType === "global") return "Global";

  return "General";
}

export function detectRegion(text: string): string {
  const lower = text.toLowerCase();
  return indiaRegex.test(lower) ? "India" : "Global";
}

export function categorizeArticle(
  title: string,
  description: string,
  sourceType: string,
) {
  const combined = `${title} ${description}`;

  return {
    category: detectCategory(combined, sourceType),
    region: detectRegion(combined),
  };
}

export function filterArticles(
  articles: RawArticle[],
): ProcessedArticle[] {
  return articles
    .filter((a) => a.title && a.url)
    .filter((a) => isAllowed(a.title))
    .map((a) => {
      const combined = [
        a.title,
        a.description,
        a.content,
      ]
        .filter(Boolean)
        .join(" ");

      return {
        title: a.title,
        summary: a.description ?? "",
        content: a.content ?? "",
        source: a.source?.name ?? "Unknown",
        url: a.url,
        image_url: a.urlToImage ?? null,
        category: detectCategory(
          combined,
          a.source?.type ?? "general",
        ),
        region: detectRegion(combined),
        published_at: a.publishedAt ?? new Date().toISOString(),
      };
    })
    .sort((a, b) => {
      const priority: ProcessedArticle["category"][] = [
        "Supreme Court",
        "High Court",
        "Constitutional",
        "Legal",
        "Finance",
        "Sports",
        "Global",
        "General",
      ];

      return (
        priority.indexOf(a.category) -
        priority.indexOf(b.category)
      );
    });
}
