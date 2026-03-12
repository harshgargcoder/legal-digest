import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
const supabase = createClient(supabaseUrl, supabaseKey);

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const userId = searchParams.get("userId");

    if (!userId) {
      return NextResponse.json({ error: "Missing userId" }, { status: 400 });
    }

    const { data, error } = await supabase
      .from("user_preferences")
      .select("*")
      .eq("user_id", userId)
      .maybeSingle();

    if (error) {
      console.error("Error fetching preferences:", error);
      throw error;
    }

    return NextResponse.json({ preferences: data || null });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const { userId, categories, topics } = await req.json();

    if (!userId) {
      return NextResponse.json({ error: "Missing userId" }, { status: 400 });
    }

    // Check if preferences already exist
    const { data: existing, error: fetchErr } = await supabase
      .from("user_preferences")
      .select("id")
      .eq("user_id", userId)
      .maybeSingle();

    if (fetchErr) {
      console.error("Error checking existing preferences:", fetchErr);
      throw fetchErr;
    }

    if (existing) {
      // Update
      const { data, error: updateErr } = await supabase
        .from("user_preferences")
        .update({
          categories: categories || [],
          topics: topics || [],
          updated_at: new Date().toISOString()
        })
        .eq("user_id", userId)
        .select();
      
      if (updateErr) {
        console.error("Error updating preferences:", updateErr);
        throw updateErr;
      }
      return NextResponse.json({ success: true, preferences: data[0] });
    } else {
      // Insert
      console.log("Inserting new preferences for user:", userId);
      const { data, error: insertErr } = await supabase
        .from("user_preferences")
        .insert([
          {
            user_id: userId,
            categories: categories || [],
            topics: topics || [],
          },
        ])
        .select();

      if (insertErr) {
        console.error("Error inserting preferences:", insertErr);
        throw insertErr;
      }
      return NextResponse.json({ success: true, preferences: data[0] });
    }
  } catch (err: any) {
    console.error("User Preferences API Error:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
