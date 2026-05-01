export interface TrendingTopicsResponse {
  articlesAnalyzed: number;
  trendingTopics: string[];
}

export interface NewsArticleSummary {
  id?: string;
  title?: string;
  description?: string;
  summary?: string;
  content?: string;
  source?: string;
}

export interface GetNewsResponse<TArticle = unknown> {
  success: boolean;
  articles: TArticle[];
  total: number;
  page: number;
  limit: number;
  hasMore: boolean;
  lastUpdated: string | null;
}

export interface MootCourtSessionRow {
  id: string;
  user_id: string;
  court_type: string;
  case_type: string;
  evaluation: unknown | null;
  created_at: string;
  updated_at: string;
}

export interface MootCourtMessageRow {
  id: string;
  session_id: string;
  role: string;
  content: string;
  side: string | null;
  is_inadmissible: boolean | null;
  created_at: string;
}

export interface MootCourtSummaryRequest {
  text: string;
}

export interface MootCourtSummaryResponse {
  summary: string;
}

export interface NewsSummaryRequest {
  id?: string;
  title: string;
  description: string;
}

export interface NewsSummaryResponse {
  summary: string;
  tags?: string[];
  precedents?: string[];
  outcomes?: string[];
}
