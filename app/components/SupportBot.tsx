"use client";

import { useEffect, useRef, useState } from "react";
import type { ReactNode } from "react";
import { useRouter } from "next/navigation";
import ReactMarkdown from "react-markdown";
import {
  ArrowUpRight,
  Bot,
  Gavel,
  HelpCircle,
  Loader2,
  MessageSquare,
  Scale,
  Search,
  Send,
  Sparkles,
  Trophy,
  Users,
  X,
} from "lucide-react";

type ChatRole = "user" | "assistant";
type ChatKind = "text" | "case-results" | "trending";

type CaseSearchResult = {
  id: string;
  title: string;
  summary?: string | null;
  url: string;
  source?: string | null;
  published_at?: string | null;
  category?: string | null;
  region?: string | null;
};

type ChatMessage = {
  id: string;
  role: ChatRole;
  kind?: ChatKind;
  content: string;
  results?: CaseSearchResult[];
  topics?: string[];
};

type QuickAction = {
  label: string;
  icon: ReactNode;
  onClick: () => void;
};

const STORAGE_KEY = "legal-digest-supportbot-v2";
const MAX_HISTORY = 12;

const WELCOME_MESSAGE: ChatMessage = {
  id: "welcome",
  role: "assistant",
  kind: "text",
  content:
    "Hi, I'm the **Legal Digest Assistant**.\n\nI can help you search cases, explain the platform, open the trial simulator, show trending topics, and point you to the right feature. Try `/help`, `/search`, `/practice`, or `/trending`.",
};

const COMMANDS = [
  { cmd: "/help", desc: "Show the platform guide" },
  { cmd: "/search", desc: "Search cases by name or number" },
  { cmd: "/practice", desc: "Open the trial simulator" },
  { cmd: "/coach", desc: "Open coach mode" },
  { cmd: "/trending", desc: "Show trending legal topics" },
  { cmd: "/community", desc: "Open community insights" },
  { cmd: "/leaderboard", desc: "View the leaderboard" },
];

function makeId() {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
    return crypto.randomUUID();
  }

  return Math.random().toString(36).slice(2, 10);
}

function normalizeQuery(value: string) {
  return value
    .replace(/^\/search\s*/i, "")
    .replace(/^(search|find|lookup|look up)\s+/i, "")
    .trim();
}

