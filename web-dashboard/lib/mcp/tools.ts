/**
 * MCP tool definitions and handlers for ClaudeBoost enterprise.
 */

import { classifyDomain } from "@/lib/boost/classifier";
import { enhancePrompt } from "@/lib/boost/enhancer";
import { scorePrompt, getWeightedWeakest } from "@/lib/boost/scorer";
import type { Domain } from "@/lib/types";
import type { SupabaseClient } from "@supabase/supabase-js";

interface OrgContext {
  orgId: string;
  anthropicApiKey: string;
  boostLevel: string;
  supabase: SupabaseClient;
}

export const TOOL_DEFINITIONS = [
  {
    name: "boost_prompt",
    description:
      "Enhance a user prompt using your organization's rules and enterprise playbook. " +
      "Classifies the domain, scores the prompt, enhances it with org-specific rules, " +
      "and returns a before/after comparison.",
    inputSchema: {
      type: "object" as const,
      properties: {
        prompt: { type: "string", description: "The user's original prompt to enhance" },
        level: {
          type: "string",
          enum: ["light", "medium", "full"],
          description: "Enhancement level (default: org setting or 'medium')",
        },
      },
      required: ["prompt"],
    },
  },
  {
    name: "boost_settings",
    description: "View or update boost settings for this organization.",
    inputSchema: {
      type: "object" as const,
      properties: {
        action: { type: "string", enum: ["get"], description: "Action to perform" },
      },
      required: ["action"],
    },
  },
];

async function fetchOrgRules(supabase: SupabaseClient, orgId: string, domain: string) {
  const { data: globalRule } = await supabase
    .from("org_rules")
    .select("rule_text")
    .eq("org_id", orgId)
    .eq("domain", "_global")
    .eq("enabled", true)
    .single();

  const { data: domainRule } = await supabase
    .from("org_rules")
    .select("rule_text")
    .eq("org_id", orgId)
    .eq("domain", domain)
    .eq("enabled", true)
    .single();

  return {
    global: globalRule?.rule_text || undefined,
    domain: domainRule?.rule_text || undefined,
  };
}

export async function handleToolCall(
  toolName: string,
  args: Record<string, unknown>,
  ctx: OrgContext
): Promise<{ content: Array<{ type: "text"; text: string }> }> {
  if (toolName === "boost_prompt") {
    const prompt = args.prompt as string;
    const level = (args.level as string) || ctx.boostLevel || "medium";

    // 1. Classify domain
    const domain = await classifyDomain(prompt, ctx.anthropicApiKey);

    // 2. Score original
    const originalScore = scorePrompt(prompt);

    // 3. Smart skip: if already good enough
    if (originalScore.total >= 20) {
      return {
        content: [{
          type: "text",
          text: JSON.stringify({
            status: "skipped",
            reason: "Prompt already scores well (>= 20/30)",
            domain,
            original: prompt,
            original_score: originalScore,
          }),
        }],
      };
    }

    // 4. Get org rules
    const orgRules = await fetchOrgRules(ctx.supabase, ctx.orgId, domain);

    // 5. Get weak dimensions
    const weakDimensions = getWeightedWeakest(
      originalScore.dimensions as Record<string, number> as Record<import("@/lib/boost/scorer").DimensionName, number>,
      domain as Domain
    );

    // 6. Enhance
    const boosted = await enhancePrompt({
      prompt,
      domain: domain as Domain,
      level,
      apiKey: ctx.anthropicApiKey,
      orgRules,
      weakDimensions,
    });

    // 7. Score boosted
    const boostedScore = scorePrompt(boosted);

    // 8. Compute improvements
    const improvements: string[] = [];
    for (const [dim, val] of Object.entries(boostedScore.dimensions)) {
      const orig = (originalScore.dimensions as Record<string, number>)[dim] ?? 0;
      if (val > orig) {
        improvements.push(`${dim}: ${orig} → ${val}`);
      }
    }

    // 9. Log to history
    await ctx.supabase.from("boost_history").insert({
      org_id: ctx.orgId,
      domain,
      original: prompt,
      boosted,
      original_score: originalScore,
      boosted_score: boostedScore,
      timestamp: new Date().toISOString(),
    });

    return {
      content: [{
        type: "text",
        text: JSON.stringify({
          status: "enhanced",
          domain,
          level,
          original: prompt,
          boosted,
          original_score: originalScore,
          boosted_score: boostedScore,
          improvements,
          org_rules_applied: !!(orgRules.global || orgRules.domain),
        }),
      }],
    };
  }

  if (toolName === "boost_settings") {
    return {
      content: [{
        type: "text",
        text: JSON.stringify({
          boost_level: ctx.boostLevel,
          org_id: ctx.orgId,
        }),
      }],
    };
  }

  return {
    content: [{ type: "text", text: JSON.stringify({ error: `Unknown tool: ${toolName}` }) }],
  };
}
