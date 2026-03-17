import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { getAdminAuth } from "@/lib/firebase-admin";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
const supabase = createClient(supabaseUrl, supabaseKey);

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const adminId = searchParams.get("adminId");

    if (!adminId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Verify if caller is admin
    const { data: adminPrefs } = await supabase
      .from("user_preferences")
      .select("role")
      .eq("user_id", adminId)
      .single();

    if (adminPrefs?.role !== "Admin") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    // 1. Fetch all Firebase users
    const adminAuth = getAdminAuth();
    const listUsersResult = await adminAuth.listUsers();
    
    // 2. Fetch all user preferences from Supabase
    const { data: supabaseUsers, error } = await supabase
      .from("user_preferences")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) throw error;

    const supabaseMap = (supabaseUsers || []).reduce((acc: any, sUser) => {
      acc[sUser.user_id] = sUser;
      return acc;
    }, {});

    // 3. Merge data (Firebase as primary source to catch everyone)
    const mergedUsers = listUsersResult.users.map((fUser) => {
      const sUser = supabaseMap[fUser.uid];
      return {
        user_id: fUser.uid,
        email: fUser.email,
        displayName: fUser.displayName || "Anonymous User",
        photoURL: fUser.photoURL,
        lastSignInTime: fUser.metadata.lastSignInTime,
        role: sUser?.role || "Law Student",
        created_at: sUser?.created_at || fUser.metadata.creationTime,
        categories: sUser?.categories || [],
        topics: sUser?.topics || []
      };
    });

    return NextResponse.json({ users: mergedUsers });
  } catch (err: unknown) {
    const error = err as Error;
    console.error("Admin Users GET Error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function DELETE(req: Request) {
  try {
    const { adminId, targetUserId } = await req.json();

    if (!adminId || !targetUserId) {
      return NextResponse.json({ error: "Missing parameters" }, { status: 400 });
    }

    // Verify if caller is admin
    const { data: adminPrefs } = await supabase
      .from("user_preferences")
      .select("role")
      .eq("user_id", adminId)
      .single();

    if (adminPrefs?.role !== "Admin") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    // 1. Delete from Firebase Auth
    const adminAuth = getAdminAuth();
    await adminAuth.deleteUser(targetUserId);

    // 2. Delete from Supabase tables
    await supabase.from("user_preferences").delete().eq("user_id", targetUserId);
    await supabase.from("bookmarks").delete().eq("user_id", targetUserId);
    await supabase.from("posts").delete().eq("user_id", targetUserId);

    return NextResponse.json({ success: true });
  } catch (err: unknown) {
    const error = err as Error;
    console.error("Admin Users DELETE Error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
