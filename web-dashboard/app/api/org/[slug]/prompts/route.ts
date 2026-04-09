import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/utils/supabase/server";
import { createAdminClient } from "@/utils/supabase/admin";

// GET: List prompts (filterable by type, domain, tags, search)
// POST: Create new prompt + version 1
export async function GET(
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
    .from("org_members").select("role").eq("org_id", org.id).eq("user_id", user.id).single();
  if (!member) return NextResponse.json({ error: "Not a member" }, { status: 403 });

  // Parse query params
  const url = new URL(request.url);
  const type = url.searchParams.get("type");
  const domain = url.searchParams.get("domain");
  const search = url.searchParams.get("search");
  const tag = url.searchParams.get("tag");

  let query = db
    .from("prompt_registry")
    .select("id, type, title, content, domain, tags, variables, version, created_by, updated_by, is_public, created_at, updated_at, profiles!prompt_registry_created_by_fkey(email, display_name)")
    .eq("org_id", org.id)
    .order("updated_at", { ascending: false });

  if (type) query = query.eq("type", type);
  if (domain) query = query.eq("domain", domain);
  if (tag) query = query.contains("tags", [tag]);
  if (search) query = query.or(`title.ilike.%${search}%,content.ilike.%${search}%`);

  const { data: prompts, error } = await query.limit(100);

  if (error) {
    // Fallback: query without profile join if FK name is wrong
    const { data: fallback } = await db
      .from("prompt_registry")
      .select("*")
      .eq("org_id", org.id)
      .order("updated_at", { ascending: false })
      .limit(100);

    return NextResponse.json(
      (fallback || []).map((p) => ({ ...p, author_email: null, author_name: null }))
    );
  }

  return NextResponse.json(
    (prompts || []).map((p) => {
      const profile = p.profiles as unknown as { email?: string; display_name?: string } | null;
      return {
        ...p,
        profiles: undefined,
        author_email: profile?.email || null,
        author_name: profile?.display_name || null,
      };
    })
  );
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

  const { data: org } = await db.from("organizations").select("id").eq("slug", slug).single();
  if (!org) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const { data: member } = await db
    .from("org_members").select("role").eq("org_id", org.id).eq("user_id", user.id).single();
  if (!member) return NextResponse.json({ error: "Not a member" }, { status: 403 });

  const body = await request.json();
  const { type, title, content, domain, tags } = body;

  if (!type || !title || !content) {
    return NextResponse.json({ error: "type, title, and content are required" }, { status: 400 });
  }

  if (!["boost", "template", "constraint"].includes(type)) {
    return NextResponse.json({ error: "type must be boost, template, or constraint" }, { status: 400 });
  }

  // Extract {{variables}} from templates
  const variables: string[] = [];
  if (type === "template") {
    const matches = content.matchAll(/\{\{(\w+)\}\}/g);
    for (const match of matches) {
      if (!variables.includes(match[1])) variables.push(match[1]);
    }
  }

  // Create prompt
  const { data: prompt, error: promptError } = await db
    .from("prompt_registry")
    .insert({
      org_id: org.id,
      type,
      title: title.trim(),
      content,
      domain: domain || null,
      tags: tags || [],
      variables,
      created_by: user.id,
      updated_by: user.id,
    })
    .select()
    .single();

  if (promptError) {
    return NextResponse.json({ error: promptError.message }, { status: 500 });
  }

  // Create version 1
  await db.from("prompt_versions").insert({
    prompt_id: prompt.id,
    version: 1,
    content,
    change_summary: "Initial version",
    changed_by: user.id,
  });

  // Log activity
  await db.from("activity_logs").insert({
    org_id: org.id,
    user_id: user.id,
    action: "prompt_created",
    details: { prompt_id: prompt.id, type, title: title.trim(), domain },
  });

  return NextResponse.json(prompt, { status: 201 });
}
