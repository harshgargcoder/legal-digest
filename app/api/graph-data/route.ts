import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
const supabase = createClient(supabaseUrl, supabaseKey);

type GraphNode = {
  id: string;
  name: string;
  group: number;
  val: number;
};

type GraphLink = {
  source: string;
  target: string;
};

export async function GET() {
  try {
    const { data: articles, error } = await supabase
      .from("legal_news")
      .select("id, title, category, precedents")
      .not("precedents", "is", null);

    if (error) throw error;

    const nodes: GraphNode[] = [];
    const links: GraphLink[] = [];

    const existingNodes = new Set();
    const precedentNodes = new Set();

    articles?.forEach(article => {
      // Add central article node
      if (!existingNodes.has(article.id)) {
        nodes.push({
          id: article.id,
          name: article.title,
          group: 1, // Group 1 = Original Article
          val: 25 // Node Size
        });
        existingNodes.add(article.id);
      }

      // Add Precedent nodes and links
      if (article.precedents && Array.isArray(article.precedents)) {
        article.precedents.forEach((prec: string) => {
          const precName = prec.replace(/^[-•*]\s*/, "").trim();
          if (!precName || precName.toLowerCase() === "none" || precName.length < 3) return;
          
          if (!precedentNodes.has(precName)) {
             nodes.push({
               id: precName,
               name: precName,
               group: 2, // Group 2 = Cited Precedent
               val: 12
             });
             precedentNodes.add(precName);
          }

          links.push({
            source: article.id,
            target: precName
          });
        });
      }
    });

    return NextResponse.json({ nodes, links });
  } catch (err: unknown) {
    return NextResponse.json({ error: err instanceof Error ? err.message : "Unknown error" }, { status: 500 });
  }
}
