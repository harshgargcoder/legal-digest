export type Category =
  | "Supreme Court"
  | "High Court"
  | "Constitutional"
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
  categories: Category[];
  region: "India" | "Global";
  published_at: string;
}

const buildRegex = (keywords: string[]) =>
  new RegExp(`\\b(${keywords.join("|")})\\b`, "i");

const supremeCourtRegex = buildRegex([
  "supreme court of india",
  "supreme court",
  "apex court",
  "chief justice of india",
  "cji",
  "sc verdict",
  "sc judgment",
  "sc order",
]);

const highCourtRegex = buildRegex([
  "high court",
  "delhi high court",
  "bombay high court",
  "madras high court",
  "calcutta high court",
  "karnataka high court",
  "division bench",
  "single judge bench",
]);

const constitutionalRegex = buildRegex([
  "constitution bench",
  "constitutional bench",
  "constitution of india",
  "constitutional law",
  "article 14",
  "article 19",
  "article 21",
  "article 32",
  "article 226",
  "basic structure doctrine",
]);

const indiaLegalRegex = buildRegex([
  "supreme court of india",
  "delhi high court",
  "bombay high court",
  "madras high court",
  "calcutta high court",
  "karnataka high court",
  "article 32",
  "article 226",
]);

export function detectCategories(
  text: string,
  sourceType?: string,
): Category[] {
  const normalized = text.toLowerCase();
  const categorySet = new Set<Category>();

  if (constitutionalRegex.test(normalized)) {
    categorySet.add("Constitutional");
  }

  if (supremeCourtRegex.test(normalized)) {
    categorySet.add("Supreme Court");
  }

  if (highCourtRegex.test(normalized)) {
    categorySet.add("High Court");
  }

  if (sourceType === "finance") categorySet.add("Finance");
  if (sourceType === "sports") categorySet.add("Sports");
  if (sourceType === "global") categorySet.add("Global");

  const categories = Array.from(categorySet);

  return categories.length ? categories : ["General"];
}

export function detectRegion(text: string): "India" | "Global" {
  return indiaLegalRegex.test(text.toLowerCase()) ? "India" : "Global";
}

export function processArticles(
  articles: RawArticle[],
): ProcessedArticle[] {
  return articles.map((a) => {
    const combinedText = `
      ${a.title ?? ""}
      ${a.description ?? ""}
      ${a.content ?? ""}
    `.trim();

    return {
      title: a.title,
      summary: a.description ?? "",
      content: a.content ?? "",
      url: a.url,
      image_url: a.urlToImage ?? null,
      source: a.source?.name ?? "Unknown",
      categories: detectCategories(
        combinedText,
        a.source?.type,
      ),
      region: detectRegion(combinedText),
      published_at: a.publishedAt ?? new Date().toISOString(),
    };
  });
}
