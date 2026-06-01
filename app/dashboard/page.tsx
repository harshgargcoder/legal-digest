"use client";

import { useEffect, useState } from "react";
import { auth } from "@/lib/firebase";
import { onAuthStateChanged, type User as FirebaseUser } from "firebase/auth";
import { BookOpen, Scale, Flame, Activity, Bookmark as BookmarkIcon, History, CheckCircle2 } from "lucide-react";
import Link from "next/link";
import NewsCard from "../components/news/NewsCard";
import type { NewsArticle } from "@/app/components/news/types";
import type { EvaluationResult } from "@/app/toolkit/moot-court/types";

interface BookmarkRecord {
  legal_news: Record<string, unknown> | null;
}

interface MootSessionRecord {
  id: string;
  case_type: string;
  created_at: string;
  evaluation: EvaluationResult | null;
}

function isNewsArticle(value: unknown): value is NewsArticle {
  return Boolean(
    value &&
    typeof value === "object" &&
    "id" in value &&
    "title" in value &&
    "url" in value &&
    "published_at" in value,
  );
}

export default function DashboardPage() {
  const [user, setUser] = useState<FirebaseUser | null>(null);
  const [loading, setLoading] = useState(true);
  const [bookmarks, setBookmarks] = useState<BookmarkRecord[]>([]);
  const [streak, setStreak] = useState(0);
  const [mootSessions, setMootSessions] = useState<MootSessionRecord[]>([]);

  // Pagination states
  const [researchPage, setResearchPage] = useState(1);
  const [mootPage, setMootPage] = useState(1);
  const pageSize = 10;

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      setUser(currentUser);
      if (currentUser) {
        try {
          const [bookmarksRes, usageRes] = await Promise.all([
            fetch(`/api/bookmarks?userId=${currentUser.uid}`),
            fetch(`/api/usage?userId=${currentUser.uid}`)
          ]);

          const bookmarksData = await bookmarksRes.json();
          const usageData = await usageRes.json();

          if (!bookmarksData.error) {
            setBookmarks(bookmarksData.bookmarks || []);
          }
          if (!usageData.error) {
            setStreak(usageData.streak || 0);
          }

          // Fetch Moot Court Sessions
          const mootRes = await fetch(`/api/moot-court/sessions?userId=${currentUser.uid}&limit=100`);
          const mootData = await mootRes.json();
          if (!mootData.error) setMootSessions(mootData.sessions || []);
        } catch (error) {
          console.error("Error fetching dashboard data", error);
        }
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 p-8 flex justify-center items-center">
        <div className="w-10 h-10 border-4 border-indigo-500/30 border-t-indigo-500 rounded-full animate-spin"></div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-6 text-center">
        <Scale size={48} className="text-slate-400 mb-6" />
        <h1 className="text-2xl font-bold text-slate-900 mb-2">Access Denied</h1>
        <p className="text-slate-600 max-w-sm mb-8 font-medium">You must be logged into the Legal Intelligence Terminal to view your dashboard.</p>
        <Link href="/" className="px-8 py-3 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 transition font-bold shadow-lg shadow-indigo-600/20 active:scale-95">
          Return Home
        </Link>
      </div>
    );
  }

  const savedCases = bookmarks
    .map((b): NewsArticle | null => (isNewsArticle(b.legal_news) ? b.legal_news : null))
    .filter((item): item is NewsArticle => item !== null);

  // Dynamically calculate the user's top bookmark category
  const getTopCategory = () => {
    if (savedCases.length === 0) return "N/A";
    const counts: Record<string, number> = {};
    savedCases.forEach((item) => {
      const cat = item.category || "General";
      counts[cat] = (counts[cat] || 0) + 1;
    });
    let topCat = "N/A";
    let maxCount = 0;
    Object.entries(counts).forEach(([cat, count]) => {
      if (count > maxCount) {
        maxCount = count;
        topCat = cat;
      }
    });
    return topCat;
  };

  // Count bookmarked cases that actually have AI summaries generated
  const briefCount = savedCases.filter((item) => item.ai_summary && item.ai_summary.trim() !== "").length;

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 pt-32 pb-8 px-4 sm:px-8">
      <div className="max-w-7xl mx-auto space-y-8">

        {/* Header Phase */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div>
            <h1 className="text-3xl font-black text-slate-900 tracking-tight">
              Researcher Dashboard
            </h1>
            <p className="text-slate-600 mt-1 font-medium">Welcome back. Here is your legal reading telemetry.</p>
          </div>
          <div className="flex items-center gap-3 bg-white border border-gray-200 px-4 py-2 rounded-xl shadow-sm">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
            <span className="text-sm font-bold text-slate-700">Terminal Active</span>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">

          <div className="bg-white border border-gray-100 rounded-2xl p-6 relative overflow-hidden group shadow-sm hover:shadow-md transition-shadow">
            <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:scale-110 transition-transform duration-500">
              <BookmarkIcon size={64} />
            </div>
            <div className="flex items-center gap-3 text-indigo-600 mb-2">
              <BookmarkIcon size={20} />
              <h3 className="font-bold text-sm uppercase tracking-wider">Saved Cases</h3>
            </div>
            <p className="text-4xl font-black text-slate-900">{savedCases.length}</p>
          </div>

          <div className="bg-white border border-gray-100 rounded-2xl p-6 relative overflow-hidden group shadow-sm hover:shadow-md transition-shadow">
            <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:scale-110 transition-transform duration-500">
              <Activity size={64} />
            </div>
            <div className="flex items-center gap-3 text-emerald-600 mb-2">
              <Activity size={20} />
              <h3 className="font-bold text-sm uppercase tracking-wider">AI Briefs</h3>
            </div>
            <p className="text-4xl font-black text-slate-900">{briefCount}</p>
            <p className="text-xs text-slate-500 mt-2 font-medium">Generated case briefs count</p>
          </div>

          <div className="bg-white border border-gray-100 rounded-2xl p-6 relative overflow-hidden group shadow-sm hover:shadow-md transition-shadow">
            <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:scale-110 transition-transform duration-500">
              <Flame size={64} />
            </div>
            <div className="flex items-center gap-3 text-orange-500 mb-2">
              <Flame size={20} />
              <h3 className="font-bold text-sm uppercase tracking-wider">Reading Streak</h3>
            </div>
            <p className="text-4xl font-black text-slate-900">{streak} <span className="text-lg text-slate-400">Days</span></p>
          </div>

          <div className="bg-white border border-gray-100 rounded-2xl p-6 relative overflow-hidden group shadow-sm hover:shadow-md transition-shadow">
            <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:scale-110 transition-transform duration-500">
              <BookOpen size={64} />
            </div>
            <div className="flex items-center gap-3 text-blue-600 mb-2">
              <BookOpen size={20} />
              <h3 className="font-bold text-sm uppercase tracking-wider">Top Category</h3>
            </div>
            <p className="text-2xl font-black text-slate-900 mt-1">{getTopCategory()}</p>
          </div>

        </div>

        {/* Recent Cases Timeline */}
        <div className="mt-12">
          <div className="flex items-center gap-3 mb-6">
            <History size={24} className="text-indigo-600" />
            <h2 className="text-xl font-bold text-slate-900 tracking-tight">Your Recent Research</h2>
          </div>

          {savedCases.length === 0 ? (
            <div className="bg-white border border-gray-200 rounded-3xl p-12 text-center shadow-sm">
              <div className="text-slate-300 mb-4 flex justify-center"><BookOpen size={48} /></div>
              <h3 className="text-lg font-bold text-slate-900 mb-2">No Research Data Found</h3>
              <p className="text-slate-600 font-medium">Begin bookmarking cases across the platform to populate your terminal.</p>
              <Link href="/" className="inline-block mt-8 px-8 py-3 bg-indigo-600 text-white hover:bg-indigo-700 rounded-xl transition font-bold shadow-lg shadow-indigo-600/20 active:scale-95">
                Explore Database
              </Link>
            </div>
          ) : (
            <div className="space-y-8">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {savedCases.slice((researchPage - 1) * pageSize, researchPage * pageSize).map((post, i: number) => (
                  <NewsCard key={i} item={post} index={i} />
                ))}
              </div>

              {savedCases.length > pageSize && (
                <div className="flex justify-center gap-2 mt-8">
                  <button
                    onClick={() => setResearchPage(p => Math.max(1, p - 1))}
                    disabled={researchPage === 1}
                    className="px-4 py-2 rounded-xl border border-slate-200 bg-white text-sm font-bold text-slate-600 disabled:opacity-50 transition-all hover:border-indigo-200"
                  >
                    Previous
                  </button>
                  <span className="flex items-center px-4 text-sm font-bold text-slate-400">
                    Page {researchPage} of {Math.ceil(savedCases.length / pageSize)}
                  </span>
                  <button
                    onClick={() => setResearchPage(p => Math.min(Math.ceil(savedCases.length / pageSize), p + 1))}
                    disabled={researchPage === Math.ceil(savedCases.length / pageSize)}
                    className="px-4 py-2 rounded-xl border border-slate-200 bg-white text-sm font-bold text-slate-600 disabled:opacity-50 transition-all hover:border-indigo-200"
                  >
                    Next
                  </button>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Moot Court Performance */}
        <div className="mt-16 pb-12">
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-indigo-600 rounded-xl text-white shadow-lg shadow-indigo-600/20">
                <Scale size={24} />
              </div>
              <h2 className="text-2xl font-black text-slate-900 tracking-tight">Courtroom Performance</h2>
            </div>
            <Link href="/toolkit/moot-court" className="text-sm font-bold text-indigo-600 hover:text-indigo-700 uppercase tracking-widest flex items-center gap-2">
              Start New Trial
              <CheckCircle2 size={16} />
            </Link>
          </div>

          {mootSessions.length === 0 ? (
            <div className="bg-white border border-slate-200 rounded-[2.5rem] p-12 text-center shadow-sm">
              <Scale size={48} className="mx-auto text-slate-200 mb-4" />
              <h3 className="text-lg font-bold text-slate-900 mb-2">No Courtroom Data</h3>
              <p className="text-slate-500 font-medium">Your advocacy scores will appear here after your first Moot Court session.</p>
            </div>
          ) : (
            <div className="space-y-8">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {mootSessions.slice((mootPage - 1) * pageSize, mootPage * pageSize).map((session) => {
                  const evalData = session.evaluation;
                  const score = evalData ? Math.round(
                    ((evalData.legalReasoning || 0) +
                      (evalData.objectionAccuracy || 0) +
                      (evalData.examinationQuality || 0) +
                      (evalData.proceduralCompliance || 0)) / 4
                  ) : 0;

                  return (
                    <div key={session.id} className="bg-white border border-slate-100 rounded-[2.5rem] p-8 shadow-sm hover:shadow-xl transition-all group">
                      <div className="flex items-start justify-between mb-6">
                        <div>
                          <span className="px-3 py-1 bg-indigo-50 text-indigo-600 text-[10px] font-black uppercase tracking-widest rounded-full border border-indigo-100">
                            {session.case_type}
                          </span>
                          <h4 className="mt-3 text-lg font-black text-slate-900">Moot Court Record</h4>
                          <p className="text-xs font-bold text-slate-400 mt-1 uppercase tracking-tighter">
                            {new Date(session.created_at).toLocaleDateString(undefined, { dateStyle: 'long' })}
                          </p>
                        </div>
                        <div className="text-right">
                          <div className="text-3xl font-black text-indigo-600">{score}%</div>
                          <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Advocacy Rank</div>
                        </div>
                      </div>

                      {evalData ? (
                        <div className="space-y-4">
                          <div className="grid grid-cols-2 gap-4">
                            <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100">
                              <div className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">Legal Reasoning</div>
                              <div className="text-sm font-black text-slate-800">{evalData.legalReasoning}%</div>
                            </div>
                            <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100">
                              <div className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">Objections</div>
                              <div className="text-sm font-black text-slate-800">{evalData.objectionAccuracy}%</div>
                            </div>
                          </div>
                          <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden">
                            <div
                              className="h-full bg-indigo-600 rounded-full transition-all duration-1000 group-hover:bg-indigo-500"
                              style={{ width: `${score}%` }}
                            />
                          </div>
                        </div>
                      ) : (
                        <div className="flex items-center gap-2 p-4 bg-amber-50 rounded-2xl border border-amber-100">
                          <Activity size={16} className="text-amber-600" />
                          <span className="text-xs font-bold text-amber-700">Evaluation Pending</span>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>

              {mootSessions.length > pageSize && (
                <div className="flex justify-center gap-2 mt-8">
                  <button
                    onClick={() => setMootPage(p => Math.max(1, p - 1))}
                    disabled={mootPage === 1}
                    className="px-4 py-2 rounded-xl border border-slate-200 bg-white text-sm font-bold text-slate-600 disabled:opacity-50 transition-all hover:border-indigo-200"
                  >
                    Previous
                  </button>
                  <span className="flex items-center px-4 text-sm font-bold text-slate-400">
                    Page {mootPage} of {Math.ceil(mootSessions.length / pageSize)}
                  </span>
                  <button
                    onClick={() => setMootPage(p => Math.min(Math.ceil(mootSessions.length / pageSize), p + 1))}
                    disabled={mootPage === Math.ceil(mootSessions.length / pageSize)}
                    className="px-4 py-2 rounded-xl border border-slate-200 bg-white text-sm font-bold text-slate-600 disabled:opacity-50 transition-all hover:border-indigo-200"
                  >
                    Next
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
