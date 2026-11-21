import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabaseAdmin";

export async function POST() {
  try {
    let totalUpdatedGeneral = 0;
    let totalUpdatedGlobal = 0;

    // 1. Fetch rows with category 'General' that need tags tagged as 'General'
    const { data: generalRows, error: genErr } = await supabaseAdmin
      .from("legal_news")
      .select("id, category, tags")
      .eq("category", "General")
      .limit(200);

    if (genErr) throw genErr;

    // Update in batches of 20 by ID to avoid timeouts
    if (generalRows && generalRows.length > 0) {
      for (const row of generalRows) {
        const { error } = await supabaseAdmin
          .from("legal_news")
          .update({
            category: "General & Global",
            tags: "General",
          })
          .eq("id", row.id);

        if (!error) totalUpdatedGeneral++;
      }
    }

    // 2. Fetch rows with category 'Global' that need tags tagged as 'Global'
    const { data: globalRows, error: globErr } = await supabaseAdmin
      .from("legal_news")
      .select("id, category, tags")
      .eq("category", "Global")
      .limit(200);

    if (globErr) throw globErr;

    if (globalRows && globalRows.length > 0) {
      for (const row of globalRows) {
        const { error } = await supabaseAdmin
          .from("legal_news")
          .update({
            category: "General & Global",
            tags: "Global",
          })
          .eq("id", row.id);

        if (!error) totalUpdatedGlobal++;
      }
    }

    return NextResponse.json({
      success: true,
      message: "Categories migration executed successfully.",
      totalUpdatedGeneral,
      totalUpdatedGlobal,
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Migration failed";
    console.error("Migration error:", message);
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}

