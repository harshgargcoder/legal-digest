"use client";

import Navbar from "../components/Navbar";
import Footer from "../components/Footer";

export default function NationalPage() {
  return (
    <>
      <Navbar />
      <main className="min-h-screen px-6 py-12 max-w-5xl mx-auto">
        <h1 className="text-3xl font-bold mb-6">
          🇮🇳 National Legal Updates
        </h1>

        <p className="text-gray-600">
          Supreme Court, High Courts, Bills, Amendments and Indian
          constitutional matters will appear here.
        </p>
      </main>
      <Footer />
    </>
  );
}