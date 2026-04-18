"use client";

import { useEffect, useState, useCallback } from "react";
import { auth } from "@/lib/firebase";
import { onAuthStateChanged, User } from "firebase/auth";

export function useAuth() {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      setUser(currentUser);
      if (currentUser) {
        const idToken = await currentUser.getIdToken();
        setToken(idToken);
      } else {
        setToken(null);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const apiFetch = useCallback(
    async (url: string, options: RequestInit = {}, customToken?: string) => {
      const activeToken = customToken || token || (await auth.currentUser?.getIdToken());
      
      const headers = {
        ...options.headers,
        ...(activeToken ? { Authorization: `Bearer ${activeToken}` } : {}),
        "Content-Type": "application/json",
      };

      return fetch(url, {
        ...options,
        headers,
      });
    },
    [token]
  );

  return {
    user,
    token,
    loading,
    apiFetch,
  };
}
