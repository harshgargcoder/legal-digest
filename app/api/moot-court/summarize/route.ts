import { NextResponse } from "next/server";
import { GoogleGenerativeAI } from "@google/generative-ai";
import {
  enforceRateLimit,
  getRouteErrorResponse,
  requireFirebaseUser,
} from "@/lib/route-security";
import type {
  MootCourtSummaryRequest,
  MootCourtSummaryResponse,
} from "@/lib/api-types";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "");

export async function POST(req: Request) {
  try {
    const auth = await requireFirebaseUser(req);
    enforceRateLimit(`moot-court:summarize:${auth.uid}`, {
      limit: 20,
      windowMs: 60_000,
    });

    const { text } = (await req.json()) as MootCourtSummaryRequest;

    if (!text || text.length < 100) {
      return NextResponse.json({ summary: text });
    }

    const modelsToTry = [
        "gemini-3.1-flash-lite",
        "gemini-3.1-flash-lite-preview",
        "gemini-2.5-flash",
        "gemini-3.1-pro-preview",
    ];

    let summary = "";
    let lastError = "";

    const prompt = `
      You are a Legal Summarizer. 
      Compress the following case brief into a highly dense, accurate summary of approximately 300 tokens (approx 1200 characters).
      Keep all critical facts, parties involved, and legal issues.
      
      BRIEF:
      ${text}
      
      STRICT SUMMARY (max 300 tokens):
    `;

    for (const modelName of modelsToTry) {
      try {
        const model = genAI.getGenerativeModel({ model: modelName });
        const result = await model.generateContent(prompt);
        summary = result.response.text();
        if (summary) break;
      } catch (err: unknown) {
        lastError = err instanceof Error ? err.message : String(err);
        console.warn(`Moot Court Summarize Model ${modelName} failed:`, lastError);
      }
    }

    if (!summary) {
      throw new Error(`All moot court summarization models failed. Last error: ${lastError}`);
    }

    const response: MootCourtSummaryResponse = { summary };
    return NextResponse.json(response);
  } catch (error: unknown) {
    const { message, status } = getRouteErrorResponse(error);
    console.error("Brief summarization error:", error);
    return NextResponse.json({ error: message || "Failed to summarize brief" }, { status });
  }
}
