"use client";

import { useState } from "react";

export default function FeedbackPage() {
  const [message, setMessage] = useState("");

  return (
    <div className="bg-white min-h-screen">

      <section className="max-w-3xl mx-auto px-6 pt-24 pb-16 text-center">
        <h1 className="text-4xl md:text-5xl font-semibold text-[#2f4a63]">
          Feedback
        </h1>

        <p className="mt-6 text-lg text-gray-600">
          Your suggestions help us improve Legal Digest.
          Share your thoughts below.
        </p>
      </section>

      <div className="h-[1px] bg-gray-200 max-w-3xl mx-auto"></div>

      <section className="max-w-3xl mx-auto px-6 py-20">
        <form className="space-y-8">

          <div>
            <label className="block text-sm font-medium text-[#2f4a63] mb-2">
              Your Name
            </label>
            <input
              type="text"
              className="w-full border border-gray-300 rounded-xl px-4 py-3 focus:outline-none focus:border-[#2f4a63] transition"
              placeholder="Enter your name"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-[#2f4a63] mb-2">
              Email Address
            </label>
            <input
              type="email"
              className="w-full border border-gray-300 rounded-xl px-4 py-3 focus:outline-none focus:border-[#2f4a63] transition"
              placeholder="Enter your email"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-[#2f4a63] mb-2">
              Message
            </label>
            <textarea
              rows={5}
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              className="w-full border border-gray-300 rounded-xl px-4 py-3 focus:outline-none focus:border-[#2f4a63] transition resize-none"
              placeholder="Write your feedback..."
            />
          </div>

          <button
            type="submit"
            className="w-full bg-[#2f4a63] text-white py-3 rounded-xl font-medium hover:opacity-90 transition"
          >
            Submit Feedback
          </button>

        </form>
      </section>
    </div>
  );
}
