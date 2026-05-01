import { GoogleGenerativeAI } from "@google/generative-ai";
import { NextResponse } from "next/server";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "");

type SupportHistoryItem = {
  role?: string;
  content?: string;
};

const SYSTEM_PROMPT = `You are the Legal Digest Support Bot, a specialized assistant for the Legal Digest platform.
Your objective is to help users navigate and use the Legal Digest application.

SCOPE GUIDELINES:
1. ONLY answer questions related to Legal Digest features (Case Reader, Trial Simulator, Coach Mode, Community, Leaderboard, Region Selector, News, etc.).
2. If a user asks a general legal question, politely explain that you are only here to help with platform-related technical issues or feature explanations.
3. If a user asks something completely off-topic (e.g., weather, cooking), decline politely and redirect them to platform help.
4. Be professional, concise, and helpful.

LEGAL DIGEST FEATURES:
- Case Reader: Search and browse legal judgments from Delhi HC, Punjab & Haryana HC, and the Supreme Court.
- Trial Simulator: Practice oral arguments against an AI judge.
- Coach Mode: Live hints during practice.
- Region Selector: Filter content by region.
- Community: A place for legal researchers to share insights.
- Leaderboard: Compare practice performance.
- Personalization: Custom feeds based on user interest.

If the user asks what the platform is or how to use it, explain the features and guide them to the correct page or command.
If they ask to search a case, help them formulate a case name or case number query.

Format your responses in Markdown.`;

export async function POST(req: Request) {
  try {
    const { message, history } = await req.json();

    if (!message) {
      return NextResponse.json({ error: "Message is required" }, { status: 400 });
    }

    // Ensure history alternates correctly. 
    const cleanHistory = ((history || []) as SupportHistoryItem[])
      .filter((h, i) => !(i === 0 && h.role !== "user"))
      .map((h) => ({
        role: h.role === "user" ? "user" : "model",
        parts: [{ text: h.content || "" }],
      }));

    const modelsToTry = [
      "gemini-2.5-flash",
      "gemini-2.5-flash-lite",
      "gemini-2.5-pro",
      "gemini-3.1-flash",
      "gemini-3.1-pro",
      "gemini-1.5-flash",
      "gemini-2.0-flash"
    ];

    let text = "";
    let lastError = "";

    for (const modelName of modelsToTry) {
      try {
        const model = genAI.getGenerativeModel({ model: modelName });
        const chat = model.startChat({
          history: [
            { role: "user", parts: [{ text: SYSTEM_PROMPT }] },
            { role: "model", parts: [{ text: "Understood. I am the Legal Digest Support Bot. I will strictly stick to platform-related queries and assist users with Legal Digest features." }] },
            ...cleanHistory,
          ],
        });

        const result = await chat.sendMessage(message);
        const response = await result.response;
        text = response.text();
        if (text) break;
      } catch (err: unknown) {
        const message = err instanceof Error ? err.message : "Unknown error";
        console.warn(`Support Model ${modelName} failed:`, message);
        lastError = message;
      }
    }

    if (!text) {
      throw new Error(`All support bot models failed. Last error: ${lastError}`);
    }

    return NextResponse.json({ text });
  } catch (error: unknown) {
    console.error("Support API Error:", error);
    return NextResponse.json({ error: "Failed to generate response" }, { status: 500 });
  }
}
