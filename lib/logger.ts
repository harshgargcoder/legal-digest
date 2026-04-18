import { auth } from "./firebase";

export const logActivity = async (action: string, details?: string) => {
  const user = auth.currentUser;
  if (!user) return;

  try {
    await fetch("/api/log-activity", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        userId: user.uid,
        action,
        details,
      }),
    });
  } catch (err) {
    console.error("Failed to log activity:", err);
  }
};
