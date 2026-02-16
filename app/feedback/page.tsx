"use client";

import { useState } from "react";

interface FormData {
  name: string;
  email: string;
  message: string;
}

export default function FeedbackPage() {
  const [formData, setFormData] = useState<FormData>({
    name: "",
    email: "",
    message: "",
  });

  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState<
    "idle" | "success" | "error"
  >("idle");

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  const handleSubmit = async (
    e: React.FormEvent<HTMLFormElement>
  ) => {
    e.preventDefault();
    setLoading(true);
    setStatus("idle");

    try {
      const response = await fetch("/api/feedback", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        throw new Error("Failed");
      }

      setStatus("success");
      setFormData({
        name: "",
        email: "",
        message: "",
      });
    } catch (error) {
      setStatus("error");
    }

    setLoading(false);
  };

  return (
    <div className="bg-white min-h-screen">
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-blue-50 via-white to-white"></div>

        <div className="relative z-10 max-w-3xl mx-auto px-6 pt-10 pb-5 text-center">
          <h1 className="text-4xl md:text-5xl font-semibold text-[#2f4a63]">
            Feedback
          </h1>

          <p className="mt-3 text-lg text-gray-600 max-w-xl mx-auto">
            Your suggestions help us improve Legal Digest.
          </p>
        </div>
      </section>

      <section className="max-w-3xl mx-auto px-6 py-10">
        <div className="bg-gray-50 p-10 rounded-3xl shadow-sm border border-gray-100">
          <form className="space-y-8" onSubmit={handleSubmit}>

            {/* Name */}
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              placeholder="Your Name"
              required
              className="w-full border border-gray-300 rounded-xl px-4 py-3 text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-[#2f4a63]/30 transition"
            />

            {/* Email */}
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              placeholder="Email Address"
              required
              className="w-full border border-gray-300 rounded-xl px-4 py-3 text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-[#2f4a63]/30 transition"
            />

            {/* Message */}
            <textarea
              rows={5}
              name="message"
              value={formData.message}
              onChange={handleChange}
              placeholder="Write your feedback..."
              required
              className="w-full border border-gray-300 rounded-xl px-4 py-3 text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-[#2f4a63]/30 transition resize-none"
            />

            {/* Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-[#2f4a63] text-white py-3 rounded-xl font-medium hover:opacity-90 transition disabled:opacity-70"
            >
              {loading ? "Submitting..." : "Submit Feedback"}
            </button>

            {/* Status Message */}
            {status === "success" && (
              <p className="text-green-600 text-sm text-center mt-4">
                ✅ Feedback submitted successfully!
              </p>
            )}

            {status === "error" && (
              <p className="text-red-600 text-sm text-center mt-4">
                ❌ Something went wrong. Please try again.
              </p>
            )}

          </form>
        </div>
      </section>
    </div>
  );
}
