"use client";

import NewsFeed from "../components/news/NewsFeed";

export default function NationalPage() {
  return (
    <div className="max-w-7xl mx-auto px-6 py-10">
      <h1 className="text-3xl font-semibold text-white mb-8">
        National News
      </h1>

      <NewsFeed
        category="All"
        search=""
        region="India"
      />
    </div>
  );
}
