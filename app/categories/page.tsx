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
    name: "Finance",
    icon: <Briefcase className="text-emerald-400" size={24} />,
    description: "Company Law updates, IBC proceedings, SEBI regulations, and commercial arbitration.",
    topics: ["IBC", "SEBI", "Debt Cases", "Profit/Loss", "Stay Proceedings", "Judgement", "NCLT hearings"],
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
    <div className="bg-slate-50 min-h-screen pt-32 pb-20">

      {/* Header Section */}
      <section className="relative z-10 max-w-6xl mx-auto px-6 mb-16 text-center">
        <h1 className="text-4xl md:text-6xl font-black text-slate-900 mb-6 tracking-tight">
          Legal Directory
        </h1>
        <p className="text-lg text-slate-600 max-w-2xl mx-auto leading-relaxed font-medium">
          Navigate through our structured legal domains. Use the search to find specific topics or explore the comprehensive category cards below.
        </p>

        {/* Search Bar */}
        <div className="max-w-2xl mx-auto mt-12 relative">
          <div className="absolute inset-y-0 left-5 flex items-center pointer-events-none">
            <Search className="text-slate-400" size={20} />
          </div>
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Find a domain or topic (e.g. 'Article 21', 'IBC', 'Bail')..."
            className="w-full bg-white border border-gray-200 rounded-2xl py-4 pl-14 pr-6 text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all shadow-xl shadow-indigo-500/5"
          />
        </div>
      </section>

      {/* Categories Grid */}
      <section className="max-w-6xl mx-auto px-6 relative z-10">
        <div className="grid md:grid-cols-2 lg:grid-cols-2 gap-8">
          {filteredCategories.map((cat) => (
            <div
              key={cat.id}
              className={`group bg-white border border-gray-200 p-8 rounded-[2.5rem] hover:border-indigo-500/30 transition-all duration-500 relative overflow-hidden shadow-sm`}
            >
              <div className="relative z-10">
                <div className="flex items-center justify-between mb-6">
                  <div className="w-14 h-14 bg-slate-50 border border-gray-100 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform duration-500">
                    {cat.icon}
                  </div>
                  <Link
                    href={`/?category=${encodeURIComponent(cat.name)}`}
                    className="flex items-center gap-2 text-sm font-bold text-indigo-600 hover:text-indigo-500 transition-colors"
                  >
                    Explore Updates <ArrowRight size={16} />
                  </Link>
                </div>

                <h3 className="text-2xl font-bold text-slate-900 mb-4">{cat.name}</h3>
                <p className="text-slate-600 text-sm leading-relaxed mb-6 font-medium">
                  {cat.description}
                </p>

                <div className="flex flex-wrap gap-2">
                  {cat.topics.map((topic, i) => (
                    <Link
                      key={i}
                      href={`/?search=${encodeURIComponent(topic)}`}
                      className="px-3 py-1 rounded-lg bg-slate-50 border border-gray-200 text-[10px] font-bold text-slate-500 uppercase tracking-wider hover:bg-slate-100 hover:text-indigo-600 transition-all"
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
              <div className="mb-4 inline-flex items-center justify-center w-16 h-16 rounded-full bg-slate-100 text-slate-400">
                <Search size={32} />
              </div>
              <p className="text-slate-500 font-medium">No categories found matching your search. Try different keywords.</p>
            </div>
          )}
        </div>
      </section>

      {/* Personalization CTA */}
      <section className="max-w-4xl mx-auto px-6 mt-32">
        <div className="bg-indigo-600 rounded-[2.5rem] p-10 md:p-16 text-center relative overflow-hidden shadow-2xl shadow-indigo-600/20">
          <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-r from-purple-500/20 to-transparent pointer-events-none"></div>

          <div className="relative z-10">
            <h2 className="text-3xl md:text-5xl font-black text-white mb-6">
              Missing Your Specific Niche?
            </h2>
            <p className="text-indigo-100 text-lg mb-10 max-w-xl mx-auto font-medium">
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