function looksLikeCaseSearch(value: string) {
  const text = value.toLowerCase();
  return (
    /\b(v\.?|vs\.?)\b/.test(text) ||
    /\bcase\b/.test(text) ||
    /\bpetition\b/.test(text) ||
    /\bappeal\b/.test(text) ||
    /\bwp\s*\(/.test(text) ||
    /\bslp\b/.test(text) ||
    /\bcase\s*no\.?\b/.test(text) ||
    /\b\d{1,5}\/\d{2,4}\b/.test(text) ||
    /\bair\s*\d{4}\b/.test(text)
  );
}

function isPlatformQuestion(value: string) {
  const text = value.toLowerCase();
  return (
    text.includes("what is this platform") ||
    text.includes("what is legal digest") ||
    text.includes("what can you do") ||
    text.includes("how do i use") ||
    text.includes("how do i navigate") ||
    text.includes("trial simulator") ||
    text.includes("coach mode") ||
    text.includes("case reader") ||
    text.includes("community") ||
    text.includes("leaderboard") ||
    text.includes("region selector")
  );
}

function buildPlatformGuide(lastCaseQuery?: string | null) {
  const caseLine = lastCaseQuery
    ? `I'm also remembering your last search: **${lastCaseQuery}**.`
    : "I can remember the current conversation and keep your last search in context.";

  return `### What Legal Digest does

Legal Digest is a legal research and practice platform built around:

1. **Case Reader** - browse and search judgments from Delhi HC, Punjab & Haryana HC, and the Supreme Court.
2. **Trial Simulator** - practice oral arguments against an AI judge.
3. **Coach Mode** - get live hints while you argue a case.
4. **Region Selector** - filter content by legal region.
5. **Community** - share research insights with other users.
6. **Leaderboard** - compare practice performance.

${caseLine}

### Fast shortcuts
- Use \`/search <case name or number>\` to search the case reader.
- Use \`/practice\` to open the trial simulator.
- Use \`/coach\` to jump into coach mode.
- Use \`/trending\` to see what legal topics are hot right now.
`;
}

export default function SupportBot() {
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([WELCOME_MESSAGE]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [lastCaseQuery, setLastCaseQuery] = useState<string | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    try {
      const raw = sessionStorage.getItem(STORAGE_KEY);
      if (!raw) return;

      const parsed = JSON.parse(raw) as ChatMessage[];
      if (Array.isArray(parsed) && parsed.length > 0) {
        setMessages(parsed);
      }
    } catch {
      // Ignore invalid cache.
    }
  }, []);

  useEffect(() => {
    try {
      sessionStorage.setItem(STORAGE_KEY, JSON.stringify(messages.slice(-24)));
    } catch {
      // Ignore cache write failures.
    }
  }, [messages]);

  useEffect(() => {
    if (!scrollRef.current) return;
    scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
  }, [messages, loading, isOpen]);

  const appendMessage = (message: ChatMessage) => {
    setMessages((prev) => [...prev, message]);
  };

  const replaceLastAssistant = (message: ChatMessage) => {
    setMessages((prev) => {
      const next = [...prev];

      for (let i = next.length - 1; i >= 0; i -= 1) {
        if (next[i].role === "assistant") {
          next[i] = message;
          return next;
        }
      }

      return [...next, message];
    });
  };

  const goTo = (path: string) => {
    router.push(path);
    setIsOpen(false);
  };

  const searchCases = async (query: string) => {
    const trimmed = normalizeQuery(query);
    if (!trimmed) {
      appendMessage({
        id: makeId(),
        role: "assistant",
        kind: "text",
        content:
          "Try `/search <case name or number>` and I'll look it up for you. Example: `/search Kesavananda Bharati`.",
      });
      return;
    }

    setLoading(true);
    setLastCaseQuery(trimmed);
    appendMessage({
      id: makeId(),
      role: "assistant",
      kind: "text",
      content: `Searching the case reader for **${trimmed}**...`,
    });

    try {
      const res = await fetch(`/api/get-news?search=${encodeURIComponent(trimmed)}&limit=5`);
      const data = await res.json();
      const results = ((data?.articles || []) as CaseSearchResult[])
        .filter((item) => item?.title && item?.url)
        .slice(0, 5);

      if (results.length === 0) {
        replaceLastAssistant({
          id: makeId(),
          role: "assistant",
          kind: "text",
          content:
            `I couldn't find a close match for **${trimmed}** in the case reader.\n\n` +
            "Try a different spelling, a shorter case name, or the case number. If you want, I can also take you straight to the trial simulator with this context.",
        });
        return;
      }

      replaceLastAssistant({
        id: makeId(),
        role: "assistant",
        kind: "case-results",
        content: `I found ${results.length} relevant case-reader results for **${trimmed}**.`,
        results,
      });
    } catch (error: unknown) {
      replaceLastAssistant({
        id: makeId(),
        role: "assistant",
        kind: "text",
        content:
          error instanceof Error
            ? `Search failed: ${error.message}`
            : "Search failed. Please try again in a moment.",
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchTrending = async () => {
    setLoading(true);
    appendMessage({
      id: makeId(),
      role: "assistant",
      kind: "text",
      content: "Fetching trending legal topics...",
    });

    try {
      const res = await fetch("/api/summarize");
      const data = await res.json();
      const topics = (data?.trendingTopics || []).slice(0, 6) as string[];

      if (topics.length === 0) {
        replaceLastAssistant({
          id: makeId(),
          role: "assistant",
          kind: "text",
          content:
            "I couldn't detect any trending topics right now, but I can still search by case name, court, or issue.",
        });
        return;
      }

      replaceLastAssistant({
        id: makeId(),
        role: "assistant",
        kind: "trending",
        content: "Here are the current trending topics I'm seeing across recent legal news:",
        topics,
      });
    } catch (error: unknown) {
      replaceLastAssistant({
        id: makeId(),
        role: "assistant",
        kind: "text",
        content:
          error instanceof Error
            ? `Trending lookup failed: ${error.message}`
            : "Trending lookup failed. Please try again.",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleCommand = async (commandLine: string) => {
    const [command, ...rest] = commandLine.trim().split(/\s+/);
    const arg = rest.join(" ").trim();

    appendMessage({
      id: makeId(),
      role: "user",
      content: commandLine,
    });
    setInput("");

    switch (command.toLowerCase()) {
      case "/help":
        appendMessage({
          id: makeId(),
          role: "assistant",
          kind: "text",
          content: buildPlatformGuide(lastCaseQuery),
        });
        return;
      case "/search":
        await searchCases(arg);
        return;
      case "/practice":
      case "/coach":
        appendMessage({
          id: makeId(),
          role: "assistant",
          kind: "text",
          content: lastCaseQuery
            ? `Opening the trial simulator. I'll keep **${lastCaseQuery}** in context while you practice.`
            : "Opening the trial simulator. If you want, search a case first and I can help you rehearse that matter.",
        });
        goTo("/toolkit/moot-court");
        return;
      case "/community":
        appendMessage({
          id: makeId(),
          role: "assistant",
          kind: "text",
          content: "Opening Community Insights so you can browse or publish legal analysis.",
        });
        goTo("/community");
        return;
      case "/leaderboard":
        appendMessage({
          id: makeId(),
          role: "assistant",
          kind: "text",
          content: "Opening the leaderboard on the home page.",
        });
        goTo("/");
        return;
      case "/trending":
        await fetchTrending();
        return;
      default:
        appendMessage({
          id: makeId(),
          role: "assistant",
          kind: "text",
          content: `I don't recognize **${command}**. Try \`/help\` to see the supported commands.`,
        });
    }
  };

  const handleSend = async () => {
    const trimmed = input.trim();
    if (!trimmed || loading) return;

    if (trimmed.startsWith("/")) {
      await handleCommand(trimmed);
      return;
    }

    appendMessage({
      id: makeId(),
      role: "user",
      content: trimmed,
    });
    setInput("");

    if (looksLikeCaseSearch(trimmed)) {
      await searchCases(trimmed);
      return;
    }

    if (isPlatformQuestion(trimmed)) {
      appendMessage({
        id: makeId(),
        role: "assistant",
        kind: "text",
        content: buildPlatformGuide(lastCaseQuery),
      });
      return;
    }

    setLoading(true);

    try {
      const history = messages.slice(-MAX_HISTORY).map((message) => ({
        role: message.role === "user" ? "user" : "model",
        content: message.content,
      }));

      const res = await fetch("/api/support", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: trimmed, history }),
      });

      const data = await res.json();

      if (data?.text) {
        appendMessage({
          id: makeId(),
          role: "assistant",
          kind: "text",
          content: data.text,
        });
        return;
      }

      throw new Error("Empty response from assistant");
    } catch (error: unknown) {
      appendMessage({
        id: makeId(),
        role: "assistant",
        kind: "text",
        content:
          error instanceof Error
            ? `I hit a snag talking to the support model: ${error.message}`
            : "I hit a snag talking to the support model. Please try again.",
      });
    } finally {
      setLoading(false);
    }
  };

  const quickActions: QuickAction[] = [
    {
      label: "Search cases",
      icon: <Search size={14} />,
      onClick: () => {
        setInput(lastCaseQuery ? `/search ${lastCaseQuery}` : "/search ");
        inputRef.current?.focus();
      },
    },
    {
      label: "Trial simulator",
      icon: <Gavel size={14} />,
      onClick: () => {
        appendMessage({
          id: makeId(),
          role: "assistant",
          kind: "text",
          content: "Opening the trial simulator. You can practice oral arguments against the AI judge there.",
        });
        goTo("/toolkit/moot-court");
      },
    },
    {
      label: "Trending",
      icon: <Sparkles size={14} />,
      onClick: () => {
        void fetchTrending();
      },
    },
    {
      label: "Platform help",
      icon: <HelpCircle size={14} />,
      onClick: () => {
        appendMessage({
          id: makeId(),
          role: "assistant",
          kind: "text",
          content: buildPlatformGuide(lastCaseQuery),
        });
      },
    },
    {
      label: "Community",
      icon: <Users size={14} />,
      onClick: () => goTo("/community"),
    },
    {
      label: "Leaderboard",
      icon: <Trophy size={14} />,
      onClick: () => goTo("/"),
    },
  ];

  const commandSuggestions = input.startsWith("/")
    ? COMMANDS.filter((item) => item.cmd.startsWith(input.toLowerCase())).slice(0, 6)
    : [];

  const suggestionChips: QuickAction[] = lastCaseQuery
    ? [
        {
          label: `Practice "${lastCaseQuery}"`,
          icon: <Scale size={14} />,
          onClick: () => {
            appendMessage({
              id: makeId(),
              role: "assistant",
              kind: "text",
              content: `I'm keeping **${lastCaseQuery}** in context. Opening the trial simulator now.`,
            });
            goTo("/toolkit/moot-court");
          },
        },
        ...quickActions,
      ].slice(0, 6)
    : quickActions.slice(0, 6);

  const renderMessage = (message: ChatMessage) => {
    if (message.kind === "case-results" && message.results?.length) {
      return (
        <div className="space-y-3">
          <ReactMarkdown>{message.content}</ReactMarkdown>
          <div className="space-y-2">
            {message.results.map((result) => (
              <a
                key={result.id}
                href={result.url}
                target="_blank"
                rel="noreferrer"
                className="block rounded-2xl border border-slate-200 bg-slate-50 p-3 transition hover:border-indigo-300 hover:bg-indigo-50"
              >
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="font-semibold text-slate-900">{result.title}</p>
                    <p className="mt-1 text-xs text-slate-500">
                      {[result.source, result.category, result.region].filter(Boolean).join(" • ")}
                    </p>
                  </div>
                  <ArrowUpRight size={16} className="mt-1 shrink-0 text-indigo-600" />
                </div>
                {result.summary ? (
                  <p className="mt-2 line-clamp-3 text-sm text-slate-600">{result.summary}</p>
                ) : null}
              </a>
            ))}
          </div>
        </div>
      );
    }

    if (message.kind === "trending" && message.topics?.length) {
      return (
        <div className="space-y-4">
          <ReactMarkdown>{message.content}</ReactMarkdown>
          <div className="flex flex-wrap gap-2">
            {message.topics.map((topic) => (
              <button
                key={topic}
                onClick={() => setInput(`/search ${topic}`)}
                className="rounded-full border border-indigo-200 bg-indigo-50 px-3 py-1.5 text-xs font-semibold text-indigo-700 transition hover:bg-indigo-100"
              >
                {topic}
              </button>
            ))}
          </div>
        </div>
      );
    }

    return <ReactMarkdown>{message.content}</ReactMarkdown>;
  };

  return (
    <div className="fixed bottom-4 right-4 z-[9999] font-sans">
      {!isOpen ? (
        <button
          onClick={() => setIsOpen(true)}
          className="group relative flex h-12 w-12 items-center justify-center overflow-hidden rounded-xl bg-gradient-to-br from-indigo-600 to-violet-700 text-white shadow-[0_8px_24px_-10px_rgba(79,70,229,0.55)] transition-all duration-300 hover:scale-105 active:scale-95"
          aria-label="Open assistant"
        >
          <div className="absolute inset-0 bg-white/10 opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
          <MessageSquare size={24} className="relative z-10" />
        </button>
      ) : (
        <div className="flex h-[min(70vh,620px)] w-[min(88vw,380px)] flex-col overflow-hidden rounded-[1.5rem] border border-slate-200 bg-white/96 shadow-[0_16px_50px_-18px_rgba(0,0,0,0.25)] backdrop-blur-xl sm:w-[380px]">
          <div className="relative flex items-center justify-between overflow-hidden bg-gradient-to-r from-indigo-600 via-violet-600 to-indigo-700 p-4 text-white">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(255,255,255,0.18),transparent_35%)]" />
            <div className="relative z-10 flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/15">
                <Bot size={20} />
              </div>
              <div>
                <h3 className="text-[13px] font-bold tracking-wide">Legal Digest Assistant</h3>
                <p className="text-[9px] uppercase tracking-[0.24em] text-indigo-100">
                  Search, guide, practice, repeat
                </p>
              </div>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              className="relative z-10 rounded-lg p-1.5 transition hover:bg-white/15"
              aria-label="Close assistant"
            >
              <X size={18} />
            </button>
          </div>

          <div ref={scrollRef} className="flex-1 space-y-4 overflow-y-auto bg-gradient-to-b from-slate-50 to-white p-3 sm:p-4">
            {messages.map((message) => (
              <div
                key={message.id}
                className={`flex items-start gap-3 ${message.role === "user" ? "flex-row-reverse" : ""}`}
              >
                <div
                  className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-lg shadow-sm ${
                    message.role === "user"
                      ? "bg-indigo-600 text-white"
                      : "border border-indigo-100 bg-white text-indigo-600"
                  }`}
                >
                  {message.role === "user" ? <Scale size={15} /> : <Bot size={15} />}
                </div>
                <div
                  className={`max-w-[84%] rounded-2xl p-3 text-[13px] leading-relaxed shadow-sm ${
                    message.role === "user"
                      ? "rounded-tr-none bg-indigo-600 text-white"
                      : "rounded-tl-none border border-slate-100 bg-white text-slate-800"
                  }`}
                >
                  {message.role === "assistant" ? (
                    loading && message === messages[messages.length - 1] ? (
                      <div className="flex items-center gap-2 text-slate-500">
                        <Loader2 size={13} className="animate-spin" />
                        <span>Working...</span>
                      </div>
                    ) : (
                      renderMessage(message)
                    )
                  ) : (
                    <p>{message.content}</p>
                  )}
                </div>
              </div>
            ))}

            {loading ? (
              <div className="flex items-start gap-3">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg border border-indigo-100 bg-white text-indigo-600 shadow-sm">
                  <Loader2 size={14} className="animate-spin" />
                </div>
                <div className="rounded-2xl rounded-tl-none border border-slate-100 bg-white p-3 text-sm text-slate-500 shadow-sm">
                  Searching the platform...
                </div>
              </div>
            ) : null}
          </div>

          <div className="border-t border-slate-100 bg-white/90 p-3 backdrop-blur">
            <div className="mb-2.5 flex flex-wrap gap-1.5">
              {suggestionChips.map((chip) => (
                <button
                  key={chip.label}
                  onClick={chip.onClick}
                  className="inline-flex items-center gap-1.5 rounded-full border border-slate-200 bg-slate-50 px-2.5 py-1.5 text-[11px] font-semibold text-slate-700 transition hover:border-indigo-300 hover:bg-indigo-50 hover:text-indigo-700"
                >
                  {chip.icon}
                  {chip.label}
                </button>
              ))}
            </div>

            <div className="relative">
              {commandSuggestions.length > 0 ? (
                <div className="absolute bottom-full left-0 right-0 mb-2 overflow-hidden rounded-xl border border-slate-200 bg-white shadow-2xl">
                  <div className="border-b border-slate-100 bg-slate-50 px-3 py-2">
                    <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-slate-400">Commands</p>
                  </div>
                  <div className="divide-y divide-slate-100">
                    {commandSuggestions.map((item) => (
                      <button
                        key={item.cmd}
                        onClick={() => setInput(`${item.cmd} `)}
                        className="flex w-full items-center justify-between px-3 py-2.5 text-left transition hover:bg-indigo-50"
                      >
                        <span className="text-[13px] font-semibold text-slate-800">{item.cmd}</span>
                        <span className="text-[11px] text-slate-500">{item.desc}</span>
                      </button>
                    ))}
                  </div>
                </div>
              ) : null}

              <div className="flex items-center gap-2.5 rounded-2xl border border-slate-200 bg-slate-50 px-3 py-2.5 focus-within:border-indigo-400 focus-within:ring-2 focus-within:ring-indigo-500/20">
                <input
                  ref={inputRef}
                  type="text"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      e.preventDefault();
                      void handleSend();
                    }
                  }}
                  placeholder="Ask about cases, features, coach mode, /search, /help..."
                  className="flex-1 bg-transparent text-[13px] text-slate-800 outline-none placeholder:text-slate-400"
                />
                <button
                  onClick={() => void handleSend()}
                  disabled={!input.trim() || loading}
                  className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-indigo-600 to-violet-700 text-white transition hover:from-indigo-500 hover:to-violet-600 disabled:opacity-40"
                  aria-label="Send message"
                >
                  <Send size={15} />
                </button>
              </div>
            </div>

            <div className="mt-2.5 flex items-center justify-between text-[9px] font-semibold uppercase tracking-[0.18em] text-slate-400">
              <span>Case search enabled</span>
              <span>Context aware</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
