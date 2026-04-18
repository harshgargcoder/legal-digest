"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import React, { type ReactNode } from "react";
import {
  ChevronLeft,
  ChevronRight,
  Gavel,
  Hammer,
  Info,
  Loader2,
  PlusCircle,
  RotateCcw,
  ScrollText,
  ShieldAlert,
  Trash2,
  Upload,
  User,
  Users,
  Globe,
} from "lucide-react";

import type { CaseType, Jurisdiction, MootCourtSession, RoleConfig, RoleType } from "../types";

const caseTypeToJurisdiction: Record<CaseType, Jurisdiction> = {
  Civil: "Indian Civil Courts (CPC/IEA)",
  Family: "Indian Civil Courts (CPC/IEA)",
  "Contract Dispute": "Indian Civil Courts (CPC/IEA)",
  Criminal: "Indian Criminal Courts (CrPC/IEA)",
  Constitutional: "Constitutional Courts",
};

interface SetupScreenProps {
  caseType: CaseType;
  setCaseType: (value: CaseType) => void;
  jurisdiction: Jurisdiction;
  setJurisdiction: (value: Jurisdiction) => void;
  roles: RoleConfig;
  setRoles: (value: RoleConfig) => void;
  witnessPersona: string;
  setWitnessPersona: (value: string) => void;
  counselStrategy: string;
  setCounselStrategy: (value: string) => void;
  difficulty: "Easy" | "Medium" | "Hard";
  setDifficulty: (value: "Easy" | "Medium" | "Hard") => void;
  isCoachMode: boolean;
  setIsCoachMode: (value: boolean) => void;
  setBrief: (value: File | null) => void;
  briefText: string;
  setBriefText: (value: string) => void;
  onStart: () => void;
  recentSessions: MootCourtSession[];
  onResumeSession: (session: MootCourtSession) => void;
  onDeleteSession: (sessionId: string) => void;
  isSaving: boolean;
}

