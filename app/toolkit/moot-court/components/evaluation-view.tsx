"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Award, FileText, PlusCircle, Scale, ShieldAlert, ChevronRight } from "lucide-react";

import type { EvaluationResult, Message } from "../types";

interface EvaluationViewProps {
  evaluation: EvaluationResult | null;
  transcript: Message[];
  onClose: () => void;
}

type EvalTab = "scores" | "analysis" | "transcript";

export function EvaluationView({ evaluation, transcript, onClose }: EvaluationViewProps) {
  const [activeTab, setActiveTab] = useState<EvalTab>("scores");

  const tabs: { key: EvalTab; label: string }[] = [
    { key: "scores", label: "Scores" },
    { key: "analysis", label: "Analysis" },
    { key: "transcript", label: "Transcript" },
  ];

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="h-screen flex flex-col bg-[#F8F9FA] overflow-hidden"
    >
      {/* Sticky Header */}
      <div className="bg-slate-900 px-8 py-6 flex items-center justify-between shrink-0 relative overflow-hidden">
        <div className="absolute inset-0 opacity-5 pointer-events-none flex items-center justify-center">
          <Scale size={300} />
        </div>
        <div className="flex items-center gap-5 relative z-10">
          <div className="w-14 h-14 bg-amber-500 text-white rounded-2xl flex items-center justify-center shadow-xl">
            <Award size={28} />
          </div>
          <div>
            <h2 className="text-xl font-black text-white uppercase tracking-[0.2em]">Judicial Evaluation</h2>
            <p className="text-slate-400 text-xs font-medium tracking-wide">Post-Session Analysis & Competency Report</p>
          </div>
        </div>
        <button
          onClick={onClose}
          className="relative z-10 bg-white/10 hover:bg-white/20 text-white px-6 py-3 rounded-xl font-black text-[10px] uppercase tracking-widest transition-all flex items-center gap-2 border border-white/10"
        >
          New Session <ChevronRight size={14} />
        </button>
      </div>

      {/* Score Cards - Always visible */}
      <div className="px-8 py-5 bg-white border-b border-slate-100 shrink-0">
        <div className="grid grid-cols-4 gap-4 max-w-5xl mx-auto">
          <EvalScore label="Legal Reasoning" score={evaluation?.legalReasoning || 0} />
          <EvalScore label="Objection Accuracy" score={evaluation?.objectionAccuracy || 0} />
          <EvalScore label="Examination Quality" score={evaluation?.examinationQuality || 0} />
          <EvalScore label="Procedural Compliance" score={evaluation?.proceduralCompliance || 0} />
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="px-8 pt-4 bg-[#F8F9FA] shrink-0">
        <div className="flex gap-2 max-w-5xl mx-auto">
          {tabs.map((tab) => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={`px-5 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${
                activeTab === tab.key
                  ? "bg-slate-900 text-white shadow-lg"
                  : "bg-white text-slate-400 hover:text-slate-700 border border-slate-200"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Scrollable Content Area */}
      <div className="flex-1 overflow-y-auto px-8 py-6">
        <div className="max-w-5xl mx-auto">
          {activeTab === "scores" && (
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
              {/* Verdict */}
              <div className="bg-white p-8 rounded-[2rem] border border-slate-200 shadow-sm">
                <div className="flex items-center gap-4 mb-6">
                  <div className="w-10 h-10 bg-indigo-900 rounded-xl flex items-center justify-center text-white">
                    <FileText size={18} />
                  </div>
                  <div>
                    <h3 className="text-base font-black text-slate-900 uppercase tracking-tight">Post-Session Analysis</h3>
                    <p className="text-xs font-medium text-slate-500">Ratio decidendi and performance breakdown</p>
                  </div>
                </div>
                <div className="bg-slate-50 p-6 rounded-2xl border border-slate-100">
                  <p className="text-slate-800 font-serif leading-relaxed italic text-sm">{evaluation?.verdict || "No verdict drafted yet."}</p>
                </div>
              </div>

              {/* Strengths & Improvements side by side */}
              <div className="grid md:grid-cols-2 gap-6">
                <div className="bg-white p-6 rounded-[2rem] border border-slate-200 shadow-sm space-y-4">
                  <h3 className="text-[10px] font-black uppercase tracking-widest text-indigo-500">Strengths</h3>
                  <ul className="space-y-2">
                    {evaluation?.strengths?.map((s: string, i: number) => (
                      <li key={i} className="flex items-start gap-3 text-sm font-medium text-slate-600 bg-indigo-50/50 p-3 rounded-xl border border-indigo-100/50">
                        <PlusCircle size={14} className="mt-0.5 text-indigo-400 shrink-0" /> {s}
                      </li>
                    )) || <li className="text-xs text-slate-400 italic">No specific strengths noted.</li>}
                  </ul>
                </div>
                <div className="bg-white p-6 rounded-[2rem] border border-slate-200 shadow-sm space-y-4">
                  <h3 className="text-[10px] font-black uppercase tracking-widest text-red-500">Areas for Improvement</h3>
                  <ul className="space-y-2">
                    {evaluation?.improvements?.map((im: string, i: number) => (
                      <li key={i} className="flex items-start gap-3 text-sm font-medium text-slate-600 bg-red-50/50 p-3 rounded-xl border border-red-100/50">
                        <ShieldAlert size={14} className="mt-0.5 text-red-400 shrink-0" /> {im}
                      </li>
                    )) || <li className="text-xs text-slate-400 italic">No specific improvements noted.</li>}
                  </ul>
                </div>
              </div>
            </motion.div>
          )}

          {activeTab === "analysis" && (
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
              {/* Student Dashboard */}
              <div className="bg-indigo-900 p-8 rounded-[2rem] text-white space-y-6 shadow-xl">
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="text-lg font-black uppercase tracking-tight">Student Score Dashboard</h2>
                    <p className="text-indigo-200 text-xs">Long-term performance trends</p>
                  </div>
                  <Award size={28} className="text-indigo-300" />
                </div>
                <div className="grid grid-cols-4 gap-3">
                  {[
                    { label: "Advocacy", val: "78%" },
                    { label: "Etiquette", val: "92%" },
                    { label: "Reasoning", val: "84%" },
                    { label: "Objections", val: "65%" },
                  ].map((stat) => (
                    <div key={stat.label} className="bg-white/10 p-5 rounded-2xl border border-white/10 backdrop-blur-sm">
                      <div className="text-[8px] font-bold uppercase tracking-widest text-indigo-300 mb-1">{stat.label}</div>
                      <div className="text-xl font-black">{stat.val}</div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Detailed Verdict */}
              <div className="bg-white p-8 rounded-[2rem] border border-slate-200 shadow-sm">
                <h3 className="text-base font-black text-slate-900 uppercase tracking-tight mb-4">Full Judicial Opinion</h3>
                <div className="bg-slate-50 p-6 rounded-2xl border border-slate-100">
                  <p className="text-slate-800 font-serif leading-loose italic text-sm">{evaluation?.verdict || "No verdict drafted yet."}</p>
                </div>
              </div>
            </motion.div>
          )}

          {activeTab === "transcript" && (
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
              <div className="bg-white border border-slate-200 rounded-[2rem] p-6 shadow-sm">
                <div className="flex items-center justify-between gap-4 mb-4">
                  <div>
                    <h3 className="text-base font-black text-slate-900 uppercase tracking-tight">Transcript Replay</h3>
                    <p className="text-xs text-slate-500">Review the full courtroom flow from opening to verdict.</p>
                  </div>
                  <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">{transcript.length} entries</span>
                </div>

                <div className="space-y-3">
                  {transcript.map((msg, idx) => (
                    <div
                      key={`${msg.role}-${idx}`}
                      className={`p-4 rounded-xl border ${
                        msg.role === "judge"
                          ? "bg-slate-900 text-white border-slate-800"
                          : msg.role === "plaintiff"
                            ? "bg-indigo-50 border-indigo-100 text-indigo-900"
                            : msg.role === "defendant"
                              ? "bg-red-50 border-red-100 text-red-900"
                              : msg.role === "witness"
                                ? "bg-amber-50 border-amber-100 text-amber-900"
                                : "bg-white border-slate-200 text-slate-700"
                      } ${msg.isInadmissible ? "opacity-50 line-through" : ""}`}
                    >
                      <div className="flex items-center justify-between gap-4 mb-1">
                        <span className="text-[10px] font-black uppercase tracking-widest">{msg.role}</span>
                        <span className="text-[10px] font-medium opacity-70">{new Date(msg.timestamp).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}</span>
                      </div>
                      <p className="text-sm leading-relaxed whitespace-pre-wrap">{msg.content}</p>
                    </div>
                  ))}

                  {transcript.length === 0 && <div className="text-sm text-slate-400 italic">No transcript available.</div>}
                </div>
              </div>
            </motion.div>
          )}
        </div>
      </div>
    </motion.div>
  );
}

function EvalScore({ label, score }: { label: string; score: number }) {
  return (
    <div className="text-center space-y-2 bg-slate-50 p-4 rounded-2xl border border-slate-100">
      <span className="text-[8px] font-black uppercase tracking-widest text-slate-400 block">{label}</span>
      <div className="text-2xl font-black text-slate-900">{score}%</div>
      <div className="w-full h-1 bg-slate-200 rounded-full overflow-hidden">
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${score}%` }}
          transition={{ duration: 1, ease: "easeOut" }}
          className="h-full bg-indigo-600 rounded-full"
        />
      </div>
    </div>
  );
}
