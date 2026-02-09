"use client";

import { useEffect, useState } from "react";

export default function HeroSection({ search, setSearch }: any) {

  const words = [
    "Legal Intelligence Platform",
    "Structured Legal Insights",
    "Filtered Global Intelligence",
    "No Noise. Just Facts."
  ];

  const [displayText, setDisplayText] = useState("");
  const [wordIndex, setWordIndex] = useState(0);
  const [charIndex, setCharIndex] = useState(0);
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    const currentWord = words[wordIndex];
    const typingSpeed = isDeleting ? 40 : 120; // slower luxury typing

    const timeout = setTimeout(() => {
      if (!isDeleting) {
        setDisplayText(currentWord.substring(0, charIndex + 1));
        setCharIndex(charIndex + 1);

        if (charIndex + 1 === currentWord.length) {
          setTimeout(() => setIsDeleting(true), 1500);
        }
      } else {
        setDisplayText(currentWord.substring(0, charIndex - 1));
        setCharIndex(charIndex - 1);

        if (charIndex - 1 === 0) {
          setIsDeleting(false);
          setWordIndex((prev) => (prev + 1) % words.length);
        }
      }
    }, typingSpeed);

    return () => clearTimeout(timeout);
  }, [charIndex, isDeleting, wordIndex]);

  return (
    <div className="relative mb-20 overflow-hidden">

      {/* FLOATING PARTICLES */}
      <div className="absolute inset-0 -z-10">
        <div className="absolute w-2 h-2 bg-indigo-400 rounded-full animate-ping top-20 left-20 opacity-40" />
        <div className="absolute w-2 h-2 bg-purple-400 rounded-full animate-pulse top-40 right-32 opacity-40" />
        <div className="absolute w-1 h-1 bg-pink-400 rounded-full animate-bounce bottom-32 left-1/3 opacity-30" />
      </div>

      {/* AI TERMINAL STYLE BOX */}
      <div className="bg-black/40 backdrop-blur-xl border border-white/10 rounded-2xl p-8 shadow-[0_0_40px_rgba(99,102,241,0.15)]">

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 items-center">

          {/* LEFT */}
          <div>

            <p className="text-xs text-indigo-400 uppercase tracking-widest mb-4">
              ● AI Powered Intelligence
            </p>

            <h1 className="text-3xl sm:text-5xl font-bold leading-tight font-mono">

              {/* GRADIENT SHIMMER TEXT */}
              <span className="bg-gradient-to-r from-indigo-400 via-purple-400 to-pink-400 bg-[length:200%_200%] animate-[gradient_6s_ease_infinite] bg-clip-text text-transparent">
                {displayText}
              </span>

              <span className="ml-2 text-indigo-400 animate-pulse">▋</span>
            </h1>

            <p className="text-gray-400 mt-6 max-w-xl text-base sm:text-lg">
              Structured legal & global updates. No noise. No clickbait.
              Stay ahead with filtered intelligence across courts,
              policy, finance & geopolitics.
            </p>
          </div>

          {/* RIGHT SEARCH */}
          <div className="flex justify-start lg:justify-end">
            <div className="relative w-full max-w-sm">

              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search cases, topics..."
                className="w-full bg-black/50 border border-indigo-500/30 rounded-lg pl-10 pr-4 py-2.5 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-indigo-400 focus:shadow-[0_0_25px_rgba(99,102,241,0.4)] transition"
              />

              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-indigo-400">
                🔎
              </span>

            </div>
          </div>

        </div>

      </div>

      {/* GRADIENT ANIMATION KEYFRAME */}
      <style jsx>{`
        @keyframes gradient {
          0% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
          100% { background-position: 0% 50%; }
        }
      `}</style>

    </div>
  );
}
