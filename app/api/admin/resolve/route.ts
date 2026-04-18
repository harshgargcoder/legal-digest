import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { getAdminAuth } from "@/lib/firebase-admin";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

const supabase = createClient(supabaseUrl!, supabaseKey!);

export async function POST(req: Request) {
  try {
    const { adminId } = await req.json();

    if (adminId !== "admin") {
      return NextResponse.json({ error: "Invalid Admin ID" }, { status: 400 });
    }

    const { data: admins, error } = await supabase
      .from("user_preferences")
      .select("user_id")
      .eq("role", "Admin");

    if (error || !admins || admins.length === 0) {
      return NextResponse.json({ error: "No admin account found in database" }, { status: 404 });
    }

    const auth = getAdminAuth();
    
    for (const admin of admins) {
      try {
        const userRecord = await auth.getUser(admin.user_id);
        if (userRecord.email) {
          return NextResponse.json({ email: userRecord.email });
        }
      } catch (e) {
        // Skip users not found in Firebase
        continue;
      }
    }

    return NextResponse.json({ error: "No valid admin email found" }, { status: 404 });
  } catch (err) {
    console.error("Resolve error:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
