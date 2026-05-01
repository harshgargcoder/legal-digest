import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
const supabase = createClient(supabaseUrl, supabaseKey);

type UsageMetricRow = {
  id: string;
  user_id: string;
  activity_date: string;
  read_count: number;
};

export async function POST(req: Request) {
  try {
    const { userId } = await req.json();

    if (!userId) {
      return NextResponse.json({ error: "Missing userId" }, { status: 400 });
    }

    const today = new Date().toISOString().split("T")[0];

    const { data: existing, error: fetchErr } = await supabase
      .from("usage_metrics")
      .select("*")
      .eq("user_id", userId)
      .eq("activity_date", today)
      .single();

    if (existing) {
      const { error: updateErr } = await supabase
        .from("usage_metrics")
        .update({ read_count: existing.read_count + 1 })
        .eq("id", existing.id);
      if (updateErr) throw updateErr;
    } else {
      const { error: insertErr } = await supabase
        .from("usage_metrics")
        .insert([{ user_id: userId, activity_date: today, read_count: 1 }]);
      if (insertErr) throw insertErr;
    }

    return NextResponse.json({ success: true });
  } catch (err: unknown) {
    return NextResponse.json({ error: err instanceof Error ? err.message : "Unknown error" }, { status: 500 });
  }
}

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const userId = searchParams.get("userId");

    if (!userId) {
      return NextResponse.json({ error: "Missing userId" }, { status: 400 });
    }

    const { data: metrics, error } = await supabase
      .from("usage_metrics")
      .select("activity_date")
      .eq("user_id", userId)
      .order("activity_date", { ascending: false });

    if (error) throw error;

    if (!metrics || metrics.length === 0) {
      return NextResponse.json({ streak: 0 });
    }

    // Calculate Streak
    let streak = 0;
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    let currentDate = new Date(today);
    
    // Check if they read today or yesterday to start the streak count
    const mostRecentDate = new Date(metrics[0].activity_date);
    mostRecentDate.setHours(0, 0, 0, 0);
    
    const diffTime = Math.abs(currentDate.getTime() - mostRecentDate.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)); 

    if (diffDays > 1) {
      return NextResponse.json({ streak: 0 }); // Streak broken
    }

    const uniqueDates = Array.from(new Set((metrics as UsageMetricRow[]).map((m) => m.activity_date)));

    for (let i = 0; i < uniqueDates.length; i++) {
      const recordDate = new Date(uniqueDates[i]);
      recordDate.setHours(0, 0, 0, 0);
      
      const expectedDate = new Date(today);
      expectedDate.setDate(today.getDate() - i - (diffDays === 1 ? 1 : 0));

      if (recordDate.getTime() === expectedDate.getTime()) {
        streak++;
      } else {
        break; // Gap found, streak ends
      }
    }

    return NextResponse.json({ streak });

  } catch (err: unknown) {
    return NextResponse.json({ error: err instanceof Error ? err.message : "Unknown error" }, { status: 500 });
  }
}
