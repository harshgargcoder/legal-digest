import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

const supabase = createClient(supabaseUrl, supabaseKey);

type CommunityPostRow = {
  id: string;
  user_id: string;
  title: string;
  content: string;
  media_url: string | null;
};

export async function GET(req: Request) {
  try {
    const { data: posts, error } = await supabase
      .from("community_posts")
      .select("*, likes:community_likes(user_id), comments:community_comments(*)")
      .order("created_at", { ascending: false });

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ posts: (posts || []) as CommunityPostRow[] });
  } catch (err: unknown) {
    return NextResponse.json({ error: err instanceof Error ? err.message : "Unknown error" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { userId, title, content, mediaUrl, authorName, authorRole, authorAvatar } = body;

    if (!userId || !title || !content) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    // Workaround: We pack author details into the content JSON to avoid requiring the user to run ALTER TABLE sql.
    const packedContent = JSON.stringify({
      text: content,
      authorName: authorName || "Anonymous",
      authorRole: authorRole || "Scholar",
      authorAvatar: authorAvatar || "?"
    });

    const { data, error } = await supabase
      .from("community_posts")
      .insert([
        {
          user_id: userId,
          title: title,
          content: packedContent,
          media_url: mediaUrl || null,
        },
      ])
      .select();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true, post: data[0] as CommunityPostRow });
  } catch (err: unknown) {
    return NextResponse.json({ error: err instanceof Error ? err.message : "Unknown error" }, { status: 500 });
  }
}

export async function PUT(req: Request) {
  try {
    const body = await req.json();
    const { id, userId, title, content, authorName, authorRole, authorAvatar, mediaUrl } = body;

    if (!id || !userId || !title || !content) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    const packedContent = JSON.stringify({
      text: content,
      authorName: authorName || "Anonymous",
      authorRole: authorRole || "Scholar",
      authorAvatar: authorAvatar || "?"
    });

    const { data, error } = await supabase
      .from("community_posts")
      .update({
        title: title,
        content: packedContent,
        media_url: mediaUrl || undefined,
      })
      .eq("id", id)
      .eq("user_id", userId)
      .select();

    if (error) throw error;
    return NextResponse.json({ success: true, post: data[0] as CommunityPostRow });
  } catch (err: unknown) {
    return NextResponse.json({ error: err instanceof Error ? err.message : "Unknown error" }, { status: 500 });
  }
}

export async function DELETE(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");
    const userId = searchParams.get("userId");

    if (!id || !userId) {
      return NextResponse.json({ error: "Missing parameters" }, { status: 400 });
    }

    const { error } = await supabase
      .from("community_posts")
      .delete()
      .eq("id", id)
      .eq("user_id", userId);

    if (error) throw error;
    return NextResponse.json({ success: true });
  } catch (err: unknown) {
    return NextResponse.json({ error: err instanceof Error ? err.message : "Unknown error" }, { status: 500 });
  }
}
