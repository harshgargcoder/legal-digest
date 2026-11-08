export interface NewsArticle {
  id: string;
  title: string;
  summary?: string;
  content?: string;
  url: string;
  source?: string | null;
  image_url?: string | null;
  region?: string | null;
  ai_summary?: string;
  tags?: string[] | string | null;
  precedents?: string[];
  category?: string;
  published_at: string;
  score?: number;
}

export interface NewsPreferences {
  categories: string[];
  topics: string[];
}

export interface NewsFeedProps {
  category: string;
  subCategory?: "All" | "General" | "Global";
  search: string;
  region?: string;
  preferences?: NewsPreferences | null;
}

export interface UseNewsFeedResult {
  articles: NewsArticle[];
  loading: boolean;
  initialLoading: boolean;
  hasMore: boolean;
  error: string | null;
  loadMore: () => void;
  retry: () => void;
}
