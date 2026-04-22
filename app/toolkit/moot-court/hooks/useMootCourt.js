"use client";

import { useState, useCallback } from "react";
import * as groqService from "@/services/groqService";

/**
 * useMootCourt Hook
 * Manages the state, logic, and LLM orchestration for a Moot Court session.
 */
export default function useMootCourt(initialBrief, userSide) {
  const [messages, setMessages] = useState([]);
  const [brief, setBrief] = useState(initialBrief);
  const [usedTokens, setUsedTokens] = useState(0);
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState(null);
  const tokenLimit = 10000;

  /**
   * Helper: Add message and update tokens
   */
  const addMessage = useCallback((role, content) => {
    const tokens = groqService.approximateTokens(content);
    setUsedTokens(prev => prev + tokens);
    setMessages(prev => [...prev, { role, content, timestamp: new Date() }]);
  }, []);

  /**
   * Submit an argument (Player turn)
   */
  const submitArgument = async (content) => {
    if (usedTokens >= tokenLimit) return;
    
    addMessage(userSide.toLowerCase(), content);
    setIsProcessing(true);
    setError(null);

    try {
      const transcript = messages.map(m => `${m.role}: ${m.content}`).join("\n");
      const truncated = groqService.truncateTranscript(transcript);

      // 1. Get Judge Ruling
      const judgeRuling = await groqService.getJudgeRuling(brief, truncated);
      addMessage("judge", judgeRuling);

      // 2. Get AI Opposing Counsel Response (if applicable)
      const aiSide = userSide === "Plaintiff" ? "Defendant" : "Plaintiff";
      const counselResponse = await groqService.getCounselResponse(
        brief, 
        truncated + `\njudge: ${judgeRuling}`, 
        aiSide, 
        "Aggressive"
      );
      addMessage(aiSide.toLowerCase(), counselResponse);

    } catch (err) {
      console.error("Moot Court Error:", err);
      setError("AI failed to respond. Check connection or Groq API Key.");
    } finally {
      setIsProcessing(false);
    }
  };

  /**
   * Raise an objection
   */
  const object = async (reason) => {
    addMessage(userSide.toLowerCase(), `OBJECTION: ${reason}`);
    setIsProcessing(true);
    
    try {
      const transcript = messages.map(m => `${m.role}: ${m.content}`).join("\n");
      const ruling = await groqService.getJudgeRuling(brief, transcript);
      addMessage("judge", ruling);
    } catch (err) {
      setError("Judge failed to rule on objection.");
    } finally {
      setIsProcessing(false);
    }
  };

  /**
   * Capture last 10 exchanges for bug report
   */
  const reportBug = () => {
    const last10 = messages.slice(-10);
    console.log("BUG REPORT - LAST 10 EXCHANGES:", JSON.stringify(last10, null, 2));
    alert("Context captured in console. Thank you for reporting.");
  };

  const resetSession = () => {
    setMessages([]);
    setUsedTokens(0);
    setError(null);
  };

  return {
    messages,
    brief,
    usedTokens,
    isProcessing,
    error,
    submitArgument,
    object,
    resetSession,
    reportBug,
  };
}
