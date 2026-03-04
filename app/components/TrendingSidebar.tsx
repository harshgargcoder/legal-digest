"use client";

import { useEffect, useState } from "react";

type Props = {
  setSearch: (value: string) => void;
};

export default function TrendingSidebar({ setSearch }: Props) {

  const [topics, setTopics] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchTopics = async () => {
      try {
        const res = await fetch("/api/summarize");
        const data = await res.json();

        if (data.trendingTopics) {
          const formatted = data.trendingTopics.map((t: any) =>
            Array.isArray(t) ? t[0] : t
          );

          setTopics(formatted);
        }

      } catch (err) {
        console.error("Failed to fetch trending topics");
      } finally {
        setLoading(false);
      }
    };

    fetchTopics();
  }, []);

  return (
    <div className="sticky top-24">

      <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
        Trending Topics
      </h3>

      <div className="mt-6 space-y-4">

        {loading && (
          <div className="text-sm text-gray-500">
            Loading trends...
          </div>
        )}

        {!loading && topics.map((topic, index) => (
          <div
            key={index}
            onClick={() => setSearch(topic)}
            className="
            border rounded-xl px-4 py-3 text-sm cursor-pointer transition-all duration-200

            bg-white border-gray-200 text-gray-700 hover:bg-gray-100 shadow-sm
            dark:bg-zinc-900 dark:border-white/20 dark:text-gray-300 dark:hover:bg-white/10
          "
          >
            {topic}
          </div>
        ))}

      </div>

    </div>
  );
}