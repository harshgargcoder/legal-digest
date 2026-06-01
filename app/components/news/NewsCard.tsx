"use client";

import { useState, useEffect } from "react";
import { auth } from "@/lib/firebase";
import BookmarkButton from "../BookmarkButton";
import { Sparkles, Scale, BookOpen, Clock, ExternalLink, Volume2, Square, X, Clipboard, Share2, Download, ChevronDown, CheckCircle2 } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { createPortal } from "react-dom";
import ReactMarkdown from "react-markdown";
import {
  normalizeHttpUrl,
  sanitizeText,
} from "@/supabase/functions/_shared/filter";
import type { NewsArticle } from "./types";

interface Props {
  item: NewsArticle;
  index: number;
  activeCategory?: string;
  isFeatured?: boolean;
}

export default function NewsCard({ item, index, isFeatured }: Props) {
  const safeTitle = sanitizeText(item.title, 300) || "Untitled Legal Event";
  const safeSummary = sanitizeText(item.summary || item.content || "", 5000);
  const safeUrl = normalizeHttpUrl(item.url);
  const [aiSummary, setAiSummary] = useState(item.ai_summary || "");
  const [tags, setTags] = useState<string[]>(Array.isArray(item.tags) ? item.tags.map((tag: unknown) => sanitizeText(tag, 120)).filter(Boolean) : []);
  const [precedents, setPrecedents] = useState<string[]>(Array.isArray(item.precedents) ? item.precedents.map((p: unknown) => sanitizeText(p, 300)).filter(Boolean) : []);
  const [loading, setLoading] = useState(false);
  const [summaryError, setSummaryError] = useState<string | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (showModal) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
  }, [showModal]);

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
      const text = `Title: ${safeTitle}. Content: ${aiSummary ? aiSummary.replace(/[*#]/g, '') : safeSummary}`;
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
    setSummaryError(null);
    setLoading(true);
    try {
      const user = auth.currentUser;
      if (!user) {
        setSummaryError("Sign in to generate an AI case brief.");
        return;
      }

      const token = await user.getIdToken();
      const res = await fetch("/api/summarize", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          id: item.id,
          title: item.title || "Untitled Event",
          description: item.summary || item.content || "No summary available for this event.",
        }),
      });
      if (!res.ok) {
        throw new Error(`Summary request failed: ${res.status}`);
      }
      const data = await res.json();
      setAiSummary(data.summary || "");
      setTags(data.tags || []);
      setPrecedents(data.precedents || []);
      setShowModal(true); // Open modal automatically
      logReadingActivity(); // Record streak action
    } catch (err: unknown) {
      console.error("AI summary error:", err);
      setSummaryError(
        err instanceof Error
          ? err.message
          : "Failed to generate the AI case brief. Please try again.",
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className={`
      group relative overflow-hidden transition-colors border cursor-pointer bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 shadow-sm hover:border-slate-400 dark:hover:border-slate-600
      ${isFeatured
          ? "p-6 sm:p-8 rounded-lg"
          : "p-4 sm:p-5 rounded-md"
        }
    `}
    >
      {/* Header Section */}
      <div className="flex justify-between items-start gap-2 mb-2 relative z-10">
        <div className="flex flex-col items-start gap-1">
          {/* Top Story / Trending Badge */}
          {isFeatured ? (
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md font-bold text-[9px] tracking-wider uppercase bg-slate-900 text-white border border-slate-950 mb-2 dark:bg-slate-100 dark:text-slate-900 dark:border-slate-100">
              Top Story
            </span>
          ) : isTopThree && (
            <span className="flex items-center gap-1 px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200 text-[8px] sm:text-[9px] font-bold tracking-wider uppercase border border-slate-200 dark:border-slate-700 mb-1.5 w-fit">
              🔥 Trending {index + 1}
            </span>
          )}
          <h2 className={`${isFeatured ? "text-xl sm:text-2xl" : "text-sm sm:text-base"} font-serif font-bold leading-snug text-slate-900 dark:text-white group-hover:text-slate-700 dark:group-hover:text-slate-350 transition-colors`}>
            {safeTitle}
          </h2>
        </div>

        <div className="flex-shrink-0">
          <BookmarkButton postId={item.id} />
        </div>
      </div>

      {/* Meta Bar */}
      <div className="flex items-center gap-3 text-[10px] sm:text-[11px] font-medium text-slate-500 mb-2.5 relative z-10">
        <span className="flex items-center gap-1 px-1.5 py-0.5 bg-slate-100 dark:bg-slate-800 rounded border border-slate-200 dark:border-slate-700">
          <BookOpen size={9} />
          {item.category}
        </span>
        <span className="flex items-center gap-1">
          <Clock size={9} />
          {formattedTime}
        </span>
      </div>

      {/* Main Content */}
      <div className="relative z-10 space-y-3">
        <p className={`leading-relaxed text-slate-600 dark:text-slate-305 ${isFeatured ? "text-sm sm:text-base max-w-3xl" : "text-[12px] sm:text-sm line-clamp-2 group-hover:line-clamp-none"} transition-all duration-300`}>
          {safeSummary || "No full summary provided for this event. Click below to analyze."}
        </p>

        {/* Actions Row */}
        <div className="flex items-center justify-between mt-3">
          <div className="flex items-center gap-3">
            {!aiSummary && !loading && (
              <button
                onClick={(e) => { e.stopPropagation(); generateSummary(); }}
                disabled={loading}
                className="flex items-center gap-1.5 px-2.5 py-1.5 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 border border-slate-300 dark:border-slate-600 rounded text-[10px] font-bold text-slate-800 dark:text-slate-200 transition-colors"
              >
                <Sparkles size={11} className="text-slate-500" />
                Generate Case Brief
              </button>
            )}

            {loading && (
              <div className="flex items-center gap-1.5 px-2.5 py-1.5 bg-slate-50 border border-slate-200 dark:bg-slate-800 dark:border-slate-700 rounded animate-pulse">
                <div className="w-2.5 h-2.5 rounded-full border border-slate-400 border-t-transparent animate-spin"></div>
                <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Analyzing...</span>
              </div>
            )}

            {aiSummary && (
              <button
                onClick={(e) => { e.stopPropagation(); setShowModal(true); }}
                className="flex items-center gap-1 px-2.5 py-1.5 bg-slate-900 text-white dark:bg-white dark:text-slate-950 border border-slate-900 rounded text-[10px] font-bold uppercase tracking-wider hover:opacity-90 transition-colors"
              >
                <Sparkles size={11} /> Brief Ready
              </button>
            )}
          </div>

          {summaryError && (
            <div className="mt-3 rounded border border-rose-200 bg-rose-50 px-3 py-2 text-[10px] font-semibold text-rose-700">
              {summaryError}
            </div>
          )}

          {safeUrl ? (
            <a
              href={safeUrl}
              target="_blank"
              rel="noopener noreferrer"
              onClick={(e) => { e.stopPropagation(); logReadingActivity(); }}
              className="flex items-center gap-1 text-[10px] sm:text-[11px] font-bold text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:underline transition-all"
            >
              Read Full Document
              <ExternalLink size={10} />
            </a>
          ) : (
            <span className="text-[10px] sm:text-[11px] font-bold text-slate-300">
              Source unavailable
            </span>
          )}
        </div>

        {/* Modal Portal */}
        {mounted && showModal && createPortal(
          <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 overflow-hidden">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowModal(false)}
              className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm"
            />

            <motion.div
              initial={{ opacity: 0, scale: 0.98, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.98, y: 10 }}
              className="relative w-full max-w-3xl bg-white dark:bg-slate-900 rounded-lg shadow-2xl flex flex-col max-h-[85vh] overflow-hidden border border-slate-200 dark:border-slate-800"
            >
              {/* Modal Header */}
              <div className="flex items-center justify-between p-5 border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/50">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded bg-slate-900 dark:bg-slate-105 flex items-center justify-center text-white dark:text-slate-900 shadow-sm">
                    <Scale size={20} />
                  </div>
                  <div>
                    <h3 className="text-lg font-serif font-bold text-slate-900 dark:text-white">AI Case Brief</h3>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={toggleAudio}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded font-bold text-xs uppercase transition-all ${isSpeaking ? 'bg-rose-600 text-white' : 'bg-slate-100 dark:bg-slate-850 hover:bg-slate-200 border border-slate-200 dark:border-slate-800 text-slate-800 dark:text-slate-200'}`}
                  >
                    {isSpeaking ? <><Square size={12} className="fill-current" /> Stop</> : <><Volume2 size={12} /> Listen</>}
                  </button>
                  <button
                    onClick={() => setShowModal(false)}
                    className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded text-slate-400 hover:text-slate-900 dark:hover:text-white transition-all"
                  >
                    <X size={20} />
                  </button>
                </div>
              </div>

              {/* Scrollable Content */}
              <div className="flex-1 overflow-y-auto p-6 sm:p-8 space-y-6 bg-white dark:bg-slate-900">
                {/* News Context */}
                <div className="p-4 rounded border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/50">
                  <p className="text-[9px] font-bold text-slate-400 uppercase tracking-wider mb-1">Source Document</p>
                  <h4 className="text-base font-serif font-bold text-slate-900 dark:text-white leading-snug">{safeTitle}</h4>
                </div>

                <div className="prose prose-slate dark:prose-invert max-w-none">
                  {aiSummary.split("\n")
                    .filter((line: string) => line.trim() !== "" && line.trim() !== "." && line.trim() !== "-")
                    .map((line: string, i: number) => {
                      const parts = line.split(":");
                      if (parts.length > 1) {
                        const label = parts[0];
                        const rest = parts.slice(1).join(":");
                        return (
                          <div key={i} className="mb-4">
                            <h5 className="text-[10px] font-bold text-slate-900 dark:text-white uppercase tracking-wider mb-1 flex items-center gap-1.5">
                              <span className="w-1 h-1 rounded-full bg-slate-900 dark:bg-white" />
                              {label.replace(/\*\*/g, "")}
                            </h5>
                            <p className="text-xs text-slate-700 dark:text-slate-300 leading-relaxed font-medium pl-2.5 border-l border-slate-200 dark:border-slate-800">
                              {rest.replace(/\*\*/g, "")}
                            </p>
                          </div>
                        );
                      }
                      return <p key={i} className="text-xs text-slate-700 dark:text-slate-300 leading-relaxed mb-3 font-medium">{line}</p>;
                    })}
                </div>

                {/* Tags & Precedents */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-6 border-t border-slate-200 dark:border-slate-800">
                  {tags.length > 0 && (
                    <div className="space-y-2">
                      <h5 className="text-[9px] font-bold text-slate-400 uppercase tracking-wider">Case Tags</h5>
                      <div className="flex flex-wrap gap-1.5">
                        {tags.map((tag, i) => (
                          <span key={i} className="px-2 py-1 bg-slate-50 dark:bg-slate-800 text-slate-600 dark:text-slate-350 rounded text-[10px] font-bold border border-slate-200 dark:border-slate-700">
                            #{tag}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  {precedents.length > 0 && !precedents[0].toLowerCase().includes("none") && (
                    <div className="space-y-2">
                      <h5 className="text-[9px] font-bold text-slate-400 uppercase tracking-wider">Key Precedents</h5>
                      <div className="space-y-1.5">
                        {precedents.map((p, i) => (
                          <div key={i} className="flex items-center gap-2 p-2 bg-slate-50 dark:bg-slate-800 rounded border border-slate-200 dark:border-slate-700">
                            <Scale size={11} className="text-slate-400 shrink-0" />
                            <span className="text-[10px] font-bold text-slate-700 dark:text-slate-300">{p}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Modal Footer */}
              <div className="p-4 sm:p-5 bg-slate-50 dark:bg-slate-900/50 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                  <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider">AI Verified Brief</span>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => {
                      navigator.clipboard.writeText(aiSummary);
                      alert("Copied to clipboard!");
                    }}
                    className="p-2.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded text-slate-500 hover:text-slate-900 dark:hover:text-white shadow-sm"
                  >
                    <Clipboard size={14} />
                  </button>
                  <button
                    onClick={() => setShowModal(false)}
                    className="px-5 py-2 bg-slate-950 text-white dark:bg-slate-100 dark:text-slate-950 rounded font-bold text-[10px] uppercase tracking-wider hover:opacity-90 shadow-sm"
                  >
                    Close Brief
                  </button>
                </div>
              </div>
            </motion.div>
          </div>,
          document.body
        )}
      </div>
    </div>
  );
}
