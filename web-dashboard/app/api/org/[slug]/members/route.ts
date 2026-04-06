import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/utils/supabase/server";
import { createAdminClient } from "@/utils/supabase/admin";

// GET: List members with profile info
// DELETE: Remove a member
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

  // Verify membership
  const { data: member } = await db
    .from("org_members")
    .select("role")
    .eq("org_id", org.id)
    .eq("user_id", user.id)
    .single();
  if (!member) return NextResponse.json({ error: "Not a member" }, { status: 403 });

  const { data: members } = await db
    .from("org_members")
    .select("id, user_id, role, joined_at, profiles(email, display_name, avatar_url)")
    .eq("org_id", org.id)
    .order("joined_at");

  return NextResponse.json(
    (members || []).map((m) => ({
      id: m.id,
      user_id: m.user_id,
      role: m.role,
      joined_at: m.joined_at,
      ...(m.profiles as unknown as Record<string, unknown>),
    }))
  );
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  const { slug } = await params;
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const db = createAdminClient();

  const { data: org } = await db.from("organizations").select("id").eq("slug", slug).single();
  if (!org) return NextResponse.json({ error: "Not found" }, { status: 404 });

  // Verify admin
  const { data: member } = await db
    .from("org_members")
    .select("role")
    .eq("org_id", org.id)
    .eq("user_id", user.id)
    .single();
  if (!member || member.role !== "admin") {
    return NextResponse.json({ error: "Admin access required" }, { status: 403 });
  }

  const { member_id } = await request.json();

  // Get member info before deleting for the log
  const { data: target } = await db
    .from("org_members")
    .select("user_id, profiles(email)")
    .eq("id", member_id)
    .single();

  await db.from("org_members").delete().eq("id", member_id).eq("org_id", org.id);

  // Log activity
  const targetProfile = target?.profiles as unknown as { email?: string } | null;
  await db.from("activity_logs").insert({
    org_id: org.id,
    user_id: user.id,
    action: "member_removed",
    details: { removed_email: targetProfile?.email, removed_user_id: target?.user_id },
  });

  return NextResponse.json({ success: true });
}

// PATCH: Update member role
export async function PATCH(
  request: NextRequest,
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
  if (!member || member.role !== "admin") {
    return NextResponse.json({ error: "Admin access required" }, { status: 403 });
  }

  const { member_id, role } = await request.json();
  if (!["admin", "manager", "member"].includes(role)) {
    return NextResponse.json({ error: "Invalid role" }, { status: 400 });
  }

  await db.from("org_members").update({ role }).eq("id", member_id).eq("org_id", org.id);

  // Log activity
  await db.from("activity_logs").insert({
    org_id: org.id,
    user_id: user.id,
    action: "role_changed",
    details: { member_id, new_role: role },
  });

  return NextResponse.json({ success: true });
}
