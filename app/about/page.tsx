import { Scale, BookOpen, Clock, ShieldCheck } from "lucide-react";

export default function AboutPage() {
  return (
    <div className="bg-[#030712] min-h-screen pt-32 pb-20">

      {/* Hero Section */}
      <section className="relative overflow-hidden mb-20">
        
        {/* Background Decorative Glows */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-lg h-96 bg-indigo-600/20 blur-[120px] rounded-full pointer-events-none"></div>
        <div className="absolute bottom-0 right-0 w-96 h-96 bg-purple-600/10 blur-[100px] rounded-full pointer-events-none"></div>

        <div className="relative z-10 max-w-5xl mx-auto px-6 text-center">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 text-sm font-semibold mb-6">
            <Scale size={16} /> Legal Digest
          </div>
          
          <h1 className="text-4xl md:text-6xl font-black text-white mb-6 tracking-tight leading-tight">
            Elevating Legal Research <br className="hidden md:block"/> for the Modern Era.
          </h1>

          <p className="text-lg md:text-xl text-gray-400 leading-relaxed max-w-3xl mx-auto">
            Legal Digest is a meticulously structured intelligence platform designed specifically for law students, advocates, and legal scholars. We transform complex judgments and sprawling bills into concise, actionable insights.
          </p>
        </div>
      </section>

      {/* Grid Content Section */}
      <section className="max-w-6xl mx-auto px-6">
        <div className="grid md:grid-cols-2 gap-8">
          
          {/* Mission */}
          <div className="bg-white/5 border border-white/10 p-8 sm:p-10 rounded-3xl hover:border-indigo-500/30 transition-colors duration-500 group">
            <div className="w-14 h-14 bg-indigo-500/10 rounded-2xl flex items-center justify-center mb-6 group-hover:bg-indigo-500/20 transition-colors">
              <ShieldCheck size={28} className="text-indigo-400" />
            </div>
            <h2 className="text-2xl font-bold text-white mb-4">Our Integrity Mission</h2>
            <p className="text-gray-400 leading-relaxed">
              To make structured legal information undeniably accessible, infinitely reliable, and purely distraction-free. We believe the legal community deserves absolute clarity—not algorithmic clutter.
            </p>
          </div>

          {/* Difference */}
          <div className="bg-white/5 border border-white/10 p-8 sm:p-10 rounded-3xl hover:border-indigo-500/30 transition-colors duration-500 group">
            <div className="w-14 h-14 bg-indigo-500/10 rounded-2xl flex items-center justify-center mb-6 group-hover:bg-indigo-500/20 transition-colors">
              <BookOpen size={28} className="text-indigo-400" />
            </div>
            <h2 className="text-2xl font-bold text-white mb-4">The Analytical Difference</h2>
            <p className="text-gray-400 leading-relaxed">
              Unlike generic news aggregators, Legal Digest strictly focuses on structural legal updates. We prioritize Supreme Court rulings, pivotal constitutional developments, and critical policy shifts over sensational headlines.
            </p>
          </div>

          {/* Modern Readers */}
          <div className="bg-white/5 border border-white/10 p-8 sm:p-10 rounded-3xl md:col-span-2 hover:border-indigo-500/30 transition-colors duration-500 group relative overflow-hidden">
            <div className="absolute right-0 top-0 w-64 h-full bg-gradient-to-l from-indigo-500/5 to-transparent pointer-events-none"></div>
            <div className="w-14 h-14 bg-indigo-500/10 rounded-2xl flex items-center justify-center mb-6 group-hover:bg-indigo-500/20 transition-colors relative z-10">
              <Clock size={28} className="text-indigo-400" />
            </div>
            <h2 className="text-2xl font-bold text-white mb-4 relative z-10">Engineered for Efficiency</h2>
            <p className="text-gray-400 leading-relaxed max-w-3xl relative z-10">
              Our interface is intentionally dark, hyper-focused, and minimal. By utilizing AI Case Briefs and intelligent categorization, we ensure you spend more time comprehending the law and less time navigating through digital noise.
            </p>
          </div>

        </div>
      </section>

    </div>
  );
}
