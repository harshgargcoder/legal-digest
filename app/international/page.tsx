"use client";

import NewsFeed from "../components/news/NewsFeed";

export default function InternationalPage() {
  return (
    <div className="max-w-7xl mx-auto px-6 py-10">
      <h1 className="text-3xl font-semibold text-white mb-8">
        International News
      </h1>

      <NewsFeed
        category="All"
        search=""
        region="International"
      />
    </div>
  );
}
