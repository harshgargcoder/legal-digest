"use client";

import React, { createContext, useContext, useEffect, useState, useCallback } from "react";
import { auth } from "@/lib/firebase";
import { onAuthStateChanged, User } from "firebase/auth";

interface Notification {
  id: string;
  title: string;
  published_at: string;
  url: string;
  source: string;
}

interface Preferences {
  categories?: string[];
  topics?: string[];
  last_notified_at?: string;
}

interface NotificationContextType {
  notifications: Notification[];
  unreadCount: number;
  loading: boolean;
  markAllAsRead: () => void;
  refreshNotifications: () => Promise<void>;
  notificationsEnabled: boolean;
  toggleNotifications: () => Promise<void>;
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

export function NotificationProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [preferences, setPreferences] = useState<Preferences | null>(null);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(false);
  const [notificationsEnabled, setNotificationsEnabled] = useState(false);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      setUser(currentUser);
      if (currentUser) {
        try {
          const token = await currentUser.getIdToken();
          await fetch("/api/session/track", {
            method: "POST",
            headers: {
              Authorization: `Bearer ${token}`,
            },
          });
        } catch (err) {
          console.error("Failed to track user session IP", err);
        }
      }
    });
    setNotificationsEnabled(localStorage.getItem("notifications") === "true");
    return () => unsubscribe();
  }, []);

  const fetchPreferences = useCallback(async () => {
    if (!user) return;
    try {
      const res = await fetch(`/api/user-preferences?userId=${user.uid}`);
      const data = await res.json();
      if (data.preferences) {
        setPreferences(data.preferences);
      }
    } catch (err) {
      console.error("Failed to fetch preferences", err);
    }
  }, [user]);

  useEffect(() => {
    fetchPreferences();
  }, [fetchPreferences]);

  const refreshNotifications = useCallback(async () => {
    if (!user || !preferences) return;
    
    setLoading(true);
    try {
      const { categories, topics, last_notified_at } = preferences;
      
      let url = `/api/get-news?limit=10`;
      if (categories && categories.length > 0) url += `&categories=${categories.join(",")}`;
      if (topics && topics.length > 0) url += `&topics=${topics.join(",")}`;

      const res = await fetch(url);
      const data = await res.json();

      if (data.success && data.articles) {
        setNotifications(data.articles);
        
        // Count how many are newer than last_notified_at
        const lastCheck = last_notified_at ? new Date(last_notified_at).getTime() : 0;
        const newCount = data.articles.filter((a: Notification) => new Date(a.published_at).getTime() > lastCheck).length;
        setUnreadCount(newCount);

        // Check for browser notification
        const newArticles = data.articles.filter((article: Notification) => {
          const publishedAt = new Date(article.published_at).getTime();
          return publishedAt > lastCheck;
        });

        if (newArticles.length > 0 && notificationsEnabled && Notification.permission === "granted") {
          const latest = newArticles[0];
          new Notification("New Legal Update for You", {
            body: latest.title,
            icon: "/new_logo.png",
          });
        }
      }
    } catch (err) {
      console.error("Notification check failed", err);
    } finally {
      setLoading(false);
    }
  }, [user, preferences, notificationsEnabled]);

  useEffect(() => {
    if (user && preferences) {
      refreshNotifications();
      const interval = setInterval(refreshNotifications, 5 * 60 * 1000);
      return () => clearInterval(interval);
    }
  }, [user, preferences, refreshNotifications]);

  const markAllAsRead = async () => {
    if (!user || notifications.length === 0) return;
    
    const latestTimestamp = notifications[0].published_at;
    
    try {
      await fetch("/api/user-preferences", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId: user.uid,
          last_notified_at: latestTimestamp
        })
      });

      setUnreadCount(0);
      setPreferences((prev) => ({ ...(prev ?? {}), last_notified_at: latestTimestamp }));
    } catch (err) {
      console.error("Failed to mark notifications as read", err);
    }
  };

  const toggleNotifications = async () => {
    if (!notificationsEnabled) {
      if (typeof window !== "undefined" && "Notification" in window) {
        const permission = await Notification.requestPermission();
        if (permission === "granted") {
          setNotificationsEnabled(true);
          localStorage.setItem("notifications", "true");
        }
      }
    } else {
      setNotificationsEnabled(false);
      localStorage.setItem("notifications", "false");
    }
  };

  return (
    <NotificationContext.Provider value={{ 
      notifications, 
      unreadCount, 
      loading, 
      markAllAsRead, 
      refreshNotifications,
      notificationsEnabled,
      toggleNotifications
    }}>
      {children}
    </NotificationContext.Provider>
  );
}

export function useNotifications() {
  const context = useContext(NotificationContext);
  if (context === undefined) {
    throw new Error("useNotifications must be used within a NotificationProvider");
  }
  return context;
}
