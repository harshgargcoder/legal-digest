"use client";

import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { auth } from "@/lib/firebase";
import { onAuthStateChanged, type User } from "firebase/auth";
import { Bookmark } from "lucide-react";

function LoginRequiredModal({ onClose }: { onClose: () => void }) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);

    // Lock scroll without layout shift
    const scrollbarWidth =
      window.innerWidth - document.documentElement.clientWidth;
    document.body.style.overflow = "hidden";
    document.body.style.paddingRight = `${scrollbarWidth}px`;

    return () => {
      document.body.style.overflow = "";
      document.body.style.paddingRight = "";
    };
  }, []);

  if (!mounted) return null;

  return createPortal(
    <div
      onClick={onClose}
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 99999,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background: "rgba(0,0,0,0.6)",
        backdropFilter: "blur(6px)",
        WebkitBackdropFilter: "blur(6px)",
      }}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          background: "linear-gradient(135deg, #1a1a2e 60%, #16213e 100%)",
          border: "1px solid rgba(139,92,246,0.35)",
          borderRadius: 20,
          padding: "2rem",
          minWidth: 320,
          maxWidth: 380,
          width: "90vw",
          boxShadow:
            "0 8px 40px 0 rgba(139,92,246,0.25), 0 2px 16px 0 rgba(0,0,0,0.5)",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          gap: "1rem",
        }}
      >
        {/* Icon */}
        <div
          style={{
            width: 64,
            height: 64,
            borderRadius: "50%",
            background: "linear-gradient(135deg, #7c3aed, #a855f7)",
            boxShadow: "0 4px 20px 0 rgba(139,92,246,0.4)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            marginBottom: 4,
          }}
        >
          <svg
            width="32"
            height="32"
            viewBox="0 0 24 24"
            fill="none"
            stroke="white"
            strokeWidth="2.2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z" />
          </svg>
        </div>

        {/* Title */}
        <h2
          style={{
            color: "#e2d9f3",
            fontSize: "1.2rem",
            fontWeight: 700,
            margin: 0,
            textAlign: "center",
          }}
        >
          Login Required
        </h2>

        {/* Body */}
        <p
          style={{
            color: "#a89ec4",
            fontSize: "0.875rem",
            lineHeight: 1.6,
            textAlign: "center",
            margin: 0,
          }}
        >
          You need to be logged in to bookmark cases. Sign in to save and access
          your bookmarks anytime.
        </p>

        {/* Buttons */}
        <div style={{ display: "flex", gap: 12, width: "100%", marginTop: 8 }}>
          <button
            onClick={onClose}
            style={{
              flex: 1,
              borderRadius: 12,
              padding: "0.5rem",
              fontSize: "0.875rem",
              fontWeight: 500,
              background: "rgba(255,255,255,0.07)",
              color: "#c4b5e8",
              border: "1px solid rgba(139,92,246,0.2)",
              cursor: "pointer",
              transition: "background 0.2s",
            }}
            onMouseEnter={(e) =>
              (e.currentTarget.style.background = "rgba(255,255,255,0.13)")
            }
            onMouseLeave={(e) =>
              (e.currentTarget.style.background = "rgba(255,255,255,0.07)")
            }
          >
            Cancel
          </button>
          <button
            onClick={() => {
              window.location.hash = "login";
              onClose();
            }}
            style={{
              flex: 1,
              borderRadius: 12,
              padding: "0.5rem",
              fontSize: "0.875rem",
              fontWeight: 700,
              background: "linear-gradient(135deg, #7c3aed, #a855f7)",
              color: "#fff",
              boxShadow: "0 2px 12px 0 rgba(139,92,246,0.4)",
              border: "none",
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              transition: "background 0.2s",
            }}
            onMouseEnter={(e) =>
              (e.currentTarget.style.background =
                "linear-gradient(135deg, #6d28d9, #9333ea)")
            }
            onMouseLeave={(e) =>
              (e.currentTarget.style.background =
                "linear-gradient(135deg, #7c3aed, #a855f7)")
            }
          >
            Sign In
          </button>
        </div>
      </div>
    </div>,
    document.body
  );
}

export default function BookmarkButton({ postId }: { postId: string }) {
  const [user, setUser] = useState<User | null>(null);
  const [bookmarked, setBookmarked] = useState(false);
  const [showLoginModal, setShowLoginModal] = useState(false);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      setUser(currentUser);

      if (currentUser) {
        try {
          const res = await fetch("/api/bookmarks", {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
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
      setShowLoginModal(true);
      return;
    }

    try {
      if (bookmarked) {
        await fetch("/api/bookmarks", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ userId: user.uid, postId, action: "remove" }),
        });
        setBookmarked(false);
      } else {
        await fetch("/api/bookmarks", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ userId: user.uid, postId, action: "add" }),
        });
        setBookmarked(true);
      }
    } catch (error) {
      console.error("Error toggling bookmark", error);
    }
  };

  return (
    <>
      {showLoginModal && (
        <LoginRequiredModal onClose={() => setShowLoginModal(false)} />
      )}
      <button
        onClick={toggleBookmark}
        className="flex items-center justify-center p-1.5 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
        title={bookmarked ? "Remove Bookmark" : "Bookmark case"}
      >
        <Bookmark
          size={16}
          className={`transition-all duration-200 ${
            bookmarked
              ? "text-indigo-600 fill-indigo-600 dark:text-indigo-400 dark:fill-indigo-400 scale-110"
              : "text-slate-400 dark:text-slate-500 hover:text-slate-600 dark:hover:text-slate-350"
          }`}
        />
      </button>
    </>
  );
}
