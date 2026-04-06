import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/utils/supabase/server";
import { createAdminClient } from "@/utils/supabase/admin";

// GET: Aggregated org stats
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

  const { data: member } = await db
    .from("org_members")
    .select("role")
    .eq("org_id", org.id)
    .eq("user_id", user.id)
    .single();
  if (!member) return NextResponse.json({ error: "Not a member" }, { status: 403 });

  // Fetch all org history
  const { data: history } = await db
    .from("boost_history")
    .select("domain, original_score, boosted_score, chosen, rating, feedback, timestamp")
    .eq("org_id", org.id)
    .order("timestamp", { ascending: false });

  const entries = history || [];
  const total = entries.length;

  // Domain distribution
  const domainCounts: Record<string, number> = {};
  for (const e of entries) {
    domainCounts[e.domain] = (domainCounts[e.domain] || 0) + 1;
  }

  // Score improvements
  const scored = entries.filter(
    (e) => e.original_score?.total != null && e.boosted_score?.total != null
  );
  const avgLift = scored.length > 0
    ? scored.reduce((sum, e) => sum + (e.boosted_score.total - e.original_score.total), 0) / scored.length
    : 0;

  // Acceptance rate
  const decided = entries.filter((e) => e.chosen !== null);
  const accepted = decided.filter((e) => e.chosen === "boosted");
  const acceptanceRate = decided.length > 0 ? (accepted.length / decided.length) * 100 : 0;

  // Dimension averages (before/after)
  const dims = ["specificity", "verification", "context", "constraints", "structure", "output_definition"];
  const dimStats = dims.map((dim) => {
    const before = scored.map((e) => e.original_score?.dimensions?.[dim] ?? 0);
    const after = scored.map((e) => e.boosted_score?.dimensions?.[dim] ?? 0);
    return {
      dimension: dim,
      avg_before: before.length > 0 ? before.reduce((a, b) => a + b, 0) / before.length : 0,
      avg_after: after.length > 0 ? after.reduce((a, b) => a + b, 0) / after.length : 0,
    };
  });

  // Daily activity (last 30 days)
  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
  const dailyActivity: Record<string, number> = {};
  for (const e of entries) {
    const day = e.timestamp?.slice(0, 10);
    if (day && new Date(day) >= thirtyDaysAgo) {
      dailyActivity[day] = (dailyActivity[day] || 0) + 1;
    }
  }

  // Quality level distribution
  const levelCounts: Record<number, number> = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
  for (const e of scored) {
    const lvl = e.boosted_score?.level ?? 0;
    if (lvl >= 1 && lvl <= 5) levelCounts[lvl]++;
  }

  // Feedback coverage
  const withFeedback = entries.filter((e) => e.rating != null || (e.feedback && e.feedback.length > 0)).length;
  const feedbackPct = total > 0 ? (withFeedback / total) * 100 : 0;

  return NextResponse.json({
    total,
    domain_counts: domainCounts,
    avg_lift: Math.round(avgLift * 10) / 10,
    acceptance_rate: Math.round(acceptanceRate),
    dimension_stats: dimStats,
    daily_activity: dailyActivity,
    level_counts: levelCounts,
    feedback_pct: Math.round(feedbackPct),
    scored_count: scored.length,
  });
}
