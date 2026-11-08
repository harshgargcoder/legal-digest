"use client";

import { useState, useEffect, useRef } from "react";
import ReactMarkdown from "react-markdown";
import {
  Sparkles,
  Bot,
  FileText,
  Globe2,
  Send,
  X,
  Upload,
  Trash2,
  RotateCcw,
  Copy,
  Check,
  ChevronDown,
  ChevronUp,
  AlertCircle,
  HelpCircle,
  MessageSquare,
  Scale,
  Paperclip,
} from "lucide-react";

interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
  mode: "notes" | "internet";
  timestamp: string;
}

const MAX_CHATS_LIMIT = 1000;
const STORAGE_COUNT_KEY = "legal_digest_chat_count";
const STORAGE_NOTES_KEY = "legal_digest_saved_notes";
const STORAGE_HISTORY_KEY = "legal_digest_chat_history";

export default function FloatingDualAI() {
  const [isOpen, setIsOpen] = useState(false);
  const [mode, setMode] = useState<"notes" | "internet">("notes");
  const [notesContent, setNotesContent] = useState("");
  const [showNotesDrawer, setShowNotesDrawer] = useState(false);
  const [inputMessage, setInputMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [chatCount, setChatCount] = useState(0);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const [messages, setMessages] = useState<Message[]>([
    {
      id: "welcome",
      role: "assistant",
      content:
        "Hello! I am your **LegalDigest AI Assistant** equipped with dual intelligence:\n\n1. 📄 **Notes AI**: Upload or paste your case notes to get answers grounded *strictly* in your material.\n2. 🌐 **Internet Legal AI**: Ask broad legal, statutory, or precedent questions answered via legal databases.\n\n*You have 1,000 complimentary AI chats for this session.*",
      mode: "internet",
      timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
    },
  ]);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Hydrate stored data from localStorage
  useEffect(() => {
    try {
      const storedCount = localStorage.getItem(STORAGE_COUNT_KEY);
      if (storedCount) {
        setChatCount(parseInt(storedCount, 10) || 0);
      }

      const storedNotes = localStorage.getItem(STORAGE_NOTES_KEY);
      if (storedNotes) {
        setNotesContent(storedNotes);
      }

      const storedHistory = localStorage.getItem(STORAGE_HISTORY_KEY);
      if (storedHistory) {
        const parsed = JSON.parse(storedHistory);
        if (Array.isArray(parsed) && parsed.length > 0) {
          setMessages(parsed);
        }
      }
    } catch {
      // LocalStorage access fallback
    }
  }, []);

  // Scroll to bottom on new message
  useEffect(() => {
    if (isOpen) {
      messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages, isOpen]);

  // Persist notes changes
  const handleNotesChange = (text: string) => {
    setNotesContent(text);
    try {
      localStorage.setItem(STORAGE_NOTES_KEY, text);
    } catch {
      // Ignore storage errors
    }
  };

  // Handle File Upload (.txt, .md, text files)
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result;
      if (typeof content === "string") {
        const combined = notesContent
          ? `${notesContent}\n\n--- [File: ${file.name}] ---\n${content}`
          : `--- [File: ${file.name}] ---\n${content}`;
        handleNotesChange(combined);
        setShowNotesDrawer(true);
      }
    };
    reader.readAsText(file);
    e.target.value = "";
  };

  // Send Chat Query
  const handleSendMessage = async (textToSend?: string) => {
    const text = (textToSend || inputMessage).trim();
    if (!text || loading) return;

    if (chatCount >= MAX_CHATS_LIMIT) {
      alert("You have reached your 1,000 free AI chats limit for this session.");
      return;
    }

    if (mode === "notes" && !notesContent.trim()) {
      setShowNotesDrawer(true);
      alert("Please upload or paste notes first to use Notes AI mode!");
      return;
    }

    const userMsg: Message = {
      id: Math.random().toString(36).substring(2, 9),
      role: "user",
      content: text,
      mode,
      timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
    };

    const newMessages = [...messages, userMsg];
    setMessages(newMessages);
    setInputMessage("");
    setLoading(true);

    // Increment chat count
    const nextCount = chatCount + 1;
    setChatCount(nextCount);
    try {
      localStorage.setItem(STORAGE_COUNT_KEY, nextCount.toString());
    } catch {
      // Ignore
    }

    try {
      const res = await fetch("/api/ai-chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: text,
          mode,
          notesContent,
          history: newMessages.slice(-6).map((m) => ({
            role: m.role,
            content: m.content,
          })),
        }),
      });

      const data = await res.json();
      const botReply = data.reply || "Sorry, I could not generate an answer right now.";

      const assistantMsg: Message = {
        id: Math.random().toString(36).substring(2, 9),
        role: "assistant",
        content: botReply,
        mode,
        timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      };

      const finalMessages = [...newMessages, assistantMsg];
      setMessages(finalMessages);

      try {
        localStorage.setItem(
          STORAGE_HISTORY_KEY,
          JSON.stringify(finalMessages.slice(-20)),
        );
      } catch {
        // Ignore
      }
    } catch {
      const errorMsg: Message = {
        id: Math.random().toString(36).substring(2, 9),
        role: "assistant",
        content: "⚠️ An error occurred while reaching the AI service. Please check your network or try again.",
        mode,
        timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      };
      setMessages((prev) => [...prev, errorMsg]);
    } finally {
      setLoading(false);
    }
  };

  const handleCopy = (id: string, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleClearChat = () => {
    if (confirm("Clear this conversation?")) {
      setMessages([
        {
          id: "welcome-cleared",
          role: "assistant",
          content: "Conversation cleared. Feel free to ask a new question in either **Notes AI** or **Internet AI** mode.",
          mode,
          timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
        },
      ]);
      localStorage.removeItem(STORAGE_HISTORY_KEY);
    }
  };

  const notesWordCount = notesContent.trim()
    ? notesContent.trim().split(/\s+/).length
    : 0;

  const remainingChats = Math.max(0, MAX_CHATS_LIMIT - chatCount);
  const percentageUsed = (chatCount / MAX_CHATS_LIMIT) * 100;

  return (
    <>
      {/* ── FLOATING BUTTON (BOTTOM-RIGHT) ─────────────────────────────────── */}
      <div className="fixed bottom-6 right-6 z-[999]">
        <button
          type="button"
          onClick={() => setIsOpen((prev) => !prev)}
          className="relative group flex items-center gap-2.5 px-4 py-3 rounded-full bg-slate-950 dark:bg-slate-100 text-white dark:text-slate-950 shadow-2xl hover:scale-105 active:scale-95 transition-all duration-200 border border-slate-700/50 dark:border-slate-300"
          aria-label="Toggle LegalDigest AI Assistant"
        >
          {/* Animated gradient ring */}
          <span className="absolute -inset-0.5 rounded-full bg-gradient-to-r from-indigo-500 via-purple-500 to-amber-500 opacity-75 blur-xs group-hover:opacity-100 transition duration-300 pointer-events-none" />

          <span className="relative flex items-center justify-center w-6 h-6 rounded-full bg-indigo-600 dark:bg-indigo-500 text-white">
            <Sparkles size={14} className="animate-spin-slow" />
          </span>

          <span className="relative font-bold text-xs tracking-wide">
            LegalDigest AI
          </span>

          {/* Dual badge */}
          <span className="relative hidden sm:inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-mono bg-white/20 dark:bg-slate-900/20 text-white dark:text-slate-900">
            {mode === "notes" ? "📄 Notes" : "🌐 Web"}
          </span>

          {/* Remaining chats counter pill */}
          <span className="relative px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-400 text-slate-950">
            {remainingChats} left
          </span>
        </button>
      </div>

      {/* ── FLOATING AI DRAWER WINDOW ──────────────────────────────────────── */}
      {isOpen && (
        <div className="fixed bottom-24 right-4 sm:right-6 w-[92vw] sm:w-[440px] h-[580px] max-h-[85vh] rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-2xl z-[1000] flex flex-col overflow-hidden animate-in fade-in slide-in-from-bottom-6 duration-200">
          
          {/* 1. HEADER */}
          <div className="p-4 bg-slate-950 text-white border-b border-slate-800 flex flex-col gap-2.5 flex-shrink-0">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-indigo-600 flex items-center justify-center text-white">
                  <Bot size={18} />
                </div>
                <div>
                  <h3 className="font-bold text-sm tracking-tight flex items-center gap-1.5">
                    LegalDigest Dual AI
                    <span className="text-[10px] font-mono font-normal text-indigo-300">v2.0</span>
                  </h3>
                  <p className="text-[10px] text-slate-400">
                    {mode === "notes"
                      ? "📄 Answering strictly from uploaded notes"
                      : "🌐 Answering with wide legal intelligence"}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-1">
                <button
                  type="button"
                  onClick={handleClearChat}
                  title="Clear conversation"
                  className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition"
                >
                  <RotateCcw size={14} />
                </button>
                <button
                  type="button"
                  onClick={() => setIsOpen(false)}
                  className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition"
                >
                  <X size={16} />
                </button>
              </div>
            </div>

            {/* 1,000 Chats Limit Progress Bar */}
            <div className="bg-slate-900 p-2 rounded-xl border border-slate-800/80 space-y-1">
              <div className="flex items-center justify-between text-[10px]">
                <span className="text-slate-400">Chat Quota:</span>
                <span className="font-bold text-amber-400">
                  {remainingChats} / {MAX_CHATS_LIMIT} remaining
                </span>
              </div>
              <div className="w-full h-1.5 bg-slate-800 rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-emerald-500 via-indigo-500 to-amber-500 transition-all duration-300"
                  style={{ width: `${Math.min(100, Math.max(3, percentageUsed))}%` }}
                />
              </div>
            </div>

            {/* DUAL MODE SELECTOR BUTTONS */}
            <div className="grid grid-cols-2 gap-1.5 bg-slate-900 p-1 rounded-xl border border-slate-800">
              <button
                type="button"
                onClick={() => setMode("notes")}
                className={`flex items-center justify-center gap-1.5 py-1.5 px-3 rounded-lg text-xs font-bold transition-all ${
                  mode === "notes"
                    ? "bg-indigo-600 text-white shadow-sm"
                    : "text-slate-400 hover:text-white hover:bg-slate-800/50"
                }`}
              >
                <FileText size={13} />
                <span>1. Notes AI</span>
              </button>

              <button
                type="button"
                onClick={() => setMode("internet")}
                className={`flex items-center justify-center gap-1.5 py-1.5 px-3 rounded-lg text-xs font-bold transition-all ${
                  mode === "internet"
                    ? "bg-purple-600 text-white shadow-sm"
                    : "text-slate-400 hover:text-white hover:bg-slate-800/50"
                }`}
              >
                <Globe2 size={13} />
                <span>2. Internet AI</span>
              </button>
            </div>
          </div>

          {/* 2. NOTES VAULT DRAWER (VISIBLE WHEN IN NOTES MODE) */}
          {mode === "notes" && (
            <div className="border-b border-slate-200 dark:border-slate-800 bg-indigo-50/50 dark:bg-slate-850/60 p-3 space-y-2 flex-shrink-0">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1.5 text-xs font-bold text-indigo-900 dark:text-indigo-200">
                  <Paperclip size={13} className="text-indigo-600" />
                  <span>Notes Vault</span>
                  <span className="text-[10px] font-mono font-normal px-1.5 py-0.2 bg-white dark:bg-slate-800 rounded border border-slate-200 dark:border-slate-700">
                    {notesWordCount} words
                  </span>
                </div>

                <div className="flex items-center gap-1">
                  <input
                    type="file"
                    ref={fileInputRef}
                    onChange={handleFileUpload}
                    accept=".txt,.md,.text"
                    className="hidden"
                  />
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="flex items-center gap-1 px-2 py-1 rounded text-[11px] font-bold bg-white dark:bg-slate-800 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800 hover:bg-indigo-100 transition"
                  >
                    <Upload size={11} />
                    Upload File
                  </button>

                  <button
                    type="button"
                    onClick={() => setShowNotesDrawer(!showNotesDrawer)}
                    className="p-1 rounded text-slate-500 hover:bg-white dark:hover:bg-slate-800 transition"
                  >
                    {showNotesDrawer ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
                  </button>
                </div>
              </div>

              {/* Collapsible Textarea for Pasting / Viewing Notes */}
              {showNotesDrawer && (
                <div className="space-y-1.5 pt-1">
                  <textarea
                    value={notesContent}
                    onChange={(e) => handleNotesChange(e.target.value)}
                    placeholder="Paste your case notes, statutes, legal arguments, or exam notes here. Notes AI will formulate answers strictly from this text..."
                    rows={4}
                    className="w-full text-xs p-2.5 rounded-xl border border-indigo-200 dark:border-indigo-900/60 bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-100 placeholder:text-slate-400 focus:outline-none focus:ring-1 focus:ring-indigo-500 resize-none font-mono"
                  />
                  <div className="flex items-center justify-between text-[10px] text-slate-400">
                    <span>Notes are automatically saved locally</span>
                    {notesContent && (
                      <button
                        type="button"
                        onClick={() => handleNotesChange("")}
                        className="text-red-500 hover:underline flex items-center gap-1"
                      >
                        <Trash2 size={10} /> Clear Notes
                      </button>
                    )}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* 3. MESSAGES SCROLL AREA */}
          <div className="flex-1 overflow-y-auto p-4 space-y-3.5 bg-slate-50/50 dark:bg-slate-950/30">
            {messages.map((msg) => (
              <div
                key={msg.id}
                className={`flex flex-col ${
                  msg.role === "user" ? "items-end" : "items-start"
                }`}
              >
                <div className="flex items-center gap-1.5 mb-1 px-1">
                  <span className="text-[10px] font-bold text-slate-400 uppercase">
                    {msg.role === "user" ? "You" : "LegalDigest AI"}
                  </span>
                  <span
                    className={`text-[9px] px-1 py-0.2 rounded font-mono font-semibold ${
                      msg.mode === "notes"
                        ? "bg-indigo-100 text-indigo-800 dark:bg-indigo-950 dark:text-indigo-300"
                        : "bg-purple-100 text-purple-800 dark:bg-purple-950 dark:text-purple-300"
                    }`}
                  >
                    {msg.mode === "notes" ? "📄 Notes" : "🌐 Internet"}
                  </span>
                  <span className="text-[9px] text-slate-400 font-mono">{msg.timestamp}</span>
                </div>

                <div
                  className={`relative group max-w-[88%] p-3.5 rounded-2xl text-xs leading-relaxed shadow-xs ${
                    msg.role === "user"
                      ? "bg-slate-900 text-white dark:bg-slate-100 dark:text-slate-950 rounded-br-xs"
                      : "bg-white dark:bg-slate-800 border border-slate-200/80 dark:border-slate-700/80 text-slate-800 dark:text-slate-100 rounded-bl-xs"
                  }`}
                >
                  {msg.role === "assistant" ? (
                    <div className="prose prose-xs dark:prose-invert max-w-none">
                      <ReactMarkdown>{msg.content}</ReactMarkdown>
                    </div>
                  ) : (
                    <p className="whitespace-pre-wrap">{msg.content}</p>
                  )}

                  {msg.role === "assistant" && (
                    <button
                      type="button"
                      onClick={() => handleCopy(msg.id, msg.content)}
                      className="absolute top-2 right-2 p-1 rounded bg-slate-100 dark:bg-slate-700 opacity-0 group-hover:opacity-100 transition text-slate-500 hover:text-slate-900 dark:hover:text-white"
                      title="Copy response"
                    >
                      {copiedId === msg.id ? <Check size={11} className="text-emerald-500" /> : <Copy size={11} />}
                    </button>
                  )}
                </div>
              </div>
            ))}

            {loading && (
              <div className="flex items-center gap-2 p-3 rounded-2xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 max-w-[70%]">
                <span className="w-4 h-4 rounded-full border-2 border-indigo-600 border-t-transparent animate-spin" />
                <span className="text-xs text-slate-500">
                  {mode === "notes"
                    ? "Searching your uploaded notes..."
                    : "Consulting legal intelligence..."}
                </span>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* 4. QUICK SUGGESTION PILLS */}
          <div className="px-3 py-1.5 bg-white dark:bg-slate-900 border-t border-slate-100 dark:border-slate-800 flex items-center gap-1.5 overflow-x-auto text-[11px] flex-shrink-0">
            <span className="text-slate-400 font-semibold text-[10px] uppercase flex-shrink-0">
              💡 Suggestions:
            </span>
            {mode === "notes" ? (
              <>
                <button
                  type="button"
                  onClick={() => handleSendMessage("Summarize the key points in my uploaded notes.")}
                  className="px-2 py-1 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 whitespace-nowrap hover:bg-indigo-50 hover:text-indigo-600 transition"
                >
                  Summarize notes
                </button>
                <button
                  type="button"
                  onClick={() => handleSendMessage("List all case precedents and statutory sections mentioned.")}
                  className="px-2 py-1 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 whitespace-nowrap hover:bg-indigo-50 hover:text-indigo-600 transition"
                >
                  List precedents & sections
                </button>
              </>
            ) : (
              <>
                <button
                  type="button"
                  onClick={() => handleSendMessage("What is the Basic Structure Doctrine in Indian Constitutional Law?")}
                  className="px-2 py-1 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 whitespace-nowrap hover:bg-purple-50 hover:text-purple-600 transition"
                >
                  Basic Structure Doctrine
                </button>
                <button
                  type="button"
                  onClick={() => handleSendMessage("Explain the principles of Anticipatory Bail under BNSS/CrPC.")}
                  className="px-2 py-1 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 whitespace-nowrap hover:bg-purple-50 hover:text-purple-600 transition"
                >
                  Anticipatory Bail
                </button>
              </>
            )}
          </div>

          {/* 5. INPUT FORM */}
          <div className="p-3 bg-white dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800 flex-shrink-0">
            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleSendMessage();
              }}
              className="flex items-center gap-2"
            >
              <input
                type="text"
                value={inputMessage}
                onChange={(e) => setInputMessage(e.target.value)}
                disabled={chatCount >= MAX_CHATS_LIMIT}
                placeholder={
                  chatCount >= MAX_CHATS_LIMIT
                    ? "Chat limit of 1,000 queries reached"
                    : mode === "notes"
                    ? "Ask a question about your uploaded notes..."
                    : "Ask any legal question (e.g. IPC, Constitution, Precedents)..."
                }
                className="flex-1 text-xs px-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 disabled:opacity-50"
              />

              <button
                type="submit"
                disabled={!inputMessage.trim() || loading || chatCount >= MAX_CHATS_LIMIT}
                className="p-2.5 rounded-xl bg-slate-900 dark:bg-indigo-600 text-white disabled:opacity-40 hover:bg-indigo-600 transition shadow-sm"
              >
                <Send size={15} />
              </button>
            </form>
          </div>
        </div>
      )}
    </>
  );
}

