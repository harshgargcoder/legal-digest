"use client";

import { useEffect, useState } from "react";
import { sanitizeText } from "@/supabase/functions/_shared/filter";
import type { TrendingTopicsResponse } from "@/lib/api-types";

export default function AIInsights() {
  const [insights, setInsights] = useState<TrendingTopicsResponse | null>(null);

  useEffect(() => {
    fetch("/api/summarize")
      .then((res) => res.json())
      .then((data: TrendingTopicsResponse) => setInsights(data));
  }, []);

  if (!insights) return null;

  return (
    <div className="p-6 rounded-2xl bg-white border border-gray-200 shadow-sm">

      <h2 className="font-semibold text-lg mb-3">
        🧠 AI Legal Intelligence
      </h2>

      <p className="text-sm text-gray-600 mb-2">
        Articles analyzed: {insights.articlesAnalyzed}
      </p>

      <div className="flex flex-wrap gap-2">
        {insights.trendingTopics.map((t, i: number) => (
          <span
            key={i}
            className="text-xs px-2 py-1 rounded-full bg-indigo-100 text-indigo-700"
          >
            {sanitizeText(t, 60)}
          </span>
        ))}
      </div>

    </div>
  );
}
