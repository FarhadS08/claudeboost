import { NextResponse } from "next/server";
import { createClient } from "@/utils/supabase/server";

export const dynamic = "force-dynamic";

export async function GET() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { data, error } = await supabase
    .from("user_settings")
    .select("boost_level, auto_boost")
    .eq("user_id", user.id)
    .single();

  if (error) {
    // Return defaults if no settings row exists
    return NextResponse.json(
      { boost_level: "medium", auto_boost: true },
      { headers: { "Cache-Control": "no-store" } }
    );
  }

  return NextResponse.json(data, {
    headers: { "Cache-Control": "no-store" },
  });
}

export async function POST(request: Request) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await request.json();

  const updates: Record<string, unknown> = {};
  if (body.boost_level !== undefined) updates.boost_level = body.boost_level;
  if (body.auto_boost !== undefined) updates.auto_boost = body.auto_boost;

  const { error } = await supabase
    .from("user_settings")
    .upsert({ user_id: user.id, ...updates }, { onConflict: "user_id" });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ ok: true });
}
