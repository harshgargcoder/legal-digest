"use client";

import { useState } from "react";
import { MessageSquare, Send, CheckCircle2, AlertCircle } from "lucide-react";

export default function FeedbackPage() {
  const [formData, setFormData] = useState({ name: "", email: "", message: "" });
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState<"idle" | "success" | "error">("idle");

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setStatus("idle");

    try {
      const response = await fetch("/api/feedback", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      if (!response.ok) throw new Error("Failed");

      setStatus("success");
      setFormData({ name: "", email: "", message: "" });
    } catch {
      setStatus("error");
    }
    setLoading(false);
  };

  return (
    <div className="bg-slate-50 min-h-screen pt-32 pb-20 px-6">
      <div className="max-w-3xl mx-auto">
        
        {/* Header */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center justify-center p-4 bg-indigo-500/10 rounded-full mb-6 ring-1 ring-indigo-500/30">
            <MessageSquare size={32} className="text-indigo-600" />
          </div>
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">Transmit Feedback</h1>
          <p className="text-gray-600 text-lg">Your structural insights dictate our platform's evolution.</p>
        </div>

        {/* Form Container */}
        <div className="bg-white border border-gray-200 rounded-3xl p-8 sm:p-10 shadow-xl relative overflow-hidden">
          {/* Subtle Glow inside form */}
          <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-500/5 blur-[80px] rounded-full pointer-events-none"></div>

          <form className="space-y-6 relative z-10" onSubmit={handleSubmit}>
            <div className="grid sm:grid-cols-2 gap-6">
              {/* Name */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Researcher Name</label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  placeholder="E.g. Harish Salve"
                  required
                  className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3.5 text-gray-900 placeholder:text-gray-500 hover:bg-gray-100 hover:border-indigo-400/50 focus:bg-white focus:outline-none focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 transition-all duration-300"
                />
              </div>

              {/* Email */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Secure Email Address</label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="contact@chambers.in"
                  required
                  className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3.5 text-gray-900 placeholder:text-gray-500 hover:bg-gray-100 hover:border-indigo-400/50 focus:bg-white focus:outline-none focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 transition-all duration-300"
                />
              </div>
            </div>

            {/* Message */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Constructive Feedback</label>
              <textarea
                rows={6}
                name="message"
                value={formData.message}
                onChange={handleChange}
                placeholder="Detail your feature requests, bug reports, or UI suggestions..."
                required
                className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3.5 text-gray-900 placeholder:text-gray-500 hover:bg-gray-100 hover:border-indigo-400/50 focus:bg-white focus:outline-none focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 transition-all duration-300 resize-none"
              />
            </div>

            {/* Status Feedback */}
            {status === "success" && (
              <div className="flex items-center justify-center gap-2 p-4 bg-emerald-500/10 border border-emerald-500/20 rounded-xl text-emerald-600 text-sm font-medium">
                <CheckCircle2 size={18} /> Protocol acknowledged. Feedback securely transmitted.
              </div>
            )}
            
            {status === "error" && (
              <div className="flex items-center justify-center gap-2 p-4 bg-red-500/10 border border-red-500/20 rounded-xl text-red-600 text-sm font-medium">
                <AlertCircle size={18} /> Transmission failed. Please verify your connection.
              </div>
            )}

            {/* Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full mt-4 flex justify-center items-center gap-2 bg-indigo-600 text-white py-4 rounded-xl font-bold tracking-wide hover:bg-indigo-500 transition-all disabled:opacity-50 disabled:active:scale-100 active:scale-[0.98] shadow-lg shadow-indigo-600/20"
            >
              {loading ? (
                <span className="flex items-center gap-2">
                  <span className="w-4 h-4 rounded-full border-2 border-white/30 border-t-white animate-spin"></span> Transmitting...
                </span>
              ) : (
                <><Send size={18} /> Submit Intelligence</>
              )}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
