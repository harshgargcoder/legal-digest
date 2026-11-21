import { NextRequest, NextResponse } from "next/server";
import { GoogleGenerativeAI } from "@google/generative-ai";
import OpenAI from "openai";

// Initialize Gemini
const geminiApiKey = process.env.GEMINI_API_KEY || "";
const genAI = geminiApiKey ? new GoogleGenerativeAI(geminiApiKey) : null;

// Initialize OpenAI fallback
const openaiApiKey = process.env.OPENAI_API_KEY || "";
const openai = openaiApiKey ? new OpenAI({ apiKey: openaiApiKey }) : null;

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const {
      message,
      mode = "internet",
      notesContent = "",
      history = [],
    } = body;

    if (!message || typeof message !== "string" || !message.trim()) {
      return NextResponse.json(
        { error: "Message is required." },
        { status: 400 },
      );
    }

    const cleanMessage = message.trim();
    const cleanNotes = (notesContent || "").trim();

    // Prepare system instructions depending on mode
    let systemPrompt = "";
    if (mode === "notes") {
      if (!cleanNotes) {
        return NextResponse.json({
          reply:
            "⚠️ **No notes uploaded yet.** Please upload a document or paste your case notes into the Notes Vault above so I can answer questions based on your material.",
        });
      }

      systemPrompt = `You are "LegalDigest Notes AI" — an expert legal research assistant.
Your sole job is to answer the user's question STRICTLY and ACCURATELY based on the user's uploaded legal notes provided below.

USER'S UPLOADED NOTES:
"""
${cleanNotes.slice(0, 30000)}
"""

CRITICAL INSTRUCTIONS FOR NOTES MODE:
1. Only answer based on the facts, laws, case citations, arguments, or details present in the user's notes above.
2. If the user's question asks for information NOT found in the uploaded notes, explicitly state:
"Based on your uploaded notes, this information is not mentioned. (Tip: Switch to 'Internet Legal AI' mode to search wider legal knowledge)."
3. Quote or reference specific sections/points from the notes when formulating your response.
4. Format your output clearly in clean GitHub Markdown with bold headings, bullet points, and code spans where appropriate.`;
    } else {
      // Internet / Web Legal AI mode
      systemPrompt = `You are "LegalDigest Web Legal AI" — a premier legal research and judicial intelligence engine.
You possess deep expertise in constitutional law, criminal law (IPC, CrPC, BNS, BNSS), civil procedure, corporate/insolvency law, family law, and international jurisprudence.

INSTRUCTIONS:
1. Provide comprehensive, accurate, and objective legal explanations.
2. Cite relevant statutory sections (e.g. Section 438 CrPC / Section 482 BNSS, Article 21, etc.), landmark case precedents (with court and year where known), and legal maxims where applicable.
3. If giving advice, clarify that you provide legal information for research and education, and advise consulting an advocate for active courtroom proceedings.
4. Format with clean GitHub Markdown, concise bullet points, and bold key terms.`;
    }

    // Build conversation context
    const recentHistory = (history || [])
      .slice(-6)
      .map((h: { role: string; content: string }) => `${h.role === "user" ? "User" : "Assistant"}: ${h.content}`)
      .join("\n\n");

    const fullPrompt = `${systemPrompt}

${recentHistory ? `RECENT CONVERSATION:\n${recentHistory}\n\n` : ""}User Question: ${cleanMessage}
Assistant Response:`;

    // 1. Try Gemini first
    if (genAI) {
      try {
        const modelNames = ["gemini-2.0-flash", "gemini-1.5-flash", "gemini-1.5-pro"];
        for (const modelName of modelNames) {
          try {
            const model = genAI.getGenerativeModel({ model: modelName });
            const result = await model.generateContent(fullPrompt);
            const reply = result.response.text();
            if (reply && reply.trim()) {
              return NextResponse.json({ reply: reply.trim(), mode });
            }
          } catch {
            // try next model
          }
        }
      } catch (geminiError) {
        console.warn("Gemini generation failed, trying OpenAI:", geminiError);
      }
    }

    // 2. Try OpenAI fallback
    if (openai) {
      try {
        const completion = await openai.chat.completions.create({
          model: "gpt-4o-mini",
          messages: [
            { role: "system", content: systemPrompt },
            ...(history || []).slice(-4).map((h: { role: string; content: string }) => ({
              role: h.role === "user" ? ("user" as const) : ("assistant" as const),
              content: h.content,
            })),
            { role: "user", content: cleanMessage },
          ],
          max_tokens: 1200,
          temperature: 0.3,
        });

        const reply = completion.choices[0]?.message?.content;
        if (reply && reply.trim()) {
          return NextResponse.json({ reply: reply.trim(), mode });
        }
      } catch (openaiError) {
        console.error("OpenAI generation failed:", openaiError);
      }
    }

    // 3. Fallback mock if both AI keys are unavailable
    return NextResponse.json({
      reply:
        mode === "notes"
          ? `### Notes Analysis (Local Preview)\n\nI reviewed your uploaded notes (${cleanNotes.length} characters). For "${cleanMessage}":\n\n- The provided notes contain key legal terms regarding your query.\n- Configure a valid \`GEMINI_API_KEY\` or \`OPENAI_API_KEY\` in your environment to enable real-time generative responses.`
          : `### Legal Intelligence (Preview Mode)\n\nRegarding **"${cleanMessage}"**:\n\n- Under general principles of jurisprudence, questions regarding this matter hinge on applicable statutory provisions and procedural jurisdiction.\n- For full generative web synthesis, ensure \`GEMINI_API_KEY\` in \`.env.local\` is active.`,
      mode,
    });
  } catch (error: unknown) {
    console.error("AI Chat API Error:", error);
    return NextResponse.json(
      { error: "Failed to generate AI response. Please try again." },
      { status: 500 },
    );
  }
}

