"use client";

import { useState, useRef, useEffect } from "react";
import { Hammer, Send, User, Scale, Gavel, Trash2, ChevronLeft, Loader2, Building2, Landmark } from "lucide-react";
import Link from "next/link";

interface Message {
  role: "user" | "judge";
  content: string;
  court?: string;
}

type CourtType = "Supreme Court" | "High Court" | "District Court";

export default function MootCourtPage() {
  const [court, setCourt] = useState<CourtType>("High Court");
  const [messages, setMessages] = useState<Message[]>([
    {
      role: "judge",
      content: "Counsel, are you ready to present your proposition? Please state your core legal argument for our consideration.",
      court: "High Court"
    }
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim() || loading) return;

    const userMsg = input.trim();
    setInput("");
    setMessages((prev) => [...prev, { role: "user", content: userMsg }]);
    setLoading(true);

    try {
      const context = messages.slice(-4).map(m => `${m.role === 'judge' ? (m.court || 'Judge') : 'Counsel'}: ${m.content}`).join("\n");
      
      const res = await fetch("/api/toolkit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          tool: "moot-court",
          content: userMsg,
          context: context,
          court: court
        })
      });

      const data = await res.json();
      if (data.result) {
        setMessages((prev) => [...prev, { role: "judge", content: data.result, court: court }]);
      } else {
        throw new Error(data.error || "Failed to get judicial response");
      }
    } catch (err: unknown) {
      console.error(err);
      setMessages((prev) => [...prev, { role: "judge", content: "Apologies, Counsel, but there seems to be a procedural error. Could you repeat that last point?", court: court }]);
    } finally {
      setLoading(false);
    }
  };

  const resetSession = () => {
    setMessages([{ 
      role: "judge", 
      content: `Counsel, you are now appearing before the ${court}. Please state your core legal argument for our consideration.`,
      court: court
    }]);
  };

  return (
    <div className="min-h-screen bg-[#FDFCFB] pt-32 pb-24 px-4 sm:px-6">
      <div className="max-w-4xl mx-auto flex flex-col h-[85vh]">
        
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-6">
          <div className="flex items-center gap-4">
            <Link href="/toolkit" className="p-2 bg-white border border-slate-200 rounded-xl text-slate-400 hover:text-indigo-600 hover:border-indigo-100 transition shadow-sm">
              <ChevronLeft size={20} />
            </Link>
            <div>
              <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-3">
                <Hammer size={24} className="text-indigo-600" /> AI Moot Court
              </h1>
              <p className="text-sm text-slate-500 font-medium tracking-tight">Judicial Sparring Partner</p>
            </div>
          </div>

          <div className="flex items-center gap-2 p-1.5 bg-slate-100 rounded-2xl w-fit">
            {[
              { id: "District Court", icon: Building2 },
              { id: "High Court", icon: Landmark },
              { id: "Supreme Court", icon: Scale }
            ].map((c) => (
              <button
                key={c.id}
                onClick={() => {
                  const newCourt = c.id as CourtType;
                  setCourt(newCourt);
                  // If it's just the initial greeting, update it to reflect the selected court
                  if (messages.length === 1 && messages[0].role === 'judge') {
                    setMessages([{ 
                      role: "judge", 
                      content: `Counsel, you are now appearing before the ${newCourt}. Please state your core legal argument for our consideration.`,
                      court: newCourt 
                    }]);
                  }
                }}
                className={`flex items-center gap-2 px-4 py-2 rounded-xl text-[11px] font-black uppercase tracking-widest transition-all ${court === c.id ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-400 hover:text-slate-600'}`}
              >
                <c.icon size={14} />
                {c.id.split(' ')[0]}
              </button>
            ))}
          </div>

          <button 
            onClick={resetSession}
            className="hidden md:flex p-3 bg-white border border-slate-200 rounded-xl text-slate-400 hover:text-red-600 hover:border-red-100 transition shadow-sm"
            title="Reset Session"
          >
            <Trash2 size={20} />
          </button>
        </div>

        {/* Chat Area */}
        <div className="flex-1 bg-white border border-slate-200 rounded-[2.5rem] shadow-xl shadow-slate-200/50 flex flex-col overflow-hidden relative">
          
          {/* Decorative Background */}
          <div className="absolute inset-0 opacity-[0.02] pointer-events-none flex items-center justify-center">
            <Scale size={400} className="text-indigo-900" />
          </div>

          <div ref={scrollRef} className="flex-1 overflow-y-auto p-6 sm:p-10 space-y-8 custom-scrollbar">
            {messages.map((msg, idx) => (
              <div 
                key={idx} 
                className={`flex gap-4 ${msg.role === 'user' ? 'flex-row-reverse' : 'flex-row'} animate-in fade-in slide-in-from-bottom-4 duration-500`}
              >
                <div className={`w-12 h-12 rounded-2xl flex items-center justify-center flex-shrink-0 shadow-lg ${msg.role === 'judge' ? 'bg-indigo-900 text-white border-2 border-indigo-950' : 'bg-white border border-slate-200 text-slate-400'}`}>
                  {msg.role === 'judge' ? <Gavel size={24} /> : <User size={24} />}
                </div>
                <div className={`max-w-[85%] p-6 rounded-3xl ${msg.role === 'judge' ? 'bg-slate-50 border border-slate-100 text-slate-900 rounded-tl-none' : 'bg-indigo-600 text-white rounded-tr-none shadow-lg shadow-indigo-600/10'}`}>
                  <p className="text-sm sm:text-base leading-relaxed font-medium whitespace-pre-wrap">
                    {msg.content}
                  </p>
                  {msg.role === 'judge' && (
                    <div className="mt-4 pt-3 border-t border-slate-200/50 flex items-center justify-between">
                      <div className="text-[10px] uppercase font-black tracking-widest text-indigo-400">
                        {msg.court || "High Court"} Transcript
                      </div>
                      <div className="w-1.5 h-1.5 rounded-full bg-indigo-400 animate-pulse"></div>
                    </div>
                  )}
                </div>
              </div>
            ))}
            {loading && (
              <div className="flex gap-4 items-center">
                <div className="w-12 h-12 rounded-2xl bg-indigo-900 text-white flex items-center justify-center shadow-lg animate-pulse">
                  <Gavel size={24} />
                </div>
                <div className="bg-slate-50 border border-slate-100 p-4 rounded-3xl rounded-tl-none flex items-center gap-3">
                  <Loader2 size={16} className="text-indigo-600 animate-spin" />
                  <span className="text-sm font-bold text-slate-400 uppercase tracking-widest">Judge is considering...</span>
                </div>
              </div>
            )}
          </div>

          {/* Input Area */}
          <div className="p-6 sm:p-8 bg-slate-50 border-t border-slate-100">
            <div className="flex gap-4">
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                placeholder={`Appearing before ${court}... state your case.`}
                className="flex-1 bg-white border border-slate-200 rounded-2xl px-6 py-4 outline-none focus:ring-2 focus:ring-indigo-500 transition-all text-slate-900 font-medium placeholder:text-slate-400 shadow-inner"
              />
              <button 
                onClick={handleSend}
                disabled={!input.trim() || loading}
                className="w-14 h-14 bg-indigo-600 hover:bg-indigo-700 text-white rounded-2xl flex items-center justify-center shadow-lg shadow-indigo-600/20 transition-all active:scale-90 disabled:opacity-50 disabled:active:scale-100"
              >
                <Send size={24} />
              </button>
            </div>
            <div className="flex items-center justify-between mt-4">
              <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">
                Forum: {court}
              </p>
              <button onClick={resetSession} className="md:hidden text-[10px] text-red-400 font-bold uppercase tracking-widest hover:text-red-600">
                Reset Bench
              </button>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
