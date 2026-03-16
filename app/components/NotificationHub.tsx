"use client";

import { useEffect, useState } from "react";
import { auth } from "@/lib/firebase";
import { onAuthStateChanged } from "firebase/auth";

export default function NotificationHub() {
  const [user, setUser] = useState<any>(null);
  const [preferences, setPreferences] = useState<any>(null);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
    });
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    if (!user) return;

    const fetchPreferences = async () => {
      try {
        const res = await fetch(`/api/user-preferences?userId=${user.uid}`);
        const data = await res.json();
        if (data.preferences) {
          setPreferences(data.preferences);
        }
      } catch (err) {
        console.error("Failed to fetch preferences for notifications", err);
      }
    };

    fetchPreferences();
  }, [user]);

  useEffect(() => {
    if (!user || !preferences) return;

    // Only run if notifications are supported and enabled in localStorage
    const notificationsEnabled = localStorage.getItem("notifications") === "true";
    if (!notificationsEnabled || !("Notification" in window) || Notification.permission !== "granted") {
      return;
    }

    const checkNotifications = async () => {
      try {
        const { categories, topics, last_notified_at } = preferences;
        
        // Build the query
        let url = `/api/get-news?limit=5`;
        if (categories && categories.length > 0) url += `&categories=${categories.join(",")}`;
        if (topics && topics.length > 0) url += `&topics=${topics.join(",")}`;

        const res = await fetch(url);
        const data = await res.json();

        if (data.success && data.articles) {
          const newArticles = data.articles.filter((article: any) => {
            const publishedAt = new Date(article.published_at).getTime();
            const lastCheck = last_notified_at ? new Date(last_notified_at).getTime() : 0;
            return publishedAt > lastCheck;
          });

          if (newArticles.length > 0) {
            // Show notification for the most recent one
            const latest = newArticles[0];
            new Notification("New Legal Update for You", {
              body: latest.title,
              icon: "/new_logo.png",
            });

            // Update last_notified_at in DB
            await fetch("/api/user-preferences", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                userId: user.uid,
                last_notified_at: new Date(newArticles[0].published_at).toISOString()
              })
            });

            // Refresh local state to avoid repeat alerts in the same session
            setPreferences((prev: any) => ({
                ...prev,
                last_notified_at: newArticles[0].published_at
            }));
          }
        }
      } catch (err) {
        console.error("Notification check failed", err);
      }
    };

    // Check every 5 minutes
    const interval = setInterval(checkNotifications, 5 * 60 * 1000);
    
    // Also run immediately on mount
    checkNotifications();

    return () => clearInterval(interval);
  }, [user, preferences]);

  return null; // Side-effect only component
}
