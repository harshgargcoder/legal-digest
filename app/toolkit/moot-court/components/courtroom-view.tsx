"use client";

import { motion } from "framer-motion";
import type { ChangeEvent } from "react";
import { Gavel, Loader2, Mic, MicOff, Pause, RotateCcw, Send, ShieldAlert, UserPlus, Users, X, Scale } from "lucide-react";

import { Column } from "./courtroom-column";
import type { Attachment, Message, RoleConfig, TrialPhase } from "../types";

interface CourtroomViewProps {
  trialPhase: TrialPhase;
  activeTurn: string;
  roles: RoleConfig;
  messages: Message[];
  plaintiffInput: string;
  setPlaintiffInput: (value: string) => void;
  defendantInput: string;
  setDefendantInput: (value: string) => void;
  witnessInput: string;
  setWitnessInput: (value: string) => void;
  onSend: (role: "plaintiff" | "defendant" | "witness", content: string) => void;
  onObjection: () => void;
  isJudgeThinking: boolean;
  isAudioMode: boolean;
  setIsAudioMode: (value: boolean) => void;
  isSummoningWitness: boolean;
  setIsSummoningWitness: (value: boolean) => void;
  isListening: string | null;
  onStartListening: (role: "plaintiff" | "defendant" | "witness") => void;
  isCoachMode: boolean;
  coachHint: string | null;
  setCoachHint: (value: string | null) => void;
  isPaused: boolean;
  setIsPaused: (value: boolean) => void;
  isOnline: boolean;
  plaintiffScrollRef: (node: HTMLDivElement | null) => void;
  centerScrollRef: (node: HTMLDivElement | null) => void;
  defendantScrollRef: (node: HTMLDivElement | null) => void;
  onFinish: () => void;
  onNextPhase: () => void;
  onFileUpload: (event: ChangeEvent<HTMLInputElement>) => void;
  attachedFile: Attachment | null;
}

