"use client";

import { useState, useEffect } from "react";
import { auth } from "@/lib/firebase";
import BookmarkButton from "../BookmarkButton";
import { Sparkles, Scale, BookOpen, Clock, ExternalLink, Volume2, Square } from "lucide-react";

interface Props {
  item: any;
  index: number;
  activeCategory?: string;
}

export default function NewsCard({ item, index }: Props) {
  const [aiSummary, setAiSummary] = useState(item.ai_summary || "");
  const [tags, setTags] = useState<string[]>(item.tags || []);
  const [precedents, setPrecedents] = useState<string[]>(item.precedents || []);
  const [loading, setLoading] = useState(false);

  const formattedTime = new Date(item.published_at).toLocaleString("en-IN", {
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });

  const isTopThree = index < 3;

  const [isSpeaking, setIsSpeaking] = useState(false);

  const toggleAudio = () => {
    if (isSpeaking) {
      window.speechSynthesis.cancel();
      setIsSpeaking(false);
    } else {
      const text = `Title: ${item.title}. Content: ${aiSummary ? aiSummary.replace(/[*#]/g, '') : item.summary}`;
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.rate = 1.0;
      utterance.pitch = 1.0;
      utterance.onend = () => setIsSpeaking(false);
      window.speechSynthesis.speak(utterance);
      setIsSpeaking(true);
      logReadingActivity(); // Record streak action
    }
  };

  const logReadingActivity = async () => {
    const user = auth.currentUser;
    if (!user) return;
    try {
      await fetch('/api/usage', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: user.uid })
      });
    } catch (err) {
      console.error("Failed to log reading activity", err);
    }
  };

  const generateSummary = async () => {
    if (loading || aiSummary) return;
    setLoading(true);
    try {
      const res = await fetch("/api/summarize", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: item.id,
          title: item.title || "Untitled Event",
          description: item.summary || item.content || "No summary available for this event.",
        }),
      });
      const data = await res.json();
      setAiSummary(data.summary || "");
      setTags(data.tags || []);
      setPrecedents(data.precedents || []);
      
      logReadingActivity(); // Record streak action
    } catch (err) {
      console.error("AI summary error:", err);
    }
    setLoading(false);
  };

  return (
    <div
      className={`
      group relative overflow-hidden rounded-3xl p-6 sm:p-8
      transition-all duration-500 border
      ${isTopThree
          ? `
      bg-white border-gray-200 shadow-lg shadow-indigo-500/5
      dark:bg-gradient-to-br dark:from-[#111827] dark:to-[#0B1221]
      dark:border-indigo-500/20 dark:shadow-[0_8px_30px_rgb(0,0,0,0.4)]
      hover:dark:border-indigo-500/40
      `
          : `
      bg-white border-gray-100 shadow-sm
      dark:bg-[#0B1221]/80 dark:border-white/5 
      hover:dark:bg-[#111827] hover:dark:border-white/10
        `
        }
    `}
    >
      {/* Background Glow for Top Items */}
      {isTopThree && (
        <div className="absolute -top-24 -right-24 w-48 h-48 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none group-hover:bg-indigo-500/20 transition-all duration-700"></div>
      )}

      {/* Header Section */}
      <div className="flex justify-between items-start gap-4 mb-4 relative z-10">
        <div className="flex flex-col items-start gap-2">
          {/* Top 3 Badge */}
          {isTopThree && (
            <span className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-gradient-to-r from-indigo-500 to-purple-500 text-white text-[10px] font-bold tracking-wider uppercase shadow-md shadow-indigo-500/20">
              <span className="text-xs">🔥</span> Trending Top {index + 1}
            </span>
          )}
          <h2 className="text-xl sm:text-2xl font-bold leading-snug text-gray-900 dark:text-white group-hover:text-indigo-400 transition-colors duration-300">
            {item.title || "Untitled Legal Event"}
          </h2>
        </div>
        
        <div className="flex-shrink-0 mt-1">
          <BookmarkButton postId={item.id} />
        </div>
      </div>

      {/* Meta Bar */}
      <div className="flex items-center gap-4 text-xs font-medium text-gray-500 dark:text-gray-400 mb-5 relative z-10">
        <span className="flex items-center gap-1.5 px-2.5 py-1 bg-gray-100 dark:bg-white/5 rounded-md border border-gray-200 dark:border-white/10">
          <BookOpen size={12} className="text-indigo-400" />
          {item.category}
        </span>
        <span className="flex items-center gap-1.5">
          <Clock size={12} />
          {formattedTime}
        </span>
      </div>

      {/* Main Content */}
      <div className="relative z-10 space-y-5">
        <p className="leading-relaxed text-sm sm:text-base text-gray-600 dark:text-gray-300">
          {item.summary || "No full summary provided for this event. Click below to analyze."}
        </p>

        {/* AI Action Area */}
        {!aiSummary && !loading && (
          <button
            onClick={generateSummary}
            disabled={loading}
            className="group/btn flex items-center gap-2 px-4 py-2 bg-indigo-50 hover:bg-indigo-100 dark:bg-indigo-500/10 dark:hover:bg-indigo-500/20 border border-indigo-100 dark:border-indigo-500/30 rounded-xl text-xs font-semibold text-indigo-700 dark:text-indigo-300 transition-all active:scale-95"
          >
            <Sparkles size={14} className="text-indigo-500 group-hover/btn:animate-pulse" />
            Generate AI Case Brief
          </button>
        )}

        {/* Loading State */}
        {loading && (
          <div className="flex items-center gap-3 px-4 py-2 bg-white/5 border border-white/10 rounded-xl animate-pulse w-max">
            <div className="w-4 h-4 rounded-full border-2 border-indigo-400 border-t-transparent animate-spin"></div>
            <span className="text-xs font-medium text-indigo-300">Analyzing legal context...</span>
          </div>
        )}

        {/* AI Brief Box */}
        {aiSummary && (
          <div className="p-5 rounded-2xl bg-[#0F172A] border border-indigo-500/30 shadow-inner overflow-hidden relative">
            <div className="absolute top-0 left-0 w-1 h-full bg-gradient-to-b from-indigo-500 to-purple-500"></div>
            
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <Scale size={16} className="text-indigo-400" />
                <p className="text-xs font-bold uppercase tracking-wider text-indigo-300">
                  AI Case Briefing
                </p>
              </div>
              <button 
                onClick={toggleAudio}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-indigo-500/10 hover:bg-indigo-500/20 text-indigo-300 text-xs font-semibold transition-colors"
                title={isSpeaking ? "Stop Audio" : "Listen to Brief"}
              >
                {isSpeaking ? <><Square size={12} className="fill-current" /> Stop</> : <><Volume2 size={12} /> Listen</>}
              </button>
            </div>

            <div className="text-sm text-gray-300 space-y-3">
              {aiSummary.split("\n")
                .filter((line: string) => line.trim() !== "" && line.trim() !== "." && line.trim() !== "-")
                .map((line: string, i: number) => {
                  const parts = line.split(":");
                  if (parts.length > 1) {
                    const label = parts[0];
                    const rest = parts.slice(1).join(":");
                    return (
                      <p key={i}>
                        <span className="font-semibold text-white">
                          {label.replace(/\*\*/g, "")}:
                        </span>{" "}
                        {rest.replace(/\*\*/g, "")}
                      </p>
                    );
                  }
                  return <p key={i}>{line}</p>;
                })}
            </div>

            {/* AI Tags */}
            {tags.length > 0 && (
              <div className="flex flex-wrap gap-2 mt-5 pt-4 border-t border-white/10">
                {tags.map((tag, i) => (
                  <span key={i} className="text-[10px] uppercase font-bold tracking-wider px-2 py-1 rounded bg-black/40 text-indigo-300 border border-indigo-500/20">
                    #{tag}
                  </span>
                ))}
              </div>
            )}

            {/* Precedents */}
            {precedents.length > 0 && !precedents[0].toLowerCase().includes("none") && (
              <div className="mt-4 pt-4 border-t border-white/10">
                <p className="text-xs font-bold uppercase tracking-wider text-gray-400 mb-2">
                  Cited Precedents
                </p>
                <ul className="text-sm space-y-1.5 text-gray-300">
                  {precedents.map((p, i) => (
                    <li key={i} className="flex items-start gap-2">
                      <span className="text-indigo-500 mt-0.5">•</span>
                      <span>{p}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        )}

      </div>

      {/* Footer Link */}
      <div className="mt-6 pt-5 border-t border-gray-100 dark:border-white/5 flex justify-end relative z-10">
        <a
          href={item.url}
          target="_blank"
          rel="noopener noreferrer"
          onClick={logReadingActivity}
          className="flex items-center gap-2 text-sm font-semibold text-gray-900 dark:text-white hover:text-indigo-600 dark:hover:text-indigo-400 transition flex-shrink-0"
        >
          Read Full Document <ExternalLink size={14} />
        </a>
      </div>

    </div>
  );
}