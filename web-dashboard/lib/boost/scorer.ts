/**
 * scorer.ts — Pure text-signal prompt scoring across 6 dimensions.
 * No API calls. All scoring is done via regex and keyword matching.
 * Each dimension scores 1-5; total is out of 30.
 *
 * Ported from mcp-server/claudeboost_mcp/scorer.py
 */

import { Domain } from "@/lib/types";

export const DIMENSIONS = [
  "specificity",
  "verification",
  "context",
  "constraints",
  "structure",
  "output_definition",
] as const;

export type DimensionName = (typeof DIMENSIONS)[number];

export const DOMAIN_WEIGHTS: Record<string, Record<DimensionName, number>> = {
  data_science:       { specificity: 2, verification: 3, context: 3, constraints: 2, structure: 2, output_definition: 3 },
  data_engineering:   { specificity: 2, verification: 3, context: 2, constraints: 3, structure: 2, output_definition: 2 },
  business_analytics: { specificity: 2, verification: 2, context: 3, constraints: 2, structure: 2, output_definition: 3 },
  general_coding:     { specificity: 3, verification: 3, context: 2, constraints: 2, structure: 2, output_definition: 2 },
  documentation:      { specificity: 2, verification: 2, context: 2, constraints: 2, structure: 3, output_definition: 3 },
  devops:             { specificity: 3, verification: 2, context: 2, constraints: 3, structure: 3, output_definition: 2 },
  other:              { specificity: 2, verification: 2, context: 2, constraints: 2, structure: 2, output_definition: 2 },
};

function clamp(val: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, val));
}

function scoreSpecificity(prompt: string): number {
  let score = 1;

  if (/\b[A-Z][a-z]+(?:[A-Z][a-z]+)+\b/.test(prompt) ||
      /\b\w+(?:Service|Controller|Manager|Handler|Repository|Module|Component|Client|Server|API|SDK)\b/i.test(prompt)) {
    score++;
  }

  if (/@\S+/.test(prompt) || /\b\w+\/\w+/.test(prompt) ||
      /\bline\s+\d+\b/i.test(prompt) ||
      /\b(?:class|def|function)\s+\w+/i.test(prompt) ||
      /\.\w{2,4}\b/.test(prompt)) {
    score++;
  }

  if (/\b(?:error|exception|traceback|crash|fail|bug|issue|problem|symptom|behavior|race\s+condition|deadlock|timeout|null\s+pointer|stack\s+overflow|returns\s+\w+|throws\s+\w+|breaks\s+when)\b/i.test(prompt)) {
    score++;
  }

  if (/\b(?:because|caused\s+by|due\s+to|root\s+cause|when\s+\w+|triggered\s+by|hypothesis|suspect|possibly|likely\s+caused|ticket\s+[A-Z]+-\d+)\b/i.test(prompt)) {
    score++;
  }

  return clamp(score, 1, 5);
}

function scoreVerification(prompt: string): number {
  let score = 1;

  const verificationWords = ["test", "verify", "validate", "check", "confirm", "assert", "ensure"];
  const found = new Set<string>();
  for (const word of verificationWords) {
    if (new RegExp(`\\b${word}\\b`, "i").test(prompt)) found.add(word);
  }
  if (found.size > 0) score++;

  if (/\b(?:pytest|jest|mocha|jasmine|vitest|lint|eslint|flake8|mypy|typecheck|type-check|run\s+\w+|npm\s+test|make\s+test|cargo\s+test)\b/i.test(prompt)) {
    score++;
  }

  if (found.size >= 2) score++;

  if (/\b(?:edge\s+case|failure|regression|error\s+state|boundary|corner\s+case|negative\s+test|invalid\s+input|stress\s+test)\b/i.test(prompt)) {
    score++;
  }

  return clamp(score, 1, 5);
}

