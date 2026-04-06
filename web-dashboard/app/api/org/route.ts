import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/utils/supabase/server";
import { createAdminClient } from "@/utils/supabase/admin";

// POST: Create org + add creator as admin
// GET: List user's orgs
export async function POST(request: NextRequest) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const db = createAdminClient();

  const { name } = await request.json();
  if (!name || typeof name !== "string" || name.trim().length < 2) {
    return NextResponse.json({ error: "Name must be at least 2 characters" }, { status: 400 });
  }

  const slug = name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "")
    .slice(0, 40);

  const { data: existing } = await db
    .from("organizations")
    .select("id")
    .eq("slug", slug)
    .single();

  if (existing) {
    return NextResponse.json({ error: "Organization name already taken" }, { status: 409 });
  }

  const { data: org, error: orgError } = await db
    .from("organizations")
    .insert({ name: name.trim(), slug, created_by: user.id })
    .select()
    .single();

  if (orgError) {
    return NextResponse.json({ error: orgError.message }, { status: 500 });
  }

  await db.from("org_members").insert({
    org_id: org.id,
    user_id: user.id,
    role: "admin",
  });

  const domains = ["_global", "data_science", "data_engineering", "business_analytics", "general_coding", "documentation", "devops", "other"];
  await db.from("org_rules").insert(
    domains.map((domain) => ({
      org_id: org.id,
      domain,
      rule_text: "",
      enabled: true,
    }))
  );

  await db.from("activity_logs").insert({
    org_id: org.id,
    user_id: user.id,
    action: "org_created",
    details: { name: name.trim(), slug },
  });

  return NextResponse.json(org, { status: 201 });
}

export async function GET() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const db = createAdminClient();
  const { data: memberships } = await db
    .from("org_members")
    .select("org_id, role, organizations(id, name, slug, boost_level, created_at)")
    .eq("user_id", user.id);

  const orgs = (memberships || []).map((m) => {
    const org = m.organizations as unknown as Record<string, unknown>;
    return { ...org, role: m.role };
  });

  return NextResponse.json(orgs);
}
