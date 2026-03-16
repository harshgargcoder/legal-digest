"use client";

import { useState, useRef, useEffect } from "react";
import { MessageSquare, X, Send, Bot, User, Loader2, Sparkles, Scale, HelpCircle, Headphones, Info } from "lucide-react";
import { auth } from "@/lib/firebase";
import { onAuthStateChanged } from "firebase/auth";
import ReactMarkdown from "react-markdown";

const Typewriter = ({ text, speed = 10, onComplete }: { text: string; speed?: number; onComplete?: () => void }) => {
  const [displayedText, setDisplayedText] = useState("");
  const [index, setIndex] = useState(0);

  useEffect(() => {
    if (index < text.length) {
      const timeout = setTimeout(() => {
        setDisplayedText((prev) => prev + text[index]);
        setIndex((prev) => prev + 1);
      }, speed);
      return () => clearTimeout(timeout);
    } else if (onComplete) {
      onComplete();
    }
  }, [index, text, speed, onComplete]);

  return <ReactMarkdown>{displayedText}</ReactMarkdown>;
};

export default function SupportBot() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<{ role: "user" | "bot"; content: string; status?: "typing" | "done" }[]>([
    { role: "bot", content: "👋 Hi! I'm your **Legal Digest Intelligence Assistant**. How can I assist your research today?\n\nType `/` to see available commands.", status: "done" }
  ]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [showCommands, setShowCommands] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  const commands = [
    { cmd: "/help", desc: "Show platform guide", icon: <HelpCircle size={14} /> },
    { cmd: "/customersupport", desc: "Contact support team", icon: <Headphones size={14} /> },
    { cmd: "/about", desc: "About Legal Digest", icon: <Info size={14} /> },
  ];

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setIsLoggedIn(!!user);
    });
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, isLoading]);

  const handleCommand = (cmd: string) => {
    setInput("");
    setShowCommands(false);
    
    let response = "";
    if (cmd === "/help") {
      response = "### 📚 Platform Guide\n\nWelcome to **Legal Digest**! Here's how you can use the platform:\n\n1. **Case Topology**: Visualize complex legal relationships.\n2. **AI Briefs**: Generate instant summaries of judgments.\n3. **Community Insights**: Share and read legal analysis.\n4. **News Feed**: Stay updated with real-time legal news.\n\n**Available Commands:**\n- `/help`: Show this guide\n- `/customersupport`: Get help from our team\n- `/about`: Learn about our mission";
    } else if (cmd === "/customersupport") {
      response = "### 🎧 Customer Support\n\nNeed direct assistance? Our team is here to help!\n\n- **Email**: support@legaldigest.com\n- **Hours**: Mon-Fri, 9 AM - 6 PM IST\n- **Response Time**: Usually within 24 hours\n\nOr just describe your issue here and I'll try my best to help!";
    } else if (cmd === "/about") {
      response = "### 🏛️ About Legal Digest\n\nLegal Digest is a next-generation intelligence platform for legal professionals. We leverage AI to transform how legal research is conducted, making it faster, more intuitive, and highly collaborative.";
    }

    setMessages((prev) => [
      ...prev, 
      { role: "user", content: cmd, status: "done" },
      { role: "bot", content: response, status: "typing" }
    ]);
  };

  const handleSend = async () => {
    if (!input.trim() || isLoading) return;

    const userMessage = input.trim();
    
    if (userMessage.startsWith("/")) {
      const foundCmd = commands.find(c => c.cmd === userMessage.split(" ")[0]);
      if (foundCmd) {
        handleCommand(foundCmd.cmd);
        return;
      }
    }

    setInput("");
    setShowCommands(false);
    setMessages((prev) => [...prev, { role: "user", content: userMessage, status: "done" }]);
    setIsLoading(true);

    try {
      const history = messages.map(m => ({
        role: m.role === "user" ? "user" : "model",
        content: m.content
      }));

      const res = await fetch("/api/support", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: userMessage, history }),
      });

      const data = await res.json();
      if (data.text) {
        setMessages((prev) => [...prev, { role: "bot", content: data.text, status: "typing" }]);
      } else {
        throw new Error("Empty response");
      }
    } catch (error) {
      setMessages((prev) => [...prev, { role: "bot", content: "I'm having a bit of trouble connecting to my knowledge base. Please try again or use `/customersupport`.", status: "typing" }]);
    } finally {
      setIsLoading(false);
    }
  };

  const onInputChange = (val: string) => {
    setInput(val);
    if (val === "/") {
      setShowCommands(true);
    } else if (!val.startsWith("/")) {
      setShowCommands(false);
    }
  };

  const markAsDone = (index: number) => {
    setMessages(prev => prev.map((msg, i) => i === index ? { ...msg, status: "done" } : msg));
  };

  if (!isLoggedIn) return null;

  return (
    <div className="fixed bottom-6 right-6 z-[9999] font-sans">
      {/* Floating Button with Premium Glow */}
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          className="w-14 h-14 bg-gradient-to-br from-indigo-600 to-violet-700 hover:from-indigo-500 hover:to-violet-600 text-white rounded-2xl shadow-[0_10px_40px_-10px_rgba(79,70,229,0.5)] flex items-center justify-center transition-all duration-500 hover:scale-110 active:scale-95 group relative overflow-hidden"
        >
          <div className="absolute inset-0 bg-white/10 opacity-0 group-hover:opacity-100 transition-opacity duration-500 animate-pulse"></div>
          <div className="absolute top-0.5 right-0.5 w-4 h-4 bg-green-500 border-2 border-white rounded-full z-10 transition-transform duration-500 group-hover:scale-110 animate-pulse shadow-[0_0_8px_rgba(34,197,94,0.6)]"></div>
          <MessageSquare size={24} className="group-hover:rotate-[15deg] transition-transform duration-500" />
        </button>
      )}

      {/* Chat Window with Glassmorphism */}
      {isOpen && (
        <div className="bg-white/95 backdrop-blur-2xl border border-white/20 w-[calc(100vw-3rem)] sm:w-[420px] h-[600px] rounded-[2.5rem] shadow-[0_25px_80px_-15px_rgba(0,0,0,0.15)] flex flex-col overflow-hidden animate-in slide-in-from-bottom-8 fade-in duration-500">

          {/* Premium Header */}
          <div className="p-6 bg-gradient-to-r from-indigo-600 via-violet-600 to-indigo-700 text-white flex items-center justify-between shadow-xl relative overflow-hidden">
            <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-10"></div>
            <div className="flex items-center gap-4 relative z-10">
              <div className="w-10 h-10 bg-white/20 backdrop-blur-xl rounded-xl flex items-center justify-center border border-white/20 shadow-inner group transition-all duration-500 hover:bg-white/30">
                <Scale size={20} className="text-white group-hover:scale-110 transition-transform" />
              </div>
              <div>
                <h3 className="font-extrabold text-base tracking-tight">Intelligence Bot</h3>
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse shadow-[0_0_8px_rgba(74,222,128,0.8)]"></span>
                  <span className="text-[10px] text-indigo-100 uppercase tracking-[0.2em] font-black">AI Researcher</span>
                </div>
              </div>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              className="p-2.5 hover:bg-white/20 rounded-xl transition-all duration-300 hover:rotate-90 relative z-10"
            >
              <X size={20} />
            </button>
          </div>

          {/* Messages Area */}
          <div
            ref={scrollRef}
            className="flex-1 overflow-y-auto p-6 space-y-6 scroll-smooth bg-gradient-to-b from-slate-50 to-white"
          >
            {messages.map((msg, i) => (
              <div
                key={i}
                className={`flex items-start gap-3 ${msg.role === "user" ? "flex-row-reverse" : "animate-in slide-in-from-left-2 duration-300"}`}
              >
                <div className={`w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 shadow-sm ${msg.role === "user"
                    ? "bg-indigo-600 text-white"
                    : "bg-white text-indigo-600 border border-indigo-100"
                  }`}>
                  {msg.role === "user" ? <User size={18} /> : <Scale size={18} />}
                </div>
                <div className={`max-w-[82%] p-4 text-sm leading-relaxed shadow-sm transition-all duration-300 ${msg.role === "user"
                    ? "bg-indigo-600 text-white rounded-3xl rounded-tr-none"
                    : "bg-white text-gray-800 border border-slate-100 rounded-3xl rounded-tl-none hover:border-indigo-200"
                  }`}>
                  <div className={`prose prose-sm max-w-none ${msg.role === "user" ? "prose-invert" : "text-slate-700"}`}>
                    {msg.role === "bot" && msg.status === "typing" ? (
                      <Typewriter text={msg.content} onComplete={() => markAsDone(i)} />
                    ) : (
                      <ReactMarkdown>{msg.content}</ReactMarkdown>
                    )}
                  </div>
                </div>
              </div>
            ))}
            {isLoading && (
              <div className="flex items-start gap-3 animate-in fade-in duration-300">
                <div className="w-9 h-9 rounded-xl bg-white border border-indigo-100 flex items-center justify-center text-indigo-600">
                  <Loader2 size={18} className="animate-spin" />
                </div>
                <div className="bg-white border border-slate-100 p-4 rounded-3xl rounded-tl-none shadow-sm">
                  <div className="flex gap-1.5">
                    <div className="w-2 h-2 bg-indigo-400 rounded-full animate-bounce"></div>
                    <div className="w-2 h-2 bg-indigo-400 rounded-full animate-bounce [animation-delay:0.2s]"></div>
                    <div className="w-2 h-2 bg-indigo-400 rounded-full animate-bounce [animation-delay:0.4s]"></div>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Input Section */}
          <div className="p-6 border-t border-slate-100 bg-white/80 backdrop-blur-md relative">
            {/* Command Suggestions */}
            {showCommands && (
              <div className="absolute bottom-full left-6 right-6 mb-2 bg-white border border-slate-200 rounded-2xl shadow-2xl overflow-hidden animate-in slide-in-from-bottom-4 duration-300 z-50">
                <div className="px-4 py-2 bg-slate-50 border-b border-slate-100 flex items-center gap-2">
                  <Sparkles size={12} className="text-indigo-500" />
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Available Commands</span>
                </div>
                <div className="max-h-48 overflow-y-auto">
                  {commands.map((c) => (
                    <button
                      key={c.cmd}
                      onClick={() => handleCommand(c.cmd)}
                      className="w-full px-4 py-3 flex items-center gap-3 hover:bg-indigo-50 transition-colors text-left group"
                    >
                      <div className="p-2 bg-slate-100 rounded-lg text-slate-500 group-hover:bg-indigo-100 group-hover:text-indigo-600 transition-colors">
                        {c.icon}
                      </div>
                      <div>
                        <div className="text-sm font-bold text-slate-800 group-hover:text-indigo-700">{c.cmd}</div>
                        <div className="text-[11px] text-slate-500">{c.desc}</div>
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            )}

            <div className="flex items-center gap-3 bg-slate-50 border border-slate-200 rounded-[2rem] px-5 py-2 focus-within:ring-2 focus-within:ring-indigo-500/20 focus-within:border-indigo-500/50 transition-all duration-300 shadow-inner group">
              <input
                type="text"
                value={input}
                onChange={(e) => onInputChange(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleSend()}
                placeholder="Message your research assistant..."
                className="flex-1 bg-transparent text-sm py-3 text-slate-800 focus:outline-none placeholder:text-slate-400 font-medium"
              />
              <button
                onClick={handleSend}
                disabled={isLoading || !input.trim()}
                className="p-3 bg-gradient-to-br from-indigo-600 to-violet-700 hover:from-indigo-500 hover:to-violet-600 disabled:opacity-40 disabled:grayscale text-white rounded-2xl transition-all duration-300 shadow-lg shadow-indigo-600/20 active:scale-90 flex-shrink-0"
              >
                <Send size={20} />
              </button>
            </div>
            <div className="flex items-center justify-center gap-2 mt-4">
              <div className="flex gap-1">
                {[...Array(3)].map((_, i) => (
                   <div key={i} className="w-1 h-1 bg-slate-200 rounded-full"></div>
                ))}
              </div>
              <p className="text-[10px] text-slate-400 font-bold uppercase tracking-[0.1em]">AI-Powered Intelligence</p>
              <div className="flex gap-1">
                {[...Array(3)].map((_, i) => (
                   <div key={i} className="w-1 h-1 bg-slate-200 rounded-full"></div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

