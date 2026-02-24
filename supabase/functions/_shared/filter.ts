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

const buildRegex = (keywords: string[]) =>
  new RegExp(`\\b(${keywords.join("|")})\\b`, "i");

const rejectRegex = buildRegex([
  "box office",
  "movie review",
  "celebrity",
  "tv show",
  "reality show",
  "fashion week",
]);

export function isAllowed(title: string): boolean {
  return !rejectRegex.test(title.toLowerCase());
}

const sportsRegex = buildRegex([
  "cricket","football","soccer","tennis","basketball","badminton","hockey",
  "chess","kabaddi","golf","formula 1","f1","boxing","wrestling",
  "world cup","olympics","ipl","t20","champions league","premier league",
  "grand slam","wimbledon","us open","french open",
  "tournament","championship","goal","wicket","century",
  "coach","captain","injury","athlete","medal"
]);

const financeRegex = buildRegex([
  "stock market","share market","stocks","trading","ipo","sensex","nifty",
  "gdp","inflation","interest rate","repo rate","budget",
  "currency","forex","rupee","dollar",
  "audit","chartered accountant","icai","gst","income tax",
  "tds","itr","balance sheet","financial statements","ledger",
  "compliance","tax audit","capital gains","ca","cma","cfo",
  "finance minister","economic survey","monetary policy","fiscal policy",
  "fdi",
]);

const legalRegex = buildRegex([
  "supreme court","high court","tribunal","bench",
  "judgment","verdict","order","petition","appeal",
  "constitutional","criminal","civil suit",
  "parliament","bill","act","legislation",
  "regulation","gazette","pil","amendment",
  "article","section","clause","subsection",
  "verdict","trial","prosecution","defense","lawyer",
  "advocate","judge","justice", "crime","case",
  "hearing","witness","evidence","act"
]);

const globalRegex = buildRegex([
  "united states","china","russia","ukraine",
  "israel","gaza","iran","north korea","europe",
  "war","conflict","sanction","refugee",
  "climate change","pandemic","covid","plague",
  "earthquake","hurricane","flood","tsunami",
  "drought","wildfire","nuclear","cyber attack",
  "terrorism","terrorist","terror","g20",
  "world economic forum","world health organization",
  "united nations","nato","eu","european union","africa","asia",
  "global warming","greenhouse","carbon","emission","sustainability",
  "renewable energy","solar","wind","electric vehicle","ev",
  "climate summit","climate action","climate crisis","climate emergency",
  "greenhouse effect","carbon footprint","solar power","wind power",
]);

export function detectCategory(text: string): string {
  const lower = text.toLowerCase();

  if (sportsRegex.test(lower)) return "Sports";
  if (financeRegex.test(lower)) return "Finance";
  if (legalRegex.test(lower)) return "Legal";
  if (globalRegex.test(lower)) return "Global";

  return "General";
}

const indiaRegex = buildRegex([
  "india","delhi","mumbai","kolkata","chennai",
  "supreme court of india","rbi","sebi"
]);

export function detectRegion(text: string): string {
  return indiaRegex.test(text.toLowerCase()) ? "India" : "Global";
}

export function filterArticles(
  articles: RawArticle[]
): ProcessedArticle[] {
  return articles
    .filter(a => a.title && a.url)
    .filter(a => isAllowed(a.title))
    .map(a => {
      const combined = `${a.title ?? ""} ${a.description ?? ""} ${a.content ?? ""}`;

      return {
        title: a.title,
        summary: a.description ?? "",
        content: a.content ?? "",
        source: a.source?.name ?? "Unknown",
        url: a.url,
        image_url: a.urlToImage ?? null,
        category: detectCategory(combined),
        region: detectRegion(combined),
        published_at: a.publishedAt ?? new Date().toISOString(),
      };
    })
    .sort((a, b) => {
      const priority = ["Legal", "Finance", "Sports", "Global", "General"];
      return priority.indexOf(a.category) - priority.indexOf(b.category);
    });
}