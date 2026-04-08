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
        a.feedCategory,
      ),
      region: detectRegion(
        combinedText,
        a.feedCategory,
      ),
      published_at: a.publishedAt ?? new Date().toISOString(),
    };
  });
}
