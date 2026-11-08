"use client";

import { useEffect, useState } from "react";
import { useSearch } from "@/app/context/SearchContext";
import { auth } from "@/lib/firebase";
import { onAuthStateChanged, type User } from "firebase/auth";

import CategoryFilter from "./components/categories/CategoryFilter";
import NewsFeed from "./components/news/NewsFeed";
import NewsletterCTA from "./components/NewsLetterCTA";
import TrendingSidebar from "./components/TrendingSidebar";
import PersonalizationModal from "./components/auth/PersonalizationModal";
import MootCourtLeaderboard from "./components/MootCourtLeaderboard";
import LegalHomepage from "./components/home/LegalHomepage";
import type { NewsPreferences } from "./components/news/types";

import { useSearchParams } from "next/navigation";
import { Suspense } from "react";
import { Sparkles, Newspaper, BookOpen } from "lucide-react";

function HomeContent() {
  const { search, setSearch } = useSearch();
  const searchParams = useSearchParams();

  const [category, setCategory] = useState(() => searchParams.get("category") || "All");
  const [subCategory, setSubCategory] = useState<"All" | "General" | "Global">("All");
  const [user, setUser] = useState<User | null>(null);
  const [preferences, setPreferences] = useState<NewsPreferences | null>(null);
  const [isPersonalizing, setIsPersonalizing] = useState(false);

  useEffect(() => {
    const catParam = searchParams.get("category");
    const searchParam = searchParams.get("search");

    if (catParam && catParam !== category) {
      setCategory(catParam);
    }
    if (searchParam && searchParam !== search) {
      setSearch(searchParam);
    }
  }, [searchParams, setSearch, category, search]);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser: User | null) => {
      setUser(currentUser);
      if (currentUser) {
        fetchPreferences(currentUser.uid);
      } else {
        setPreferences(null);
      }
    });
    return () => unsubscribe();
  }, []);

  const fetchPreferences = async (uid: string) => {
    try {
      const res = await fetch(`/api/user-preferences?userId=${uid}`);
      const data = await res.json();
      if (data.preferences) {
        setPreferences(data.preferences);
      } else {
        // New user or no preferences set
        setIsPersonalizing(true);
      }
    } catch (err: unknown) {
      console.error("Failed to fetch preferences", err);
    }
  };

  return (
    <div className="max-w-[1440px] mx-auto px-4 pt-24 sm:pt-28 pb-12 min-h-screen bg-gray-50 dark:bg-slate-950 transition-colors">

      {/* ── RICH HOMEPAGE: LAW DEFINITION, HISTORY, BEST JUDGES, LAWYERS & SITE INTRO ── */}
      <LegalHomepage
        onExploreFeed={() => {
          const el = document.getElementById("live-feed-section");
          el?.scrollIntoView({ behavior: "smooth" });
        }}
      />

      {/* ── LIVE LEGAL FEED & ARCHIVES SECTION ── */}
      <div id="live-feed-section" className="scroll-mt-24 pt-6">

        {/* THREE-COLUMN LAYOUT: LEADERBOARD | NEWS | SIDEBAR */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">

          {/* LEFT: LEADERBOARD */}
          <aside className="lg:col-span-3 lg:sticky lg:top-28 self-start order-2 lg:order-1">
            <MootCourtLeaderboard />
          </aside>

          {/* CENTER: NEWS FEED & CATEGORY DROPDOWN */}
          <div className="lg:col-span-6 order-1 lg:order-2 space-y-6">
            {/* Category Dropdown Filter directly above feed */}
            <CategoryFilter
              category={category}
              setCategory={setCategory}
              subCategory={subCategory}
              setSubCategory={setSubCategory}
            />

            <NewsFeed
              category={category}
              subCategory={subCategory}
              search={search}
              preferences={preferences}
            />
          </div>

          {/* RIGHT: SIDEBAR */}
          <aside className="lg:col-span-3 order-3">
            <TrendingSidebar setSearch={setSearch} />
          </aside>

        </div>

      </div>

      {/* NEWSLETTER */}
      <div className="mt-20">
        <NewsletterCTA />
      </div>

      {/* PERSONALIZATION MODAL */}
      {user && (
        <PersonalizationModal
          isOpen={isPersonalizing}
          onClose={() => setIsPersonalizing(false)}
          userId={user.uid}
          onComplete={(prefs) => setPreferences(prefs)}
        />
      )}

    </div>
  );
}

export default function Home() {
  return (
    <Suspense
      fallback={
        <div className="flex items-center justify-center min-h-screen bg-gray-50 dark:bg-slate-950">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-600"></div>
        </div>
      }
    >
      <HomeContent />
    </Suspense>
  );
}
