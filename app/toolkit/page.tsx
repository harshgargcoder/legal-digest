"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Hammer, Scale, BookOpen, Quote, Boxes, ChevronRight, X, User, ShieldCheck } from "lucide-react";
import { auth } from "@/lib/firebase";
import { onAuthStateChanged, type User as FirebaseUser } from "firebase/auth";
import { createPortal } from "react-dom";
import { motion, AnimatePresence } from "framer-motion";

function LoginRequiredModal({ onClose }: { onClose: () => void }) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    document.body.style.overflow = "hidden";
    return () => { document.body.style.overflow = ""; };
  }, []);

  if (!mounted) return null;

  return createPortal(
    <div onClick={onClose} className="fixed inset-0 z-[9999] flex items-center justify-center bg-slate-950/60 backdrop-blur-md p-4">
      <div onClick={(e) => e.stopPropagation()} className="bg-white rounded-[2.5rem] p-8 max-w-sm w-full shadow-2xl border border-slate-100 flex flex-col items-center text-center gap-6">
        <div className="w-16 h-16 rounded-2xl bg-indigo-600 text-white flex items-center justify-center shadow-lg shadow-indigo-200">
          <User size={32} />
        </div>
        <div>
          <h2 className="text-xl font-black text-slate-900 mb-2">Login Required</h2>
          <p className="text-sm font-medium text-slate-500 leading-relaxed">
            Please sign in to access our AI-powered legal tools and save your progress.
          </p>
        </div>
        <div className="grid grid-cols-2 gap-4 w-full">
          <button onClick={onClose} className="py-3 rounded-2xl bg-slate-50 text-slate-400 font-bold text-xs uppercase tracking-widest hover:bg-slate-100 transition-all">Cancel</button>
          <button onClick={() => { window.location.hash = "login"; onClose(); }} className="py-3 rounded-2xl bg-indigo-600 text-white font-bold text-xs uppercase tracking-widest hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-200">Sign In</button>
        </div>
      </div>
    </div>,
    document.body
  );
}

function AIHallucinationModal({ toolName, onConfirm, onClose }: { toolName: string, onConfirm: () => void, onClose: () => void }) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    document.body.style.overflow = "hidden";
    return () => { document.body.style.overflow = ""; };
  }, []);

  if (!mounted) return null;

  return createPortal(
    <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-slate-950/80 backdrop-blur-xl p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.9, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        className="bg-white rounded-[3rem] p-10 max-w-lg w-full shadow-2xl border border-rose-100 flex flex-col gap-8 relative overflow-hidden"
      >
        <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-rose-500 via-amber-500 to-rose-500"></div>

        <div className="flex flex-col items-center text-center">
          <div className="w-20 h-20 rounded-3xl bg-rose-50 text-rose-600 flex items-center justify-center mb-6 ring-4 ring-rose-50">
            <Scale size={40} />
          </div>
          <h2 className="text-3xl font-black text-slate-900 mb-4 tracking-tight">AI Safety Disclaimer</h2>
          <div className="space-y-4 text-slate-600 text-sm font-medium leading-relaxed">
            <p>
              You are about to enter <span className="text-indigo-600 font-bold">{toolName}</span>. Please be aware that this tool uses Large Language Models (LLMs).
            </p>
            <div className="bg-rose-50 border border-rose-100 p-4 rounded-2xl text-rose-700 text-left space-y-2 italic">
              <p>• AI models can <strong>hallucinate</strong> (generate confident but false information).</p>
              <p>• Legal precedents or sections mentioned may not be 100% accurate or up-to-date.</p>
              <p>• <strong>Do not</strong> use this output for official legal filings without professional verification.</p>
            </div>
            <p className="pt-2">Always cross-reference AI insights with official gazettes, statutes, and verified case laws.</p>
          </div>
        </div>

        <div className="flex flex-col gap-3">
          <button onClick={onConfirm} className="w-full py-4 rounded-[1.5rem] bg-slate-950 text-white font-black text-xs uppercase tracking-[0.2em] hover:bg-indigo-600 transition-all shadow-xl shadow-indigo-100">
            I Understand, Proceed
          </button>
          <button onClick={onClose} className="w-full py-3 text-slate-400 font-bold text-[10px] uppercase tracking-widest hover:text-slate-600 transition-all">
            Go Back
          </button>
        </div>
      </motion.div>
    </div>,
    document.body
  );
}

