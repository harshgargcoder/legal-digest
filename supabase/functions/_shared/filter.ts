export type Category =
  | "Supreme Court"
  | "High Court"
  | "Constitutional"
  | "Legal"
  | "Finance"
  | "Sports"
  | "Global"
  | "General";

export interface RawArticle {
  title: string;
  description?: string;
  content?: string;
  url: string;
  urlToImage?: string;
  source?: {
    name: string;
    type?: string;
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
  category: Category;
  region: "India" | "Global";
  published_at: string;
}

const buildRegex = (keywords: string[]) =>
  new RegExp(`\\b(${keywords.join("|")})\\b`, "i");


const supremeCourtRegex = buildRegex([
  "supreme court",
  "supreme court of india",
  "apex court",
  "top court",
  "chief justice of india",
  "cji",
  "sc verdict",
  "sc order",
  "sc judgment",
  "sc bench",
]);

const highCourtRegex = buildRegex([
  "high court",
  "division bench",
  "single judge bench",
]);

const constitutionalRegex = buildRegex([
  "article 14",
  "article 19",
  "article 21",
  "article 32",
  "article 226",
  "constitutional bench",
]);

const legalRegex = buildRegex([
  "tribunal",
  "nclt",
  "pil",
  "writ petition",
  "bail plea",
  "stay order",
  "judgment",
  "verdict",
  "petition",
]);

const indiaRegex = buildRegex([
  "india",
  "delhi",
  "mumbai",
  "kolkata",
  "chennai",
  "bengaluru",
]);

export function detectCategory(
  text: string,
  sourceType?: string
): Category {
  if (supremeCourtRegex.test(text)) return "Supreme Court";
  if (highCourtRegex.test(text)) return "High Court";
  if (constitutionalRegex.test(text)) return "Constitutional";
  if (legalRegex.test(text)) return "Legal";

  if (sourceType === "finance") return "Finance";
  if (sourceType === "sports") return "Sports";
  if (sourceType === "global") return "Global";

  return "General";
}

export function detectRegion(text: string): "India" | "Global" {
  return indiaRegex.test(text) ? "India" : "Global";
}

export function processArticles(
  articles: RawArticle[]
): ProcessedArticle[] {
  return articles.map((a) => {
    const combined = `${a.title} ${a.description ?? ""} ${a.content ?? ""}`;

    return {
      title: a.title,
      summary: a.description ?? "",
      content: a.content ?? "",
      url: a.url,
      image_url: a.urlToImage ?? null,
      source: a.source?.name ?? "Unknown",
      category: detectCategory(combined, a.source?.type),
      region: detectRegion(combined),
      published_at:
        a.publishedAt ?? new Date().toISOString(),
    };
  });
}