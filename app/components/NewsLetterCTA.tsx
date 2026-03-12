"use client";

import { useState } from "react";

export default function NewsletterCTA() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState<"idle" | "success" | "error">("idle");

  const handleSubscribe = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setStatus("idle");

    try {
      const response = await fetch("/api/feedback", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: "Newsletter",
          email: email,
          message: "Newsletter Subscription",
        }),
      });

      if (!response.ok) throw new Error("Failed");

      setStatus("success");
      setEmail("");
    } catch (error) {
      setStatus("error");
    }

    setLoading(false);
  };

  return (
    <section className="max-w-5xl mx-auto px-6 my-16 sm:my-24">
      <div className="bg-[#f8fafc] border border-gray-200 rounded-3xl p-6 sm:p-12 text-center">

        <h2 className="text-3xl font-semibold text-[#2f4a63]">
          Stay Updated With Legal Developments
        </h2>

        <p className="mt-4 text-gray-600">
          Get structured legal updates delivered weekly.
        </p>

        <form
          onSubmit={handleSubscribe}
          className="mt-8 flex flex-col sm:flex-row gap-4 justify-center"
        >
          <input
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Enter your email"
            className="px-5 py-3 rounded-xl border border-gray-300 w-full sm:w-80 
                       bg-white text-gray-800 placeholder-gray-400
                       focus:outline-none focus:border-[#2f4a63]"
          />

          <button
            type="submit"
            disabled={loading}
            className="px-6 py-3 rounded-xl bg-[#2f4a63] text-white font-medium hover:opacity-90 transition disabled:opacity-70"
          >
            {loading ? "Subscribing..." : "Subscribe"}
          </button>
        </form>

        {status === "success" && (
          <p className="text-green-600 text-sm mt-4">
            ✅ You’re subscribed successfully!
          </p>
        )}

        {status === "error" && (
          <p className="text-red-600 text-sm mt-4">
            ❌ Something went wrong. Please try again.
          </p>
        )}
      </div>
    </section>
  );
}
