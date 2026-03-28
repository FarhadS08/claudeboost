import { Domain } from "./types";

export const DOMAINS: Domain[] = ["data_science", "data_engineering", "business_analytics", "general_coding", "documentation", "devops", "other"];

export const DOMAIN_COLORS: Record<Domain, string> = {
  data_science: "bg-blue-500/20 text-blue-400 border-blue-500/30",
  data_engineering: "bg-purple-500/20 text-purple-400 border-purple-500/30",
  business_analytics: "bg-emerald-500/20 text-emerald-400 border-emerald-500/30",
  general_coding: "bg-amber-500/20 text-amber-400 border-amber-500/30",
  documentation: "bg-orange-500/20 text-orange-400 border-orange-500/30",
  devops: "bg-rose-500/20 text-rose-400 border-rose-500/30",
  other: "bg-zinc-500/20 text-zinc-400 border-zinc-500/30",
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
