import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
const supabase = createClient(supabaseUrl, supabaseKey);

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const userId = searchParams.get("userId");
    const limit = Math.min(Number(searchParams.get("limit") || "20"), 100);
    const forLeaderboard = searchParams.get("forLeaderboard") === "1";

    let query = supabase
      .from("moot_court_sessions")
      .select("id, user_id, court_type, case_type, evaluation, created_at, updated_at")
      .order("created_at", { ascending: false })
      .limit(limit);

    if (userId) {
      query = query.eq("user_id", userId);
    }

    if (forLeaderboard) {
      query = query.not("evaluation", "is", null);
    }

    const { data, error } = await query;

    if (error) {
      console.error("Moot court sessions API error:", error);
      return NextResponse.json({ sessions: [], error: error.message }, { status: 200 });
    }

    return NextResponse.json({ sessions: data || [] });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Failed to load sessions";
    console.error("Moot court sessions API fatal error:", err);
    return NextResponse.json({ sessions: [], error: message }, { status: 200 });
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { userId, courtType, caseType } = body;

    if (!userId || !caseType) {
      return NextResponse.json({ error: "Missing userId or caseType" }, { status: 400 });
    }

    const { data, error } = await supabase
      .from("moot_court_sessions")
      .insert([
        {
          user_id: userId,
          court_type: courtType || "High Court",
          case_type: caseType,
        },
      ])
      .select("id, user_id, court_type, case_type, evaluation, created_at, updated_at")
      .single();

    if (error) {
      console.error("Moot court session create error:", error);
      return NextResponse.json({ error: error.message }, { status: 200 });
    }

    return NextResponse.json({ session: data });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Failed to create session";
    console.error("Moot court session create fatal error:", err);
    return NextResponse.json({ error: message }, { status: 200 });
  }
}

export async function PATCH(req: Request) {
  try {
    const body = await req.json();
    const { sessionId, evaluation } = body;

    if (!sessionId) {
      return NextResponse.json({ error: "Missing sessionId" }, { status: 400 });
    }

    const { data, error } = await supabase
      .from("moot_court_sessions")
      .update({ evaluation, updated_at: new Date().toISOString() })
      .eq("id", sessionId)
      .select("id, user_id, court_type, case_type, evaluation, created_at, updated_at")
      .single();

    if (error) {
      console.error("Moot court session update error:", error);
      return NextResponse.json({ error: error.message }, { status: 200 });
    }

    return NextResponse.json({ session: data });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Failed to update session";
    console.error("Moot court session update fatal error:", err);
    return NextResponse.json({ error: message }, { status: 200 });
  }
}

export async function DELETE(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const sessionId = searchParams.get("sessionId");

    if (!sessionId) {
      return NextResponse.json({ error: "Missing sessionId" }, { status: 400 });
    }

    const { error } = await supabase
      .from("moot_court_sessions")
      .delete()
      .eq("id", sessionId);

    if (error) {
      console.error("Moot court session delete error:", error);
      return NextResponse.json({ error: error.message }, { status: 200 });
    }

    return NextResponse.json({ success: true });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Failed to delete session";
    console.error("Moot court session delete fatal error:", err);
    return NextResponse.json({ error: message }, { status: 200 });
  }
}
