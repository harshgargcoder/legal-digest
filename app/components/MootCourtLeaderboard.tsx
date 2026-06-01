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
    <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-850 rounded-lg shadow-sm overflow-hidden flex flex-col">
      {/* Header */}
      <div className="p-4 border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/40">
        <div className="flex items-center gap-2 mb-3">
          <Trophy size={16} className="text-slate-700 dark:text-slate-300 animate-bounce" />
          <div>
            <h3 className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider">Leaderboard</h3>
            <p className="text-[9px] font-medium text-slate-500 uppercase tracking-wider">Global Standings</p>
          </div>
        </div>
        <div className="flex items-center justify-between bg-white dark:bg-slate-800 px-3 py-2 rounded border border-slate-200 dark:border-slate-700">
          <div className="text-[9px] font-bold text-slate-400 uppercase tracking-wider">Top Rank</div>
          <div className="flex items-center gap-1.5">
            <Award size={13} className="text-amber-500" />
            <span className="text-xs font-semibold text-slate-900 dark:text-white">
              {entries.length > 0 ? entries[0].user_name : "N/A"}
            </span>
          </div>
        </div>
      </div>

      {/* List Container */}
      <div className="flex-1 overflow-y-auto p-3 space-y-1.5 custom-scrollbar max-h-[600px]">
        {loading ? (
          <div className="py-12 text-center space-y-3">
            <Scale size={24} className="mx-auto text-slate-300 animate-pulse" />
            <p className="text-xs font-bold text-slate-400 animate-pulse">Syncing Rankings...</p>
          </div>
        ) : paginatedEntries.length > 0 ? (
          paginatedEntries.map((entry, idx) => {
            const rank = (page - 1) * limit + idx + 1;
            return (
              <div
                key={`${entry.user_id}-${idx}`}
                className="relative p-2.5 rounded border border-slate-100 dark:border-slate-800/40 bg-slate-50 dark:bg-slate-800/20 flex items-center justify-between gap-3 transition-colors hover:bg-white dark:hover:bg-slate-800/50"
              >
                <div className="flex items-center gap-2.5">
                  {/* Rank Badge */}
                  <div className={`h-6 w-6 rounded flex items-center justify-center text-[10px] font-bold ${
                    rank === 1 ? "bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-300" :
                    rank === 2 ? "bg-slate-200 text-slate-805 dark:bg-slate-750 dark:text-slate-300" :
                    rank === 3 ? "bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-300" :
                    "bg-white dark:bg-slate-800 text-slate-400 dark:text-slate-500 border border-slate-200 dark:border-slate-700"
                  }`}>
                    {rank}
                  </div>

                  {/* Info */}
                  <div>
                    <div className="text-xs font-semibold text-slate-800 dark:text-slate-200 truncate max-w-[120px]">
                      {entry.user_name}
                    </div>
                    <div className="text-[8px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                      {entry.case_type}
                    </div>
                  </div>
                </div>

                {/* Score */}
                <div className="text-right">
                  <div className="text-xs font-bold text-slate-900 dark:text-white">{entry.score}</div>
                  <div className="text-[7px] font-semibold text-slate-450 uppercase tracking-widest">Points</div>
                </div>
              </div>
            );
          })
        ) : (
          <div className="py-10 text-center px-4">
            <div className="h-10 w-10 bg-slate-50 dark:bg-slate-800 rounded-full flex items-center justify-center mx-auto mb-3 border border-slate-100 dark:border-slate-750">
              <Scale size={16} className="text-slate-300" />
            </div>
            <p className="text-[10px] font-medium text-slate-455 leading-relaxed italic">
              The courtroom is empty. Start a session to claim your rank!
            </p>
          </div>
        )}
      </div>

      {/* Footer / Pagination */}
      <div className="p-3 border-t border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/40 flex items-center justify-between">
        <div className="text-[8px] font-bold text-slate-450 uppercase tracking-widest">
          Pg {page} of {totalPages}
        </div>
        <div className="flex gap-1.5">
          <button
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            disabled={page === 1}
            className="h-7 w-7 rounded border border-slate-200 dark:border-slate-700 flex items-center justify-center text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white disabled:opacity-30 transition-all bg-white dark:bg-slate-800 shadow-sm"
          >
            <ChevronLeft size={12} />
          </button>
          <button
            onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
            disabled={page === totalPages}
            className="h-7 w-7 rounded border border-slate-200 dark:border-slate-700 flex items-center justify-center text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white disabled:opacity-30 transition-all bg-white dark:bg-slate-800 shadow-sm"
          >
            <ChevronRight size={12} />
          </button>
        </div>
      </div>
    </div>
  );
}
