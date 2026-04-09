import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/utils/supabase/server";
import { createAdminClient } from "@/utils/supabase/admin";

// GET: Get single prompt
// PATCH: Update prompt (creates new version)
// DELETE: Delete prompt (admin/manager only)
export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ slug: string; id: string }> }
) {
  const { slug, id } = await params;
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const db = createAdminClient();

  const { data: org } = await db.from("organizations").select("id").eq("slug", slug).single();
  if (!org) return NextResponse.json({ error: "Org not found" }, { status: 404 });

  const { data: member } = await db
    .from("org_members").select("role").eq("org_id", org.id).eq("user_id", user.id).single();
  if (!member) return NextResponse.json({ error: "Not a member" }, { status: 403 });

  const { data: prompt } = await db
    .from("prompt_registry")
    .select("*")
    .eq("id", id)
    .eq("org_id", org.id)
    .single();

  if (!prompt) return NextResponse.json({ error: "Prompt not found" }, { status: 404 });

  // Get author info
  const { data: author } = await db
    .from("profiles").select("email, display_name").eq("id", prompt.created_by).single();

  return NextResponse.json({
    ...prompt,
    author_email: author?.email || null,
    author_name: author?.display_name || null,
  });
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string; id: string }> }
) {
  const { slug, id } = await params;
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const db = createAdminClient();

  const { data: org } = await db.from("organizations").select("id").eq("slug", slug).single();
  if (!org) return NextResponse.json({ error: "Org not found" }, { status: 404 });

  const { data: member } = await db
    .from("org_members").select("role").eq("org_id", org.id).eq("user_id", user.id).single();
  if (!member) return NextResponse.json({ error: "Not a member" }, { status: 403 });

  const { data: prompt } = await db
    .from("prompt_registry")
    .select("*")
    .eq("id", id)
    .eq("org_id", org.id)
    .single();

  if (!prompt) return NextResponse.json({ error: "Prompt not found" }, { status: 404 });

  const body = await request.json();
  const { content, title, domain, tags, change_summary } = body;

  if (!content) {
    return NextResponse.json({ error: "content is required" }, { status: 400 });
  }

  if (!change_summary || !change_summary.trim()) {
    return NextResponse.json({ error: "change_summary is required (like a commit message)" }, { status: 400 });
  }

  const newVersion = prompt.version + 1;

  // Extract variables for templates
  const variables: string[] = [];
  if (prompt.type === "template") {
    const matches = content.matchAll(/\{\{(\w+)\}\}/g);
    for (const match of matches) {
      if (!variables.includes(match[1])) variables.push(match[1]);
    }
  }

  // Create version record FIRST to avoid inconsistent state
  const { error: versionError } = await db.from("prompt_versions").insert({
    prompt_id: id,
    version: newVersion,
    content,
    change_summary: change_summary.trim(),
    changed_by: user.id,
  });

  if (versionError) {
    return NextResponse.json({ error: versionError.message }, { status: 500 });
  }

  // Update prompt (safe now — version record exists)
  const updates: Record<string, unknown> = {
    content,
    version: newVersion,
    updated_by: user.id,
    updated_at: new Date().toISOString(),
    variables,
  };
  if (title !== undefined) updates.title = title;
  if (domain !== undefined) updates.domain = domain || null;
  if (tags !== undefined) updates.tags = tags;

  const { data: updated, error: updateError } = await db
    .from("prompt_registry")
    .update(updates)
    .eq("id", id)
    .select()
    .single();

  if (updateError) {
    return NextResponse.json({ error: updateError.message }, { status: 500 });
  }

  // Log activity
  await db.from("activity_logs").insert({
    org_id: org.id,
    user_id: user.id,
    action: "prompt_updated",
    details: { prompt_id: id, version: newVersion, change_summary: change_summary.trim() },
  });

  return NextResponse.json(updated);
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ slug: string; id: string }> }
) {
  const { slug, id } = await params;
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const db = createAdminClient();

  const { data: org } = await db.from("organizations").select("id").eq("slug", slug).single();
  if (!org) return NextResponse.json({ error: "Org not found" }, { status: 404 });

  const { data: member } = await db
    .from("org_members").select("role").eq("org_id", org.id).eq("user_id", user.id).single();
  if (!member || !["admin", "manager"].includes(member.role)) {
    return NextResponse.json({ error: "Admin or manager access required" }, { status: 403 });
  }

  const { data: prompt } = await db
    .from("prompt_registry")
    .select("title, type")
    .eq("id", id)
    .eq("org_id", org.id)
    .single();

  if (!prompt) return NextResponse.json({ error: "Prompt not found" }, { status: 404 });

  // Delete cascades to prompt_versions
  const { error: deleteError } = await db.from("prompt_registry").delete().eq("id", id);
  if (deleteError) {
    return NextResponse.json({ error: deleteError.message }, { status: 500 });
  }

  // Log activity
  await db.from("activity_logs").insert({
    org_id: org.id,
    user_id: user.id,
    action: "prompt_deleted",
    details: { prompt_id: id, title: prompt.title, type: prompt.type },
  });

  return NextResponse.json({ success: true });
}
