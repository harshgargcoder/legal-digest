"use client";

import { useEffect, useRef, useState } from "react";
import { Trophy, Award, ChevronLeft, ChevronRight, Scale } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import type { EvaluationResult } from "@/app/toolkit/moot-court/types";

interface LeaderboardEntry {
  user_id: string;
  user_name: string;
  case_type: string;
  score: number;
}

interface SessionRow {
  user_id: string;
  case_type: string;
  evaluation: EvaluationResult | null;
}

export default function MootCourtLeaderboard() {
  const [entries, setEntries] = useState<LeaderboardEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const didFetchRef = useRef(false);
  const limit = 10;

  useEffect(() => {
    if (didFetchRef.current) return;
    didFetchRef.current = true;
    fetchLeaderboard();
  }, []);

  const fetchLeaderboard = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/moot-court/sessions?forLeaderboard=1&limit=100");
      const data = await res.json();

      if (data?.error) {
        console.warn("Leaderboard sessions fallback:", data.error);
      }

      const sessions: SessionRow[] = Array.isArray(data?.sessions) ? data.sessions : [];

      if (sessions.length > 0) {
        const processed = sessions.map((session) => {
          const evalData = session.evaluation;
          const score = Math.round(
            (((evalData?.legalReasoning || 0) +
              (evalData?.objectionAccuracy || 0) +
              (evalData?.examinationQuality || 0) +
              (evalData?.proceduralCompliance || 0)) / 4)
          );
          return {
            user_id: session.user_id,
            user_name: `Researcher ${session.user_id.slice(-4).toUpperCase()}`,
            case_type: session.case_type,
            score: score,
          };
        });

        const sorted = processed.sort((a, b) => b.score - a.score);
        setEntries(sorted);
      } else {
        setEntries([]);
      }
    } catch (err) {
      console.error("Leaderboard fetch failed:", err);
      setEntries([]);
    } finally {
      setLoading(false);
    }
  };

  const totalPages = Math.ceil(entries.length / limit) || 1;
  const paginatedEntries = entries.slice((page - 1) * limit, page * limit);

  return (
    <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-[2.5rem] shadow-2xl overflow-hidden flex flex-col">
      {/* Header */}
      <div className="p-5 border-b border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/50">
        <div className="flex items-center gap-3 mb-4">
          <div className="h-10 w-10 rounded-xl bg-indigo-600 flex items-center justify-center text-white shadow-lg shadow-indigo-600/30">
            <Trophy size={20} />
          </div>
          <div>
            <h3 className="text-base font-black text-slate-900 dark:text-white uppercase tracking-tight">Leaderboard</h3>
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Global Standings</p>
          </div>
        </div>
        <div className="flex items-center justify-between bg-white dark:bg-slate-800 p-3 rounded-2xl border border-slate-100 dark:border-slate-700">
          <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Top Rank</div>
          <div className="flex items-center gap-2">
            <Award size={14} className="text-amber-500" />
            <span className="text-xs font-black text-slate-900 dark:text-white">
              {entries.length > 0 ? entries[0].user_name : "N/A"}
            </span>
          </div>
        </div>
      </div>

      {/* List Container */}
      <div className="flex-1 overflow-y-auto p-4 space-y-2 custom-scrollbar max-h-[720px]">
        <AnimatePresence mode="wait">
          {loading ? (
            <div className="py-20 text-center space-y-4">
              <Scale size={32} className="mx-auto text-slate-200 animate-pulse" />
              <p className="text-xs font-bold text-slate-400 animate-pulse">Syncing Rankings...</p>
            </div>
          ) : paginatedEntries.length > 0 ? (
            paginatedEntries.map((entry, idx) => {
              const rank = (page - 1) * limit + idx + 1;
              return (
                <motion.div
                  key={`${entry.user_id}-${idx}`}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: idx * 0.05 }}
                  className="relative group p-3.5 rounded-[1.5rem] bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-700/50 transition-all hover:bg-white dark:hover:bg-slate-800 hover:shadow-lg hover:shadow-slate-200/40 dark:hover:shadow-none"
                >
                  <div className="flex items-center justify-between gap-3">
                    <div className="flex items-center gap-3">
                      {/* Rank Badge */}
                      <div className={`h-8 w-8 rounded-xl flex items-center justify-center text-xs font-black ${rank === 1 ? "bg-amber-100 text-amber-600" :
                          rank === 2 ? "bg-slate-200 text-slate-600" :
                            rank === 3 ? "bg-orange-100 text-orange-600" :
                              "bg-white dark:bg-slate-900 text-slate-400"
                        }`}>
                        {rank === 1 ? <Trophy size={14} /> : rank}
                      </div>

                      {/* Info */}
                      <div>
                        <div className="text-sm font-black text-slate-900 dark:text-slate-100 truncate max-w-[110px]">
                          {entry.user_name}
                        </div>
                        <div className="text-[9px] font-bold text-indigo-500 uppercase tracking-tighter">
                          {entry.case_type}
                        </div>
                      </div>
                    </div>

                    {/* Score */}
                    <div className="text-right">
                      <div className="text-sm font-black text-slate-900 dark:text-white">{entry.score}</div>
                      <div className="text-[8px] font-black text-slate-400 uppercase tracking-widest">Points</div>
                    </div>
                  </div>
                </motion.div>
              );
            })
          ) : (
            <div className="py-12 text-center px-6">
              <div className="h-14 w-14 bg-slate-50 dark:bg-slate-800 rounded-full flex items-center justify-center mx-auto mb-4 border border-slate-100 dark:border-slate-700">
                <Scale size={20} className="text-slate-300" />
              </div>
              <p className="text-[11px] font-bold text-slate-400 leading-relaxed italic">
                The courtroom is empty. Start a session to claim your rank!
              </p>
            </div>
          )}
        </AnimatePresence>
      </div>

      {/* Footer / Pagination */}
      <div className="p-4 border-t border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/50 flex items-center justify-between">
        <div className="text-[9px] font-black text-slate-400 uppercase tracking-widest">
          Pg {page}/{totalPages}
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            disabled={page === 1}
            className="h-8 w-8 rounded-lg border border-slate-200 dark:border-slate-800 flex items-center justify-center text-slate-400 hover:text-indigo-600 disabled:opacity-30 transition-all bg-white dark:bg-slate-900 shadow-sm"
          >
            <ChevronLeft size={14} />
          </button>
          <button
            onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
            disabled={page === totalPages}
            className="h-8 w-8 rounded-lg border border-slate-200 dark:border-slate-800 flex items-center justify-center text-slate-400 hover:text-indigo-600 disabled:opacity-30 transition-all bg-white dark:bg-slate-900 shadow-sm"
          >
            <ChevronRight size={14} />
          </button>
        </div>
      </div>
    </div>
  );
}
