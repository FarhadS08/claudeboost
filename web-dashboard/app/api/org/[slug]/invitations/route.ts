import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/utils/supabase/server";
import { createAdminClient } from "@/utils/supabase/admin";
import crypto from "crypto";

// POST: Create invitation
// GET: List pending invitations
export async function POST(
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

  // Verify admin/manager
  const { data: member } = await db
    .from("org_members")
    .select("role")
    .eq("org_id", org.id)
    .eq("user_id", user.id)
    .single();
  if (!member || !["admin", "manager"].includes(member.role)) {
    return NextResponse.json({ error: "Admin or manager access required" }, { status: 403 });
  }

  const { email, role = "member" } = await request.json();
  if (!email) return NextResponse.json({ error: "Email required" }, { status: 400 });

  // Check if already a member
  const { data: existingUser } = await db
    .from("profiles")
    .select("id")
    .eq("email", email)
    .single();

  if (existingUser) {
    const { data: existingMember } = await db
      .from("org_members")
      .select("id")
      .eq("org_id", org.id)
      .eq("user_id", existingUser.id)
      .single();
    if (existingMember) {
      return NextResponse.json({ error: "User is already a member" }, { status: 409 });
    }
  }

  // Check for existing pending invitation
  const { data: existingInvite } = await db
    .from("org_invitations")
    .select("id")
    .eq("org_id", org.id)
    .eq("email", email)
    .is("accepted_at", null)
    .single();

  if (existingInvite) {
    return NextResponse.json({ error: "Invitation already pending for this email" }, { status: 409 });
  }

  const inviteCode = crypto.randomBytes(12).toString("hex");

  const { data: invitation, error } = await db
    .from("org_invitations")
    .insert({
      org_id: org.id,
      email,
      role,
      invite_code: inviteCode,
      invited_by: user.id,
    })
    .select()
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  // Log activity
  await db.from("activity_logs").insert({
    org_id: org.id,
    user_id: user.id,
    action: "invite_sent",
    details: { email, role, invite_code: inviteCode },
  });

  return NextResponse.json({
    ...invitation,
    invite_url: `${process.env.NEXT_PUBLIC_SITE_URL || "https://claudeboost.vercel.app"}/join/${inviteCode}`,
  }, { status: 201 });
}

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

  const { data: invitations } = await db
    .from("org_invitations")
    .select("id, email, role, invite_code, created_at, accepted_at, expires_at")
    .eq("org_id", org.id)
    .order("created_at", { ascending: false });

  return NextResponse.json(invitations || []);
}
