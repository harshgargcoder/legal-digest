"use client";

import { useEffect, useState } from "react";
import NewsCard from "./components/news/NewsCard";

const categories = ["All", "Legal", "Political", "Finance", "Sports", "Global"];
  
export default function Home() {
  const [category, setCategory] = useState("All");
  const [articles, setArticles] = useState([]);

  useEffect(() => {
    fetchNews();
  }, [category]);

  async function fetchNews() {
    const res =
      category === "All"
        ? await fetch("/api/get-news")
        : await fetch(`/api/get-news?category=${category}`);

    const data = await res.json();
    setArticles(data.articles || []);
  }

  return (
    <div className="max-w-6xl mx-auto px-6 py-10">
      <h1 className="text-4xl font-bold text-white mb-8">
        Legal Intelligence Feed
      </h1>

      {/* Tabs */}
      <div className="flex gap-4 mb-10">
        {categories.map((cat) => (
          <button
            key={cat}
            onClick={() => setCategory(cat)}
            className={`px-4 py-2 rounded-full text-sm font-medium ${
              category === cat
                ? "bg-indigo-600 text-white"
                : "bg-white/10 text-gray-300"
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* News Grid */}
      <div className="grid gap-8">
        {articles.map((item: any, index: number) => (
          <NewsCard
            key={item.id}
            item={item}
            index={index}
            activeCategory={category}
          />
        ))}
      </div>
    </div>
  );
}
