import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/utils/supabase/server";
import { createAdminClient } from "@/utils/supabase/admin";

// GET: List all versions of a prompt (newest first)
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

  // Verify prompt belongs to this org
  const { data: prompt } = await db
    .from("prompt_registry")
    .select("id")
    .eq("id", id)
    .eq("org_id", org.id)
    .single();
  if (!prompt) return NextResponse.json({ error: "Prompt not found" }, { status: 404 });

  const { data: versions } = await db
    .from("prompt_versions")
    .select("id, version, content, change_summary, changed_by, created_at")
    .eq("prompt_id", id)
    .order("version", { ascending: false });

  // Get author info for each version
  const userIds = [...new Set((versions || []).map((v) => v.changed_by))];
  const { data: profiles } = await db
    .from("profiles")
    .select("id, email, display_name")
    .in("id", userIds);

  const profileMap = new Map((profiles || []).map((p) => [p.id, p]));

  return NextResponse.json(
    (versions || []).map((v) => {
      const profile = profileMap.get(v.changed_by);
      return {
        ...v,
        author_email: profile?.email || null,
        author_name: profile?.display_name || null,
      };
    })
  );
}
