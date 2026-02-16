export default function AboutPage() {
  return (
    <div className="bg-white">

      {/* Hero Section */}
      <section className="relative overflow-hidden">

        {/* Background Image */}
        <div className="absolute inset-0">
          <img
            src="https://images.unsplash.com/photo-1589829545856-d10d557cf95f?q=80&w=1600&auto=format&fit=crop"
            alt="Law background"
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-white/75"></div>
        </div>

        {/* Hero Content */}
        <div className="relative z-10 max-w-4xl mx-auto px-6 pt-28 pb-20 text-center">
          <h1 className="text-4xl md:text-5xl font-semibold text-[#2f4a63]">
            About Legal Digest
          </h1>

          <p className="mt-6 text-lg text-gray-600 leading-relaxed max-w-2xl mx-auto">
            Legal Digest is a structured legal news platform designed
            for law students, professionals, and informed readers.
            We simplify complex judgments, bills, and policy updates
            into concise and readable insights.
          </p>
        </div>
      </section>

      {/* Divider */}
      <div className="h-[1px] bg-gray-200 max-w-4xl mx-auto"></div>

      {/* Content Section */}
      <section className="max-w-4xl mx-auto px-6 py-12 space-y-10">

        {/* Mission */}
        <div className="bg-gray-50 p-8 rounded-2xl shadow-sm">
          <h2 className="text-2xl font-semibold text-[#2f4a63] flex items-center gap-2">
            ⚖️ Our Mission
          </h2>
          <p className="mt-4 text-gray-600 leading-relaxed">
            To make structured legal information accessible, reliable,
            and distraction-free. We believe law students and
            professionals deserve clarity — not clutter.
          </p>
        </div>

        {/* Difference */}
        <div className="bg-gray-50 p-8 rounded-2xl shadow-sm">
          <h2 className="text-2xl font-semibold text-[#2f4a63] flex items-center gap-2">
            📜 What Makes Us Different
          </h2>
          <p className="mt-4 text-gray-600 leading-relaxed">
            Unlike traditional news platforms, Legal Digest focuses on
            structured legal updates — prioritizing judgments, bills,
            constitutional developments, and policy changes over
            generic headlines.
          </p>
        </div>

        {/* Modern Readers */}
        <div className="bg-gray-50 p-8 rounded-2xl shadow-sm">
          <h2 className="text-2xl font-semibold text-[#2f4a63] flex items-center gap-2">
            🏛️ Built for Modern Legal Readers
          </h2>
          <p className="mt-4 text-gray-600 leading-relaxed">
            Our interface is clean, focused, and minimal —
            ensuring you spend more time understanding the law
            and less time navigating distractions.
          </p>
        </div>

      </section>
    </div>
  );
}
