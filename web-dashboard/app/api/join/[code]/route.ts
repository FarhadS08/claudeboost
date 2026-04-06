import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/utils/supabase/server";
import { createAdminClient } from "@/utils/supabase/admin";

// GET: Fetch invite details (public, shows org name + role)
export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ code: string }> }
) {
  const { code } = await params;
  const db = createAdminClient();

  const { data: invite } = await db
    .from("org_invitations")
    .select("id, email, role, accepted_at, expires_at, org_id, organizations(name, slug)")
    .eq("invite_code", code)
    .single();

  if (!invite) {
    return NextResponse.json({ error: "Invitation not found" }, { status: 404 });
  }

  if (invite.accepted_at) {
    return NextResponse.json({ error: "Invitation already accepted" }, { status: 410 });
  }

  if (new Date(invite.expires_at) < new Date()) {
    return NextResponse.json({ error: "Invitation expired" }, { status: 410 });
  }

  const org = invite.organizations as unknown as { name: string; slug: string };

  return NextResponse.json({
    email: invite.email,
    role: invite.role,
    org_name: org.name,
    org_slug: org.slug,
  });
}

// POST: Accept invitation (authenticated user)
export async function POST(
  _request: NextRequest,
  { params }: { params: Promise<{ code: string }> }
) {
  const { code } = await params;
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: "Must be logged in to accept" }, { status: 401 });
  }

  const db = createAdminClient();

  // Fetch and validate invite
  const { data: invite } = await db
    .from("org_invitations")
    .select("id, email, role, accepted_at, expires_at, org_id")
    .eq("invite_code", code)
    .single();

  if (!invite) {
    return NextResponse.json({ error: "Invitation not found" }, { status: 404 });
  }

  if (invite.accepted_at) {
    return NextResponse.json({ error: "Invitation already accepted" }, { status: 410 });
  }

  if (new Date(invite.expires_at) < new Date()) {
    return NextResponse.json({ error: "Invitation expired" }, { status: 410 });
  }

  // Check email matches (if invite was sent to specific email)
  if (invite.email && user.email && invite.email.toLowerCase() !== user.email.toLowerCase()) {
    return NextResponse.json({
      error: `This invitation was sent to ${invite.email}. You are logged in as ${user.email}.`
    }, { status: 403 });
  }

  // Check if already a member
  const { data: existing } = await db
    .from("org_members")
    .select("id")
    .eq("org_id", invite.org_id)
    .eq("user_id", user.id)
    .single();

  if (existing) {
    // Mark invite as accepted anyway
    await db.from("org_invitations").update({
      accepted_by: user.id,
      accepted_at: new Date().toISOString(),
    }).eq("id", invite.id);

    return NextResponse.json({ already_member: true, org_id: invite.org_id });
  }

  // Add user to org
  const { error: memberError } = await db.from("org_members").insert({
    org_id: invite.org_id,
    user_id: user.id,
    role: invite.role,
  });

  if (memberError) {
    return NextResponse.json({ error: memberError.message }, { status: 500 });
  }

  // Mark invite as accepted
  await db.from("org_invitations").update({
    accepted_by: user.id,
    accepted_at: new Date().toISOString(),
  }).eq("id", invite.id);

  // Log activity
  await db.from("activity_logs").insert({
    org_id: invite.org_id,
    user_id: user.id,
    action: "invite_accepted",
    details: { email: user.email, role: invite.role },
  });

  // Get org slug for redirect
  const { data: org } = await db
    .from("organizations")
    .select("slug")
    .eq("id", invite.org_id)
    .single();

  return NextResponse.json({
    success: true,
    org_slug: org?.slug,
    role: invite.role,
  });
}
