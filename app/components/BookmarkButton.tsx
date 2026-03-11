"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { auth } from "@/lib/firebase";
import { onAuthStateChanged } from "firebase/auth";

export default function BookmarkButton({ postId }: { postId: string }) {
  const [user, setUser] = useState<any>(null);
  const [bookmarked, setBookmarked] = useState(false);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      setUser(currentUser);

      if (currentUser) {
        try {
          const res = await fetch("/api/bookmarks", {
            method: "PUT",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({ userId: currentUser.uid, postId }),
          });
          const data = await res.json();
          setBookmarked(data.isBookmarked);
        } catch (error) {
          console.error("Error checking bookmark status", error);
        }
      } else {
        setBookmarked(false);
      }
    });

    return () => unsubscribe();
  }, [postId]);

  const toggleBookmark = async () => {
    if (!user) {
      alert("Login required");
      return;
    }

    try {
        if (bookmarked) {
          // DELETE
          await fetch("/api/bookmarks", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({ userId: user.uid, postId, action: "remove" }),
          });
    
          setBookmarked(false);
        } else {
          // INSERT
          await fetch("/api/bookmarks", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({ userId: user.uid, postId, action: "add" }),
          });
    
          setBookmarked(true);
        }
    } catch (error) {
        console.error("Error toggling bookmark", error);
    }
  };

  return (
    <button
      onClick={toggleBookmark}
      className="flex items-center gap-2 text-sm transition"
    >
      {bookmarked ? (
        <span className="text-red-500 cursor-pointer">❤️</span>
      ) : (
        <span className="text-gray-400 cursor-pointer">🤍</span>
      )}
    </button>
  );
}
