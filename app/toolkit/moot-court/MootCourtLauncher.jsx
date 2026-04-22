"use client";

import React, { useState, useEffect } from "react";
import WarningModal from "./components/WarningModal";
import QuickMootModal from "./components/QuickMootModal";
import TokenMeter from "./components/TokenMeter";
import useMootCourt from "./hooks/useMootCourt";

/**
 * MootCourtLauncher Component
 * Orchestrates the full user journey: Disclaimer -> Mode Selection -> Simulation.
 */
export default function MootCourtLauncher() {
  const [step, setStep] = useState("warning"); // warning, choice, trial
  const [config, setConfig] = useState({ brief: "", side: "" });
  
  // Custom hook (initialised with dummy data, updated when trial starts)
  const moot = useMootCourt(config.brief, config.side);

  useEffect(() => {
    const accepted = localStorage.getItem("aiWarningAccepted");
    if (accepted === "true") {
      setStep("choice");
    }
  }, []);

  const handleWarningAccept = () => setStep("choice");
  const handleWarningDecline = () => (window.location.href = "/");

  const handleStartQuickMoot = (brief, side) => {
    setConfig({ brief, side });
    setStep("trial");
  };

  const handleOpenCustom = () => {
    alert("Opening Custom Setup Studio...");
    // Integration point for existing full setup form
  };

  if (step === "warning") {
    return <WarningModal onAccept={handleWarningAccept} onClose={handleWarningDecline} />;
  }

  if (step === "choice") {
    return (
      <QuickMootModal 
        onSelectQuickMoot={handleStartQuickMoot} 
        onSelectCustom={handleOpenCustom} 
      />
    );
  }

  return (
    <div className="flex min-h-screen flex-col bg-slate-50 p-6 font-sans text-slate-900">
      {/* Header */}
      <header className="mb-8 flex items-center justify-between border-b border-slate-200 pb-6">
        <div>
          <h1 className="text-2xl font-black uppercase tracking-tighter">AI Moot Court Session</h1>
          <p className="text-sm font-medium text-slate-500">Case: {config.brief.substring(0, 50)}...</p>
        </div>
        <div className="w-64">
          <TokenMeter usedTokens={moot.usedTokens} />
        </div>
      </header>

      {/* Main UI */}
      <main className="flex flex-1 gap-8 overflow-hidden">
        {/* Sidebar / Brief */}
        <aside className="w-80 overflow-y-auto rounded-[2rem] bg-white p-6 shadow-sm">
          <h2 className="mb-4 text-xs font-black uppercase tracking-widest text-slate-400">Case Brief</h2>
          <div className="text-sm font-medium leading-relaxed text-slate-600 whitespace-pre-wrap">
            {config.brief}
          </div>
        </aside>

        {/* Courtroom / Messages */}
        <section className="flex flex-1 flex-col rounded-[2rem] bg-white p-8 shadow-sm">
          <div className="flex-1 overflow-y-auto space-y-6 pr-4">
            {moot.messages.length === 0 && (
              <div className="flex h-full items-center justify-center text-slate-300 italic">
                Court is in session. Petitioner, lead the way.
              </div>
            )}
            {moot.messages.map((m, i) => (
              <div key={i} className={`flex flex-col ${m.role === config.side.toLowerCase() ? "items-end" : "items-start"}`}>
                <span className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1">
                  {m.role}
                </span>
                <div className={`max-w-[80%] rounded-2xl px-5 py-3 text-sm font-medium leading-relaxed ${
                  m.role === "judge" ? "bg-slate-900 text-white" : 
                  m.role === config.side.toLowerCase() ? "bg-indigo-600 text-white" : "bg-slate-100 text-slate-800"
                }`}>
                  {m.content}
                </div>
              </div>
            ))}
            {moot.isProcessing && (
              <div className="flex items-center gap-2 text-indigo-500 animate-pulse text-xs font-bold">
                Judge is deliberating...
              </div>
            )}
            {moot.error && (
              <div className="rounded-xl bg-red-50 p-4 text-xs font-bold text-red-600 border border-red-100">
                {moot.error}
              </div>
            )}
          </div>

          {/* Input Area */}
          <div className="mt-8 border-t border-slate-100 pt-6">
            <div className="flex gap-3">
              <input
                id="trial-input"
                type="text"
                placeholder="Enter your argument or question..."
                className="flex-1 rounded-2xl bg-slate-50 px-6 py-4 text-sm font-medium outline-none focus:ring-2 focus:ring-indigo-500"
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    moot.submitArgument(e.target.value);
                    e.target.value = "";
                  }
                }}
              />
              <button
                onClick={() => {
                  const input = document.getElementById("trial-input");
                  moot.submitArgument(input.value);
                  input.value = "";
                }}
                disabled={moot.isProcessing}
                className="rounded-2xl bg-slate-950 px-8 py-4 text-sm font-black uppercase tracking-widest text-white transition-all hover:bg-indigo-600 disabled:opacity-50"
              >
                Send
              </button>
            </div>
            <div className="mt-4 flex gap-4">
              <button onClick={() => moot.object("Irrelevant")} className="text-[10px] font-black uppercase tracking-widest text-red-500 hover:underline">
                Objection
              </button>
              <button onClick={moot.reportBug} className="text-[10px] font-black uppercase tracking-widest text-slate-400 hover:underline">
                Report Bug
              </button>
              <button onClick={moot.resetSession} className="text-[10px] font-black uppercase tracking-widest text-slate-400 hover:underline ml-auto">
                Reset
              </button>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}
