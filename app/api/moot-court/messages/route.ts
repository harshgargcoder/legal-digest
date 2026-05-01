import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import {
  enforceRateLimit,
  getRouteErrorResponse,
  requireFirebaseUser,
} from "@/lib/route-security";
import type { MootCourtMessageRow } from "@/lib/api-types";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
const supabase = createClient(supabaseUrl, supabaseKey);

export async function GET(req: Request) {
  try {
    const auth = await requireFirebaseUser(req);
    enforceRateLimit(`moot-court:messages:${auth.uid}`, {
      limit: 60,
      windowMs: 60_000,
    });

    const { searchParams } = new URL(req.url);
    const sessionId = searchParams.get("sessionId");

    if (!sessionId) {
      return NextResponse.json({ error: "Missing sessionId" }, { status: 400 });
    }

    const { data: existingSession, error: sessionError } = await supabase
      .from("moot_court_sessions")
      .select("user_id")
      .eq("id", sessionId)
      .maybeSingle();

    if (sessionError) {
      throw sessionError;
    }

    if (!existingSession) {
      return NextResponse.json({ error: "Session not found" }, { status: 404 });
    }

    if (existingSession.user_id !== auth.uid) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
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
    })) as Array<{
      role: MootCourtMessageRow["role"];
      content: string;
      timestamp: Date;
      isInadmissible: boolean;
    }>;

    return NextResponse.json({ messages });
  } catch (err) {
    const { message, status } = getRouteErrorResponse(err);
    console.error("Moot court messages API fatal error:", err);
    return NextResponse.json({ messages: [], error: message }, { status });
  }
}
