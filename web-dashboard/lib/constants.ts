import { Domain } from "./types";

export const DOMAINS: Domain[] = ["data_science", "data_engineering", "business_analytics", "general_coding", "documentation", "devops", "other"];

export const DOMAIN_COLORS: Record<Domain, { bg: string; text: string; border: string; accent: string }> = {
  data_science:       { bg: "bg-blue-500/12",    text: "text-blue-400",    border: "border-blue-500/25",    accent: "#3b82f6" },
  data_engineering:   { bg: "bg-violet-500/12",   text: "text-violet-400",  border: "border-violet-500/25",  accent: "#8b5cf6" },
  business_analytics: { bg: "bg-emerald-500/12",  text: "text-emerald-400", border: "border-emerald-500/25", accent: "#10b981" },
  general_coding:     { bg: "bg-amber-500/12",    text: "text-amber-400",   border: "border-amber-500/25",   accent: "#f59e0b" },
  documentation:      { bg: "bg-orange-500/12",   text: "text-orange-400",  border: "border-orange-500/25",  accent: "#f97316" },
  devops:             { bg: "bg-rose-500/12",     text: "text-rose-400",    border: "border-rose-500/25",    accent: "#f43f5e" },
  other:              { bg: "bg-cyan-500/12",      text: "text-cyan-400",    border: "border-cyan-500/25",    accent: "#06b6d4" },
};

export const DOMAIN_LABELS: Record<Domain, string> = {
  data_science: "Data Science",
  data_engineering: "Data Engineering",
  business_analytics: "Business Analytics",
  general_coding: "General Coding",
  documentation: "Documentation",
  devops: "DevOps",
  other: "Other",
};

export const DIMENSION_NAMES: Record<string, string> = {
  specificity: "Specificity",
  verification: "Verification",
  context: "Context",
  constraints: "Constraints",
  structure: "Structure",
  output_definition: "Output",
};

export const LEVEL_LABELS: Record<number, string> = {
  1: "Unacceptable",
  2: "Needs Work",
  3: "Acceptable",
  4: "Production",
  5: "Enterprise",
};

export const LEVEL_COLORS: Record<number, string> = {
  1: "text-red-400",
  2: "text-orange-400",
  3: "text-yellow-400",
  4: "text-emerald-400",
  5: "text-cyan-400",
};
