"use client";

import Navbar from "../components/Navbar";
import Footer from "../components/Footer";

export default function InternationalPage() {
  return (
    <>
      <Navbar />
      <main className="min-h-screen px-6 py-12 max-w-5xl mx-auto">
        <h1 className="text-3xl font-bold mb-6">
          🌍 International Legal Updates
        </h1>

        <p className="text-gray-600">
          ICJ rulings, international treaties, global constitutional
          developments and cross-border legal matters.
        </p>
      </main>
      <Footer />
    </>
  );
}
