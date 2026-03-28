export type Domain =
  | "data_science"
  | "data_engineering"
  | "business_analytics"
  | "general_coding"
  | "documentation"
  | "devops"
  | "other";

export interface HistoryEntry {
  id: number;
  timestamp: string;
  domain: Domain;
  original: string;
  boosted: string;
  chosen: "boosted" | "original" | null;
  rating: number | null;
  feedback: string;
}

export type Constraints = Record<Domain, string>;

export const DOMAINS: Domain[] = [
  "data_science",
  "data_engineering",
  "business_analytics",
  "general_coding",
  "documentation",
  "devops",
  "other",
];

export const DOMAIN_COLORS: Record<Domain, { bg: string; text: string }> = {
  data_science: { bg: "bg-domain-ds-bg", text: "text-domain-ds-text" },
  data_engineering: { bg: "bg-domain-de-bg", text: "text-domain-de-text" },
  business_analytics: { bg: "bg-domain-ba-bg", text: "text-domain-ba-text" },
  general_coding: { bg: "bg-domain-gc-bg", text: "text-domain-gc-text" },
  documentation: { bg: "bg-domain-doc-bg", text: "text-domain-doc-text" },
  devops: { bg: "bg-domain-devops-bg", text: "text-domain-devops-text" },
  other: { bg: "bg-domain-other-bg", text: "text-domain-other-text" },
};

export const MOCK_HISTORY: HistoryEntry[] = [
  {
    id: 1,
    timestamp: "2025-01-15T10:32:00.000Z",
    domain: "data_science",
    original: "analyse my churn data",
    boosted:
      "Analyse customer churn data for a SaaS subscription business. Identify the top 3 predictive features using logistic regression. Return a summary table with feature importance scores and a confusion matrix. Use Python and sklearn.",
    chosen: "boosted",
    rating: 4,
    feedback: "Good but always assume Python and sklearn",
  },
  {
    id: 2,
    timestamp: "2025-01-15T11:10:00.000Z",
    domain: "data_engineering",
    original: "build an ETL pipeline for user events",
    boosted:
      "Build a batch ETL pipeline that ingests raw user event data from S3, transforms it using dbt on BigQuery, and loads it into a final analytics table partitioned by event_date. Handle late-arriving data with a 3-day lookback window. Pipeline must be idempotent.",
    chosen: "boosted",
    rating: 5,
    feedback: "",
  },
  {
    id: 3,
    timestamp: "2025-01-16T09:15:00.000Z",
    domain: "business_analytics",
    original: "show me revenue trends",
    boosted:
      "Analyse monthly recurring revenue (MRR) trends for the past 12 months, segmented by plan tier (Starter, Pro, Enterprise). Include MoM growth rate, churn-adjusted net revenue, and a comparison against the same period last year. Output as a markdown table with an executive summary paragraph.",
    chosen: null,
    rating: null,
    feedback: "",
  },
  {
    id: 4,
    timestamp: "2025-01-17T14:22:00.000Z",
    domain: "devops",
    original: "set up CI/CD for my Node app",
    boosted:
      "Set up a CI/CD pipeline using GitHub Actions for a Node.js application. Include linting, unit tests, Docker image build, push to ECR, and deploy to ECS Fargate. Add environment-specific configs for staging and production. Include rollback strategy.",
    chosen: "boosted",
    rating: 3,
    feedback: "Should use GitLab CI instead",
  },
  {
    id: 5,
    timestamp: "2025-01-18T08:45:00.000Z",
    domain: "documentation",
    original: "write API docs for my endpoints",
    boosted:
      "Generate comprehensive API documentation for all REST endpoints including request/response schemas, authentication requirements, error codes, rate limits, and example curl commands. Use OpenAPI 3.0 specification format.",
    chosen: "boosted",
    rating: null,
    feedback: "",
  },
];

export const MOCK_CONSTRAINTS: Constraints = {
  data_science: "Always use Python and sklearn. Never use R.",
  data_engineering: "Always assume dbt + BigQuery. Output must be idempotent.",
  business_analytics:
    "Always include a 12-month time range. Output as markdown table.",
  general_coding: "",
  documentation: "",
  devops: "",
  other: "",
};
