import { Domain } from "./types";

export const DOMAINS: Domain[] = ["data_science", "data_engineering", "business_analytics", "general_coding", "documentation", "devops", "other"];

export const DOMAIN_COLORS: Record<Domain, string> = {
  data_science: "bg-primary/15 text-primary border-primary/25",
  data_engineering: "bg-violet-500/15 text-violet-400 border-violet-500/25",
  business_analytics: "bg-fuchsia-500/15 text-fuchsia-400 border-fuchsia-500/25",
  general_coding: "bg-purple-400/15 text-purple-300 border-purple-400/25",
  documentation: "bg-indigo-500/15 text-indigo-400 border-indigo-500/25",
  devops: "bg-pink-500/15 text-pink-400 border-pink-500/25",
  other: "bg-zinc-500/15 text-zinc-400 border-zinc-500/25",
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
  4: "text-primary",
  5: "text-violet-400",
};
