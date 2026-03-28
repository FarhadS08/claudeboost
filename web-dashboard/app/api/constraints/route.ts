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
    .from("user_constraints")
    .select("domain, constraint_text")
    .eq("user_id", user.id);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  // Convert array to Record<domain, constraint_text>
  const constraints: Record<string, string> = {};
  for (const row of data ?? []) {
    constraints[row.domain] = row.constraint_text;
  }

  return NextResponse.json(constraints, {
    headers: { "Cache-Control": "no-store" },
  });
}

export async function POST(request: Request) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await request.json() as Record<string, string>;

  // Upsert each domain constraint
  const upserts = Object.entries(body).map(([domain, constraint_text]) => ({
    user_id: user.id,
    domain,
    constraint_text,
  }));

  const { error } = await supabase
    .from("user_constraints")
    .upsert(upserts, { onConflict: "user_id,domain" });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ ok: true });
}
