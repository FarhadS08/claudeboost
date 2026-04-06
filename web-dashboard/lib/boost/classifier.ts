/**
 * classifier.ts — Domain classification using Claude Haiku.
 * Ported from mcp-server/claudeboost_mcp/classifier.py
 */

import Anthropic from "@anthropic-ai/sdk";
import { Domain } from "@/lib/types";

const DOMAINS: Domain[] = [
  "data_science",
  "data_engineering",
  "business_analytics",
  "general_coding",
  "documentation",
  "devops",
  "other",
];

export async function classifyDomain(prompt: string, apiKey: string): Promise<Domain> {
  try {
    const client = new Anthropic({ apiKey });
    const response = await client.messages.create({
      model: "claude-haiku-4-5-20251001",
      max_tokens: 20,
      temperature: 0,
      system:
        "You are a domain classifier. Classify the user's prompt into exactly one " +
        "of these domains: data_science, data_engineering, business_analytics, " +
        "general_coding, documentation, devops, other. " +
        "Reply with only the domain name. No punctuation, no explanation.",
      messages: [{ role: "user", content: prompt }],
    });

    const result = (response.content[0] as { text: string }).text.trim().toLowerCase();
    return DOMAINS.includes(result as Domain) ? (result as Domain) : "other";
  } catch (e) {
    console.error("[ClaudeBoost] Classification error:", e);
    return "other";
  }
}
