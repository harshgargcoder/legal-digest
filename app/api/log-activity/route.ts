import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

const supabase = createClient(supabaseUrl!, supabaseKey!);

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { userId, action, details } = body;

    console.log("Logging Activity:", { userId, action, details });

    if (!supabaseUrl || !supabaseKey) {
      console.error("Supabase credentials missing!");
      return NextResponse.json({ error: "Server configuration error" }, { status: 500 });
    }

    if (!userId || !action) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    const { error } = await supabase
      .from("user_activity_logs")
      .insert([
        { 
          user_id: userId, 
          action, 
          details, 
          created_at: new Date().toISOString() 
        }
      ]);

    if (error) {
      if (error.code === "42P01") {
        console.warn("HINT: 'user_activity_logs' table is missing. Please create it in Supabase SQL Editor to enable tracking.");
      } else {
        console.error("Supabase Insert Error:", error.message);
      }
      return NextResponse.json({ success: false, error: error.message }, { status: 200 });
    }

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("Critical API Error:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
