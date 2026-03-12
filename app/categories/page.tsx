"use client";

import { useState } from "react";
import {
  Scale,
  Search,
  ArrowRight,
  Gavel,
  Landmark,
  Briefcase,
  Globe,
  Zap,
  Users
} from "lucide-react";
import Link from "next/link";

const CATEGORIES = [
  {
    id: "supreme-court",
    name: "Supreme Court",
    icon: <Landmark className="text-indigo-400" size={24} />,
    description: "Milestone judgments, constitutional bench rulings, and pivotal precedents from the apex court.",
    topics: ["Bench Rulings", "Special Leave Petitions", "Contempt", "Public Interest Litigation"],
    color: "from-indigo-500/10 to-blue-500/10"
  },
  {
    id: "high-courts",
    name: "High Court",
    icon: <Gavel className="text-purple-400" size={24} />,
    description: "State-level judicial developments, writ jurisdictions, and notable criminal & civil appeals.",
    topics: ["Writ Petitions", "Anticipatory Bail", "Property Disputes", "Family Law"],
    color: "from-purple-500/10 to-pink-500/10"
  },
  {
    id: "constitutional",
    name: "Constitutional",
    icon: <Scale className="text-blue-400" size={24} />,
    description: "In-depth analysis of Fundamental Rights, Directive Principles, and structural amendments.",
    topics: ["Article 21", "Federalism", "Basic Structure", "Administrative Law"],
    color: "from-blue-500/10 to-cyan-500/10"
  },
  {
    id: "corporate",
    name: "Corporate & Finance",
    icon: <Briefcase className="text-emerald-400" size={24} />,
    description: "Company Law updates, IBC proceedings, SEBI regulations, and commercial arbitration.",
    topics: ["IBC", "M&A", "SEBI", "Taxation", "Banking & Insurance"],
    color: "from-emerald-500/10 to-teal-500/10"
  },
  {
    id: "criminal",
    name: "Criminal",
    icon: <Gavel className="text-red-400" size={24} />,
    description: "BNS, CrPC updates, bail jurisprudence, criminal appeals, and landmark prosecution cases.",
    topics: ["Bail", "BNS", "IPC", "NDPS", "Money Laundering"],
    color: "from-red-500/10 to-orange-500/10"
  },
  {
    id: "family",
    name: "Family",
    icon: <Users className="text-pink-400" size={24} />,
    description: "Marriage, divorce, custody, maintenance, adoption, and succession laws in India.",
    topics: ["Divorce", "Custody", "Maintenance", "Succession", "Adoption"],
    color: "from-pink-500/10 to-rose-500/10"
  },
  {
    id: "international",
    name: "Global",
    icon: <Globe className="text-cyan-400" size={24} />,
    description: "Global legal shifts, treaties, International Court of Justice updates, and cross-border disputes.",
    topics: ["Human Rights", "Maritime Law", "Extradition", "UN Conventions"],
    color: "from-cyan-500/10 to-blue-500/10"
  },
  {
    id: "ipr",
    name: "IPR & Tech",
    icon: <Zap className="text-yellow-400" size={24} />,
    description: "Intellectual Property Rights, Digital Personal Data Protection, and Tech-Law intersections.",
    topics: ["Copyright", "Patent Law", "Data Privacy", "AI Ethics"],
    color: "from-yellow-500/10 to-amber-500/10"
  },
  {
    id: "environment",
    name: "Environment",
    icon: <Scale className="text-green-400" size={24} />,
    description: "NGT rulings, environmental protection acts, and sustainable development litigation.",
    topics: ["NGT Rulings", "Forest Rights", "Climate Justice", "Wildlife Protection"],
    color: "from-green-500/10 to-emerald-500/10"
  }
];

