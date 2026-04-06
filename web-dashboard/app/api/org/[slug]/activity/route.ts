import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/utils/supabase/server";
import { createAdminClient } from "@/utils/supabase/admin";

// GET: Activity log for org
export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  const { slug } = await params;
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const db = createAdminClient();

  const { data: org } = await db.from("organizations").select("id").eq("slug", slug).single();
  if (!org) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const { data: member } = await db
    .from("org_members")
    .select("role")
    .eq("org_id", org.id)
    .eq("user_id", user.id)
    .single();
  if (!member) return NextResponse.json({ error: "Not a member" }, { status: 403 });

  const { data: logs } = await db
    .from("activity_logs")
    .select("id, action, details, created_at, profiles(email, display_name)")
    .eq("org_id", org.id)
    .order("created_at", { ascending: false })
    .limit(100);

  return NextResponse.json(
    (logs || []).map((l) => ({
      id: l.id,
      action: l.action,
      details: l.details,
      created_at: l.created_at,
      ...(l.profiles as unknown as Record<string, unknown>),
    }))
  );
}
