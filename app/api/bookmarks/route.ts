import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

// Initialize Supabase with the Service Role Key to bypass RLS securely on the backend
const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function GET(req: NextRequest) {
  try {
    const userId = req.nextUrl.searchParams.get("userId");

    if (!userId) {
      return NextResponse.json({ error: "Missing userId" }, { status: 400 });
    }

    // Fetch bookmarks for the user
    // including the note column!
    const { data, error } = await supabaseAdmin
      .from("bookmarks")
      .select(`note, legal_news (*)`)
      .eq("user_id", userId);

    if (error) {
      console.error("Supabase Error:", error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ bookmarks: data || [] }, { status: 200 });
  } catch (error: any) {
    console.error("API Error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

  export async function POST(req: NextRequest) {
    try {
      const { userId, postId, action, note } = await req.json();
  
      if (!userId || !postId || !action) {
        return NextResponse.json({ error: "Missing parameters" }, { status: 400 });
      }
  
      if (action === "add") {
        const { error } = await supabaseAdmin.from("bookmarks").insert([
          {
            user_id: userId,
            post_id: postId,
            note: note || null,
          },
        ]);
        
        if (error) {
           console.error("Supabase Error (add):", error);
           return NextResponse.json({ error: error.message }, { status: 500 });
        }
      } else if (action === "remove") {
        const { error } = await supabaseAdmin
          .from("bookmarks")
          .delete()
          .eq("post_id", postId)
          .eq("user_id", userId);
          
        if (error) {
           console.error("Supabase Error (remove):", error);
           return NextResponse.json({ error: error.message }, { status: 500 });
        }
      } else if (action === "note") {
        const { error } = await supabaseAdmin
          .from("bookmarks")
          .update({ note })
          .eq("post_id", postId)
          .eq("user_id", userId);
  
        if (error) {
          console.error("Supabase Error (note update):", error);
          return NextResponse.json({ error: error.message }, { status: 500 });
        }
      } else {
          return NextResponse.json({ error: "Invalid action" }, { status: 400 });
      }

    return NextResponse.json({ success: true }, { status: 200 });

  } catch (error: any) {
    console.error("API Error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function PUT(req: NextRequest) {
    try {
      const { userId, postId } = await req.json();
  
      if (!userId || !postId) {
        return NextResponse.json({ error: "Missing parameters" }, { status: 400 });
      }
  
      // Check if bookmark exists
      const { data: existing, error } = await supabaseAdmin
        .from("bookmarks")
        .select("id")
        .eq("post_id", postId)
        .eq("user_id", userId)
        .single();
  
      if (error && error.code !== "PGRST116") { // PGRST116 is "No rows found"
         console.error("Supabase Error (check):", error);
         return NextResponse.json({ error: error.message }, { status: 500 });
      }
  
      return NextResponse.json({ isBookmarked: !!existing }, { status: 200 });
  
    } catch (error: any) {
      console.error("API Error:", error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }
  }
