import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { getAdminAuth } from "@/lib/firebase-admin";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
const supabase = createClient(supabaseUrl, supabaseKey);

function getBearerToken(req: Request) {
  const header = req.headers.get("authorization");
  if (!header || !header.startsWith("Bearer ")) return null;
  return header.slice("Bearer ".length);
}

export async function POST(req: Request) {
  try {
    const token = getBearerToken(req);
    if (!token) {
      return NextResponse.json({ error: "Missing authorization token" }, { status: 401 });
    }

    const adminAuth = getAdminAuth();
    const decoded = await adminAuth.verifyIdToken(token);
    const { targetUserId, email } = await req.json();

    if (!targetUserId || !email) {
      return NextResponse.json({ error: "Missing parameters" }, { status: 400 });
    }

    // Verify if caller is admin
    const { data: adminPrefs } = await supabase
      .from("user_preferences")
      .select("role")
      .eq("user_id", decoded.uid)
      .single();

    if (adminPrefs?.role !== "Admin") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    // Generate password reset link
    const link = await adminAuth.generatePasswordResetLink(email);

    return NextResponse.json({ success: true, link });
  } catch (err: unknown) {
    const error = err as Error;
    console.error("Admin Reset Password Error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
