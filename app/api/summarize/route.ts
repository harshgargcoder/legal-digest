import { NextRequest, NextResponse } from "next/server";
import { GoogleGenerativeAI } from "@google/generative-ai";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
);

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

        articles.forEach((article: any) => {
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

        return NextResponse.json({
            articlesAnalyzed: articles.length,
            trendingTopics,
        });
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
        const { title, description } = await req.json();

        if (!process.env.GEMINI_API_KEY) {
            throw new Error("Missing GEMINI_API_KEY");
        }

        const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);

        const model = genAI.getGenerativeModel({
            model: "gemini-2.5-flash",
        });

        const prompt = `
        Analyze this legal news article and extract structured information.

        Return in this format:

        Court or authority: ...
        Legal issue: ...

        Relevant precedents:
        - case 1
        - case 2

        Current outcome:
        - point 1
        - point 2
        - point 3

        Tags: tag1, tag2, tag3

        Title: ${title}
        Content: ${description}
        `;

        const result = await model.generateContent(prompt);
        const text = result.response.text();
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
        return NextResponse.json({
            summary,
            tags,
            precedents,
            outcomes,
        });
    } catch (error: any) {
        if (error.message?.includes("429")) {
            console.log("Rate limit hit. Returning fallback summary.");

            return NextResponse.json({
                summary:
                    "• Legal issue under review\n• Court examining arguments\n• Final decision pending",
            });
        }

        console.error(error);

        return NextResponse.json(
            { error: error.message || "Summary generation failed" },
            { status: 500 },
        );
    }
}
