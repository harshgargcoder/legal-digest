import { GoogleGenerativeAI } from "@google/generative-ai";
import { NextResponse } from "next/server";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "");

const SYSTEM_PROMPT = `You are the Legal Digest Support Bot, a specialized assistant for the Legal Digest platform.
Your objective is to help users navigate and use the Legal Digest application.

SCOPE GUIDELINES:
1. ONLY answer questions related to Legal Digest features (Case Topology, AI Briefs, Community Insights, News Categories, etc.).
2. If a user asks a general legal question, politely explain that you are only here to help with platform-related technical issues or feature explanations.
3. If a user asks something completely off-topic (e.g., weather, cooking), decline politely and redirect them to platform help.
4. Be professional, concise, and helpful.

LEGAL DIGEST FEATURES:
- Case Topology: Visual graph of legal precedents.
- AI Briefs: Summarization of complex judgments.
- Community: A place for legal researchers to share insights.
- Personalization: Custom feeds based on user interest.

Format your responses in Markdown.`;

export async function POST(req: Request) {
  try {
    const { message, history } = await req.json();

    if (!message) {
      return NextResponse.json({ error: "Message is required" }, { status: 400 });
    }

    const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

    // Ensure history alternates correctly. 
    // The SupportBot sends the initial greeting as the first message, which is 'bot' (model).
    // Our startChat history already has [user: SYSTEM_PROMPT, model: "Understood..."].
    // So the next message MUST be 'user'. We should skip the initial bot greeting.
    const cleanHistory = (history || [])
      .filter((h: any, i: number) => !(i === 0 && h.role !== "user"))
      .map((h: any) => ({
        role: h.role === "user" ? "user" : "model",
        parts: [{ text: h.content }],
      }));

    const chat = model.startChat({
      history: [
        { role: "user", parts: [{ text: SYSTEM_PROMPT }] },
        { role: "model", parts: [{ text: "Understood. I am the Legal Digest Support Bot. I will strictly stick to platform-related queries and assist users with Legal Digest features." }] },
        ...cleanHistory,
      ],
    });

    const result = await chat.sendMessage(message);
    const response = await result.response;
    const text = response.text();

    return NextResponse.json({ text });
  } catch (error: any) {
    console.error("Support API Error:", error);
    return NextResponse.json({ error: "Failed to generate response" }, { status: 500 });
  }
}
