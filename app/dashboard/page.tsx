"use client";

import { useEffect, useState } from "react";
import { auth } from "@/lib/firebase";
import { onAuthStateChanged } from "firebase/auth";
import { BookOpen, Scale, Flame, Activity, Bookmark as BookmarkIcon, History } from "lucide-react";
import Link from "next/link";
import NewsCard from "../components/news/NewsCard";

export default function DashboardPage() {
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [bookmarks, setBookmarks] = useState<any[]>([]);
  const [streak, setStreak] = useState(0);

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

  const savedCases = bookmarks.map((b) => b.legal_news).filter(Boolean);

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
              <h3 className="font-bold text-sm uppercase tracking-wider">AI Summaries</h3>
            </div>
            <p className="text-4xl font-black text-slate-900">{(savedCases.length * 1.5).toFixed(0)}</p>
            <p className="text-xs text-slate-500 mt-2 font-medium">Estimated generation count</p>
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
            <p className="text-2xl font-black text-slate-900 mt-1">Constitutional</p>
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
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {savedCases.slice(0, 3).map((post: any, i: number) => (
                <NewsCard key={i} item={post} index={i} />
              ))}
            </div>
          )}
        </div>

      </div>
    </div>
  );
}