function scoreContext(prompt: string): number {
  let score = 1;

  const words = prompt.match(/\b[a-zA-Z]{4,}\b/g) || [];
  const actionVerbs = new Set(["make", "create", "write", "build", "implement", "add", "fix", "update", "change", "edit"]);
  const contentWords = words.filter((w) => !actionVerbs.has(w.toLowerCase()));
  if (contentWords.length >= 3) score++;

  if (/@\S+/.test(prompt) || /\b\w+(?:\/\w+)+\.\w{2,4}\b/.test(prompt)) score++;

  if (/\b(?:pattern|existing|git\s+(?:history|log|blame)|pull\s+request|PR\s+#?\d*|ticket|jira|issue\s+#?\d+|[A-Z]+-\d+|refactor|legacy|current\s+impl|as\s+defined|based\s+on|following\s+the\s+existing)\b/i.test(prompt)) {
    score++;
  }

  if (/\b(?:do\s+not|don'?t|avoid|not\s+in\s+scope|out\s+of\s+scope|note\s+that|important:|context:|background:|domain|assume)\b/i.test(prompt)) {
    score++;
  }

  return clamp(score, 1, 5);
}

function scoreConstraints(prompt: string): number {
  let score = 1;

  if (/\b(?:do\s+not|don'?t|avoid|never|without)\b/i.test(prompt)) score++;
  if (/\b(?:only|within|limited\s+to|only\s+modify|only\s+touch|restrict|in\s+scope)\b/i.test(prompt)) score++;
  if (/\b(?:preserve|backward\s+compat|backwards\s+compat|no\s+new\s+depend|maintain\s+API|keep\s+the\s+interface|existing\s+API|contract)\b/i.test(prompt)) score++;
  if (/\b(?:performance|compliance|security|max\s+\d+|limit\s+\d+|SLA|latency|throughput|GDPR|HIPAA|PCI|budget|cost)\b/i.test(prompt)) score++;

  return clamp(score, 1, 5);
}

function scoreStructure(prompt: string): number {
  let score = 1;

  const terminators = (prompt.match(/[.!?]|\n/g) || []).length;
  if (terminators >= 2) score++;

  const lines = prompt.split("\n");
  if (lines.some((l) => /^\s*\d+\./.test(l)) || lines.some((l) => /^\s*[-*]/.test(l))) score++;

  if (/^#{1,6}\s+\S/m.test(prompt) || /\*\*\S/.test(prompt)) score++;

  const headerCount = (prompt.match(/^#{1,6}\s+\S/gm) || []).length;
  const sectionKeywords = new Set<string>();
  const re = /\b(context|task|verification|output|steps|background|requirements|constraints)\b/gi;
  let m;
  while ((m = re.exec(prompt))) sectionKeywords.add(m[0].toLowerCase());
  if (headerCount >= 3 || sectionKeywords.size >= 3) score++;

  return clamp(score, 1, 5);
}

function scoreOutputDefinition(prompt: string): number {
  let score = 1;

  const outputTypeRe = /\b(?:file|report|PR|pull\s+request|commit|table|chart|summary|test|output|result|artifact|document|diagram|dashboard|log|diff)\b/gi;
  const outputMatches = prompt.match(outputTypeRe) || [];
  if (outputMatches.length > 0) score++;

  if (/@\S+\.\w{2,4}/.test(prompt) || /\b\w+(?:\/\w+)+\.\w{2,4}\b/.test(prompt)) score++;

  if (/\b(?:JSON|markdown|CSV|PDF|PNG|YAML|yaml|XML|HTML|TOML|parquet|xlsx|txt|rst)\b/i.test(prompt)) score++;

  if (outputMatches.length >= 2 ||
      (prompt.match(/@\S+\.\w{2,4}/g) || []).length >= 2 ||
      /\b(?:success\s+criteria|done\s+when|complete\s+when|definition\s+of\s+done|acceptance\s+criteria|must\s+include|should\s+contain)\b/i.test(prompt)) {
    score++;
  }

  return clamp(score, 1, 5);
}

export interface ScoreResult {
  dimensions: Record<DimensionName, number>;
  total: number;
  average: number;
  level: number;
  weakest: string[];
}

export function scorePrompt(prompt: string): ScoreResult {
  const dimensions: Record<DimensionName, number> = {
    specificity: scoreSpecificity(prompt),
    verification: scoreVerification(prompt),
    context: scoreContext(prompt),
    constraints: scoreConstraints(prompt),
    structure: scoreStructure(prompt),
    output_definition: scoreOutputDefinition(prompt),
  };

  const total = Object.values(dimensions).reduce((a, b) => a + b, 0);
  const average = Math.round((total / DIMENSIONS.length) * 10) / 10;
  const level = getLevel(average);
  const weakest = getWeakestDimensions(dimensions);

  return { dimensions, total, average, level, weakest };
}

export function getWeakestDimensions(scores: Record<DimensionName, number>, threshold = 3): string[] {
  return Object.entries(scores)
    .filter(([, val]) => val < threshold)
    .sort((a, b) => a[1] - b[1])
    .map(([dim]) => dim);
}

export function getWeightedWeakest(scores: Record<DimensionName, number>, domain: Domain, threshold = 3): string[] {
  const weights = DOMAIN_WEIGHTS[domain] ?? DOMAIN_WEIGHTS.other;
  return Object.entries(scores)
    .filter(([, val]) => val < threshold)
    .map(([dim, val]) => ({ dim, priority: (weights[dim as DimensionName] ?? 1) * (threshold - val) }))
    .sort((a, b) => b.priority - a.priority)
    .map(({ dim }) => dim);
}

export function getLevel(average: number): number {
  if (average < 1.5) return 1;
  if (average < 2.5) return 2;
  if (average < 3.5) return 3;
  if (average < 4.5) return 4;
  return 5;
}
