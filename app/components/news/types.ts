export interface NewsArticle {
  id: string;
  title: string;
  summary?: string;
  content?: string;
  url: string;
  ai_summary?: string;
  tags?: string[];
  precedents?: string[];
  category?: string;
  published_at: string;
}

export interface NewsPreferences {
  categories: string[];
  topics: string[];
}

export interface NewsFeedProps {
  category: string;
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
