"use client";

import { useEffect, useState } from "react";
import { auth } from "@/lib/firebase";
import { onAuthStateChanged } from "firebase/auth";
import NewsCard from "../components/news/NewsCard";
import { Save, Edit3, CheckCircle2 } from "lucide-react";

function BookmarkItem({ post, index }: { post: any, index: number }) {
  const [note, setNote] = useState(post.userNote || "");
  const [isEditing, setIsEditing] = useState(!post.userNote);
  const [isSaving, setIsSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  const handleSaveNote = async () => {
    setIsSaving(true);
    setSaved(false);
    try {
      const res = await fetch("/api/bookmarks", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId: auth.currentUser?.uid,
          postId: post.id,
          action: "note",
          note: note,
        }),
      });
      if (res.ok) {
        setIsEditing(false);
        setSaved(true);
        setTimeout(() => setSaved(false), 2000);
      }
    } catch (err) {
      console.error("Failed to save note", err);
    }
    setIsSaving(false);
  };

  return (
    <div className="bg-white/5 border border-white/10 rounded-3xl overflow-hidden shadow-xl backdrop-blur-md transition-all hover:border-indigo-500/30">
      {/* The Actual News Component */}
      <NewsCard item={post} index={index} />
      
      {/* The Note Editor Section */}
      <div className="border-t border-white/10 bg-[#0B1221] p-5 sm:p-6">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2 text-indigo-400 font-medium text-sm tracking-wide uppercase">
            <Edit3 size={16} />
            <h2>Private Research Note</h2>
          </div>
          {!isEditing && note && (
            <button 
              onClick={() => setIsEditing(true)}
              className="text-xs text-gray-400 hover:text-indigo-400 transition"
            >
              Edit Note
            </button>
          )}
        </div>

        {isEditing ? (
          <div className="space-y-3 animate-in fade-in slide-in-from-top-2 duration-200">
            <textarea
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder="Add your thoughts, references, or essay notes here..."
              className="w-full bg-black/40 border border-white/10 rounded-xl p-4 text-sm text-gray-200 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all outline-none resize-none shadow-inner"
              rows={3}
            />
            <div className="flex justify-end gap-3">
              {post.userNote && (
                 <button 
                   onClick={() => { setNote(post.userNote); setIsEditing(false); }}
                   className="px-4 py-2 text-xs font-medium text-gray-400 hover:text-white transition"
                 >
                   Cancel
                 </button>
              )}
              <button 
                onClick={handleSaveNote}
                disabled={isSaving}
                className="flex items-center gap-2 px-5 py-2 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-medium rounded-lg shadow-lg shadow-indigo-600/20 transition disabled:opacity-50"
              >
                {isSaving ? "Encrypting..." : <><Save size={14}/> Save to Vault</>}
              </button>
            </div>
          </div>
        ) : (
          <div className="bg-black/20 rounded-xl p-4 border border-white/5 animate-in fade-in duration-200">
            {note ? (
              <p className="text-sm text-gray-300 whitespace-pre-wrap leading-relaxed">{note}</p>
            ) : (
              <p className="text-sm text-gray-500 italic">No notes attached.</p>
            )}
          </div>
        )}
        
        {saved && (
          <div className="mt-3 flex items-center gap-2 text-emerald-400 text-xs font-medium animate-in fade-in slide-in-from-bottom-2">
            <CheckCircle2 size={14} /> Note synchronized securely.
          </div>
        )}
      </div>
    </div>
  );
}

export default function BookmarksPage() {
  const [posts, setPosts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (!user) {
        setLoading(false);
        return;
      }

      try {
        const res = await fetch(`/api/bookmarks?userId=${user.uid}`);
        const data = await res.json();
        
        if (data.error) {
          console.error(data.error);
          setLoading(false);
          return;
        }

        const seenIds = new Set();
        const newsPosts =
          data.bookmarks?.map((item: any) => ({
            ...item.legal_news,
            userNote: item.note,
          })).filter((post: any) => {
             if (post.id && !seenIds.has(post.id)) {
               seenIds.add(post.id);
               return true;
             }
             return false;
          }) || [];

        setPosts(newsPosts);
      } catch (error) {
        console.error("Error fetching bookmarks", error);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-[#030712] pt-32 pb-16 px-6">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-3xl font-bold mb-2 text-white/90">
            Intelligence Vault
          </h1>
          <p className="text-sm text-gray-500 mb-8">
            Encrypting and decoding user credentials...
          </p>
          <div className="flex flex-col gap-8">
            {[1, 2, 3].map((item) => (
              <div
                key={item}
                className="animate-pulse bg-white/5 border border-white/10 h-64 rounded-3xl"
              ></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#030712] pt-32 pb-16 px-4 sm:px-6">
      <div className="max-w-4xl mx-auto">
        
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-indigo-400 to-purple-400">
              Intelligence Vault
            </h1>
            <p className="text-gray-400 mt-2 text-sm">Review your saved legal intelligence and manage private research notes.</p>
          </div>
        </div>

        {posts.length === 0 ? (
          <div className="bg-white/5 border border-white/10 rounded-3xl text-center py-24">
            <div className="text-5xl mb-6 opacity-80">🔖</div>

            <h2 className="text-xl font-semibold text-white/90 mb-3">
              Vault is Empty
            </h2>

            <p className="text-gray-500 max-w-md mx-auto mb-6">
              Start saving important legal updates and judgments to
              access them quickly anytime.
            </p>

            <a
              href="/"
              className="inline-block bg-indigo-600/20 text-indigo-400 border border-indigo-500/30 px-6 py-3 rounded-xl text-sm font-medium hover:bg-indigo-600/30 transition"
            >
              Explore Latest Updates
            </a>
          </div>
        ) : (
          <div className="flex flex-col gap-10">
            {posts.map((post, index) => (
              <BookmarkItem key={post.id} post={post} index={index} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
