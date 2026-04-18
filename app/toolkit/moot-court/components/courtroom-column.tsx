"use client";

import { useRef, useState } from "react";
import { motion } from "framer-motion";
import { FileText, Mic, Send, ShieldAlert, Upload, User, X } from "lucide-react";

import type { Attachment, Message } from "../types";
import type { ChangeEvent } from "react";

interface ColumnProps {
  title: string;
  role: "plaintiff" | "defendant";
  color: "blue" | "red";
  messages: Message[];
  input: string;
  setInput: (value: string) => void;
  onSend: (role: "plaintiff" | "defendant" | "witness", content: string) => void;
  onObjection: () => void;
  onFileUpload: (event: ChangeEvent<HTMLInputElement>) => void;
  attachedFile: Attachment | null;
  isAi: boolean;
  isActive: boolean;
  isListening: boolean;
  onStartListening: () => void;
  coachHint: string | null;
  isCoachMode: boolean;
  setCoachHint: (value: string | null) => void;
  scrollRef: (node: HTMLDivElement | null) => void;
}

export function Column({
  title,
  role,
  color,
  messages,
  input,
  setInput,
  onSend,
  onObjection,
  onFileUpload,
  attachedFile,
  isAi,
  isActive,
  isListening,
  onStartListening,
  coachHint,
  isCoachMode,
  setCoachHint,
  scrollRef,
}: ColumnProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isDictating, setIsDictating] = useState(false);
  const accentTextClass = color === "blue" ? "text-indigo-600" : "text-red-600";
  const focusRingClass = color === "blue" ? "focus:ring-indigo-600" : "focus:ring-red-600";
  const sendButtonClass = color === "blue" ? "bg-indigo-600" : "bg-red-600";
  const bgColor = color === "blue" ? "bg-indigo-50" : "bg-red-50";
  const borderColor = color === "blue" ? "border-indigo-100" : "border-red-100";

  return (
    <div className={`col-span-12 lg:col-span-3 flex flex-col gap-4 min-h-0 max-h-[calc(100vh-10rem)] overflow-hidden transition-all duration-700 ${isActive ? "scale-[1.01] z-10" : "opacity-60 saturate-[0.8]"}`}>
      <div className={`p-6 bg-white dark:bg-slate-900 border rounded-[2.5rem] flex flex-col gap-4 transition-all shadow-sm ${isActive ? "border-indigo-200 ring-4 ring-indigo-500/5 shadow-2xl" : "border-slate-100 dark:border-slate-800"}`}>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className={`p-3.5 bg-slate-50 dark:bg-slate-800 rounded-2xl shadow-inner ${accentTextClass}`}>
              {role === "plaintiff" ? <User size={22} /> : <ShieldAlert size={22} />}
            </div>
            <div>
              <h3 className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-400">{title}</h3>
              {isAi ? (
                <div className="flex items-center gap-1.5 mt-1">
                  <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></div>
                  <span className="text-[9px] font-black uppercase text-emerald-600 tracking-widest">AI Agent Active</span>
                </div>
              ) : (
                <div className="flex items-center gap-1.5 mt-1">
                  <div className="w-1.5 h-1.5 rounded-full bg-indigo-500"></div>
                  <span className="text-[9px] font-black uppercase text-indigo-600 tracking-widest">Human Counsel</span>
                </div>
              )}
            </div>
          </div>
          <div className="flex gap-2">
            {!isAi && isActive && (
              <>
                <input type="file" ref={fileInputRef} onChange={onFileUpload} accept=".pdf" className="hidden" />
                <button
                  onClick={() => fileInputRef.current?.click()}
                  className={`p-2.5 rounded-xl transition-all ${attachedFile ? "bg-indigo-600 text-white shadow-lg rotate-12" : "bg-slate-50 dark:bg-slate-800 text-slate-400 hover:text-indigo-600"}`}
                  title="Attach PDF Brief"
                >
                  <Upload size={16} />
                </button>
                <button
                  onClick={onStartListening}
                  className={`p-2.5 rounded-xl transition-all ${isListening ? "bg-red-500 text-white shadow-lg animate-pulse" : "bg-slate-50 dark:bg-slate-800 text-slate-400 hover:text-red-600"}`}
                  title="Voice Mode"
                >
                  <Mic size={16} />
                </button>
              </>
            )}
          </div>
        </div>

        {attachedFile && isActive && !isAi && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex items-center justify-between bg-indigo-50/50 dark:bg-indigo-900/20 px-4 py-2.5 rounded-2xl border border-indigo-100 dark:border-indigo-800"
          >
            <div className="flex items-center gap-3 overflow-hidden">
              <FileText size={14} className="text-indigo-600 shrink-0" />
              <span className="text-[10px] font-bold text-indigo-900 dark:text-indigo-200 truncate">{attachedFile.name}</span>
            </div>
            <button onClick={() => setInput("")} className="text-indigo-400 hover:text-indigo-600">
              <X size={14} />
            </button>
          </motion.div>
        )}
      </div>

      <div className={`flex-1 bg-white dark:bg-slate-900 border rounded-[2.5rem] shadow-[0_20px_50px_rgba(0,0,0,0.03)] flex flex-col overflow-hidden transition-all duration-500 ${isActive ? "border-indigo-100 ring-1 ring-indigo-50" : "border-slate-100 dark:border-slate-800"}`}>
        <div ref={scrollRef} className="flex-1 overflow-y-auto p-8 space-y-8 z-10 custom-scrollbar scroll-smooth">
          {coachHint && isCoachMode && (
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              className="bg-indigo-600/5 dark:bg-indigo-500/10 border-2 border-indigo-200/50 dark:border-indigo-500/20 p-6 rounded-[2.5rem] relative mb-10 group"
            >
              <div className="absolute -top-3 left-8 bg-indigo-600 text-white px-4 py-1.5 rounded-full text-[9px] font-black uppercase tracking-widest shadow-xl">AI Coach Whisper</div>
              <button onClick={() => setCoachHint(null)} className="absolute top-4 right-4 text-indigo-400 hover:text-indigo-600">
                <X size={14} />
              </button>
              <p className="text-sm font-semibold text-indigo-900 dark:text-indigo-100 leading-relaxed italic">&quot;{coachHint}&quot;</p>
            </motion.div>
          )}

          {messages.map((msg, idx) => (
            <motion.div
              initial={{ opacity: 0, x: role === "plaintiff" ? -10 : 10 }}
              animate={{ opacity: 1, x: 0 }}
              key={idx}
              className={`group relative flex flex-col ${msg.role === role ? "items-end" : "items-start"}`}
            >
              <div className="flex items-center gap-2 mb-2">
                <span className="text-[9px] font-black uppercase tracking-[0.2em] text-slate-400 opacity-60">{msg.role}</span>
                {msg.role !== role && !msg.isInadmissible && !isAi && isActive && (
                  <button
                    onClick={onObjection}
                    className="opacity-0 group-hover:opacity-100 transition-opacity bg-red-50 text-red-600 px-3 py-1 rounded-full text-[8px] font-black uppercase tracking-tighter hover:bg-red-600 hover:text-white"
                  >
                    Objection?
                  </button>
                )}
              </div>
              <div
                className={`max-w-[100%] p-5 rounded-3xl text-sm font-medium leading-relaxed shadow-sm transition-all ${
                  msg.role === "judge"
                    ? "bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800 text-slate-400 italic text-center"
                    : msg.role === "plaintiff"
                      ? "bg-indigo-600 text-white rounded-tl-none shadow-[0_10px_25px_rgba(79,70,229,0.2)]"
                      : "bg-red-600 text-white rounded-tr-none shadow-[0_10px_25px_rgba(220,38,38,0.2)]"
                } ${msg.isInadmissible ? "opacity-20 blur-[2px] grayscale" : ""}`}
              >
                {msg.content}
              </div>
              <span className="text-[8px] font-bold text-slate-300 mt-2 uppercase tracking-widest opacity-40">
                {new Date(msg.timestamp).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
              </span>
            </motion.div>
          ))}
        </div>

        <div className={`p-6 bg-slate-50 border-t border-slate-100 transition-all ${!isActive ? "grayscale" : ""}`}>
          <div className="relative group">
            <div className="flex gap-2 w-full">
              <textarea
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && !e.shiftKey) {
                    e.preventDefault();
                    onSend(role, input);
                  }
                }}
                placeholder={!isActive ? "Wait for your turn..." : isAi ? "AI processing arguments..." : "Enter argument..."}
                disabled={isAi || !isActive}
                className={`w-full bg-white border border-slate-200 rounded-2xl p-4 outline-none focus:ring-2 ${focusRingClass} transition-all text-sm font-medium resize-none shadow-inner h-24 ${isAi || !isActive ? "opacity-50 cursor-not-allowed" : ""}`}
              />
              <div className="flex flex-col gap-2">
                <button
                  disabled={isAi || !isActive}
                  title="Dictate argument"
                  onClick={() => {
                    if (isDictating) return;
                    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
                    if (!SpeechRecognition) {
                      alert("Voice dictation is not supported in this browser. Please use Chrome, Edge, or Safari.");
                      return;
                    }
                    const recognition = new SpeechRecognition();
                    recognition.continuous = false;
                    recognition.interimResults = true;
                    
                    recognition.onstart = () => setIsDictating(true);
                    recognition.onend = () => setIsDictating(false);
                    recognition.onerror = () => setIsDictating(false);
                    
                    recognition.onresult = (event: any) => {
                      const transcript = Array.from(event.results)
                        .map((res: any) => res[0].transcript)
                        .join("");
                      setInput(transcript);
                    };
                    
                    recognition.start();
                  }}
                  className={`p-3 ${isDictating ? "bg-red-100 text-red-600 animate-pulse" : "bg-slate-100 hover:bg-slate-200 text-slate-500"} rounded-xl transition-all active:scale-95 disabled:opacity-50 disabled:active:scale-100`}
                >
                  <Mic size={18} />
                </button>
                <button
                  disabled={!input.trim() || isAi || !isActive}
                  onClick={() => onSend(role, input)}
                  className={`p-3 h-full ${sendButtonClass} hover:opacity-90 text-white rounded-xl transition-all shadow-lg active:scale-95 disabled:opacity-50 disabled:active:scale-100`}
                >
                  <Send size={18} />
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
