import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import {
  enforceRateLimit,
  getRouteErrorResponse,
  requireFirebaseUser,
} from "@/lib/route-security";
import type { MootCourtSessionRow } from "@/lib/api-types";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
const supabase = createClient(supabaseUrl, supabaseKey);

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const limit = Math.min(Number(searchParams.get("limit") || "20"), 100);
    const forLeaderboard = searchParams.get("forLeaderboard") === "1";
    const userIdParam = searchParams.get("userId");
    const auth = forLeaderboard ? null : await requireFirebaseUser(req);
    const userId = auth?.uid ?? userIdParam;

    if (!forLeaderboard && userIdParam && userIdParam !== auth?.uid) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    enforceRateLimit(`moot-court:sessions:${forLeaderboard ? "leaderboard" : userId}`, {
      limit: 60,
      windowMs: 60_000,
    });

    let query = supabase
      .from("moot_court_sessions")
      .select("id, user_id, court_type, case_type, evaluation, created_at, updated_at")
      .order("created_at", { ascending: false })
      .limit(limit);

    if (userId && !forLeaderboard) {
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

    return NextResponse.json({ sessions: (data || []) as MootCourtSessionRow[] });
  } catch (err) {
    const { message, status } = getRouteErrorResponse(err);
    console.error("Moot court sessions API fatal error:", err);
    return NextResponse.json({ sessions: [], error: message }, { status });
  }
}

export async function POST(req: Request) {
  try {
    const auth = await requireFirebaseUser(req);
    enforceRateLimit(`moot-court:sessions:${auth.uid}`, {
      limit: 30,
      windowMs: 60_000,
    });

    const body = (await req.json()) as { courtType?: string; caseType?: string };
    const { courtType, caseType } = body;

    if (!caseType) {
      return NextResponse.json({ error: "Missing caseType" }, { status: 400 });
    }

    const { data, error } = await supabase
      .from("moot_court_sessions")
      .insert([
        {
          user_id: auth.uid,
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

    return NextResponse.json({ session: data as MootCourtSessionRow });
  } catch (err) {
    const { message, status } = getRouteErrorResponse(err);
    console.error("Moot court session create fatal error:", err);
    return NextResponse.json({ error: message }, { status });
  }
}

export async function PATCH(req: Request) {
  try {
    const auth = await requireFirebaseUser(req);
    enforceRateLimit(`moot-court:sessions:${auth.uid}`, {
      limit: 30,
      windowMs: 60_000,
    });

    const body = (await req.json()) as { sessionId?: string; evaluation?: unknown };
    const { sessionId, evaluation } = body;

    if (!sessionId) {
      return NextResponse.json({ error: "Missing sessionId" }, { status: 400 });
    }

    const { data: existingSession, error: fetchError } = await supabase
      .from("moot_court_sessions")
      .select("user_id")
      .eq("id", sessionId)
      .maybeSingle();

    if (fetchError) {
      throw fetchError;
    }

    if (!existingSession) {
      return NextResponse.json({ error: "Session not found" }, { status: 404 });
    }

    if (existingSession.user_id !== auth.uid) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
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

    return NextResponse.json({ session: data as MootCourtSessionRow });
  } catch (err) {
    const { message, status } = getRouteErrorResponse(err);
    console.error("Moot court session update fatal error:", err);
    return NextResponse.json({ error: message }, { status });
  }
}

export async function DELETE(req: Request) {
  try {
    const auth = await requireFirebaseUser(req);
    enforceRateLimit(`moot-court:sessions:${auth.uid}`, {
      limit: 30,
      windowMs: 60_000,
    });

    const { searchParams } = new URL(req.url);
    const sessionId = searchParams.get("sessionId");

    if (!sessionId) {
      return NextResponse.json({ error: "Missing sessionId" }, { status: 400 });
    }

    const { data: existingSession, error: fetchError } = await supabase
      .from("moot_court_sessions")
      .select("user_id")
      .eq("id", sessionId)
      .maybeSingle();

    if (fetchError) {
      throw fetchError;
    }

    if (!existingSession) {
      return NextResponse.json({ error: "Session not found" }, { status: 404 });
    }

    if (existingSession.user_id !== auth.uid) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
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
    const { message, status } = getRouteErrorResponse(err);
    console.error("Moot court session delete fatal error:", err);
    return NextResponse.json({ error: message }, { status });
  }
}
