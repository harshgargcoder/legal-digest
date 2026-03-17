"use client";

import { useState, useEffect } from "react";
import { X, Search, Check, ChevronRight, Globe, Shield, Landmark, Scale, BookOpen, Building2, Activity, Trophy, Search as SearchIcon, Gavel, Users } from "lucide-react";

interface Props {
  isOpen: boolean;
  onClose: () => void;
  userId: string;
  onComplete: (preferences: any) => void;
}

const categories = [
  { name: "Supreme Court", icon: Landmark },
  { name: "High Court", icon: Scale },
  { name: "Constitutional", icon: BookOpen },
  { name: "Finance", icon: Building2 },
  { name: "Criminal", icon: Gavel },
  { name: "Family", icon: Users },
  { name: "General", icon: Activity },
  { name: "Sports", icon: Trophy },
  { name: "Global", icon: Shield }
];

const suggestedTopics = [
  "CJI", "SLP", "Bail", "BNS", "IPC", "NDPS", "SEBI", "IBC", "GST", "Income Tax",
  "Divorce", "Custody", "Maintenance", "Succession", "Adoption",
  "Environment", "Human Rights", "Intellectual Property", "Cyber Law", "Data Privacy"
];

export default function PersonalizationModal({ isOpen, onClose, userId, onComplete }: Props) {
  const [step, setStep] = useState(1);
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [selectedTopics, setSelectedTopics] = useState<string[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const toggleCategory = (name: string) => {
    setSelectedCategories(prev => 
      prev.includes(name) ? prev.filter(c => c !== name) : [...prev, name]
    );
  };

  const toggleTopic = (topic: string) => {
    setSelectedTopics(prev => 
      prev.includes(topic) ? prev.filter(t => t !== topic) : [...prev, topic]
    );
  };

  const addCustomTopic = () => {
    if (searchTerm.trim() && !selectedTopics.includes(searchTerm.trim())) {
      setSelectedTopics(prev => [...prev, searchTerm.trim()]);
      setSearchTerm("");
    }
  };

  const handleNext = () => {
    if (step < 2) setStep(step + 1);
    else handleComplete();
  };

  const handleComplete = async () => {
    setIsSaving(true);
    setError(null);
    try {
      const res = await fetch("/api/user-preferences", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId,
          categories: selectedCategories,
          topics: selectedTopics
        })
      });
      const data = await res.json();
      if (data.success) {
        onComplete(data.preferences);
        onClose();
      } else {
        setError(data.error || "Failed to save. Please ensure the 'user_preferences' table exists in Supabase.");
      }
    } catch (err: any) {
      console.error("Failed to save preferences", err);
      setError("Network error or server-side failure.");
    }
    setIsSaving(false);
  };

  return (
    <div className="fixed inset-0 z-[2000] flex items-center justify-center p-4">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-md" onClick={onClose}></div>
      
      {/* Modal */}
      <div className="relative w-full max-w-lg bg-white rounded-3xl shadow-2xl overflow-hidden border border-gray-200 animate-in zoom-in-95 duration-200">
        
        {/* Header */}
        <div className="px-6 py-5 border-b border-gray-100 flex justify-between items-center bg-slate-50">
          <div>
            <h2 className="text-xl font-bold text-gray-900">Personalize Your Feed</h2>
            <p className="text-xs text-gray-500 mt-1">Step {step} of 2</p>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-gray-200 rounded-full transition">
            <X size={20} className="text-gray-500" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6">
          {step === 1 ? (
            <div className="space-y-4 animate-in slide-in-from-right-4 duration-300">
              <div>
                <h3 className="text-lg font-semibold text-gray-800 mb-2">Choose Categories</h3>
                <p className="text-sm text-gray-500">Select the legal domains you are interested in.</p>
              </div>
              
              <div className="grid grid-cols-2 gap-3 pt-2">
                {categories.map((cat) => {
                  const Icon = cat.icon;
                  const isSelected = selectedCategories.includes(cat.name);
                  return (
                    <button
                      key={cat.name}
                      onClick={() => toggleCategory(cat.name)}
                      className={`flex items-center gap-3 p-3 rounded-2xl border transition-all text-sm font-medium ${
                        isSelected 
                          ? "bg-indigo-600 border-indigo-500 text-white shadow-lg shadow-indigo-500/20" 
                          : "bg-white border-gray-200 text-slate-700 hover:border-indigo-400/50"
                      }`}
                    >
                      <Icon size={18} className={isSelected ? "text-white" : "text-indigo-400"} />
                      {cat.name}
                      {isSelected && <Check size={14} className="ml-auto" />}
                    </button>
                  );
                })}
              </div>
            </div>
          ) : (
            <div className="space-y-4 animate-in slide-in-from-right-4 duration-300">
              <div>
                <h3 className="text-lg font-semibold text-gray-800 mb-1">Follow Specific Topics</h3>
                <p className="text-sm text-gray-500">Add common legal topics or search for custom ones.</p>
              </div>

              {/* Search Box */}
              <div className="relative">
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && addCustomTopic()}
                  placeholder="Search topics (e.g. CJI, GST)..."
                  className="w-full bg-gray-50 border border-gray-200 rounded-xl pl-10 pr-4 py-2.5 text-sm text-gray-900 focus:ring-2 focus:ring-indigo-500 outline-none"
                />
                <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                {searchTerm.trim() && (
                  <button 
                    onClick={addCustomTopic}
                    className="absolute right-2 top-1/2 -translate-y-1/2 text-[10px] font-bold uppercase tracking-wider bg-indigo-600 text-white px-2 py-1 rounded"
                  >
                    Add
                  </button>
                )}
              </div>

              {/* Topics Grid */}
              <div className="flex flex-wrap gap-2 pt-2 max-h-48 overflow-y-auto no-scrollbar">
                {suggestedTopics.map(topic => {
                  const isSelected = selectedTopics.includes(topic);
                  return (
                    <button
                      key={topic}
                      onClick={() => toggleTopic(topic)}
                      className={`px-3 py-1.5 rounded-full text-xs font-medium border transition-all ${
                        isSelected 
                          ? "bg-indigo-100 border-indigo-500 text-indigo-700" 
                          : "bg-white border-gray-200 text-gray-600 hover:border-indigo-400"
                      }`}
                    >
                      {topic}
                    </button>
                  );
                })}
                {selectedTopics.filter(t => !suggestedTopics.includes(t)).map(topic => (
                  <button
                    key={topic}
                    onClick={() => toggleTopic(topic)}
                    className="px-3 py-1.5 rounded-full text-xs font-medium border bg-indigo-100 border-indigo-500 text-indigo-700 flex items-center gap-1.5"
                  >
                    {topic} <X size={10} />
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-5 border-t border-gray-100 bg-slate-50">
          {error && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-xl">
              <p className="text-xs text-red-600 font-medium">{error}</p>
            </div>
          )}
          
          <div className="flex items-center justify-between">
            <button 
              onClick={() => step === 1 ? onClose() : setStep(1)}
              className="text-sm font-medium text-gray-500 hover:text-gray-900 transition"
            >
              {step === 1 ? "Skip for now" : "Back"}
            </button>
            
            <button
              onClick={handleNext}
              disabled={isSaving || (step === 1 && selectedCategories.length === 0)}
              className="flex items-center gap-2 px-6 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-bold rounded-xl shadow-lg shadow-indigo-600/20 transition-all active:scale-95 disabled:opacity-50"
            >
              {isSaving ? "Saving..." : (step === 1 ? "Next Step" : "Complete Setup")}
              {!isSaving && <ChevronRight size={16} />}
            </button>
          </div>
        </div>

      </div>
    </div>
  );
}
