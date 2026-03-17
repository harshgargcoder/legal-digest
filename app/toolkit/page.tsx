"use client";

import Link from "next/link";
import { Hammer, Scale, BookOpen, Quote, Boxes, ChevronRight } from "lucide-react";

export default function ToolkitPage() {
  const tools = [
    {
      id: "moot-court",
      title: "AI Moot Court",
      description: "Spar with a strict AI judge to sharpen your oral arguments and legal reasoning.",
      icon: Hammer,
      href: "/toolkit/moot-court",
      color: "from-blue-500 to-indigo-600",
      badge: "Oral Defense"
    },
    {
      id: "citation-detective",
      title: "Citation Detective",
      description: "Audit your research drafts. Find better precedents and fix citation formatting instantly.",
      icon: Quote,
      href: "/toolkit/citation-detective",
      color: "from-purple-500 to-pink-600",
      badge: "Research Audit"
    },
    {
      id: "story-visualizer",
      title: "Statute Visualizer",
      description: "Translate dry legal sections into vivid narrative stories to understand their real-world application.",
      icon: BookOpen,
      href: "/toolkit/story-visualizer",
      color: "from-emerald-500 to-teal-600",
      badge: "Statute Narrative"
    }
  ];

  return (
    <div className="min-h-screen bg-slate-50 pt-32 pb-24 px-4 sm:px-6">
      <div className="max-w-4xl mx-auto">
        
        <div className="mb-12 text-center">
          <div className="inline-flex items-center justify-center p-3 bg-indigo-500/10 rounded-2xl mb-4 ring-1 ring-indigo-500/30">
            <Boxes size={32} className="text-indigo-600" />
          </div>
          <h1 className="text-4xl font-bold text-slate-900 mb-4 tracking-tight">Student Toolkit</h1>
          <p className="text-lg text-slate-600 max-w-2xl mx-auto font-medium">
            AI-powered tools designed to bridge the gap between legal theory and professional practice.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {tools.map((tool) => {
            const Icon = tool.icon;
            return (
              <Link 
                key={tool.id} 
                href={tool.href}
                className="group relative bg-white border border-slate-200 rounded-3xl p-8 shadow-sm transition-all duration-300 hover:shadow-xl hover:-translate-y-2 hover:border-indigo-500/20 flex flex-col items-center text-center overflow-hidden"
              >
                {/* Decorative Gradient Background */}
                <div className={`absolute inset-0 bg-gradient-to-br ${tool.color} opacity-0 group-hover:opacity-[0.03] transition-opacity`} />
                
                <div className={`w-16 h-16 rounded-2xl bg-gradient-to-br ${tool.color} flex items-center justify-center text-white mb-6 shadow-lg shadow-indigo-500/20 group-hover:scale-110 transition-transform`}>
                  <Icon size={32} />
                </div>

                <div className="bg-slate-50 text-slate-500 px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest mb-4 border border-slate-100 group-hover:bg-indigo-50 group-hover:text-indigo-600 transition-colors">
                  {tool.badge}
                </div>

                <h3 className="text-xl font-bold text-slate-900 mb-3 group-hover:text-indigo-600 transition-colors">
                  {tool.title}
                </h3>
                
                <p className="text-sm text-slate-500 leading-relaxed font-medium mb-8">
                  {tool.description}
                </p>

                <div className="mt-auto flex items-center gap-2 text-indigo-600 text-sm font-bold opacity-0 group-hover:opacity-100 transition-opacity">
                  Open Tool <ChevronRight size={16} />
                </div>
              </Link>
            );
          })}
        </div>

        {/* Info Card */}
        <div className="mt-16 bg-indigo-900 rounded-3xl p-8 relative overflow-hidden shadow-2xl">
          <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full -mr-32 -mt-32 blur-3xl" />
          <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-8">
            <div className="max-w-xl">
              <h3 className="text-white text-2xl font-bold mb-3 flex items-center gap-3">
                <Scale size={24} className="text-indigo-400" /> Professional Preparation
              </h3>
              <p className="text-indigo-100/70 text-sm font-medium leading-relaxed">
                Legal Digest tools are powered by Gemini AI and trained to provide professional-grade feedback. Use these to supplement your lectures and research for a competitive edge in moot courts and internships.
              </p>
            </div>
            <div className="flex-shrink-0">
              <span className="px-6 py-3 bg-white/10 hover:bg-white/20 text-white rounded-2xl text-sm font-bold border border-white/10 transition backdrop-blur-md cursor-default">
                AI Powered • Free Beta
              </span>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
