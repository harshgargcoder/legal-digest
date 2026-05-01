import { NextRequest, NextResponse } from "next/server";
import { GoogleGenerativeAI } from "@google/generative-ai";
import { createClient } from "@supabase/supabase-js";
import {
    enforceRateLimit,
    getRouteErrorResponse,
    requireFirebaseUser,
} from "@/lib/route-security";
import { sanitizeText } from "@/supabase/functions/_shared/filter";
import type {
    NewsSummaryRequest,
    NewsSummaryResponse,
    TrendingTopicsResponse,
} from "@/lib/api-types";

const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
);

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "");

export async function GET() {
    try {
        const { data, error } = await supabase
            .from("legal_news")
            .select("title, description")
            .limit(300);

        if (error) {
            console.error("DB error:", error);
            return NextResponse.json(
                { articlesAnalyzed: 0, trendingTopics: [] },
                { status: 500 },
            );
        }

        const articles = data || [];

        if (!articles.length) {
            return NextResponse.json({
                articlesAnalyzed: 0,
                trendingTopics: [],
            });
        }

        const wordCount: Record<string, number> = {};

        articles.forEach((article: { title?: string | null; description?: string | null }) => {
            const text = `${article.title ?? ""} ${article.description ?? ""}`;

            const words = text.split(/\s+/);

            words.forEach((word: string) => {
                const clean = word
                    .toLowerCase()
                    .replace(/[^a-z]/g, "");

                if (clean.length < 5) return;

                wordCount[clean] = (wordCount[clean] || 0) + 1;
            });
        });

        const trendingTopics = Object.entries(wordCount)
            .sort((a, b) => b[1] - a[1])
            .slice(0, 5)
            .map(([word]) => word.charAt(0).toUpperCase() + word.slice(1));

        const response: TrendingTopicsResponse = {
            articlesAnalyzed: articles.length,
            trendingTopics,
        };

        return NextResponse.json(response);
    } catch (err) {
        console.error("Trending API error:", err);

        return NextResponse.json({
            articlesAnalyzed: 0,
            trendingTopics: [],
        });
    }
}

export async function POST(req: NextRequest) {
    try {
        const auth = await requireFirebaseUser(req);
        enforceRateLimit(`summarize:${auth.uid}`, {
            limit: 20,
            windowMs: 60_000,
        });

        const { id, title, description } = (await req.json()) as NewsSummaryRequest & {
            id?: string;
        };

        if (!process.env.GEMINI_API_KEY) {
            throw new Error("Missing GEMINI_API_KEY");
        }

        // Ensure we don't send purely empty/null strings to the AI, or it talks about missing content.
        const safeTitle = sanitizeText(title, 300) || "Untitled";
        const safeDesc = sanitizeText(
            description ||
                "No detailed description provided. Assume this is a breaking news headline or live event.",
            5000,
        );

        const prompt = `
You are a legal news analyst. Analyze the following legal news article and extract structured information.

STRICT RULES:
- Only include fields clearly supported by the article. Write "Not mentioned" if absent — never fabricate.
- Keep each point concise (1–2 sentences max).
- "Quick Summary" must be 2–3 lines max, written in plain simple language (non-legal).

Return EXACTLY in this format (preserve all headers):

Quick Summary:
[2–3 line plain-English summary of what happened, who was involved, and what the result was. No legal jargon.]

Court or Authority: ...
Legal Issue: ...
Jurisdiction: ...

Upcoming / Scheduled Hearings:
- [Date if known] – [Hearing type] – [Court/Bench if mentioned]
- Or: Not mentioned

Past Hearings & Proceedings:
- [Date if known] – [What happened]
- Or: Not mentioned

Key Points Discussed in Hearing:
- [Most important argument or point raised — by either side or the bench]
- [Second key point]
- [Third key point]
- Or: Not mentioned

Legal Articles / Sections Cited:
- [Article or Section name/number] – [What it covers] – [How it was applied or challenged in this case]
- Or: Not mentioned

Changes / Amendments Noted:
- [Any rule, law, or order that was modified, introduced, or struck down]
- Or: Not mentioned

Final Result / Order:
- [What the court decided or ordered — clear and direct]
- Or: Pending / Not mentioned

Relevant Precedents:
- [Case name + brief relevance]
- Or: Not mentioned

Key Parties Involved:
- [Petitioner / Plaintiff]: ...
- [Respondent / Defendant]: ...
- [Judge / Bench]: ...

Tags: tag1, tag2, tag3

---
Title: ${safeTitle}
Content: ${safeDesc}

Do not add any commentary, markdown formatting, or extra explanation. Return only the structured format above.
`;

        const modelsToTry = [
            "gemini-3-flash-preview",
            "gemini-2.5-flash",
            "gemini-2.5-pro",
        ];

        let text = "";
        let lastError = "";

        for (const modelName of modelsToTry) {
            try {
                const model = genAI.getGenerativeModel({ model: modelName });
                const result = await model.generateContent(prompt);
                text = result.response.text();
                if (text) break;
            } catch (err: unknown) {
                const message = err instanceof Error ? err.message : "Unknown error";
                console.warn(`Summarize Model ${modelName} failed:`, message);
                lastError = message;
            }
        }

        if (!text) {
            throw new Error(`All summarization models failed. Last error: ${lastError}`);
        }

        const lines = text.split("\n").map((l) => l.trim());

        let summary = "";
        let tags: string[] = [];
        let precedents: string[] = [];
        let outcomes: string[] = [];

        let collectingPrecedents = false;
        let collectingOutcomes = false;

        for (const line of lines) {
            if (!line) continue;

            if (line.toLowerCase().startsWith("tags")) {
                tags = line
                    .replace(/tags:/i, "")
                    .split(",")
                    .map((t) => t.trim())
                    .filter(Boolean);

                collectingPrecedents = false;
                collectingOutcomes = false;
                continue;
            }

            if (line.toLowerCase().includes("precedent")) {
                collectingPrecedents = true;
                collectingOutcomes = false;
                continue;
            }

            if (line.toLowerCase().includes("outcome")) {
                collectingOutcomes = true;
                collectingPrecedents = false;
                continue;
            }

            if (collectingPrecedents && /^[-•*]/.test(line)) {
                precedents.push(line.replace(/^[-•*]\s*/, "").trim());
                continue;
            }

            if (collectingOutcomes && /^[-•*]/.test(line)) {
                outcomes.push(line.replace(/^[-•*]\s*/, "").trim());
                continue;
            }

            summary += line + "\n";
        }

        // Cache the result into the database for the Case Linkage Graph
        if (id) {
            await supabase
                .from("legal_news")
                .update({
                    ai_summary: summary,
                    tags: tags,
                    precedents: precedents
                })
                .eq("id", id);
        }

        const response: NewsSummaryResponse = {
            summary,
            tags,
            precedents,
            outcomes,
        };

        return NextResponse.json(response);
    } catch (error: unknown) {
        const { message, status } = getRouteErrorResponse(error);

        if (error instanceof Error && error.message?.includes("429")) {
            console.log("Rate limit hit. Returning fallback summary.");

            return NextResponse.json({
                summary:
                    "• Legal issue under review\n• Court examining arguments\n• Final decision pending",
            });
        }

        console.error(error);

        return NextResponse.json(
            { error: message || "Summary generation failed" },
            { status },
        );
    }
}
