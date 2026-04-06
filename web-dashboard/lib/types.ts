export type Domain = "data_science" | "data_engineering" | "business_analytics" | "general_coding" | "documentation" | "devops" | "other";

export interface ScoreBreakdown {
  dimensions: {
    specificity: number;
    verification: number;
    context: number;
    constraints: number;
    structure: number;
    output_definition: number;
  };
  total: number;
  average: number;
  level: number;
}

export interface HistoryEntry {
  id: number;
  timestamp: string;
  domain: Domain;
  original: string;
  boosted: string;
  chosen: "boosted" | "original" | "refined" | null;
  rating: number | null;
  feedback: string;
  original_score: ScoreBreakdown | null;
  boosted_score: ScoreBreakdown | null;
  org_id?: string | null;
}

export type Constraints = Record<Domain, string>;

export interface Settings {
  boost_level: "light" | "medium" | "full";
  auto_boost: boolean;
}

// ─── Enterprise/Org Types ──────────────────────────────────────────────────

export interface Organization {
  id: string;
  name: string;
  slug: string;
  created_by: string;
  boost_level: "light" | "medium" | "full";
  created_at: string;
  has_api_key: boolean; // derived, never expose actual key
}

export interface OrgMember {
  id: string;
  org_id: string;
  user_id: string;
  role: "admin" | "member";
  joined_at: string;
  email?: string; // from profiles join
}

export interface OrgRule {
  id: string;
  org_id: string;
  domain: string; // Domain | "_global"
  rule_text: string;
  enabled: boolean;
  updated_at: string;
}

export interface OrgApiKey {
  id: string;
  org_id: string;
  key_prefix: string;
  created_at: string;
}
