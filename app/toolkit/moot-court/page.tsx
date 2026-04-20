"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import type { ChangeEvent } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Gavel } from "lucide-react";
import { onAuthStateChanged } from "firebase/auth";

import { auth } from "@/lib/firebase";
import { supabase } from "@/lib/supabase";
import { SetupScreen } from "./components/setup-screen";
import { LoadingScreen } from "./components/loading-screen";
import { CourtroomView } from "./components/courtroom-view";
import { EvaluationView } from "./components/evaluation-view";
import { PhaseNavigator } from "./components/phase-navigator";
import { ObjectionButton } from "./components/objection-button";
import type {
  Attachment,
  CaseType,
  EvaluationResult,
  FirebaseUser,
  Jurisdiction,
  Message,
  MootCourtSession,
  RoleConfig,
  SpeechRecognitionEventLike,
  SpeechRecognitionLike,
  TrialPhase,
  ViewMode,
} from "./types";
import { QuickMootModal } from "./components/quick-moot-modal";
import { TokenMeter } from "./components/token-meter";
import { approximateTokenCount } from "@/lib/moot-court-utils";


export default function MootCourtPage() {
  const router = useRouter();
  const [view, setView] = useState<ViewMode>("setup");
  const [user, setUser] = useState<FirebaseUser | null>(null);
  const [caseType, setCaseType] = useState<CaseType>("Civil");
  const [jurisdiction, setJurisdiction] = useState<Jurisdiction>("Indian Civil Courts (CPC/IEA)");
  const [roles, setRoles] = useState<RoleConfig>({
    plaintiff: "Human",
    defendant: "AI",
    witness: "AI",
  });
  const [briefFile, setBriefFile] = useState<File | null>(null);
  const [briefText, setBriefText] = useState("");

  const [sessionId, setSessionId] = useState<string | null>(null);
  const [recentSessions, setRecentSessions] = useState<MootCourtSession[]>([]);
  const [isSaving, setIsSaving] = useState(false);

  const [witnessPersona, setWitnessPersona] = useState<string>("Cooperative");
  const [counselStrategy, setCounselStrategy] = useState<string>("Aggressive Case Building");
  const [difficulty, setDifficulty] = useState<"Easy" | "Medium" | "Hard">("Medium");
  const [isCoachMode, setIsCoachMode] = useState(false);
  const [coachHint, setCoachHint] = useState<string | null>(null);
  const [isSummoningWitness, setIsSummoningWitness] = useState(false);

  const [isPaused, setIsPaused] = useState(false);
  const [isOnline, setIsOnline] = useState(true);
  const [trialPhase, setTrialPhase] = useState<TrialPhase>("Opening Statements");
  const [activeTurn, setActiveTurn] = useState<string>("plaintiff");
  const [phaseProgress, setPhaseProgress] = useState(0);
  const [isListening, setIsListening] = useState<string | null>(null);
  const [isAudioMode, setIsAudioMode] = useState(false);

  const [messages, setMessages] = useState<Message[]>([]);
  const [plaintiffInput, setPlaintiffInput] = useState("");
  const [defendantInput, setDefendantInput] = useState("");
  const [witnessInput, setWitnessInput] = useState("");
  const [isJudgeThinking, setIsJudgeThinking] = useState(false);
  const [isEvaluating, setIsEvaluating] = useState(false);
  const [evaluation, setEvaluation] = useState<EvaluationResult | null>(null);
  const [attachedFile, setAttachedFile] = useState<Attachment | null>(null);

  const recognitionRef = useRef<SpeechRecognitionLike | null>(null);
  const [plaintiffScrollEl, setPlaintiffScrollEl] = useState<HTMLDivElement | null>(null);
  const [defendantScrollEl, setDefendantScrollEl] = useState<HTMLDivElement | null>(null);
  const [centerScrollEl, setCenterScrollEl] = useState<HTMLDivElement | null>(null);

  const [showChoiceModal, setShowChoiceModal] = useState(true);
  const [totalTokens, setTotalTokens] = useState(0);
  const [sessionStartTime, setSessionStartTime] = useState<Date | null>(null);
  const [primaryModel, setPrimaryModel] = useState("");


  const briefSourceLabel = briefText.trim() || (briefFile ? `Uploaded brief file: ${briefFile.name}` : "No brief selected yet.");

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      if (currentUser) fetchRecentSessions(currentUser.uid);
    });

    return () => unsubscribe();
  }, []);

  useEffect(() => {
    [plaintiffScrollEl, defendantScrollEl, centerScrollEl].forEach((el) => {
      if (el) {
        el.scrollTo({
          top: el.scrollHeight,
          behavior: "smooth",
        });
      }
    });
  }, [messages, plaintiffScrollEl, defendantScrollEl, centerScrollEl]);

  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => {
      setIsOnline(false);
      setIsPaused(true);
    };

    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);
    setIsOnline(navigator.onLine);

    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
    };
  }, []);

  const fetchRecentSessions = async (userId: string) => {
    const res = await fetch(`/api/moot-court/sessions?userId=${userId}&limit=5`);
    const data = await res.json();

    if (!data.error) setRecentSessions(data.sessions || []);
  };

  const resumeSession = async (session: MootCourtSession) => {
    setView("loading");
    setIsSaving(true);
    setSessionId(session.id);
    setCaseType(session.case_type as CaseType);

    try {
      const res = await fetch(`/api/moot-court/messages?sessionId=${session.id}`);
      const data = await res.json();
      if (!data.error) {
        setMessages(data.messages || []);
        // Basic heuristic to determine phase based on messages
        if (data.messages.length > 20) setTrialPhase("Closing Arguments");
        else if (data.messages.length > 10) setTrialPhase("Witness Examination");
        else setTrialPhase("Opening Statements");
      }
      setView("trial");
    } catch (err) {
      console.error("Resume failed:", err);
      setView("setup");
    } finally {
      setIsSaving(false);
    }
  };

  const deleteSession = async (sessionId: string) => {
    try {
      await fetch(`/api/moot-court/sessions?sessionId=${sessionId}`, { method: "DELETE" });
      setRecentSessions((prev) => prev.filter((s) => s.id !== sessionId));
    } catch (err) {
      console.error("Delete session failed:", err);
    }
  };

  const saveMessageToDB = async (sId: string, msg: Message, side?: string) => {
    if (!user) return;

    try {
      await supabase.from("moot_court_messages").insert([
        {
          session_id: sId,
          role: msg.role,
          content: msg.content,
          side: side || (msg.role === "plaintiff" || msg.role === "defendant" ? msg.role : null),
        },
      ]);
    } catch (err) {
      console.error("Failed to save message:", err);
    }
  };

  const logSessionActivity = async (status: 'active' | 'completed' | 'failed' = 'active') => {
    if (!sessionId || !user) return;

    try {
      await supabase.from("session_logs").upsert({
        session_id: sessionId,
        user_id: user.uid,
        turn_count: messages.length,
        total_tokens: totalTokens,
        primary_model: primaryModel,
        status,
        metadata: {
          caseType,
          jurisdiction,
          difficulty,
          trialPhase
        }
      }, { onConflict: 'session_id' });
    } catch (err) {
      console.error("Logging failed:", err);
    }
  };


  const speak = (text: string, role?: string) => {
    if (!isAudioMode || isPaused) {
      window.speechSynthesis.cancel();
      return;
    }

    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);

    if (role === "judge") {
      utterance.pitch = 0.8;
      utterance.rate = 0.9;
    } else if (role === "witness") {
      utterance.pitch = 1.1;
    }

    window.speechSynthesis.speak(utterance);
  };

  const fetchCoachHint = async () => {
    if (!isCoachMode) return;

    try {
      const res = await fetch("/api/toolkit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          tool: "moot-court-coach",
          context: messages.slice(-5).map((m) => `${m.role}: ${m.content}`).join("\n"),
          jurisdiction,
          trialPhase,
        }),
      });

      const data = await res.json();
      if (data.result) setCoachHint(data.result);
    } catch (err) {
      console.error("Coach hint failed:", err);
    }
  };

  const getEvaluation = async () => {
    if (messages.length < 3) {
      setView("setup");
      return;
    }

    setIsEvaluating(true);
    try {
      const fullTranscript = messages.map((m) => `${m.role.toUpperCase()}: ${m.content}`).join("\n");
      const res = await fetch("/api/toolkit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          tool: "moot-court",
          role: "evaluator",
          content: fullTranscript,
        }),
      });

      const data = await res.json();
      if (data.result) {
        const cleanedResult = data.result.replace(/```json|```/g, "").trim();
        const parsed = JSON.parse(cleanedResult);
        setEvaluation(parsed);

        if (sessionId) {
          await fetch("/api/moot-court/sessions", {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ sessionId, evaluation: parsed }),
          });
        }

        setView("evaluation");
      }
    } catch (err) {
      console.error("Evaluation failed:", err);
    } finally {
      setIsEvaluating(false);
      logSessionActivity('completed');
    }
  };


  const startTrial = async () => {
    setView("loading");
    setIsSaving(true);

    const initialMsg: Message = {
      role: "judge",
      content: `The Hon'ble Bench is now in session. We are presiding over a ${caseType} matter today under ${jurisdiction}. Counsel for the Petitioner, you may lead the presentation.`,
      timestamp: new Date(),
    };

    await new Promise((resolve) => setTimeout(resolve, 900));
    setMessages([initialMsg]);
    setView("trial");

    if (user) {
      try {
        const createRes = await fetch("/api/moot-court/sessions", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            userId: user.uid,
            courtType: "High Court",
            caseType,
          }),
        });
        const createData = await createRes.json();
        if (createData.session?.id) {
          setSessionId(createData.session.id);
          await saveMessageToDB(createData.session.id, initialMsg);
        }
      } catch (err) {
        console.error("Failed to persist session:", err);
      }
    }

    setIsSaving(false);
    setSessionStartTime(new Date());
    logSessionActivity('active');
  };

  const handleQuickMoot = (role: "Plaintiff" | "Defendant") => {
    setCaseType("Contract Dispute");
    setJurisdiction("Indian Civil Courts (CPC/IEA)");
    setBriefText("A software development company (Petitioner) sues a retail client (Respondent) for ₹50 Lakhs in unpaid invoices. The Respondent alleges that the software was delivered 6 months late and contained critical bugs that caused business loss. The Petitioner argues that the delays were caused by the Respondent changing requirements 15 times mid-project.");
    setRoles({
      plaintiff: role === "Plaintiff" ? "Human" : "AI",
      defendant: role === "Defendant" ? "Human" : "AI",
      witness: "AI"
    });
    setShowChoiceModal(false);
    // Use a slight delay to ensure states are updated if needed, though setState is async
    setTimeout(() => startTrial(), 100);
  };


  const handleObjection = async (aiObjectionContent?: string) => {
    setIsJudgeThinking(true);
    const lastMsg = messages[messages.length - 1];
    const systemMsg: Message = { role: "system", content: "OBJECTION RAISED!", timestamp: new Date() };
    setMessages((prev) => [...prev, systemMsg]);

    try {
      const res = await fetch("/api/toolkit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          tool: "moot-court",
          role: "judge",
          isObjection: true,
          content: aiObjectionContent || lastMsg?.content || "An objection was raised to the proceeding.",
          context: messages.slice(-15).map((m) => `${m.role}: ${m.content}`).join("\n"),
          jurisdiction,
          witnessPersona,
          counselStrategy,
        }),
      });

      const data = await res.json();
      if (data.result) {
        const isSustained = data.result.toLowerCase().includes("sustained");
        if (isSustained && messages.length > 0) {
          setMessages((prev) => {
            const nextMessages = [...prev];
            // If the user objected manually, the target is the message before the system message.
            // If the AI objected, the target is the message before the AI's objection.
            let targetIdx = nextMessages.length - 2;
            if (aiObjectionContent) {
              // The system message is last. The AI objection is second to last. The target is third to last.
              targetIdx = nextMessages.length - 3;
            }
            if (targetIdx >= 0) nextMessages[targetIdx] = { ...nextMessages[targetIdx], isInadmissible: true };
            return nextMessages;
          });
        }

        const judgeMsg: Message = {
          role: "judge",
          content: `${isSustained ? "SUSTAINED" : "OVERRULED"}. ${data.result}`,
          timestamp: new Date(),
        };
        setMessages((prev) => [...prev, judgeMsg]);
        if (sessionId) await saveMessageToDB(sessionId, judgeMsg);
        speak(judgeMsg.content, "judge");
      }
    } catch (err) {
      console.error("Objection failed:", err);
    } finally {
      setIsJudgeThinking(false);
    }
  };



  const handleSendMessage = async (role: "plaintiff" | "defendant" | "witness", content: string) => {
    if (!content.trim()) return;

    if (role === "witness" && trialPhase !== "Witness Examination") {
      alert("Witness questions are only available during the Witness Examination phase.");
      return;
    }

    const newMsg: Message = { role, content, timestamp: new Date() };
    setMessages((prev) => [...prev, newMsg]);
    if (sessionId) await saveMessageToDB(sessionId, newMsg, role);

    if (role === "plaintiff") {
      setPlaintiffInput("");
      setActiveTurn("defendant");
    }
    if (role === "defendant") {
      setDefendantInput("");
      setActiveTurn("plaintiff");
    }
    if (role === "witness") setWitnessInput("");

    setIsJudgeThinking(true);
    try {
      // Token optimization: Send only recent context and truncate brief
      const context = messages.slice(-6).map((m) => `${m.role.toUpperCase()}: ${m.content}`).join("\n");
      const truncatedBrief = briefText ? briefText.substring(0, 1500) + (briefText.length > 1500 ? "..." : "") : "";

      const res = await fetch("/api/toolkit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          tool: "moot-court",
          role: "judge",
          content,
          context,
          caseType,
          jurisdiction,
          trialPhase,
          activeTurn,
          witnessPersona,
          counselStrategy,
          brief: truncatedBrief,
          file: attachedFile,
          messageCount: messages.length,
          preferredModel: primaryModel,
        }),
      });

      setAttachedFile(null);
      const data = await res.json();
      
      if (data.usedModel && data.usedModel !== primaryModel) {
        setPrimaryModel(data.usedModel);
      }

      
      // Update tokens
      const sentTokens = approximateTokenCount(content + context);
      const receivedTokens = data.result ? approximateTokenCount(data.result) : 0;
      setTotalTokens(prev => prev + sentTokens + receivedTokens);

      if (data.result) {
        let judgeResponse = data.result;
        
        // Check if the AI judge signaled to advance phase
        const shouldAdvance = judgeResponse.includes("[NEXT_PHASE]");
        judgeResponse = judgeResponse.replace("[NEXT_PHASE]", "").trim();

        const judgeMsg: Message = { role: "judge", content: judgeResponse, timestamp: new Date() };
        setMessages((prev) => [...prev, judgeMsg]);
        if (sessionId) await saveMessageToDB(sessionId, judgeMsg);
        speak(judgeResponse, "judge");

        const plaintiffIsAI = roles.plaintiff === "AI";
        const defendantIsAI = roles.defendant === "AI";

        if (isCoachMode && (role === "plaintiff" || role === "defendant" || role === "witness")) {
          fetchCoachHint();
        }

        // Auto-generate AI argument for opposing side or witness
        if (trialPhase === "Witness Examination") {
          // If counsel asked a question, the witness answers.
          await generateAIArgument("witness", judgeResponse);
        } else {
          if (role === "plaintiff" && defendantIsAI) {
            await generateAIArgument("defendant", judgeResponse);
          } else if (role === "defendant" && plaintiffIsAI) {
            await generateAIArgument("plaintiff", judgeResponse);
          }
        }

        // If judge signaled phase advance, do it after a short delay
        if (shouldAdvance) {
          setTimeout(() => advanceToNextPhase(trialPhase), 2000);
        }
        
        logSessionActivity();
      }
    } catch (err) {
      console.error("AI failed:", err);
      logSessionActivity('failed');
    } finally {
      setIsJudgeThinking(false);
    }
  };


  const generateAIArgument = async (aiRole: "plaintiff" | "defendant" | "witness", lastJudgeResponse: string) => {
    await new Promise((resolve) => setTimeout(resolve, 1200));

    try {
      // Token optimization: Send only recent context and truncate brief
      const context = messages.slice(-4).map((m) => `${m.role.toUpperCase()}: ${m.content}`).join("\n");
      const truncatedBrief = briefText ? briefText.substring(0, 1500) + (briefText.length > 1500 ? "..." : "") : "";

      const res = await fetch("/api/toolkit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          tool: "moot-court",
          role: aiRole === "witness" ? "witness" : "counsel",
          content: lastJudgeResponse,
          context,
          activeTurn: aiRole,
          trialPhase,
          jurisdiction,
          caseType,
          counselStrategy,
          brief: truncatedBrief,
          preferredModel: primaryModel,
        }),
      });

      const data = await res.json();
      
      if (data.usedModel && data.usedModel !== primaryModel) {
        setPrimaryModel(data.usedModel);
      }

      
      // Update tokens
      const sentTokens = approximateTokenCount(lastJudgeResponse + context);
      const receivedTokens = data.result ? approximateTokenCount(data.result) : 0;
      setTotalTokens(prev => prev + sentTokens + receivedTokens);

      if (data.result) {
        const aiMsg: Message = { role: aiRole, content: data.result, timestamp: new Date() };
        setMessages((prev) => [...prev, aiMsg]);
        if (sessionId) await saveMessageToDB(sessionId, aiMsg, aiRole);
        speak(aiMsg.content, aiRole);
        
        if (data.result.toUpperCase().includes("OBJECTION")) {
          // Trigger objection flow
          handleObjection(aiMsg.content);
        } else if (aiRole !== "witness") {
          setActiveTurn(aiRole === "plaintiff" ? "defendant" : "plaintiff");
        }
        
        logSessionActivity();
      }
    } catch (err) {
      console.error("AI argument generation failed:", err);
    }
  };


  const advanceToNextPhase = (fromPhase: TrialPhase) => {
    const phases: TrialPhase[] = ["Opening Statements", "Witness Examination", "Closing Arguments", "Verdict Deliberation"];
    const currentIndex = phases.indexOf(fromPhase);

    if (currentIndex < phases.length - 1) {
      const nextPhase = phases[currentIndex + 1];
      setTrialPhase(nextPhase);
      setPhaseProgress(currentIndex + 1);

      const systemMsg: Message = {
        role: "system",
        content: `⚖️ COURT ORDER: The bench is advancing proceedings to ${nextPhase}.`,
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, systemMsg]);

      if (nextPhase === "Verdict Deliberation") {
        // Auto-trigger evaluation after a short delay
        setTimeout(() => getEvaluation(), 2000);
      }
    } else {
      getEvaluation();
    }
  };

  const handleNextPhase = () => {
    advanceToNextPhase(trialPhase);
  };

  const handleFileUpload = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.type !== "application/pdf") {
      alert("Please upload only PDF files.");
      return;
    }

    if (file.size > 4 * 1024 * 1024) {
      alert("File size exceeds 4MB limit.");
      return;
    }

    const reader = new FileReader();
    reader.onload = async () => {
      const base64Data = (reader.result as string).split(",")[1];
      setAttachedFile({
        name: file.name,
        data: base64Data,
        mimeType: file.type,
      });

      // Task 4: Summarize brief on upload
      try {
        // Here we'd ideally extract text from PDF first, but for now assuming we use briefText
        // or just the briefText area for demonstration.
        // Let's call the summarizer if briefText is populated.
        if (briefText.length > 500) {
          const res = await fetch("/api/moot-court/summarize", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ text: briefText }),
          });
          const data = await res.json();
          if (data.summary) {
            setBriefText(data.summary + "\n\n(Summarized for efficiency)");
          }
        }
      } catch (err) {
        console.error("Summarization failed:", err);
      }
    };
    reader.readAsDataURL(file);
  };


  const startListening = (role: "plaintiff" | "defendant" | "witness") => {
    if (isListening) {
      recognitionRef.current?.stop();
      setIsListening(null);
      return;
    }

    const speechWindow = window as Window & {
      SpeechRecognition?: new () => SpeechRecognitionLike;
      webkitSpeechRecognition?: new () => SpeechRecognitionLike;
    };
    const SpeechRecognition = speechWindow.SpeechRecognition || speechWindow.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      alert("Speech recognition is not supported in this browser.");
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.lang = "en-US";

    recognition.onstart = () => setIsListening(role);
    recognition.onresult = (event: SpeechRecognitionEventLike) => {
      const transcript = Array.from(event.results)
        .map((result) => result[0])
        .map((result) => result.transcript)
        .join("");

      if (role === "plaintiff") setPlaintiffInput(transcript);
      if (role === "defendant") setDefendantInput(transcript);
      if (role === "witness") setWitnessInput(transcript);
    };

    recognition.onerror = (event: { error: string }) => {
      console.error("Speech Recognition Error:", event.error);
      setIsListening(null);
    };

    recognition.onend = () => setIsListening(null);

    recognitionRef.current = recognition;
    recognition.start();
  };

  return (
    <div className="min-h-screen bg-[#F8F9FA] text-slate-900 selection:bg-indigo-100 font-sans">
      <QuickMootModal 
        isOpen={showChoiceModal} 
        onClose={() => router.push("/toolkit")}
        onQuickMoot={handleQuickMoot}
        onCustomTrial={() => setShowChoiceModal(false)}
      />

      <AnimatePresence mode="wait">

        {view === "setup" ? (
          <SetupScreen
            key="setup"
            caseType={caseType}
            setCaseType={setCaseType}
            jurisdiction={jurisdiction}
            setJurisdiction={setJurisdiction}
            roles={roles}
            setRoles={setRoles}
            witnessPersona={witnessPersona}
            setWitnessPersona={setWitnessPersona}
            counselStrategy={counselStrategy}
            setCounselStrategy={setCounselStrategy}
            difficulty={difficulty}
            setDifficulty={setDifficulty}
            isCoachMode={isCoachMode}
            setIsCoachMode={setIsCoachMode}
            setBrief={(file) => {
              setBriefFile(file);
              if (file) setBriefText(`Uploaded brief file: ${file.name}`);
            }}
            briefText={briefText}
            setBriefText={setBriefText}
            onStart={startTrial}
            recentSessions={recentSessions}
            onResumeSession={resumeSession}
            onDeleteSession={deleteSession}
            isSaving={isSaving}
          />
        ) : view === "loading" ? (
        <LoadingScreen key="loading" label={briefSourceLabel} />
        ) : view === "evaluation" ? (
        <EvaluationView key="evaluation" evaluation={evaluation} transcript={messages} onClose={() => setView("setup")} />
        ) : (
        <div key="courtroom" className="relative flex min-h-screen flex-col">
          <PhaseNavigator currentPhase={trialPhase} progress={phaseProgress} />
          
          {/* Token Meter Overlay */}
          <div className="fixed bottom-6 right-6 z-[100] w-64">
            <TokenMeter usedTokens={totalTokens} />
          </div>

          <div className="relative flex-1 overflow-hidden">

            <CourtroomView
              trialPhase={trialPhase}
              activeTurn={activeTurn}
              plaintiffScrollRef={setPlaintiffScrollEl}
              defendantScrollRef={setDefendantScrollEl}
              centerScrollRef={setCenterScrollEl}
              roles={roles}
              messages={messages}
              plaintiffInput={plaintiffInput}
              setPlaintiffInput={setPlaintiffInput}
              defendantInput={defendantInput}
              setDefendantInput={setDefendantInput}
              witnessInput={witnessInput}
              setWitnessInput={setWitnessInput}
              onSend={handleSendMessage}
              onObjection={handleObjection}
              isJudgeThinking={isJudgeThinking}
              isAudioMode={isAudioMode}
              setIsAudioMode={setIsAudioMode}
              isSummoningWitness={isSummoningWitness}
              setIsSummoningWitness={setIsSummoningWitness}
              isListening={isListening}
              onStartListening={startListening}
              isCoachMode={isCoachMode}
              coachHint={coachHint}
              setCoachHint={setCoachHint}
              onFinish={getEvaluation}
              onNextPhase={handleNextPhase}
              onFileUpload={handleFileUpload}
              attachedFile={attachedFile}
              isPaused={isPaused}
              setIsPaused={setIsPaused}
              isOnline={isOnline}
            />
          </div>
        </div>
        )}

        {isEvaluating && (
          <motion.div
            key="eval-loading"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[2000] bg-slate-900/90 backdrop-blur-xl flex flex-col items-center justify-center text-white"
          >
            <div className="relative w-24 h-24 mb-8">
              <div className="absolute inset-0 border-4 border-indigo-500/20 rounded-full"></div>
              <div className="absolute inset-0 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin"></div>
              <Gavel className="absolute inset-0 m-auto text-indigo-400 animate-pulse" size={32} />
            </div>
            <h2 className="text-2xl font-black uppercase tracking-[0.3em] mb-4">Delivering Final Verdict</h2>
            <p className="text-slate-400 font-medium animate-pulse">The Hon&apos;ble Bench is drafting its final ratio decidendi...</p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
