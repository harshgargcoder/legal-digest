"use client";


import { useEffect, useState } from "react";
import { useSearch } from "@/app/context/SearchContext";
import { auth } from "@/lib/firebase";
import { onAuthStateChanged } from "firebase/auth";

import CategoryFilter from "./components/categories/CategoryFilter";
import NewsFeed from "./components/news/NewsFeed";
import NewsletterCTA from "./components/NewsLetterCTA";
import TrendingSidebar from "./components/TrendingSidebar";
import PersonalizationModal from "./components/auth/PersonalizationModal";

import { useSearchParams } from "next/navigation";
import { Suspense } from "react";

function HomeContent() {
  const { search, setSearch } = useSearch();
  const searchParams = useSearchParams();

  const [category, setCategory] = useState(() => searchParams.get("category") || "All");
  const [user, setUser] = useState<any>(null);
  const [preferences, setPreferences] = useState<any>(null);
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
  }, [searchParams, setSearch]);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
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
    } catch (err) {
      console.error("Failed to fetch preferences", err);
    }
  };

  return (
    <div className="max-w-6xl mx-auto px-4 pt-32 pb-8 min-h-screen bg-gray-50">

      {/* CATEGORY FILTER */}
      <CategoryFilter
        category={category}
        setCategory={setCategory}
      />

      {/* NEWS + SIDEBAR */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-10 mt-10">

        <div className="lg:col-span-2">
          <NewsFeed category={category} search={search} preferences={preferences} />
        </div>

        <aside className="hidden lg:block">
          <TrendingSidebar setSearch={setSearch} />
        </aside>

      </div>

      {/* NEWSLETTER */}
      <div className="mt-16">
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
    <Suspense fallback={
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-600"></div>
      </div>
    }>
      <HomeContent />
    </Suspense>
  );
}