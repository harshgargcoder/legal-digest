"use client";

import { useState } from "react";
import { BookOpen, Sparkles, Wand2, History, ChevronLeft, Loader2, ScrollText, Lightbulb } from "lucide-react";
import Link from "next/link";

export default function StoryVisualizerPage() {
  const [content, setContent] = useState("");
  const [story, setStory] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleVisualize = async () => {
    if (!content.trim() || loading) return;

    setLoading(true);
    setError("");
    setStory(null);

    try {
      const res = await fetch("/api/toolkit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          tool: "story-visualizer",
          content: content.trim()
        })
      });

      const data = await res.json();
      if (data.result) {
        setStory(data.result);
      } else {
        throw new Error(data.error || "Failed to generate story");
      }
    } catch (err: unknown) {
      console.error(err);
      setError(err instanceof Error ? err.message : "The storyteller encountered an error.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#FAFAFA] pt-32 pb-24 px-4 sm:px-6">
      <div className="max-w-5xl mx-auto">
        
        {/* Header */}
        <div className="flex items-center gap-4 mb-12">
          <Link href="/toolkit" className="p-2 bg-white border border-slate-200 rounded-xl text-slate-400 hover:text-emerald-600 hover:border-emerald-100 transition shadow-sm">
            <ChevronLeft size={20} />
          </Link>
          <div>
            <h1 className="text-3xl font-bold text-slate-900 flex items-center gap-3 tracking-tight">
              <BookOpen size={28} className="text-emerald-600" /> Statute Visualizer
            </h1>
            <p className="text-sm text-slate-500 font-medium tracking-wide">Turning dry statutes into vivid narratives.</p>
          </div>
        </div>

        <div className="space-y-12">
          
          {/* Input Section */}
          <div className="bg-white border border-slate-200 rounded-[2.5rem] p-8 sm:p-12 shadow-2xl shadow-emerald-900/5 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-50 rounded-full -mr-16 -mt-16 blur-3xl opacity-50" />
            
            <div className="flex items-center justify-between mb-8 relative z-10">
              <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                <ScrollText size={20} className="text-emerald-500" /> Enter Legal Section
              </h3>
              <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">Section, Article, or Clause</span>
            </div>
            
            <textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="Paste a complex legal section here (e.g., Section 299 of the BNS, or Article 21 of the Constitution)..."
              className="w-full h-48 bg-slate-50 border border-slate-100 rounded-3xl p-8 outline-none focus:ring-4 focus:ring-emerald-500/10 focus:border-emerald-400 transition-all text-slate-900 font-medium placeholder:text-slate-400 resize-none shadow-inner text-lg leading-relaxed relative z-10"
            />

            <div className="flex justify-center mt-10 relative z-10">
              <button
                onClick={handleVisualize}
                disabled={!content.trim() || loading}
                className="px-12 py-5 bg-slate-900 hover:bg-black text-white font-bold rounded-2xl shadow-xl shadow-slate-900/20 transition-all active:scale-95 disabled:opacity-50 disabled:active:scale-100 flex items-center gap-3 group"
              >
                {loading ? <Loader2 size={24} className="animate-spin" /> : <><Wand2 size={24} className="group-hover:rotate-12 transition-transform" /> Visualize the Law</>}
              </button>
            </div>
          </div>

          {/* Story Output */}
          {error && (
            <div className="bg-red-50 border border-red-100 p-4 rounded-2xl text-red-600 text-sm font-bold animate-in zoom-in-95 flex items-center gap-2">
              <History size={18} /> {error}
            </div>
          )}

          {loading || story ? (
            <div className="bg-white border border-slate-200 rounded-[2.5rem] p-8 sm:p-12 shadow-2xl animate-in slide-in-from-bottom-12 duration-1000">
              <div className="flex items-center gap-4 mb-8">
                <div className="w-12 h-12 bg-emerald-50 rounded-2xl flex items-center justify-center text-emerald-600">
                  <Sparkles size={24} className={loading ? 'animate-pulse' : ''} />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-slate-900">The Illustration</h3>
                  <p className="text-xs text-slate-400 font-bold uppercase tracking-widest mt-0.5">Story-based breakdown</p>
                </div>
              </div>

              <div className="prose prose-slate max-w-none">
                {loading ? (
                  <div className="space-y-4">
                    <div className="h-4 bg-slate-100 rounded-full w-full animate-pulse" />
                    <div className="h-4 bg-slate-100 rounded-full w-[90%] animate-pulse" />
                    <div className="h-4 bg-slate-100 rounded-full w-[95%] animate-pulse" />
                    <div className="h-4 bg-slate-100 rounded-full w-[70%] animate-pulse" />
                  </div>
                ) : (
                  <div className="text-slate-700 text-lg leading-loose font-serif selection:bg-emerald-100 italic">
                    {story}
                  </div>
                )}
              </div>

              {!loading && story && (
                <div className="mt-12 flex flex-col md:flex-row gap-6 border-t border-slate-100 pt-10">
                  <div className="flex-1 bg-emerald-50 rounded-3xl p-6 border border-emerald-100 flex gap-4">
                    <div className="p-2 bg-white rounded-xl shadow-sm h-fit">
                      <Lightbulb size={20} className="text-emerald-600" />
                    </div>
                    <div>
                      <h4 className="text-sm font-bold text-emerald-900 uppercase tracking-widest mb-1">Concept Mastered</h4>
                      <p className="text-xs text-emerald-800/70 font-bold leading-relaxed">
                        Visualizing laws as narratives activates the part of your brain responsible for "Situational Awareness"—a key skill for courtroom advocacy.
                      </p>
                    </div>
                  </div>
                  <button 
                    onClick={() => { setStory(null); setContent(""); }}
                    className="px-8 py-3 bg-slate-100 hover:bg-slate-200 text-slate-600 text-xs font-bold rounded-2xl transition active:scale-95 flex-shrink-0"
                  >
                    Clear & Start Again
                  </button>
                </div>
              )}
            </div>
          ) : (
            <div className="text-center py-20 opacity-20 flex flex-col items-center select-none grayscale cursor-default">
              <ScrollText size={80} className="text-slate-400 mb-6" />
              <p className="text-xl font-bold uppercase tracking-[0.4em] text-slate-500">Waiting for Testimony</p>
            </div>
          )}

        </div>

      </div>
    </div>
  );
}
