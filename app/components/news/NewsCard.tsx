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
            {safeTitle}
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
          {safeSummary || "No full summary provided for this event. Click below to analyze."}
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
              <button
                onClick={(e) => { e.stopPropagation(); setShowModal(true); }}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-50 border border-emerald-100 rounded-xl text-[10px] font-bold text-emerald-700 uppercase tracking-widest hover:bg-emerald-100 transition-all"
              >
                <Sparkles size={12} className="text-emerald-500" /> Brief Ready
              </button>
            )}
          </div>

          {summaryError && (
            <div className="mt-3 rounded-xl border border-rose-200 bg-rose-50 px-3 py-2 text-[11px] font-semibold text-rose-700">
              {summaryError}
            </div>
          )}

          {safeUrl ? (
            <a
              href={safeUrl}
              target="_blank"
              rel="noopener noreferrer"
              onClick={(e) => { e.stopPropagation(); logReadingActivity(); }}
              className="group/link flex items-center gap-1.5 text-[10px] sm:text-[11px] font-bold text-slate-400 hover:text-indigo-600 transition-all duration-300"
            >
              Read Full Document
              <ExternalLink size={12} className="transition-transform duration-300 group-hover/link:translate-x-0.5 group-hover/link:-translate-y-0.5" />
            </a>
          ) : (
            <span className="text-[10px] sm:text-[11px] font-bold text-slate-300">
              Source unavailable
            </span>
          )}
        </div>

        {/* Modal Portal */}
        {mounted && showModal && createPortal(
          <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 sm:p-6 overflow-hidden">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowModal(false)}
              className="absolute inset-0 bg-slate-900/80 backdrop-blur-md"
            />

            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="relative w-full max-w-4xl bg-white rounded-[2rem] sm:rounded-[3rem] shadow-2xl flex flex-col max-h-[90vh] overflow-hidden border border-white/20"
            >
              {/* Modal Header */}
              <div className="flex items-center justify-between p-6 sm:p-8 border-b border-slate-100 bg-slate-50/50">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-2xl bg-indigo-600 flex items-center justify-center text-white shadow-lg shadow-indigo-200">
                    <Scale size={24} />
                  </div>
                  <div>
                    <h3 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">AI Case Briefing</h3>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={toggleAudio}
                    className={`flex items-center gap-2 px-4 py-2.5 rounded-2xl font-bold text-xs uppercase tracking-widest transition-all ${isSpeaking ? 'bg-rose-500 text-white' : 'bg-indigo-50 text-indigo-600 hover:bg-indigo-100'}`}
                  >
                    {isSpeaking ? <><Square size={14} className="fill-current" /> Stop</> : <><Volume2 size={14} /> Listen</>}
                  </button>
                  <button
                    onClick={() => setShowModal(false)}
                    className="p-3 hover:bg-slate-100 rounded-2xl text-slate-400 hover:text-slate-900 transition-all"
                  >
                    <X size={24} />
                  </button>
                </div>
              </div>

              {/* Scrollable Content */}
              <div className="flex-1 overflow-y-auto custom-scrollbar p-6 sm:p-10 space-y-8 bg-white">
                {/* News Context */}
                <div className="p-6 rounded-3xl bg-slate-50 border border-slate-100 mb-8">
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Source Document</p>
                  <h4 className="text-lg font-bold text-slate-900 leading-snug">{safeTitle}</h4>
                </div>

                <div className="prose prose-slate prose-indigo max-w-none">
                  {aiSummary.split("\n")
                    .filter((line: string) => line.trim() !== "" && line.trim() !== "." && line.trim() !== "-")
                    .map((line: string, i: number) => {
                      const parts = line.split(":");
                      if (parts.length > 1) {
                        const label = parts[0];
                        const rest = parts.slice(1).join(":");
                        return (
                          <div key={i} className="mb-6 group">
                            <h5 className="text-xs font-black text-indigo-500 uppercase tracking-widest mb-2 flex items-center gap-2">
                              <div className="w-1.5 h-1.5 rounded-full bg-indigo-500" />
                              {label.replace(/\*\*/g, "")}
                            </h5>
                            <p className="text-base text-slate-700 leading-relaxed font-medium pl-3 border-l-2 border-slate-100 group-hover:border-indigo-200 transition-colors">
                              {rest.replace(/\*\*/g, "")}
                            </p>
                          </div>
                        );
                      }
                      return <p key={i} className="text-base text-slate-700 leading-relaxed mb-4 font-medium">{line}</p>;
                    })}
                </div>

                {/* Tags & Precedents */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-12 pt-12 border-t border-slate-100">
                  {tags.length > 0 && (
                    <div className="space-y-4">
                      <h5 className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Case Tags</h5>
                      <div className="flex flex-wrap gap-2">
                        {tags.map((tag, i) => (
                          <span key={i} className="px-3 py-1.5 bg-indigo-50 text-indigo-600 rounded-xl text-[11px] font-bold border border-indigo-100">
                            #{tag}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  {precedents.length > 0 && !precedents[0].toLowerCase().includes("none") && (
                    <div className="space-y-4">
                      <h5 className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Key Precedents</h5>
                      <div className="space-y-2">
                        {precedents.map((p, i) => (
                          <div key={i} className="flex items-center gap-3 p-3 bg-slate-50 rounded-2xl border border-slate-100">
                            <Scale size={14} className="text-indigo-400 shrink-0" />
                            <span className="text-xs font-bold text-slate-700">{p}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Modal Footer */}
              <div className="p-6 sm:p-8 bg-slate-50 border-t border-slate-100 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                  <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">AI Verified Brief</span>
                </div>
                <div className="flex items-center gap-3">
                  <button
                    onClick={() => {
                      navigator.clipboard.writeText(aiSummary);
                      alert("Copied to clipboard!");
                    }}
                    className="p-3 bg-white border border-slate-200 rounded-2xl text-slate-400 hover:text-indigo-600 transition-all shadow-sm hover:shadow-md"
                  >
                    <Clipboard size={18} />
                  </button>
                  <button
                    onClick={() => setShowModal(false)}
                    className="px-8 py-3 bg-slate-950 text-white rounded-2xl font-black text-[10px] uppercase tracking-[0.2em] hover:bg-indigo-600 transition-all shadow-xl shadow-slate-200"
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