export function CourtroomView({
  trialPhase,
  activeTurn,
  roles,
  messages,
  plaintiffInput,
  setPlaintiffInput,
  defendantInput,
  setDefendantInput,
  witnessInput,
  setWitnessInput,
  onSend,
  onObjection,
  isJudgeThinking,
  isAudioMode,
  setIsAudioMode,
  isSummoningWitness,
  setIsSummoningWitness,
  isListening,
  onStartListening,
  isCoachMode,
  coachHint,
  setCoachHint,
  isPaused,
  setIsPaused,
  isOnline,
  plaintiffScrollRef,
  centerScrollRef,
  defendantScrollRef,
  onFinish,
  onNextPhase,
  onFileUpload,
  attachedFile,
}: CourtroomViewProps) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="flex h-full min-h-[calc(100vh-5rem)] w-full flex-col overflow-hidden px-4 pb-8 pt-4 sm:px-6 xl:px-8 bg-[#FDFDFF] dark:bg-slate-950"
    >
      <div className="mb-4 flex items-center justify-between gap-4 px-2">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2 p-1 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl shadow-sm">
            <span className="px-3 py-1 bg-indigo-600 text-white rounded-lg text-[9px] font-black uppercase tracking-widest">
              Phase {trialPhase.split(' ')[0]}
            </span>
            <div
              className={`flex items-center gap-2 px-3 py-1 rounded-lg cursor-pointer transition-all ${isAudioMode ? "bg-amber-50 text-amber-700" : "text-slate-400 hover:text-slate-600"}`}
              onClick={() => setIsAudioMode(!isAudioMode)}
            >
              {isAudioMode ? <Mic size={12} className="animate-pulse" /> : <MicOff size={12} />}
              <span className="text-[9px] font-black uppercase tracking-widest">{isAudioMode ? "Voice Live" : "Text Only"}</span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button onClick={onNextPhase} className="flex items-center gap-2 px-6 py-2.5 bg-slate-900 text-white hover:bg-indigo-600 rounded-xl transition-all shadow-lg font-black text-[9px] uppercase tracking-widest group">
            <RotateCcw size={12} className="group-hover:rotate-180 transition-transform duration-500" />
            {trialPhase === "Closing Arguments" ? "Final Verdict" : "Next Phase"}
          </button>
        </div>
      </div>

      <div className="grid flex-1 min-h-0 grid-cols-12 gap-6 overflow-hidden">
        <Column
          title="Plaintiff / Prosecution"
          role="plaintiff"
          color="blue"
          messages={messages.filter((m) => m.role === "plaintiff" || (m.role === "judge" && m.content.toLowerCase().includes("petitioner")))}
          input={plaintiffInput}
          setInput={setPlaintiffInput}
          onSend={onSend}
          onObjection={onObjection}
          isAi={roles.plaintiff === "AI"}
          isActive={activeTurn === "plaintiff"}
          isListening={isListening === "plaintiff"}
          onStartListening={() => onStartListening("plaintiff")}
          coachHint={coachHint}
          isCoachMode={isCoachMode}
          setCoachHint={setCoachHint}
          scrollRef={plaintiffScrollRef}
          onFileUpload={onFileUpload}
          attachedFile={attachedFile}
        />

        <div className="col-span-12 flex flex-col gap-4 overflow-hidden lg:col-span-6 min-h-0 max-h-[calc(100vh-10rem)]">
          <div className={`flex-1 bg-white dark:bg-slate-900 border rounded-[3.5rem] shadow-[0_30px_100px_rgba(0,0,0,0.05)] flex flex-col overflow-hidden relative group transition-all duration-700 ${activeTurn === "judge" ? "ring-2 ring-indigo-500/20 border-indigo-200" : "border-slate-200/60"}`}>
            <div className="absolute inset-0 bg-[radial-gradient(#e5e7eb_1px,transparent_1px)] [background-size:20px_20px] opacity-[0.15]"></div>
            <div className="absolute top-10 left-1/2 -translate-x-1/2 flex flex-col items-center z-20">
              <div className={`p-5 rounded-[2rem] shadow-2xl mb-3 border-4 transition-all duration-700 ${activeTurn === "judge" ? "bg-indigo-600 text-white border-indigo-400 scale-110 rotate-3" : "bg-slate-950 text-white border-slate-800"}`}>
                <Gavel size={32} />
              </div>
              <h2 className="text-[9px] font-black uppercase tracking-[0.4em] text-slate-400 bg-white/90 dark:bg-slate-800 backdrop-blur-md px-5 py-1.5 rounded-full border border-slate-100 dark:border-slate-700 shadow-sm">AI Presiding Judge</h2>
            </div>

            <div ref={centerScrollRef} className="flex-1 overflow-y-auto p-12 pt-44 space-y-10 z-10 custom-scrollbar scroll-smooth relative">
              {isPaused && (
                <div className="absolute inset-0 z-30 flex items-center justify-center bg-white/40 dark:bg-slate-900/40 backdrop-blur-sm">
                  <motion.div
                    initial={{ scale: 0.9, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    className="bg-slate-900 text-white px-8 py-4 rounded-[2rem] flex flex-col items-center gap-2 shadow-2xl border border-slate-700"
                  >
                    <div className="flex items-center gap-4">
                      {isOnline ? <Pause size={24} className="animate-pulse" /> : <ShieldAlert size={24} className="text-red-500 animate-pulse" />}
                      <span className="text-sm font-black uppercase tracking-[0.3em]">{isOnline ? "Trial Paused" : "Internet Disrupted"}</span>
                    </div>
                    {!isOnline && <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Waiting for connectivity...</span>}
                  </motion.div>
                </div>
              )}
              {messages
                .filter((m) => m.role === "judge" || m.role === "system" || m.role === "witness")
                .map((msg, idx) => (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    key={idx}
                    className="flex flex-col items-center"
                  >
                    <span className="text-[9px] font-black uppercase tracking-[0.2em] text-slate-400 mb-2">
                      {msg.role === "system" ? "System" : msg.role === "witness" ? "Witness" : "Judge"}
                    </span>
                    <div
                      className={`max-w-[90%] p-5 rounded-2xl text-sm font-medium leading-relaxed shadow-sm ${
                        msg.role === "system"
                          ? "bg-amber-50 border border-amber-200 text-amber-800 text-center"
                          : msg.role === "witness"
                          ? "bg-emerald-50 border border-emerald-200 text-emerald-900"
                          : "bg-slate-900 text-white border border-slate-800"
                      }`}
                    >
                      {msg.content}
                    </div>
                    <span className="text-[8px] font-bold text-slate-300 mt-1.5 uppercase tracking-widest opacity-40">
                      {new Date(msg.timestamp).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                    </span>
                  </motion.div>
                ))}
              {isJudgeThinking && (
                <div className="flex flex-col items-center gap-6 py-12">
                  <div className="relative">
                    <Loader2 size={32} className="text-indigo-600 animate-spin" />
                    <div className="absolute inset-0 blur-lg bg-indigo-500/20 animate-pulse"></div>
                  </div>
                  <span className="text-[10px] font-black uppercase tracking-[0.3em] text-indigo-400 animate-pulse">The Bench is Deliberating...</span>
                </div>
              )}
            </div>

            <div className="flex justify-center gap-3 border-t border-slate-100 dark:border-slate-800 bg-white/80 dark:bg-slate-900/80 p-5 backdrop-blur-md z-20">
              <button
                onClick={() => setIsPaused(!isPaused)}
                className={`flex-1 py-4 border rounded-2xl flex items-center justify-center gap-2 transition-all font-black text-[9px] uppercase tracking-widest shadow-sm ${isPaused ? "bg-amber-100 border-amber-200 text-amber-700" : "bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-500 hover:bg-white"}`}
              >
                {isPaused ? <RotateCcw size={14} /> : <Pause size={14} />}
                {isPaused ? "Resume" : "Pause"}
              </button>
              <button
                onClick={onObjection}
                className="flex-[1.5] py-4 bg-red-600 text-white rounded-2xl shadow-xl shadow-red-200 flex items-center justify-center gap-2 hover:bg-red-700 transition-all font-black text-[9px] uppercase tracking-widest border-2 border-red-500"
              >
                <ShieldAlert size={14} className="animate-shake" />
                Objection!
              </button>
              <button
                onClick={onFinish}
                className="flex-1 py-4 bg-slate-900 text-white rounded-2xl shadow-xl flex items-center justify-center gap-2 hover:bg-slate-800 transition-all font-black text-[9px] uppercase tracking-widest"
              >
                <Gavel size={14} /> End Trial
              </button>
            </div>
          </div>

          <div className={`transition-all duration-700 ease-in-out ${trialPhase === "Witness Examination" ? (isSummoningWitness ? "h-72 opacity-100" : "h-20 opacity-100") : "h-0 opacity-0 pointer-events-none"}`}>
            <div className="relative flex h-full flex-col items-center justify-center overflow-hidden rounded-[2.5rem] border-2 border-dashed border-amber-200 bg-amber-50 group">
              {!isSummoningWitness ? (
                <button onClick={() => setIsSummoningWitness(true)} className="flex items-center gap-3 rounded-2xl bg-amber-600 px-8 py-3 text-[10px] font-black uppercase tracking-[0.2em] text-white shadow-xl transition-all hover:bg-amber-700">
                  <UserPlus size={16} /> Summon AI Witness
                </button>
              ) : (
                <div className="w-full h-full p-6 flex flex-col">
                  <div className="mb-4 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-amber-600 text-white rounded-xl">
                        <Users size={16} />
                      </div>
                      <div>
                        <span className="text-[10px] font-black uppercase tracking-widest text-amber-700 block">Witness Stand</span>
                        <span className="text-xs font-bold text-amber-900">AI-Controlled Eyewitness</span>
                      </div>
                    </div>
                    <button onClick={() => setIsSummoningWitness(false)} className="text-amber-400 hover:text-amber-700">
                      <X size={20} />
                    </button>
                  </div>
                  <div className="mb-4 flex-1 overflow-y-auto rounded-2xl border border-amber-100 bg-white/60 p-4 custom-scrollbar">
                    <p className="text-xs font-medium text-amber-600 italic text-center py-4">The witness is on the stand and ready to answer your questions.</p>
                  </div>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={witnessInput}
                      onChange={(e) => setWitnessInput(e.target.value)}
                      onKeyDown={(e) => e.key === "Enter" && onSend(activeTurn as "plaintiff" | "defendant" | "witness", witnessInput)}
                      placeholder="Ask the witness a question..."
                      className="flex-1 bg-white border border-amber-200 rounded-xl px-4 py-2 text-sm outline-none focus:ring-2 focus:ring-amber-500"
                    />
                    <button onClick={() => onStartListening("witness")} className={`p-2 rounded-xl transition-all ${isListening === "witness" ? "bg-red-500 text-white animate-pulse" : "bg-amber-100 text-amber-600 hover:bg-amber-200"}`}>
                      <Mic size={16} />
                    </button>
                    <button onClick={() => onSend(activeTurn as "plaintiff" | "defendant" | "witness", witnessInput)} className="p-2 bg-amber-600 text-white rounded-xl hover:bg-amber-700">
                      <Send size={16} />
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

          <Column
            title="Defendant / Defense"
            role="defendant"
          color="red"
          messages={messages.filter((m) => m.role === "defendant" || (m.role === "judge" && m.content.toLowerCase().includes("respondent")))}
          input={defendantInput}
          setInput={setDefendantInput}
          onSend={onSend}
          onObjection={onObjection}
          isAi={roles.defendant === "AI"}
          isActive={activeTurn === "defendant"}
          isListening={isListening === "defendant"}
          onStartListening={() => onStartListening("defendant")}
          coachHint={coachHint}
          isCoachMode={isCoachMode}
          setCoachHint={setCoachHint}
          scrollRef={defendantScrollRef}
          onFileUpload={onFileUpload}
          attachedFile={attachedFile}
        />
      </div>
    </motion.div>
  );
}
