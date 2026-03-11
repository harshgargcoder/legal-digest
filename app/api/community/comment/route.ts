import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
const supabase = createClient(supabaseUrl, supabaseKey);

export async function POST(req: Request) {
  try {
    const { postId, userId, authorName, authorAvatar, content } = await req.json();

    if (!postId || !userId || !content) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    const { data, error } = await supabase
      .from("community_comments")
      .insert([
        {
          post_id: postId,
          user_id: userId,
          author_name: authorName || "Anonymous",
          author_avatar: authorAvatar || "?",
          content: content,
        },
      ])
      .select();

    if (error) throw error;

    return NextResponse.json({ success: true, comment: data[0] });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
