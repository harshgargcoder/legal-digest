"use client";

import { useState, useEffect } from "react";
import { auth } from "@/lib/firebase";
import BookmarkButton from "../BookmarkButton";
import { Sparkles, Scale, BookOpen, Clock, ExternalLink, Volume2, Square } from "lucide-react";

interface Props {
  item: any;
  index: number;
  activeCategory?: string;
  isFeatured?: boolean;
}

export default function NewsCard({ item, index, isFeatured }: Props) {
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
      group relative overflow-hidden transition-all duration-500 border cursor-pointer
      hover:-translate-y-1 hover:scale-[1.005]
      ${isFeatured 
        ? "p-8 sm:p-10 rounded-[2rem] bg-white border-gray-200 shadow-xl hover:border-indigo-400/60 hover:shadow-indigo-500/10"
        : `rounded-xl p-3 sm:p-5 ${isTopThree ? "bg-white border-gray-200 shadow-sm hover:shadow-xl hover:shadow-indigo-500/10 hover:border-indigo-400/60" : "bg-white border-gray-100 shadow-sm hover:shadow-xl hover:shadow-indigo-500/10 hover:border-indigo-300/50"}`
      }
    `}
    >
      {/* Background Glow for Featured/Top Items */}
      {isFeatured && (
        <>
          <div className="absolute top-0 right-0 w-full h-full bg-gradient-to-l from-indigo-500/5 to-transparent opacity-50 pointer-events-none mix-blend-screen"></div>
          <div className="absolute -top-32 -right-32 w-64 h-64 bg-indigo-600/10 rounded-full blur-[100px] pointer-events-none group-hover:bg-purple-600/20 transition-colors duration-1000"></div>
        </>
      )}
      {/* Shimmer sweep on hover */}
      <div className="pointer-events-none absolute inset-0 -translate-x-full group-hover:translate-x-full transition-transform duration-700 ease-in-out bg-gradient-to-r from-transparent via-white/10 to-transparent z-20" />

      {/* Animated left accent border */}
      <div className="absolute left-0 top-1/2 -translate-y-1/2 w-[3px] h-0 group-hover:h-3/4 bg-gradient-to-b from-indigo-500 to-purple-500 rounded-full transition-all duration-500 ease-out z-10" />
      {/* Background Glow for Top Items */}
      {isTopThree && (
        <div className="absolute -top-12 -right-12 w-24 h-24 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none group-hover:bg-indigo-500/20 transition-all duration-700"></div>
      )}

      {/* Header Section */}
      <div className="flex justify-between items-start gap-2 mb-2 relative z-10">
        <div className="flex flex-col items-start gap-1">
          {/* Top Story / Trending Badge */}
          {isFeatured ? (
            <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full font-bold text-[10px] tracking-widest uppercase bg-indigo-600 text-white border border-indigo-700 mb-4 backdrop-blur-md shadow-lg shadow-indigo-600/20 relative z-10">
              <span className="w-1.5 h-1.5 rounded-full bg-indigo-200 animate-pulse"></span>
              Top Story
            </span>
          ) : isTopThree && (
            <span className="flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-gradient-to-r from-indigo-500 to-purple-500 text-white text-[8px] sm:text-[9px] font-bold tracking-wider uppercase shadow-md shadow-indigo-500/20 mb-1">
              <span className="text-[9px] sm:text-[10px]">🔥</span> Trending {index + 1}
            </span>
          )}
          <h2 className={`${isFeatured ? "text-2xl sm:text-4xl" : "text-base sm:text-xl"} font-bold leading-tight text-slate-900 group-hover:text-indigo-600 transition-colors duration-300`}>
            {item.title || "Untitled Legal Event"}
          </h2>
        </div>
        
        <div className="flex-shrink-0">
          <BookmarkButton postId={item.id} />
        </div>
      </div>

      {/* Meta Bar */}
      <div className="flex items-center gap-3 text-[10px] sm:text-[11px] font-bold text-slate-500 mb-3 relative z-10">
        <span className="flex items-center gap-1.5 px-1.5 py-1 bg-slate-50 rounded-md border border-gray-100">
          <BookOpen size={10} className="text-indigo-400" />
          {item.category}
        </span>
        <span className="flex items-center gap-1.5">
          <Clock size={10} />
          {formattedTime}
        </span>
      </div>

      {/* Main Content */}
      <div className="relative z-10 space-y-3">
        <p className={`leading-relaxed text-slate-600 ${isFeatured ? "text-base sm:text-lg max-w-3xl" : "text-[13px] sm:text-sm line-clamp-2 group-hover:line-clamp-none"} transition-all duration-500`}>
          {item.summary || "No full summary provided for this event. Click below to analyze."}
        </p>

        {/* Actions Row */}
        <div className="flex items-center justify-between mt-4">
          <div className="flex items-center gap-3">
            {!aiSummary && !loading && (
              <button
                onClick={(e) => { e.stopPropagation(); generateSummary(); }}
                disabled={loading}
                className="group/btn flex items-center gap-2 px-3 py-1.5 bg-indigo-50 hover:bg-indigo-100 border border-indigo-100 rounded-xl text-[10px] font-bold text-indigo-700 transition-all active:scale-95"
              >
                <Sparkles size={12} className="text-indigo-500 group-hover/btn:rotate-12 transition-transform" />
                Generate AI Case Brief
              </button>
            )}

            {loading && (
              <div className="flex items-center gap-2 px-3 py-1.5 bg-indigo-50 border border-indigo-100 rounded-xl animate-pulse">
                <div className="w-3 h-3 rounded-full border-2 border-indigo-400 border-t-transparent animate-spin"></div>
                <span className="text-[10px] font-bold text-indigo-700 uppercase tracking-wider">Analyzing...</span>
              </div>
            )}
            
            {aiSummary && (
              <div className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-50 border border-emerald-100 rounded-xl text-[10px] font-bold text-emerald-700 uppercase tracking-widest">
                <Sparkles size={12} className="text-emerald-500" /> Brief Ready
              </div>
            )}
          </div>

          <a
            href={item.url}
            target="_blank"
            rel="noopener noreferrer"
            onClick={(e) => { e.stopPropagation(); logReadingActivity(); }}
            className="group/link flex items-center gap-1.5 text-[10px] sm:text-[11px] font-bold text-slate-400 hover:text-indigo-600 transition-all duration-300"
          >
            Read Full Document
            <ExternalLink size={12} className="transition-transform duration-300 group-hover/link:translate-x-0.5 group-hover/link:-translate-y-0.5" />
          </a>
        </div>

        {/* AI Brief Box */}
        {aiSummary && (
          <div className="p-5 rounded-2xl bg-slate-50 border border-indigo-500/10 shadow-inner overflow-hidden relative">
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

            <div className="text-sm text-gray-700 space-y-3">
              {aiSummary.split("\n")
                .filter((line: string) => line.trim() !== "" && line.trim() !== "." && line.trim() !== "-")
                .map((line: string, i: number) => {
                  const parts = line.split(":");
                  if (parts.length > 1) {
                    const label = parts[0];
                    const rest = parts.slice(1).join(":");
                    return (
                      <p key={i}>
                        <span className="font-semibold text-gray-900">
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
              <div className="flex flex-wrap gap-2 mt-5 pt-4 border-t border-gray-100">
                {tags.map((tag, i) => (
                  <span key={i} className="text-[10px] uppercase font-bold tracking-wider px-2 py-1 rounded bg-slate-100 text-indigo-600 border border-indigo-100">
                    #{tag}
                  </span>
                ))}
              </div>
            )}

            {/* Precedents */}
            {precedents.length > 0 && !precedents[0].toLowerCase().includes("none") && (
              <div className="mt-4 pt-4 border-t border-gray-100">
                <p className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">
                  Cited Precedents
                </p>
                <ul className="text-sm space-y-1.5 text-slate-700 font-medium">
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


    </div>
  );
}