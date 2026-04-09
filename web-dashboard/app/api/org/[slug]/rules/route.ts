import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/utils/supabase/server";
import { createAdminClient } from "@/utils/supabase/admin";

// GET: List all rules for this org
// POST: Upsert a rule for a domain
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

  const { data: rules } = await db
    .from("org_rules")
    .select("id, domain, rule_text, enabled, updated_at")
    .eq("org_id", org.id)
    .order("domain");

  return NextResponse.json(rules || []);
}

export async function POST(
  request: NextRequest,
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

  const { domain, rule_text, enabled } = await request.json();

  const validDomains = ["_global", "data_science", "data_engineering", "business_analytics", "general_coding", "documentation", "devops", "other"];
  if (!domain || !validDomains.includes(domain)) {
    return NextResponse.json({ error: "Invalid domain" }, { status: 400 });
  }

  const { data: rule, error } = await db
    .from("org_rules")
    .upsert(
      {
        org_id: org.id,
        domain,
        rule_text: rule_text ?? "",
        enabled: enabled ?? true,
        updated_at: new Date().toISOString(),
      },
      { onConflict: "org_id,domain" }
    )
    .select()
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  // Log activity
  await db.from("activity_logs").insert({
    org_id: org.id,
    user_id: user.id,
    action: "rule_updated",
    details: { domain, has_content: !!(rule_text && rule_text.trim()), enabled: enabled ?? true },
  });

  return NextResponse.json(rule);
}
