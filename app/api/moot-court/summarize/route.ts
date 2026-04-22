import { NextResponse } from "next/server";
import { GoogleGenerativeAI } from "@google/generative-ai";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "");

export async function POST(req: Request) {
  try {
    const { text } = await req.json();

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

    return NextResponse.json({ summary });
  } catch (error: any) {
    console.error("Brief summarization error:", error);
    return NextResponse.json({ error: "Failed to summarize brief" }, { status: 500 });
  }
}
