export type Category =
  | "Constitutional"
  | "Supreme Court"
  | "High Court"
  | "Finance"
  | "Sports"
  | "General"
  | "Global"
  | "Criminal"
  | "Family";

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
  feedCategory?: Category;
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

const MAX_TEXT_LENGTH = 5000;
const MAX_TITLE_LENGTH = 300;
const MAX_SOURCE_LENGTH = 120;

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

const financeRegex = buildRegex([
  "debt",
  "profit",
  "loss",
  "insolvency",
  "bankruptcy",
  "nclt",
  "nclat",
  "sebi",
  "rbi",
  "company act",
  "corporate law",
  "shareholder",
  "merger",
  "acquisition",
  "liquidation",
  "stay proceedings",
  "corporate hearing",
  "financial dispute",
  "monetary claim",
  "gst",
  "income tax",
  "customs duty",
  "dividend",
]);

const familyRegex = buildRegex([
  "divorce",
  "divorce petition",
  "divorce settlement",
  "alimony",
  "spousal support",
  "maintenance",
  "child maintenance",
  "separation",
  "judicial separation",
  "custody",
  "child custody",
  "visitation",
  "visitation rights",
  "adoption",
  "guardianship",
  "marital",
  "matrimonial",
  "settlement",
  "annulment",
  "bigamy",
  "mutual consent divorce",
  "restoration of conjugal rights",
  "domestic violence",
  "domestic abuse",
  "child support",
  "dowry",
  "paternity",
  "parentage",
  "succession",
  "inheritance",
  "partition",
  "streedhan",
  "child marriage",
  "guardians and wards",
  "nri divorce",
  "maintenance under section 125",
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

export function sanitizeText(value: unknown, maxLength = MAX_TEXT_LENGTH) {
  if (typeof value !== "string") return "";

  return value
    .replace(/<[^>]*>/g, " ")
    .replace(/[\u0000-\u0008\u000B-\u001F\u007F]/g, " ")
    .replace(/[\u202A-\u202E\u2066-\u2069]/g, "")
    .replace(/\s+/g, " ")
    .trim()
    .slice(0, maxLength);
}

export function normalizeHttpUrl(value: unknown) {
  if (typeof value !== "string") return null;

  const trimmed = value.trim();
  if (!trimmed) return null;

  try {
    const url = new URL(trimmed);
    if (url.protocol !== "http:" && url.protocol !== "https:") {
      return null;
    }

    url.hash = "";
    return url.toString();
  } catch {
    return null;
  }
}

export function chunkArray<T>(items: T[], size: number) {
  if (size <= 0) return [items];

  const chunks: T[][] = [];
  for (let i = 0; i < items.length; i += size) {
    chunks.push(items.slice(i, i + size));
  }
  return chunks;
}

export function detectCategories(
  text: string,
  feedCategory?: Category,
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

  if (financeRegex.test(normalized)) {
    categorySet.add("Finance");
  }

  if (familyRegex.test(normalized)) {
    categorySet.add("Family");
  }

  if (feedCategory) {
    categorySet.add(feedCategory);
  }

  if (
    categorySet.has("Supreme Court") ||
    categorySet.has("High Court") ||
    categorySet.has("Constitutional")
  ) {
    categorySet.delete("General");
  }

  if (categorySet.size === 0) {
    categorySet.add("General");
  }

  return Array.from(categorySet);
}

export function detectRegion(
  text: string,
  feedCategory?: Category,
): "India" | "Global" {
  const normalized = text.toLowerCase();

  if (feedCategory === "Global") {
    return "Global";
  }

  if (feedCategory === "Criminal" || feedCategory === "Family") {
    return "India";
  }

  if (
    indiaLegalRegex.test(normalized) ||
    normalized.includes("india") ||
    normalized.includes("new delhi") ||
    normalized.includes("mumbai") ||
    normalized.includes("delhi")
  ) {
    return "India";
  }
  return "Global";
}

export function processArticles(
  articles: RawArticle[],
): ProcessedArticle[] {
  return articles
    .map((a) => {
      const url = normalizeHttpUrl(a.url);
      if (!url) return null;

      const title = sanitizeText(a.title, MAX_TITLE_LENGTH);
      if (!title) return null;

      const summary = sanitizeText(a.description);
      const content = sanitizeText(a.content);
      const imageUrl = normalizeHttpUrl(a.urlToImage);
      const source = sanitizeText(a.source?.name ?? "Unknown", MAX_SOURCE_LENGTH) || "Unknown";
      const combinedText = `
        ${title}
        ${summary}
        ${content}
      `.trim();

      return {
        title,
        summary,
        content,
        url,
        image_url: imageUrl,
        source,
        categories: detectCategories(
          combinedText,
          a.feedCategory,
        ),
        region: detectRegion(
          combinedText,
          a.feedCategory,
        ),
        published_at: a.publishedAt ?? new Date().toISOString(),
      };
    })
    .filter((article): article is ProcessedArticle => Boolean(article));
}
