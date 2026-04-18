import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
const supabase = createClient(supabaseUrl, supabaseKey);

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const sessionId = searchParams.get("sessionId");

    if (!sessionId) {
      return NextResponse.json({ error: "Missing sessionId" }, { status: 400 });
    }

    const { data, error } = await supabase
      .from("moot_court_messages")
      .select("id, session_id, role, content, side, is_inadmissible, created_at")
      .eq("session_id", sessionId)
      .order("created_at", { ascending: true });

    if (error) {
      console.error("Moot court messages API error:", error);
      return NextResponse.json({ messages: [], error: error.message }, { status: 200 });
    }

    // Map DB rows to the Message shape expected by the frontend
    const messages = (data || []).map((row) => ({
      role: row.role,
      content: row.content,
      timestamp: new Date(row.created_at),
      isInadmissible: row.is_inadmissible || false,
    }));

    return NextResponse.json({ messages });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Failed to load messages";
    console.error("Moot court messages API fatal error:", err);
    return NextResponse.json({ messages: [], error: message }, { status: 200 });
  }
}
