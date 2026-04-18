import { GoogleGenerativeAI, Part } from "@google/generative-ai";
import OpenAI from "openai";
import { NextResponse } from "next/server";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "");

// In-memory rate limit store (resets on server restart)
const rateLimitMap = new Map<string, number[]>();

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { tool, content, context, file } = body;

    if (!content && !file) {
      return NextResponse.json({ error: "Content or file is required" }, {
        status: 400,
      });
    }

    let prompt = "";

    switch (tool) {
      case "moot-court":
        {
          const {
            role: mcRole,
            jurisdiction,
            caseType,
            brief: mcBrief,
            trialPhase,
            activeTurn,
            isObjection,
            witnessPersona,
            counselStrategy,
          } = body;

          if (isObjection) {
            prompt = `
              SYSTEM PROMPT LAYERS (JUDGE):
              1. JURISDICTION: ${jurisdiction || "Indian Courts (CPC/IEA)"}
              2. CASE FACTS: ${mcBrief || "Standard facts."}
              3. PHASE: ${trialPhase}
              4. RECORD: ${context}
              5. ROLE: You are a neutral, experienced presiding judge ruling on a real-time objection.
              
              OBJECTION CONTEXT: A party has objected to the statement: "${content}".
              
              JUDGE RESPONSIBILITIES:
              - Rule "SUSTAINED" or "OVERRULED".
              - Provide legal reasoning based strictly on ${jurisdiction}.
              - Maintain a formal, impartial judicial tone.
              - Response must be under 50 words.
            `;
          } else if (mcRole === "evaluator") {
            prompt = `
              POST-SESSION EVALUATOR AI:
              You are a senior law professor and judicial trainer.
              READ FULL TRANSCRIPT: "${content}"
              
              EVALUATION DIMENSIONS:
              1. Legal Reasoning: Grounding in law?
              2. Objection Accuracy: Strategic timing and legal basis?
              3. Examination Quality: Use of leading/open questions?
              4. Procedural Compliance: Court etiquette and order?
              
              Return a STRICT JSON response (no other text):
              {
                "legalReasoning": number (0-100),
                "objectionAccuracy": number (0-100),
                "examinationQuality": number (0-100),
                "proceduralCompliance": number (0-100),
                "verdict": "Formal finding + ratio decidendi + cited laws (100 words max)",
                "strengths": ["string", "string"],
                "improvements": ["string", "string"]
              }
            `;
          } else if (mcRole === "witness") {
            prompt = `
              SYSTEM PROMPT LAYERS (WITNESS):
              1. CHARACTER BRIEF: You are a witness in this ${caseType} case. Persona: ${
              witnessPersona || "Cooperative"
            }. If your name isn't mentioned in the facts, invent a realistic name for yourself.
              2. CHARACTER KNOWLEDGE: Answer only what your character would logically know based on: "${mcBrief}".
              3. ROLEPLAY MODE: Answer in the first person. Stay consistent in tone (emotion: ${witnessPersona}).
              4. CONSISTENCY TRACKER: Do not contradict your prior statements in the record: "${context}".
              
              COUNSEL QUESTION: "${content}"
              
              TASK: Respond as the witness. Keep it under 60 words.
            `;
          } else if (mcRole === "counsel") {
            prompt = `
              SYSTEM PROMPT LAYERS (COUNSEL):
              1. CONTEXT: You are an advocate for the ${
              activeTurn === "plaintiff" ? "Plaintiff" : "Defendant"
            }.
              2. STRATEGY: ${
              counselStrategy || "Aggressive case building"
            }. Focus on precedents and burden of proof.
              3. RECORD: Use prior statements in this session: "${context}".
              4. ROLE: Experienced advocate. Never fabricate facts outside the case brief: "${mcBrief}".
              
              CURRENT SITUATION: The ${
              activeTurn === "plaintiff" ? "Respondent" : "Petitioner"
            } just said/did: "${content}".
              
              CAPABILITIES:
              - If it's your turn: Make a strategic argument or cross-examine.
              - If out of turn: Detect procedural/evidentiary violations and raise an objection.
              
              TASK: Provide a response. If objecting, start with "OBJECTION, MY LORD." Else, keep it under 80 words.
            `;
          } else {
            // Default to Judge
            prompt = `
              SYSTEM PROMPT LAYERS (JUDGE):
              1. JURISDICTION: ${jurisdiction || "Indian Courts (CPC/IEA)"}
              2. CASE FACTS: ${mcBrief || "Standard principles."}
              3. PHASE: ${trialPhase}. Active turn: ${activeTurn}.
              4. RECORD: "${context}"
              5. ROLE: You are a neutral, experienced presiding judge.
              
              JUDGE RESPONSIBILITIES:
              - Enforce procedure: Interrupt if a party violates rules.
              - Procedure enforcement: Identify out-of-turn inputs.
              - Tone Management: Formal court language, impartial, no commentary.
              
              PHASE ADVANCEMENT RULE:
              If you determine that the arguments in the current phase ("${trialPhase}") have been sufficiently presented by both sides, OR the arguments are becoming weak, repetitive, or circular with no new legal merit, you MUST append the exact text "[NEXT_PHASE]" at the very end of your response (after your judicial statement). Do NOT advance unless you genuinely believe the phase is exhausted. Let strong lawyers argue as long as they want.
              
              CRITICAL RULE: DO NOT ROLEPLAY. You are ONLY the Judge. Do not write dialogue for the Witness or Counsel. If this is the "Witness Examination" phase and Counsel is asking a question, simply say "Proceed." or provide a brief judicial acknowledgement.
              
              COUNSEL STATEMENT: "${content}"
              
              TASK: Standard judicial reaction or question. Under 80 words.
            `;
          }
        }
        break;

      case "moot-court-coach":
        {
          const { jurisdiction: coachJ, trialPhase: coachP } = body;
          prompt = `
            ROLE: You are the user's Legal Coach.
            CONTEXT: A Moot Court simulation under ${coachJ}. Current Phase: ${coachP}.
            RECORD: "${content || context}"
            
            TASK: Suggest the user's next strategic move. 
            - If they should object, tell them why.
            - If they should ask a specific question, suggest one.
            - Keep it brief, supportive, and highly tactical.
            - Format: Single sentence "whisper". Max 40 words.
          `;
        }
        break;

      case "citation-detective":
        prompt = `
          You are an expert legal researcher and editor. 
          Analyze the following legal research draft for citations: "${
          content || "See attached file"
        }".

          TASK:
          1. Scan the text/image/PDF for any case laws or statutes mentioned.
          2. Identify if the citations are in a standard format (like Bluebook or OSCOLA).
          3. Suggest 2-3 "Better Authorities" (more recent Supreme Court judgments or landmark precedents) that strengthen the specific arguments made in the text.
          4. If a citation is missing or incomplete, provide the correct full citation.

          RETURN A STRICT JSON RESPONSE (no other text):
          {
            "analysis": "Markdown formatted audit findings (bullets, bold text, etc.)",
            "correctedText": "The EXACT full original text provided by the user, but with all citations fixed, formatted correctly, and 'better authorities' integrated into the prose where appropriate. Ensure the legal tone is professional."
          }
        `;
        break;

      case "story-visualizer":
        prompt = `
          You are a legal educator who specializes in making complex laws easy to understand through storytelling.
          The student has provided this legal section or statute: "${content}".

          Your task:
          1. Create a vivid, short narrative (story) involving characters (e.g., "A", "B", or "Rohan") that illustrates exactly how this law applies in a real-world situation.
          2. Explain the "Legal Takeaway" of the story at the end.
          3. Use simple language but maintain legal accuracy.
          4. Keep the story engaging and under 250 words.
        `;
        break;

      default:
        return NextResponse.json({ error: "Invalid tool specified" }, {
          status: 400,
        });
    }

    // --- Rate Limiting (per IP, 30 req/min) ---
    const clientIP = req.headers.get("x-forwarded-for") ||
      req.headers.get("x-real-ip") || "unknown";
    const now = Date.now();
    const windowMs = 60_000; // 1 minute
    const maxRequests = 30;

    if (!rateLimitMap.has(clientIP)) {
      rateLimitMap.set(clientIP, []);
    }
    const timestamps = rateLimitMap.get(clientIP)!.filter((t) =>
      now - t < windowMs
    );
    if (timestamps.length >= maxRequests) {
      return NextResponse.json({
        error:
          "Rate limit exceeded. Please wait a moment before sending more messages.",
      }, { status: 429 });
    }
    timestamps.push(now);
    rateLimitMap.set(clientIP, timestamps);

    const geminiModels = [
      "gemini-3.1-pro",
      "gemini-3-flash",
      "gemini-3.1-flash-lite",
      "gemini-3.1-flash-live",
      "nano-banana-pro",
      "nano-banana-2",
      "gemini-2.5-pro",
      "gemini-2.5-flash",
      "gemini-2.5-flash-lite",
      "gemini-2.0-flash",
      "gemini-1.5-pro",
      "gemini-1.5-flash",
    ];

    const openaiModels = [
      "gpt-5.4",
      "gpt-5.4-mini",
      "gpt-5.3-codex",
      "gpt-5.2-codex",
      "gpt-5.2",
      "gpt-5.1-codex-max",
      "gpt-5.1-codex-mini",
      "gpt-4o",
      "gpt-4o-mini",
    ];

    let text = "";
    let lastError = "";

    // --- HYPER-CONSERVATIVE TOKEN MANAGEMENT ---
    // User ratio: 1 char ≈ 0.3 tokens. 
    // We want to keep total tokens (Input + Output) well under model limits.
    // Max Input Chars: 4000 (~1200 tokens)
    const MAX_INPUT_CHARS = 4000;
    const optimizedPrompt = prompt.length > MAX_INPUT_CHARS
      ? prompt.substring(0, 800) + "\n... [TRUNCATED FOR TOKEN SAFETY] ...\n" + prompt.substring(prompt.length - 3000)
      : prompt;

    // Try Gemini models first
    for (const modelName of geminiModels) {
      try {
        const model = genAI.getGenerativeModel({ 
          model: modelName,
          safetySettings: [
            { category: "HARM_CATEGORY_HARASSMENT" as any, threshold: "BLOCK_NONE" as any },
            { category: "HARM_CATEGORY_HATE_SPEECH" as any, threshold: "BLOCK_NONE" as any },
            { category: "HARM_CATEGORY_SEXUALLY_EXPLICIT" as any, threshold: "BLOCK_NONE" as any },
            { category: "HARM_CATEGORY_DANGEROUS_CONTENT" as any, threshold: "BLOCK_NONE" as any }
          ]
        });

        // Strict Max Output Tokens
        let maxTokens = 400;
        if (body.role === "evaluator") maxTokens = 1200;
        if (modelName.includes("pro")) maxTokens = Math.min(maxTokens, 1500);
        if (modelName.includes("flash") || modelName.includes("lite")) maxTokens = Math.min(maxTokens, 450);

        const result = await model.generateContent({
          contents: [{ role: "user", parts: [{ text: optimizedPrompt }] }],
          generationConfig: { maxOutputTokens: maxTokens, temperature: 0.7 },
        });
        const response = await result.response;
        text = response.text();
        if (text) break;
      } catch (err: unknown) {
        lastError = err instanceof Error ? err.message : String(err);
      }
    }

    // Fallback to OpenAI
    if (!text && process.env.OPENAI_API_KEY) {
      const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
      for (const modelName of openaiModels) {
        try {
          let maxTokens = 400;
          if (modelName.includes("5.4") && !modelName.includes("mini")) maxTokens = 800;
          if (modelName.includes("mini") || modelName.includes("codex")) maxTokens = 250;

          const completion = await openai.chat.completions.create({
            model: modelName,
            messages: [{ role: "user", content: optimizedPrompt }],
            max_tokens: maxTokens,
          });
          text = completion.choices[0]?.message?.content || "";
          if (text) break;
        } catch (err: unknown) {
          lastError = err instanceof Error ? err.message : String(err);
        }
      }
    }

    // Fallback to DeepSeek
    if (!text && process.env.DEEPSEEK_API_KEY) {
      const deepseek = new OpenAI({ 
        apiKey: process.env.DEEPSEEK_API_KEY,
        baseURL: "https://api.deepseek.com"
      });
      const deepseekModels = ["deepseek-chat", "deepseek-reasoner"];
      for (const modelName of deepseekModels) {
        try {
          let maxTokens = 500;
          if (modelName === "deepseek-reasoner") maxTokens = 1000;

          const completion = await deepseek.chat.completions.create({
            model: modelName,
            messages: [{ role: "user", content: optimizedPrompt }],
            max_tokens: maxTokens,
          });
          text = completion.choices[0]?.message?.content || "";
          if (text) break;
        } catch (err: unknown) {
          lastError = err instanceof Error ? err.message : String(err);
        }
      }
    }

    if (!text) {
      return NextResponse.json({
        error: `All AI models (Gemini, OpenAI, & DeepSeek) failed to respond. Last error: ${lastError}`,
      }, { status: 500 });
    }

    return NextResponse.json({ result: text });
  } catch (error: unknown) {
    const errorMessage = error instanceof Error
      ? error.message
      : "Failed to process request";
    console.error("Toolkit API Error:", error);
    return NextResponse.json({
      error: errorMessage,
    }, { status: 500 });
  }
}
