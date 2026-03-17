import { GoogleGenerativeAI, Part } from "@google/generative-ai";
import { NextResponse } from "next/server";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "");

export async function POST(req: Request) {
  try {
    const { tool, content, context, file, court } = await req.json();

    if (!content && !file) {
      return NextResponse.json({ error: "Content or file is required" }, {
        status: 400,
      });
    }

    let prompt = "";

    switch (tool) {
      case "moot-court":
        const courtName = court || "High Court";
        let courtPersona = "";
        
        if (courtName === "Supreme Court") {
          courtPersona = "You are a Justice of the Supreme Court. Focus on high-level constitutional interpretation, landmark precedents (SCC), and the national impact of the judgment. You are extremely rigorous and expect deep philosophical legal reasoning.";
        } else if (courtName === "District Court") {
          courtPersona = "You are a District Judge. Focus on procedural correctness, factual evidence, and the specific application of statutes (e.g., CPC, CrPC, Evidence Act) to the case at hand. You are practical and strict about the trial process.";
        } else {
          courtPersona = "You are a distinguished and strict High Court Judge. Balance constitutional principles with procedural law. Challenge the student on both the merits of the case and the legal frameworks involved.";
        }

        prompt = `
          ${courtPersona}
          The student (Counsel) has presented the following legal proposition or argument: "${content}".
          
          Previous context of the session: "${
          context || "Beginning of the session"
        }".

          Your task:
          1. Briefly acknowledge a specific point they made (1 sentence).
          2. Ask one sharp, probing, and intellectually challenging legal question that tests the foundation of their argument, specifically from the perspective of a ${courtName} judge.
          3. Maintain a formal, authoritative, and judicial tone.
          4. Keep your response under 100 words.
        `;
        break;

      case "citation-detective":
        prompt = `
          You are an expert legal researcher and editor. 
          Analyze the following legal research draft for citations: "${content || "See attached file"}".

          Your task:
          1. Scan the text/image/PDF for any case laws or statutes mentioned.
          2. Identify if the citations are in a standard format (like Bluebook or OSCOLA).
          3. Suggest 2-3 "Better Authorities" (more recent Supreme Court judgments or landmark precedents) that strengthen the specific arguments made in the text.
          4. If a citation is missing or incomplete, provide the correct full citation.
          5. Present your findings in a clear, bulleted format. 
          6. Be professional and constructive.
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

    const modelsToTry = [
      "gemini-2.5-flash",
      "gemini-2.5-flash-lite",
      "gemini-2.5-pro",
      "gemini-3.1-flash",
      "gemini-3.1-pro",
      "gemini-1.5-flash",
      "gemini-2.0-flash",
    ];

    let text = "";
    let lastError = "";

    // Prepare parts for multi-modal generation
    const parts: Part[] = [{ text: prompt }];
    if (file && file.data && file.mimeType) {
      parts.push({
        inlineData: {
          data: file.data,
          mimeType: file.mimeType,
        },
      });
    }

    for (const modelName of modelsToTry) {
      try {
        const model = genAI.getGenerativeModel({ model: modelName });
        const result = await model.generateContent(parts);
        const response = await result.response;
        text = response.text();
        if (text) break;
      } catch (err: unknown) {
        const errorMessage = err instanceof Error ? err.message : String(err);
        console.warn(`Model ${modelName} failed:`, errorMessage);
        lastError = errorMessage;
      }
    }

    if (!text) {
      return NextResponse.json({
        error: `All models failed. Last error: ${lastError}`,
      }, { status: 500 });
    }

    return NextResponse.json({ result: text });
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : "Failed to process request";
    console.error("Toolkit API Error:", error);
    return NextResponse.json({
      error: errorMessage,
    }, { status: 500 });
  }
}
