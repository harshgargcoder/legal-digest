"use client";

import React from "react";

/**
 * QuickMootModal Component
 * Offers choice between a pre-loaded Quick Moot and Custom Trial.
 */
export default function QuickMootModal({ onSelectQuickMoot, onSelectCustom }) {
  const defaultBrief = `
    CASE: Sharma vs. TechSolutions Pvt. Ltd. (Contract Dispute)
    
    FACTS: 
    1. Mr. Sharma (Petitioner) entered into a contract with TechSolutions (Respondent) for a custom ERP software for ₹25,00,000 on June 1, 2023.
    2. The deadline was Dec 1, 2023. TechSolutions delivered the beta on Feb 15, 2024.
    3. Petitioner alleges 15+ critical bugs causing ₹10,00,000 in operational losses.
    4. Respondent argues Petitioner changed specifications 12 times via WhatsApp, causing scope creep and delays.
    5. Petitioner has paid ₹15,00,000. TechSolutions demands the balance. Petitioner demands refund + damages.
    
    EVIDENCE: Contract dated 01/06/2023, Bug logs, WhatsApp chat records.
  `;

  return (
    <div className="fixed inset-0 z-[1000] flex items-center justify-center bg-slate-900/60 p-4 backdrop-blur-md">
      <div className="w-full max-w-4xl overflow-hidden rounded-[3rem] bg-white p-8 shadow-2xl sm:p-12">
        <div className="text-center mb-10">
          <h2 className="text-4xl font-black text-slate-950">Choose Your Path</h2>
          <p className="mt-4 text-slate-500 font-medium">Ready for battle or need more control?</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Quick Moot Card */}
          <div className="group flex flex-col rounded-[2.5rem] border border-indigo-100 bg-indigo-50/30 p-8 transition-all hover:-translate-y-2 hover:border-indigo-300 hover:bg-white hover:shadow-xl">
            <span className="text-4xl mb-4">⚡</span>
            <h3 className="text-2xl font-black text-slate-900">Quick Moot</h3>
            <p className="mt-3 text-sm font-medium text-slate-500 leading-relaxed">
              Pre-loaded: <strong>Sharma vs. TechSolutions</strong>. 
              A software contract dispute. Start in 10 seconds.
            </p>
            
            <div className="mt-8 flex gap-3">
              <button
                onClick={() => onSelectQuickMoot(defaultBrief, "Plaintiff")}
                className="flex-1 rounded-2xl bg-slate-950 py-4 text-[10px] font-black uppercase tracking-widest text-white transition-all hover:bg-indigo-600"
              >
                As Petitioner
              </button>
              <button
                onClick={() => onSelectQuickMoot(defaultBrief, "Defendant")}
                className="flex-1 rounded-2xl border-2 border-slate-950 py-4 text-[10px] font-black uppercase tracking-widest text-slate-950 transition-all hover:bg-slate-50"
              >
                As Respondent
              </button>
            </div>
          </div>

          {/* Custom Trial Card */}
          <button
            onClick={onSelectCustom}
            className="flex flex-col text-left rounded-[2.5rem] border border-slate-200 bg-slate-50 p-8 transition-all hover:-translate-y-2 hover:border-slate-300 hover:bg-white hover:shadow-xl"
          >
            <span className="text-4xl mb-4">🎛️</span>
            <h3 className="text-2xl font-black text-slate-900">Custom Trial</h3>
            <p className="mt-3 text-sm font-medium text-slate-500 leading-relaxed">
              Upload your own brief, set witness personas, and define court jurisdiction manually.
            </p>
            <div className="mt-auto pt-8">
              <span className="text-[10px] font-black uppercase tracking-widest text-indigo-600">
                Open Setup Studio →
              </span>
            </div>
          </button>
        </div>
      </div>
    </div>
  );
}
