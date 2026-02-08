"use client";

import { useEffect, useState } from "react";

import Navbar from "./components/Navbar";
import Footer from "./components/Footer";
import NewsCard from "./components/NewsCard";
import CategoryFilter from "./components/CategoryFilter";
import EmptyState from "./components/EmptyState";

interface Article {
  id: string;
  title: string;
  summary: string;
  source: string;
  score: number;
  legal_category: string;
  published_at: string;
  url: string;
}

export default function Home() {
  const [news, setNews] = useState<Article[]>([]);
  const [category, setCategory] = useState<string>("All");
  const [loading, setLoading] = useState<boolean>(false);

  useEffect(() => {
    fetchNews();
  }, [category]);

  async function fetchNews() {
    try {
      setLoading(true);

      const res = await fetch(
        category === "All"
          ? "/api/legal-route-news"
          : `/api/legal-route-news?category=${category}`
      );

      const data = await res.json();

      if (!data.success) {
        console.error("API error:", data.error);
        return;
      }

      setNews(data.articles || []);
    } catch (error) {
      console.error("Fetch error:", error);
    } finally {
      setLoading(false);
    }
  }


  return (
    <>
      <Navbar />

      <main className="min-h-screen px-6 py-12">
        <div className="max-w-5xl mx-auto">
          <h1 className="text-4xl font-bold mb-8">
            Legal Intelligence Feed
          </h1>

          <CategoryFilter
            selected={category}
            setSelected={setCategory}
          />

          <div className="mt-10 space-y-6">
            {loading ? (
              <p className="text-gray-500">Loading...</p>
            ) : news.length === 0 ? (
              <EmptyState />
            ) : (
              news.map((item, index) => (
                <NewsCard key={item.id} item={item} index={index} />
              ))
            )}
          </div>
        </div>
      </main>

      <Footer />
    </>
  );
}
