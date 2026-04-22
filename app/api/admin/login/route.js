import { supabaseAdmin } from "@/lib/supabaseAdmin";
import { NextResponse } from "next/server";

export async function POST(request) {
  try {
    const { username, password } = await request.json();

    // Query using admin client (bypasses RLS)
    const { data, error } = await supabaseAdmin
      .from('admin_credentials')
      .select('*')
      .eq('username', username)
      .eq('password', password)
      .single();

    if (error || !data) {
      return NextResponse.json({ error: "Invalid Credentials" }, { status: 401 });
    }

    // Success - update last login
    await supabaseAdmin
      .from('admin_credentials')
      .update({ last_login: new Date().toISOString() })
      .eq('id', data.id);

    return NextResponse.json({ success: true });

  } catch (err) {
    return NextResponse.json({ error: "Server Error" }, { status: 500 });
  }
}
