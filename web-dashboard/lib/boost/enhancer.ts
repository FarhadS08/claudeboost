/**
 * enhancer.ts — Prompt enhancement using domain-specific rules + org rules.
 * Ported from mcp-server/claudeboost_mcp/enhancer.py
 */

import Anthropic from "@anthropic-ai/sdk";
import { Domain } from "@/lib/types";
import { DOMAIN_RULES, LEVEL_INSTRUCTIONS } from "./domain-rules";

interface OrgRules {
  global?: string;
  domain?: string;
}

interface EnhanceOptions {
  prompt: string;
  domain: Domain;
  level?: string;
  apiKey: string;
  orgRules?: OrgRules;
  weakDimensions?: string[];
}

export async function enhancePrompt({
  prompt,
  domain,
  level = "medium",
  apiKey,
  orgRules,
  weakDimensions,
}: EnhanceOptions): Promise<string> {
  try {
    const client = new Anthropic({ apiKey, timeout: 30000 });

    // Base domain rules
    const baseRules = DOMAIN_RULES[domain] ?? DOMAIN_RULES.other;

    // Merge org rules
    let rules = baseRules;
    if (orgRules?.global) {
      rules += `\n\nORGANIZATION-WIDE RULES:\n${orgRules.global}`;
    }
    if (orgRules?.domain) {
      rules += `\n\nDOMAIN-SPECIFIC ORG RULES:\n${orgRules.domain}`;
    }

    const levelInstruction = LEVEL_INSTRUCTIONS[level] ?? LEVEL_INSTRUCTIONS.medium;

    let dimensionFocus = "";
    if (weakDimensions && weakDimensions.length > 0) {
      const dimNames = weakDimensions.map((d) => d.replace(/_/g, " ")).join(", ");
      dimensionFocus =
        `\n\nFOCUS AREAS: The original prompt scores lowest on: ${dimNames}. ` +
        "Prioritize improving these dimensions. Do not over-engineer dimensions " +
        "that are already adequate.";
    }

    // Light/medium use Haiku (fast), full uses Sonnet (thorough)
    const modelMap: Record<string, [string, number]> = {
      light: ["claude-haiku-4-5-20251001", 200],
      medium: ["claude-haiku-4-5-20251001", 400],
      full: ["claude-sonnet-4-20250514", 600],
    };
    const [model, maxTokens] = modelMap[level] ?? modelMap.medium;

    const system =
      `${rules}\n\n` +
      `BOOST LEVEL: ${level.toUpperCase()}\n${levelInstruction}` +
      `${dimensionFocus}\n\n` +
      "Rewrite the user's prompt to be significantly better. " +
      "Return ONLY the improved prompt. No preamble, no explanation, " +
      "no quotes around the result.";

    const response = await client.messages.create({
      model,
      max_tokens: maxTokens,
      temperature: 0,
      system,
      messages: [{ role: "user", content: prompt }],
    });

    return (response.content[0] as { text: string }).text.trim();
  } catch (e: unknown) {
    const errName = e instanceof Error ? e.constructor.name : "Error";
    const errMsg = e instanceof Error ? e.message : String(e);
    console.error(`[ClaudeBoost] Enhancement error: ${errName}: ${errMsg}`);
    return `${prompt}\n\n[ClaudeBoost: enhancement failed — ${errName}: ${errMsg}]`;
  }
}
