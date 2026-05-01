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
        "gemini-3-flash-preview",
        "gemini-2.5-flash",
        "gemini-2.5-pro",
    ];

    const model = genAI.getGenerativeModel({ model: modelsToTry[0] });

    const prompt = `
      You are a Legal Summarizer. 
      Compress the following case brief into a highly dense, accurate summary of approximately 300 tokens (approx 1200 characters).
      Keep all critical facts, parties involved, and legal issues.
      
      BRIEF:
      ${text}
      
      STRICT SUMMARY (max 300 tokens):
    `;

    const result = await model.generateContent(prompt);
    const summary = result.response.text();

    const response: MootCourtSummaryResponse = { summary };
    return NextResponse.json(response);
  } catch (error: unknown) {
    const { message, status } = getRouteErrorResponse(error);
    console.error("Brief summarization error:", error);
    return NextResponse.json({ error: message || "Failed to summarize brief" }, { status });
  }
}
