import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/utils/supabase/server";
import { createAdminClient } from "@/utils/supabase/admin";

// GET: Get org details
// PATCH: Update org settings (name, boost_level, anthropic_api_key)
export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  const { slug } = await params;
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const db = createAdminClient();

  const { data: org } = await db
    .from("organizations")
    .select("id, name, slug, boost_level, created_at, created_by")
    .eq("slug", slug)
    .single();

  if (!org) return NextResponse.json({ error: "Not found" }, { status: 404 });

  // Check membership
  const { data: member } = await db
    .from("org_members")
    .select("role")
    .eq("org_id", org.id)
    .eq("user_id", user.id)
    .single();

  if (!member) return NextResponse.json({ error: "Not a member" }, { status: 403 });

  // Check if API key exists (don't expose the actual key)
  const { count } = await db
    .from("org_api_keys")
    .select("id", { count: "exact", head: true })
    .eq("org_id", org.id);

  // Get member count
  const { count: memberCount } = await db
    .from("org_members")
    .select("id", { count: "exact", head: true })
    .eq("org_id", org.id);

  // Get boost count
  const { count: boostCount } = await db
    .from("boost_history")
    .select("id", { count: "exact", head: true })
    .eq("org_id", org.id);

  // Check if anthropic key is set
  const { data: orgFull } = await db
    .from("organizations")
    .select("anthropic_api_key")
    .eq("id", org.id)
    .single();

  return NextResponse.json({
    ...org,
    role: member.role,
    has_api_key: (count ?? 0) > 0,
    has_anthropic_key: !!orgFull?.anthropic_api_key,
    member_count: memberCount ?? 0,
    boost_count: boostCount ?? 0,
  });
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  const { slug } = await params;
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const db = createAdminClient();

  // Find org and verify admin
  const { data: org } = await db
    .from("organizations")
    .select("id")
    .eq("slug", slug)
    .single();

  if (!org) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const { data: member } = await db
    .from("org_members")
    .select("role")
    .eq("org_id", org.id)
    .eq("user_id", user.id)
    .single();

  if (!member || member.role !== "admin") {
    return NextResponse.json({ error: "Admin access required" }, { status: 403 });
  }

  const body = await request.json();
  const updates: Record<string, unknown> = {};

  if (body.name) updates.name = body.name;
  if (body.boost_level) updates.boost_level = body.boost_level;
  if (body.anthropic_api_key !== undefined) updates.anthropic_api_key = body.anthropic_api_key;

  const { data: updated, error } = await db
    .from("organizations")
    .update(updates)
    .eq("id", org.id)
    .select("id, name, slug, boost_level, created_at")
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  // Log activity
  const changedFields = Object.keys(updates).filter(k => k !== "anthropic_api_key");
  await db.from("activity_logs").insert({
    org_id: org.id,
    user_id: user.id,
    action: "settings_changed",
    details: { fields: changedFields, has_api_key_change: "anthropic_api_key" in updates },
  });

  return NextResponse.json(updated);
}
