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
  chosen: "boosted" | "original" | null;
  rating: number | null;
  feedback: string;
  original_score: ScoreBreakdown | null;
  boosted_score: ScoreBreakdown | null;
}

export type Constraints = Record<Domain, string>;

export interface Settings {
  boost_level: "light" | "medium" | "full";
  auto_boost: boolean;
}
