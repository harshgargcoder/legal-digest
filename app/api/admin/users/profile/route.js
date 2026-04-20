import { supabaseAdmin } from "@/lib/supabaseAdmin";
import { NextResponse } from "next/server";

export async function POST(request) {
  try {
    const { userId, ipPage = 0, sessionPage = 0 } = await request.json();
    if (!userId) return NextResponse.json({ error: "User ID required" }, { status: 400 });

    const PAGE_SIZE = 5;
    const ipFrom = ipPage * PAGE_SIZE;
    const ipTo = ipFrom + PAGE_SIZE - 1;
    
    const sessionFrom = sessionPage * PAGE_SIZE;
    const sessionTo = sessionFrom + PAGE_SIZE - 1;

    // Fetch using admin client with pagination
    const [ips, sessions] = await Promise.all([
      supabaseAdmin.from('user_ip_logs').select('*').eq('user_id', userId).order('seen_at', { ascending: false }).range(ipFrom, ipTo),
      supabaseAdmin.from('session_logs').select('*').eq('user_id', userId).order('start_time', { ascending: false }).range(sessionFrom, sessionTo)
    ]);

    return NextResponse.json({
      ips: ips.data || [],
      sessions: sessions.data || []
    });

  } catch (err) {
    return NextResponse.json({ error: "Profile fetch failed" }, { status: 500 });
  }
}
