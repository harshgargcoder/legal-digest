"use client";

import { useState } from "react";
import BookmarkButton from "../BookmarkButton";

interface Props {
  item: any;
  index: number;
  activeCategory?: string;
}

export default function NewsCard({ item, index }: Props) {

  const [aiSummary, setAiSummary] = useState("");
  const [tags, setTags] = useState<string[]>([]);
  const [precedents, setPrecedents] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);

  const formattedTime = new Date(item.published_at).toLocaleString("en-IN", {
    dateStyle: "medium",
    timeStyle: "short",
  });

  const isTopThree = index < 3;

  const generateSummary = async () => {
    if (loading || aiSummary) return;

    setLoading(true);

    try {
      const res = await fetch("/api/summarize", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          title: item.title,
          description: item.summary,
        }),
      });

      const data = await res.json();

      setAiSummary(data.summary || "");
      setTags(data.tags || []);
      setPrecedents(data.precedents || []);

    } catch (err) {
      console.error("AI summary error:", err);
    }

    setLoading(false);
  };

  return (
    <div
      className={`
      relative overflow-hidden rounded-2xl p-4 sm:p-6
      transition-all duration-500

      ${isTopThree
          ? `
      bg-white border border-gray-200 shadow-md
      dark:bg-gradient-to-br 
      dark:from-indigo-900/60 
      dark:to-purple-900/60
      dark:border-indigo-500/30 
      dark:backdrop-blur-xl
      `
          : `
      bg-white border border-gray-200 shadow-sm
      dark:bg-white/5 dark:border-white/10 dark:backdrop-blur-lg
        `
        }
      hover:scale-[1.02] hover:shadow-xl
    `}
    >

      {/* TOP 3 Badge */}
      {isTopThree && (
        <div className="absolute top-4 right-4 bg-indigo-600 text-white text-xs px-3 py-1 rounded-full font-semibold shadow-md">
          🔥 Top {index + 1}
        </div>
      )}

      {/* Title */}
      <h2 className="text-lg sm:text-xl font-semibold leading-snug text-gray-900 dark:text-white">
        {item.title}
      </h2>

      <div className="mt-3">
        <BookmarkButton postId={item.id} />
      </div>

      {/* RSS Summary */}
      <p className="mt-3 leading-relaxed text-sm sm:text-base text-gray-600 dark:text-gray-300">
        {item.summary}
      </p>

      {/* AI Summary Button */}
      {!aiSummary && !loading && (
        <button
          onClick={generateSummary}
          disabled={loading}
          className="mt-3 text-xs font-medium text-indigo-600 hover:text-indigo-800 dark:text-indigo-300 dark:hover:text-white disabled:opacity-50 disabled:cursor-not-allowed transition"
        >
          ⚡ AI Quick Summary
        </button>
      )}

      {/* Loading */}
      {loading && (
        <p className="mt-3 text-xs text-gray-500 dark:text-gray-400">
          Generating AI summary...
        </p>
      )}

      {/* AI Summary Box */}
      {aiSummary && (
        <div className="mt-4 p-3 rounded-lg border
                      bg-indigo-50 border-indigo-200
                      dark:bg-indigo-900/30 dark:border-indigo-500/30">

          <p className="text-xs font-semibold mb-2 text-indigo-700 dark:text-indigo-300">
            ⚖ AI Case Brief
          </p>

          <div className="text-sm text-gray-700 dark:text-gray-200 space-y-1">
            {aiSummary.split("\n")
              .filter((line) => line.trim() !== "" && line.trim() !== "." && line.trim() !== "-")
              .map((line, i) => {
                const [label, ...rest] = line.split(":");
                return (
                  <p key={i}>
                    <span className="font-semibold text-indigo-700 dark:text-indigo-300">
                      {label}:
                    </span>{" "}
                    {rest.join(":").replace(/\*\*/g, "")}
                  </p>
                );
              })}
          </div>

        </div>
      )}

      {/* AI Tags */}
      {tags.length > 0 && (
        <div className="flex flex-wrap gap-2 mt-3">
          {tags.map((tag, i) => (
            <span
              key={i}
              className="text-xs px-2 py-1 rounded-full bg-indigo-100 text-indigo-700 dark:bg-indigo-900/40 dark:text-indigo-300"
            >
              {tag}
            </span>
          ))}
        </div>
      )}

      {/* Precedents */}
      {precedents.length > 0 && !precedents[0].toLowerCase().includes("none") && (
        <div className="mt-3">
          <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 mb-1">
            📚 Related Precedents
          </p>

          <ul className="text-xs space-y-1 text-gray-700 dark:text-gray-300">
            {precedents.map((p, i) => (
              <li key={i}>• {p}</li>
            ))}
          </ul>
        </div>
      )}

      {/* Outcomes */}
      {item.outcomes?.length > 0 && (
        <div className="mt-3">
          <h4 className="font-medium text-sm">Current Outcome</h4>
          <ul className="list-disc ml-5 text-sm">
            {item.outcomes.map((o: string, i: number) => (
              <li key={i}>{o}</li>
            ))}
          </ul>
        </div>
      )}

      {/* Bottom */}
      <div className="flex justify-between items-center mt-6">

        <div className="flex items-center gap-3 text-xs text-gray-500 dark:text-gray-300">
          <span className="bg-gray-100 dark:bg-white/10 px-3 py-1 rounded-full">
            {item.category}
          </span>

          <span>{formattedTime}</span>
        </div>

        <a
          href={item.url}
          target="_blank"
          rel="noopener noreferrer"
          className="font-medium transition text-indigo-600 hover:text-indigo-800 dark:text-indigo-300 dark:hover:text-white"
        >
          Read Full →
        </a>

      </div>
    </div>
  );
}