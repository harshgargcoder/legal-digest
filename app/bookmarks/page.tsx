"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import NewsCard from "../components/news/NewsCard";

export default function BookmarksPage() {
  const [posts, setPosts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchBookmarks = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        setLoading(false);
        return;
      }

      const { data, error } = await supabase
        .from("bookmarks")
        .select(`legal_news (*)`)
        .eq("user_id", user.id);

      if (error) {
        console.error(error);
        setLoading(false);
        return;
      }

      const newsPosts =
        data?.map((item: any) => item.legal_news).filter(Boolean) || [];

      setPosts(newsPosts);
      setLoading(false);
    };

    fetchBookmarks();
  }, []);

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto px-6 py-16">
        <h1 className="text-2xl font-bold mb-2 text-[#2f4a63]">
          Your Bookmarks
        </h1>

        <p className="text-sm text-gray-500 mb-8">
          Loading bookmarks…
        </p>

        <div className="flex flex-col gap-6">
          {[1, 2, 3].map((item) => (
            <div
              key={item}
              className="animate-pulse bg-gray-50 border border-gray-200 p-6 rounded-2xl"
            >
              <div className="h-5 bg-gray-300 rounded w-1/3 mb-4"></div>
              <div className="h-3 bg-gray-300 rounded w-2/3 mb-2"></div>
              <div className="h-3 bg-gray-300 rounded w-1/2 mb-4"></div>
              <div className="h-3 bg-gray-200 rounded w-1/4"></div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-6 py-16">
      <h1 className="text-2xl font-bold mb-8 text-[#2f4a63]">
        Your Bookmarks
      </h1>

      {posts.length === 0 ? (
        <div className="text-center py-24">
          <div className="text-5xl mb-6">🔖</div>

          <h2 className="text-xl font-semibold text-[#2f4a63] mb-3">
            No bookmarks yet
          </h2>

          <p className="text-gray-500 max-w-md mx-auto mb-6">
            Start saving important legal updates and judgments to
            access them quickly anytime.
          </p>

          <a
            href="/"
            className="inline-block bg-[#2f4a63] text-white px-6 py-3 rounded-xl text-sm font-medium hover:opacity-90 transition"
          >
            Explore Latest Updates
          </a>
        </div>
      ) : (
        <div className="flex flex-col gap-6">
          {posts.map((post, index) => (
            <NewsCard key={post.id} item={post} index={index} />
          ))}
        </div>
      )}
    </div>
  );
}