export default function ToolkitPage() {
  const [user, setUser] = useState<FirebaseUser | null>(null);
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [pendingTool, setPendingTool] = useState<{ id: string, title: string, href: string } | null>(null);
  const router = useRouter();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser: FirebaseUser | null) => {
      setUser(currentUser);
    });
    return () => unsubscribe();
  }, []);

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
    },
    {
      id: "briefing-pro",
      title: "Briefing Pro",
      description: "Upload case documents or paste facts to generate a professional case brief using Gemini 3 Flash.",
      icon: Scale,
      href: "/toolkit/briefing-pro",
      color: "from-blue-600 to-indigo-700",
      badge: "Gemini 3 Flash"
    }
  ];

  type ToolkitTool = (typeof tools)[number];

  const handleToolClick = (e: React.MouseEvent, tool: ToolkitTool) => {
    e.preventDefault();
    if (!user) {
      setShowLoginModal(true);
    } else {
      setPendingTool(tool);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 pt-32 pb-24 px-4 sm:px-6 font-sans">
      {showLoginModal && <LoginRequiredModal onClose={() => setShowLoginModal(false)} />}

      {pendingTool && (
        <AIHallucinationModal
          toolName={pendingTool.title}
          onConfirm={() => {
            router.push(pendingTool.href);
            setPendingTool(null);
          }}
          onClose={() => setPendingTool(null)}
        />
      )}

      <div className="max-w-6xl mx-auto">
        <div className="mb-12 text-center">
          <div className="inline-flex items-center justify-center p-3 bg-indigo-500/10 rounded-2xl mb-4 ring-1 ring-indigo-500/30">
            <Boxes size={32} className="text-indigo-600" />
          </div>
          <h1 className="text-4xl font-bold text-slate-900 mb-4 tracking-tight">Student Toolkit</h1>
          <p className="text-lg text-slate-600 max-w-2xl mx-auto font-medium">
            AI-powered tools designed to bridge the gap between legal theory and professional practice.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {tools.map((tool) => {
            const Icon = tool.icon;
            return (
              <div
                key={tool.id}
                onClick={(e) => handleToolClick(e, tool)}
                className="group relative bg-white border border-slate-200 rounded-3xl p-8 shadow-sm transition-all duration-300 hover:shadow-xl hover:-translate-y-2 hover:border-indigo-500/20 flex flex-col items-center text-center overflow-hidden cursor-pointer"
              >
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
              </div>
            );
          })}
        </div>

        <div className="mt-16 bg-slate-900 rounded-[2.5rem] p-10 relative overflow-hidden shadow-2xl border border-slate-800">
          <div className="absolute top-0 right-0 w-96 h-96 bg-indigo-500/10 rounded-full -mr-48 -mt-48 blur-3xl" />
          <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-10">
            <div className="max-w-xl">
              <div className="flex items-center gap-3 mb-4">
                <div className="p-2 bg-amber-500/20 text-amber-500 rounded-lg">
                  <ShieldCheck size={20} />
                </div>
                <h3 className="text-white text-xl font-bold">Important Notice</h3>
              </div>
              <p className="text-slate-400 text-sm font-medium leading-relaxed">
                Legal Digest AI tools are designed for academic training only. AI models may hallucinate or provide outdated legal interpretations. <span className="text-white font-bold underline">Always cross-verify AI outputs</span> with official legal databases before professional use.
              </p>
            </div>
            <div className="flex-shrink-0 flex flex-col items-center gap-3">
              <span className="px-6 py-3 bg-white/5 text-white rounded-2xl text-xs font-black uppercase tracking-widest border border-white/10 backdrop-blur-md">
                Alpha Testing
              </span>
              <p className="text-[10px] font-black text-slate-600 uppercase tracking-widest">Verify with Statutes</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
