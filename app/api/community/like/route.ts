import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
const supabase = createClient(supabaseUrl, supabaseKey);

export async function POST(req: Request) {
  try {
    const { postId, userId } = await req.json();

    if (!postId || !userId) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    // Check if like exists
    const { data: existingLike, error: checkError } = await supabase
      .from("community_likes")
      .select("id")
      .eq("post_id", postId)
      .eq("user_id", userId)
      .single();

    if (existingLike) {
      // Unlike
      const { error: deleteError } = await supabase
        .from("community_likes")
        .delete()
        .eq("id", existingLike.id);

      if (deleteError) throw deleteError;
      return NextResponse.json({ success: true, action: "unliked" });
    } else {
      // Like
      const { error: insertError } = await supabase
        .from("community_likes")
        .insert([{ post_id: postId, user_id: userId }]);

      if (insertError) throw insertError;
      return NextResponse.json({ success: true, action: "liked" });
    }
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
