"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";

export default function BookmarkButton({ postId }: { postId: string }) {
  const [user, setUser] = useState<any>(null);
  const [bookmarked, setBookmarked] = useState(false);

  useEffect(() => {
    const checkUser = async () => {
      const { data } = await supabase.auth.getUser();
      setUser(data.user);

      if (data.user) {
        const { data: existing } = await supabase
          .from("bookmarks")
          .select("id")
          .eq("post_id", postId)
          .eq("user_id", data.user.id)
          .single();

        if (existing) setBookmarked(true);
      }
    };

    checkUser();
  }, [postId]);

  const toggleBookmark = async () => {
    if (!user) {
      alert("Login required");
      return;
    }

    if (bookmarked) {
      // DELETE
      await supabase
        .from("bookmarks")
        .delete()
        .eq("post_id", postId)
        .eq("user_id", user.id);

      setBookmarked(false);
    } else {
      // INSERT
      await supabase.from("bookmarks").insert([
        {
          user_id: user.id,
          post_id: postId,
        },
      ]);

      setBookmarked(true);
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