export default function CategoriesPage() {
  const [search, setSearch] = useState("");

  const filteredCategories = CATEGORIES.filter(cat =>
    cat.name.toLowerCase().includes(search.toLowerCase()) ||
    cat.description.toLowerCase().includes(search.toLowerCase()) ||
    cat.topics.some(t => t.toLowerCase().includes(search.toLowerCase()))
  );

  return (
    <div className="bg-[#030712] min-h-screen pt-32 pb-20">

      {/* Header Section */}
      <section className="relative z-10 max-w-6xl mx-auto px-6 mb-16 text-center">
        <h1 className="text-4xl md:text-6xl font-black text-white mb-6 tracking-tight">
          Legal Directory
        </h1>
        <p className="text-lg text-gray-400 max-w-2xl mx-auto leading-relaxed">
          Navigate through our structured legal domains. Use the search to find specific topics or explore the comprehensive category cards below.
        </p>

        {/* Search Bar */}
        <div className="max-w-2xl mx-auto mt-12 relative">
          <div className="absolute inset-y-0 left-5 flex items-center pointer-events-none">
            <Search className="text-gray-500" size={20} />
          </div>
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Find a domain or topic (e.g. 'Article 21', 'IBC', 'Bail')..."
            className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 pl-14 pr-6 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all shadow-2xl shadow-indigo-500/5"
          />
        </div>
      </section>

      {/* Categories Grid */}
      <section className="max-w-6xl mx-auto px-6 relative z-10">
        <div className="grid md:grid-cols-2 lg:grid-cols-2 gap-8">
          {filteredCategories.map((cat) => (
            <div
              key={cat.id}
              className={`group bg-gradient-to-br ${cat.color} border border-white/10 p-8 rounded-[2.5rem] hover:border-indigo-500/30 transition-all duration-500 relative overflow-hidden`}
            >
              <div className="relative z-10">
                <div className="flex items-center justify-between mb-6">
                  <div className="w-14 h-14 bg-white/5 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform duration-500">
                    {cat.icon}
                  </div>
                  <Link
                    href={`/?category=${encodeURIComponent(cat.name)}`}
                    className="flex items-center gap-2 text-sm font-semibold text-indigo-400 hover:text-indigo-300 transition-colors"
                  >
                    Explore Updates <ArrowRight size={16} />
                  </Link>
                </div>

                <h3 className="text-2xl font-bold text-white mb-4">{cat.name}</h3>
                <p className="text-gray-400 text-sm leading-relaxed mb-6">
                  {cat.description}
                </p>

                <div className="flex flex-wrap gap-2">
                  {cat.topics.map((topic, i) => (
                    <Link
                      key={i}
                      href={`/?search=${encodeURIComponent(topic)}`}
                      className="px-3 py-1 rounded-lg bg-white/5 border border-white/5 text-[10px] font-bold text-gray-500 uppercase tracking-wider hover:bg-white/10 hover:text-white transition-all"
                    >
                      {topic}
                    </Link>
                  ))}
                </div>
              </div>

              {/* Decorative Background Element */}
              <div className="absolute -bottom-12 -right-12 w-32 h-32 bg-white/5 rounded-full blur-[40px] group-hover:bg-indigo-500/10 transition-colors duration-700"></div>
            </div>
          ))}

          {filteredCategories.length === 0 && (
            <div className="col-span-full py-20 text-center">
              <div className="mb-4 inline-flex items-center justify-center w-16 h-16 rounded-full bg-white/5 text-gray-600">
                <Search size={32} />
              </div>
              <p className="text-gray-500">No categories found matching your search. Try different keywords.</p>
            </div>
          )}
        </div>
      </section>

      {/* Personalization CTA */}
      <section className="max-w-4xl mx-auto px-6 mt-32">
        <div className="bg-indigo-600 dark:bg-indigo-900/40 rounded-[2.5rem] p-10 md:p-16 text-center relative overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-r from-purple-500/20 to-transparent pointer-events-none"></div>

          <div className="relative z-10">
            <h2 className="text-3xl md:text-5xl font-black text-white mb-6">
              Missing Your Specific Niche?
            </h2>
            <p className="text-indigo-100/70 text-lg mb-10 max-w-xl mx-auto">
              Our AI curators are indexing new legal domains every hour. Personalize your feed to get exactly what you need.
            </p>
            <Link
              href="/profile"
              className="px-8 py-4 rounded-2xl bg-white text-indigo-600 font-bold hover:shadow-2xl hover:shadow-white/20 transition-all inline-flex items-center gap-3"
            >
              Personalize My Feed <Zap size={20} />
            </Link>
          </div>
        </div>
      </section>

    </div>
  );
}