export function SetupScreen({
  caseType,
  setCaseType,
  jurisdiction,
  setJurisdiction,
  roles,
  setRoles,
  witnessPersona,
  setWitnessPersona,
  counselStrategy,
  setCounselStrategy,
  difficulty,
  setDifficulty,
  isCoachMode,
  setIsCoachMode,
  setBrief,
  briefText,
  setBriefText,
  onStart,
  recentSessions,
  onResumeSession,
  onDeleteSession,
  isSaving,
}: SetupScreenProps) {
  const caseLibrary = [
    {
      title: "The Breach & The Build",
      jurisdiction: "Indian Civil Courts (CPC/IEA)" as Jurisdiction,
      type: "Contract Dispute" as CaseType,
      brief: "Plaintiff alleges the defendant failed to deliver a software project on time. Defendant argues scope creep and shifting requirements.",
    },
    {
      title: "Negligence in the Night",
      jurisdiction: "Indian Civil Courts (CPC/IEA)" as Jurisdiction,
      type: "Civil" as CaseType,
      brief: "A damage claim arising from an accident allegedly caused by faulty street lighting in a private housing society.",
    },
    {
      title: "State v. Merchant",
      jurisdiction: "Indian Criminal Courts (CrPC/IEA)" as Jurisdiction,
      type: "Criminal" as CaseType,
      brief: "The accused is charged with causing grievous hurt after a warehouse altercation. The defense disputes intent and identification.",
    },
    {
      title: "Statutory Silence",
      jurisdiction: "Constitutional Courts" as Jurisdiction,
      type: "Constitutional" as CaseType,
      brief: "Challenge to a regulation that allegedly infringes free speech through indirect financial penalties.",
    },
  ];

  const legalInsights = [
    { title: "The Golden Thread", content: "In criminal law, the 'Golden Thread' is the principle that the prosecution must prove the defendant's guilt beyond a reasonable doubt.", author: "Lord Sankey" },
    { title: "Ratio Decidendi", content: "This refers to the 'reason for the decision'—the legal principle upon which a court's judgment is based.", author: "Legal Maxim" },
    { title: "Audi Alteram Partem", content: "A fundamental principle of natural justice: 'Hear the other side.' No person should be judged without a fair hearing.", author: "Natural Justice" },
    { title: "Res Ipsa Loquitur", content: "The thing speaks for itself.' Used in negligence cases where the accident itself implies the defendant's fault.", author: "Tort Law" },
    { title: "Ignorantia Juris Non Excusat", content: "Ignorance of the law is no excuse. A person who is unaware of a law may not escape liability for violating that law.", author: "Legal Maxim" },
    { title: "Habeas Corpus", content: "A recourse in law through which a person can report an unlawful detention or imprisonment to a court.", author: "Constitutional Law" },
    { title: "Stare Decisis", content: "The legal principle of determining points in litigation according to precedent.", author: "Common Law" },
    { title: "Caveat Emptor", content: "Let the buyer beware. The principle that the buyer alone is responsible for checking the quality and suitability of goods before a purchase.", author: "Commercial Law" },
  ];

  const [insightIndex, setInsightIndex] = React.useState(new Date().getDate() % legalInsights.length);
  const [isRefreshingInsight, setIsRefreshingInsight] = React.useState(false);

  // Pagination for Recent Trials
  const [trialsPage, setTrialsPage] = React.useState(1);
  const trialsPageSize = 10;

  const refreshInsight = () => {
    setIsRefreshingInsight(true);
    setTimeout(() => {
      setInsightIndex((prev) => (prev + 1) % legalInsights.length);
      setIsRefreshingInsight(false);
    }, 800);
  };

  const dailyInsight = legalInsights[insightIndex];

  const applyCaseBrief = (type: CaseType, brief: string) => {
    setCaseType(type);
    setJurisdiction(caseTypeToJurisdiction[type]);
    setBriefText(brief);
  };

  const summaryPills = [
    { label: "Case Type", value: caseType },
    { label: "Jurisdiction", value: jurisdiction },
    { label: "Witness", value: witnessPersona },
    { label: "Difficulty", value: difficulty },
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="relative w-full min-h-[calc(100vh-1rem)] overflow-hidden px-4 py-4 sm:px-6 sm:py-6 lg:px-8 xl:px-10"
    >
      <div className="pointer-events-none absolute inset-0 -z-10 overflow-hidden">
        <div className="absolute -left-40 top-10 h-96 w-96 rounded-full bg-indigo-200/50 blur-3xl" />
        <div className="absolute right-0 top-32 h-[28rem] w-[28rem] rounded-full bg-sky-100/80 blur-3xl" />
        <div className="absolute bottom-0 left-1/4 h-80 w-80 rounded-full bg-amber-100/70 blur-3xl" />
      </div>

      <div className="relative mx-auto flex w-full max-w-[2200px] flex-col gap-6">
        <div className="flex flex-col gap-4 xl:flex-row xl:items-end xl:justify-between">
          <div className="flex items-start gap-4">
            <Link href="/toolkit" className="mt-1 inline-flex h-14 w-14 items-center justify-center rounded-2xl border border-slate-200 bg-white text-slate-400 shadow-sm transition hover:text-indigo-600">
              <ChevronLeft size={24} />
            </Link>
            <div className="space-y-3">
              <div className="flex flex-wrap items-center gap-3">
                <span className="inline-flex items-center gap-2 rounded-full border border-indigo-100 bg-indigo-50 px-3 py-1 text-[10px] font-black uppercase tracking-[0.28em] text-indigo-700">
                  <Hammer size={14} />
                  AI Moot Court
                </span>
                <span className="text-[10px] font-black uppercase tracking-[0.28em] text-slate-400">Phase 2: Core AI & Prompt Architecture</span>
              </div>
              <h1 className="text-4xl font-black tracking-tight text-slate-950 sm:text-5xl xl:text-6xl">Build the courtroom before the hearing starts.</h1>
              <p className="max-w-3xl text-sm font-medium leading-relaxed text-slate-500 sm:text-base">
                Set the case, route the AI by jurisdiction, choose who is human or AI, and load a brief so the trial begins with real context instead of a blank screen.
              </p>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
            {summaryPills.map((item) => (
              <div key={item.label} className="rounded-2xl border border-slate-200 bg-white/90 px-4 py-3 shadow-sm backdrop-blur">
                <div className="text-[9px] font-black uppercase tracking-[0.24em] text-slate-400">{item.label}</div>
                <div className="mt-1 text-sm font-bold text-slate-900">{item.value}</div>
              </div>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 mt-6">
          <div className="lg:col-span-8 flex flex-col gap-6 order-1">
            <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
              <div className="rounded-[2.75rem] border border-slate-200 bg-white/95 p-8 shadow-2xl shadow-slate-200/40 backdrop-blur">
                <div className="flex items-center justify-between gap-4 border-b border-slate-100 pb-5">
                  <div>
                    <div className="text-[11px] font-black uppercase tracking-[0.3em] text-slate-400">Trial Specifications</div>
                    <div className="mt-2 text-lg font-black text-slate-900">Case Setup Studio</div>
                  </div>
                  <div className="rounded-full border border-indigo-100 bg-indigo-50 px-3 py-1 text-[10px] font-black uppercase tracking-[0.24em] text-indigo-700">
                    Auto jurisdiction
                  </div>
                </div>

                <div className="mt-6 space-y-6">
                  <div className="space-y-4">
                    <label className="flex items-center gap-2 text-sm font-bold text-slate-700">
                      <ScrollText size={16} className="text-indigo-500" /> Case Type
                    </label>
                    <select
                      value={caseType}
                      onChange={(e) => {
                        const nextCase = e.target.value as CaseType;
                        setCaseType(nextCase);
                        setJurisdiction(caseTypeToJurisdiction[nextCase]);
                      }}
                      className="h-16 w-full appearance-none rounded-3xl border border-slate-200 bg-slate-50 px-6 text-base font-semibold text-slate-900 outline-none transition focus:ring-2 focus:ring-indigo-500"
                    >
                      {Object.keys(caseTypeToJurisdiction).map((t) => (
                        <option key={t} value={t}>
                          {t}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="space-y-4">
                    <label className="flex items-center gap-2 text-sm font-bold text-slate-700">
                      <Globe size={16} className="text-indigo-500" /> Jurisdiction
                    </label>
                    <div className="flex min-h-16 items-center rounded-3xl border border-slate-200 bg-slate-50 px-6 text-base font-semibold text-slate-900">
                      {jurisdiction}
                    </div>
                    <p className="text-xs font-medium leading-relaxed text-slate-500">Jurisdiction is derived automatically from the selected case type.</p>
                  </div>
                </div>

                <div className="mt-8 rounded-[2rem] border border-slate-100 bg-slate-50/80 p-5">
                  <label className="mb-4 block text-[10px] font-black uppercase tracking-[0.28em] text-slate-400">Case Brief (Facts & Evidence)</label>
                  <div className="rounded-[2rem] border-2 border-dashed border-slate-200 bg-white px-6 py-10 text-center transition hover:border-indigo-400">
                    <input type="file" className="hidden" id="brief-upload" onChange={(e) => setBrief(e.target.files?.[0] || null)} />
                    <label htmlFor="brief-upload" className="cursor-pointer">
                      <Upload size={46} className="mx-auto mb-4 text-slate-300 transition group-hover:text-indigo-500" />
                      <p className="text-sm font-bold text-slate-700">Upload PDF / DOCX</p>
                      <p className="mt-2 text-xs font-medium text-slate-400">Seed the AI with case facts and laws</p>
                    </label>
                  </div>
                </div>

                <div className="mt-6 space-y-3">
                  <label className="text-[10px] font-black uppercase tracking-[0.28em] text-slate-400">Case Brief Text</label>
                  <textarea
                    value={briefText}
                    onChange={(e) => setBriefText(e.target.value)}
                    placeholder="Write or paste the core brief here so the judge, counsel, and witness prompts can use it."
                    className="min-h-44 w-full resize-y rounded-[2rem] border border-slate-200 bg-slate-50 p-5 text-sm leading-relaxed text-slate-800 outline-none transition focus:ring-2 focus:ring-indigo-500"
                  />
                </div>



              </div>



              <div className="rounded-[2.75rem] border border-slate-200 bg-white/95 p-8 shadow-2xl shadow-slate-200/40 backdrop-blur">
                <div className="flex items-center justify-between border-b border-slate-100 pb-5">
                  <div>
                    <div className="text-[11px] font-black uppercase tracking-[0.3em] text-slate-400">AI Personality & Strategy</div>
                    <div className="mt-2 text-lg font-black text-slate-900">Courtroom Behavior Matrix</div>
                  </div>
                </div>

                <div className="mt-6 space-y-5">
                  <RoleToggle
                    label="Plaintiff / Prosecution"
                    current={roles.plaintiff}
                    onToggle={(v) => setRoles({ ...roles, plaintiff: v })}
                    icon={<User size={20} className="text-blue-600" />}
                  />
                  <RoleToggle
                    label="Defendant / Defense"
                    current={roles.defendant}
                    onToggle={(v) => setRoles({ ...roles, defendant: v })}
                    icon={<ShieldAlert size={20} className="text-red-600" />}
                  />
                  <RoleToggle
                    label="Witness Box"
                    current={roles.witness}
                    onToggle={(v) => setRoles({ ...roles, witness: v })}
                    icon={<Users size={20} className="text-amber-600" />}
                  />
                </div>

                <div className="mt-6 rounded-[2rem] border border-indigo-100 bg-indigo-50/70 p-5">
                  <div className="flex items-start gap-3">
                    <Info size={18} className="mt-0.5 flex-shrink-0 text-indigo-600" />
                    <p className="text-xs font-medium leading-relaxed text-indigo-800">
                      <strong>Advanced Prompt Architecture</strong>: AI behavior adapts to roles, personas, strategy, and the selected brief in real-time.
                    </p>
                  </div>
                </div>

                <div className="mt-6 grid grid-cols-1 gap-4">
                  <div className="space-y-3">
                    <label className="text-[10px] font-black uppercase tracking-[0.28em] text-slate-400">Witness Persona</label>
                    <select
                      value={witnessPersona}
                      onChange={(e) => setWitnessPersona(e.target.value)}
                      className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-xs font-bold outline-none transition focus:ring-2 focus:ring-indigo-500"
                    >
                      {["Cooperative", "Hostile", "Nervous", "Evasive"].map((p) => (
                        <option key={p} value={p}>
                          {p}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div className="space-y-3">
                    <label className="text-[10px] font-black uppercase tracking-[0.28em] text-slate-400">AI Counsel Strategy</label>
                    <select
                      value={counselStrategy}
                      onChange={(e) => setCounselStrategy(e.target.value)}
                      className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-xs font-bold outline-none transition focus:ring-2 focus:ring-indigo-500"
                    >
                      {["Aggressive Case Building", "Constitutional Focus", "Fact-Driven Defense", "Procedural Technicality"].map((s) => (
                        <option key={s} value={s}>
                          {s}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="mt-6 grid grid-cols-1 gap-4">
                  <div className="space-y-3">
                    <label className="text-[10px] font-black uppercase tracking-[0.28em] text-slate-400">Difficulty</label>
                    <div className="grid grid-cols-3 gap-2">
                      {(["Easy", "Medium", "Hard"] as const).map((level) => (
                        <button
                          key={level}
                          onClick={() => setDifficulty(level)}
                          className={`rounded-xl border px-3 py-3 text-[10px] font-black uppercase tracking-[0.24em] transition-all ${difficulty === level ? "border-slate-900 bg-slate-900 text-white shadow-md" : "border-slate-200 bg-white text-slate-500 hover:border-indigo-200"
                            }`}
                        >
                          {level}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="space-y-3">
                    <label className="text-[10px] font-black uppercase tracking-[0.28em] text-slate-400">Coach Mode</label>
                    <button
                      onClick={() => setIsCoachMode(!isCoachMode)}
                      className={`flex h-full w-full items-center justify-center rounded-2xl border px-4 py-4 text-[10px] font-black uppercase tracking-[0.24em] transition-all ${isCoachMode ? "border-indigo-600 bg-indigo-600 text-white shadow-lg" : "border-slate-200 bg-white text-slate-500 hover:border-indigo-200"
                        }`}
                    >
                      {isCoachMode ? "Coach Enabled" : "Coach Disabled"}
                    </button>
                  </div>
                </div>
              </div>
            </div>

            <div className="rounded-[2.75rem] border border-slate-200 bg-white/95 p-8 shadow-2xl shadow-slate-200/40 backdrop-blur">
              <div className="flex items-center justify-between border-b border-slate-100 pb-5">
                <div>
                  <div className="text-[11px] font-black uppercase tracking-[0.3em] text-slate-400">Case Library</div>
                  <div className="mt-2 text-lg font-black text-slate-900">Pre-Configured Samples</div>
                </div>
                <span className="text-[10px] font-bold uppercase tracking-[0.24em] text-slate-400">Quick Start</span>
              </div>
              <div className="mt-6 flex gap-4 overflow-x-auto pb-4 custom-scrollbar">
                {caseLibrary.map((item) => (
                  <button
                    key={item.title}
                    onClick={() => applyCaseBrief(item.type, item.brief)}
                    className="group flex-shrink-0 w-80 rounded-[1.75rem] border border-slate-200 bg-slate-50 p-5 text-left transition-all hover:-translate-y-1 hover:border-indigo-300 hover:bg-white hover:shadow-lg"
                  >
                    <div className="flex items-center justify-between gap-3">
                      <div className="text-sm font-black text-slate-900">{item.title}</div>
                      <div className="text-[9px] font-black uppercase tracking-[0.2em] px-2 py-0.5 bg-indigo-50 text-indigo-600 rounded-md">{item.type}</div>
                    </div>
                    <p className="mt-3 line-clamp-2 text-xs leading-relaxed text-slate-500">{item.brief}</p>
                    <div className="mt-4 flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.24em] text-indigo-500 opacity-0 transition-opacity group-hover:opacity-100">
                      <span>Apply Brief</span>
                      <PlusCircle size={12} />
                    </div>
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Right Sidebar: Recent Trials, Insight, and Start */}
          <div className="lg:col-span-4 sticky top-32 self-start order-2 lg:order-2 flex flex-col gap-6">
            <div className="flex flex-col rounded-[2.75rem] border border-slate-200 bg-white/95 p-8 shadow-2xl shadow-slate-200/40 backdrop-blur overflow-hidden">
              <div className="flex items-center justify-between">
                <div>
                  <label className="block text-[11px] font-black uppercase tracking-[0.3em] text-slate-400">Recent Trials</label>
                  <h3 className="mt-2 text-xl font-black text-slate-900">Session History</h3>
                </div>
                <div className="rounded-full border border-slate-200 bg-slate-50 px-3 py-1 text-[10px] font-black uppercase tracking-[0.24em] text-slate-500">
                  {recentSessions.length} saved
                </div>
              </div>

              <div className="mt-6 flex-1 space-y-4 overflow-y-auto pr-1 custom-scrollbar">
                {recentSessions.length > 0 ? (
                  <>
                    <div className="space-y-4">
                      {recentSessions.slice((trialsPage - 1) * trialsPageSize, trialsPage * trialsPageSize).map((session) => {
                        const isCompleted = !!session.evaluation;
                        return (
                          <div
                            key={session.id}
                            onClick={() => !isCompleted && onResumeSession(session)}
                            className={`group rounded-[2rem] border p-5 shadow-sm transition-all ${
                              isCompleted
                                ? "border-slate-100 bg-slate-50 cursor-default opacity-70"
                                : "border-slate-200 bg-white cursor-pointer hover:-translate-y-0.5 hover:border-indigo-200 hover:shadow-md"
                            }`}
                          >
                            <div className="mb-3 flex items-start justify-between gap-3">
                              <div className="flex items-center gap-2">
                                <span className="rounded-full bg-slate-100 px-3 py-1 text-[10px] font-black uppercase tracking-[0.24em] text-slate-500 transition-colors group-hover:bg-indigo-50 group-hover:text-indigo-600">
                                  {session.case_type}
                                </span>
                                {isCompleted && (
                                  <span className="rounded-full bg-emerald-100 px-3 py-1 text-[10px] font-black uppercase tracking-[0.24em] text-emerald-600">
                                    Completed
                                  </span>
                                )}
                              </div>
                              <span className="text-[10px] font-bold text-slate-400">{new Date(session.created_at).toLocaleDateString()}</span>
                            </div>
                            <h4 className="text-base font-black text-slate-900">Mock Trial Session</h4>
                            <p className="mt-2 text-sm leading-relaxed text-slate-500 line-clamp-2">
                              {isCompleted ? "This trial has concluded. View evaluation in your history." : "Resume this courtroom record or use it as a reference."}
                            </p>
                            <div className="mt-4 flex items-center justify-between opacity-0 transition-opacity group-hover:opacity-100">
                              {!isCompleted && (
                                <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.24em] text-indigo-500">
                                  <span>Resume Transcript</span>
                                  <PlusCircle size={12} />
                                </div>
                              )}
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  onDeleteSession(session.id);
                                }}
                                className="p-1.5 rounded-lg text-slate-400 hover:bg-red-50 hover:text-red-600 transition-all ml-auto"
                                title="Delete session"
                              >
                                <Trash2 size={14} />
                              </button>
                            </div>
                        </div>
                        );
                      })}
                    </div>

                    {recentSessions.length > trialsPageSize && (
                      <div className="flex items-center justify-between gap-2 mt-6 pt-6 border-t border-slate-100">
                        <button
                          onClick={() => setTrialsPage(p => Math.max(1, p - 1))}
                          disabled={trialsPage === 1}
                          className="p-2 rounded-xl border border-slate-200 bg-white text-slate-400 disabled:opacity-30 hover:text-indigo-600 transition-all"
                        >
                          <ChevronLeft size={16} />
                        </button>
                        <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">
                          {trialsPage} / {Math.ceil(recentSessions.length / trialsPageSize)}
                        </span>
                        <button
                          onClick={() => setTrialsPage(p => Math.min(Math.ceil(recentSessions.length / trialsPageSize), p + 1))}
                          disabled={trialsPage === Math.ceil(recentSessions.length / trialsPageSize)}
                          className="p-2 rounded-xl border border-slate-200 bg-white text-slate-400 disabled:opacity-30 hover:text-indigo-600 transition-all"
                        >
                          <ChevronRight size={16} />
                        </button>
                      </div>
                    )}
                  </>
                ) : (
                  <div className="flex min-h-[400px] items-center justify-center rounded-[2rem] border-2 border-dashed border-slate-200 bg-slate-50 p-10 text-center">
                    <div>
                      <RotateCcw size={32} className="mx-auto mb-4 text-slate-200" />
                      <p className="px-4 text-xs font-bold text-slate-400">No recent trials found. Start a new session to begin your record.</p>
                    </div>
                  </div>
                )}
              </div>
            </div>

            <div className="rounded-[2.5rem] bg-gradient-to-br from-indigo-600 to-slate-900 p-8 text-white shadow-xl relative overflow-hidden">
              <div className="absolute top-0 right-0 p-6">
                <button
                  onClick={refreshInsight}
                  disabled={isRefreshingInsight}
                  className="text-indigo-300 hover:text-white transition-colors"
                >
                  <RotateCcw size={16} className={isRefreshingInsight ? "animate-spin" : ""} />
                </button>
              </div>
              <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.28em] text-indigo-200">
                <ScrollText size={16} />
                Legal Insight
              </div>
              {isRefreshingInsight ? (
                <div className="mt-8 flex items-center justify-center py-4">
                  <Loader2 className="animate-spin text-indigo-300" size={24} />
                </div>
              ) : (
                <motion.div
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  key={insightIndex}
                >
                  <h4 className="mt-4 text-xl font-black leading-tight text-white">{dailyInsight.title}</h4>
                  <p className="mt-3 text-sm leading-relaxed text-indigo-100/90 italic">"{dailyInsight.content}"</p>
                  <div className="mt-6 flex items-center justify-between">
                    <span className="text-xs font-bold text-indigo-300">— {dailyInsight.author}</span>
                    <div className="flex gap-1">
                      <div className="h-1.5 w-1.5 rounded-full bg-indigo-400" />
                      <div className="h-1.5 w-1.5 rounded-full bg-indigo-400/50" />
                      <div className="h-1.5 w-1.5 rounded-full bg-indigo-400/20" />
                    </div>
                  </div>
                </motion.div>
              )}
            </div>

            <button
              onClick={onStart}
              disabled={isSaving}
              className="flex w-full items-center justify-center gap-3 rounded-[2.5rem] bg-slate-950 px-6 py-6 text-base font-black uppercase tracking-[0.24em] text-white shadow-2xl shadow-indigo-200 transition-all active:scale-[0.99] hover:bg-indigo-600 disabled:opacity-50"
            >
              {isSaving ? <Loader2 className="animate-spin" /> : <Gavel size={20} />}
              {isSaving ? "Initializing Session..." : "Begin Court Session"}
            </button>
          </div>
        </div>
      </div>
    </motion.div>
  );
}

function RoleToggle({ label, current, onToggle, icon }: { label: string; current: RoleType; onToggle: (value: RoleType) => void; icon: ReactNode }) {
  return (
    <div className="flex items-center justify-between p-4 bg-slate-50 border border-slate-200 rounded-2xl">
      <div className="flex items-center gap-3">
        {icon}
        <span className="text-sm font-bold text-slate-700">{label}</span>
      </div>
      <div className="flex bg-white rounded-xl p-1 border border-slate-200">
        {["Human", "AI"].map((r) => (
          <button
            key={r}
            onClick={() => onToggle(r as RoleType)}
            className={`px-4 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-tighter transition-all ${current === r ? "bg-slate-900 text-white shadow-md" : "text-slate-400 hover:text-slate-600"}`}
          >
            {r}
          </button>
        ))}
      </div>
    </div>
  );
}
