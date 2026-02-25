import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";
import {
    detectCategory,
    detectRegion,
} from "@/supabase/functions/_shared/filter";

export async function GET() {
    const { data } = await supabase
        .from("legal_news")
        .select("*");

    for (const article of data || []) {
        const combined =
            `${article.title} ${article.summary} ${article.content}`;

        const newCategory = detectCategory(combined);
        const newRegion = detectRegion(combined);
        console.log("TITLE:", article.title);
        console.log("COMBINED:", combined);
        console.log("DETECTED:", detectCategory(combined));
        console.log("------");

        await supabase
            .from("legal_news")
            .update({
                category: newCategory,
                region: newRegion,
            })
            .eq("id", article.id);
    }

    return NextResponse.json({ success: true });
}
