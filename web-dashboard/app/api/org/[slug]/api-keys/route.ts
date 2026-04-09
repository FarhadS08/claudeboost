import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/utils/supabase/server";
import { createAdminClient } from "@/utils/supabase/admin";
import crypto from "crypto";

// POST: Generate a new API key
// GET: List API keys (prefix only)
export async function POST(
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
    .select("id")
    .eq("slug", slug)
    .single();
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

  // Generate key: cb_org_ + 32 random hex chars
  const rawKey = `cb_org_${crypto.randomBytes(16).toString("hex")}`;
  const keyHash = crypto.createHash("sha256").update(rawKey).digest("hex");
  const keyPrefix = rawKey.slice(0, 16);

  const { error } = await db.from("org_api_keys").insert({
    org_id: org.id,
    key_hash: keyHash,
    key_prefix: keyPrefix,
    created_by: user.id,
  });

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  // Log activity
  await db.from("activity_logs").insert({
    org_id: org.id,
    user_id: user.id,
    action: "api_key_generated",
    details: { key_prefix: keyPrefix },
  });

  // Return the full key ONCE — it's never shown again
  return NextResponse.json({ key: rawKey, prefix: keyPrefix }, { status: 201 });
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

  const { data: org } = await db
    .from("organizations")
    .select("id")
    .eq("slug", slug)
    .single();
  if (!org) return NextResponse.json({ error: "Not found" }, { status: 404 });

  // Verify membership
  const { data: member } = await db
    .from("org_members")
    .select("role")
    .eq("org_id", org.id)
    .eq("user_id", user.id)
    .single();
  if (!member) return NextResponse.json({ error: "Not a member" }, { status: 403 });

  const { data: keys } = await db
    .from("org_api_keys")
    .select("id, key_prefix, created_at")
    .eq("org_id", org.id)
    .order("created_at", { ascending: false });

  return NextResponse.json(keys || []);
}
