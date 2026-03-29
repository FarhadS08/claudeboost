import { Domain } from "./types";

export interface Preset {
  id: string;
  name: string;
  domain: Domain;
  constraints: string;
  description: string;
}

export const PRESETS: Preset[] = [
  {
    id: "python-ds",
    name: "Python Data Science",
    domain: "data_science",
    constraints: "Always use Python. Prefer sklearn, pandas, numpy. Output tables as markdown. Include data profiling before modeling. Use random_state=42 for reproducibility.",
    description: "sklearn + pandas stack with reproducibility",
  },
  {
    id: "pytorch-ml",
    name: "PyTorch ML",
    domain: "data_science",
    constraints: "Use PyTorch for all deep learning. Include training loops with validation. Log metrics with tensorboard. Save model checkpoints. Use GPU if available.",
    description: "PyTorch-first with training best practices",
  },
  {
    id: "dbt-bigquery",
    name: "dbt + BigQuery",
    domain: "data_engineering",
    constraints: "Always assume dbt + BigQuery stack. SQL must be idempotent. Use incremental models where possible. Follow dbt naming conventions (stg_, int_, fct_, dim_).",
    description: "dbt conventions with BigQuery",
  },
  {
    id: "spark-pipeline",
    name: "Spark Pipeline",
    domain: "data_engineering",
    constraints: "Use PySpark for data processing. Optimize for large datasets (partitioning, caching). Handle schema evolution. Write to Delta Lake format.",
    description: "PySpark for large-scale pipelines",
  },
  {
    id: "react-ts",
    name: "React + TypeScript",
    domain: "general_coding",
    constraints: "Use TypeScript strict mode. Functional components only. Tailwind CSS for styling. React hooks for state. No class components. Include proper types, no 'any'.",
    description: "Modern React with TypeScript + Tailwind",
  },
  {
    id: "nextjs-app",
    name: "Next.js App Router",
    domain: "general_coding",
    constraints: "Use Next.js App Router. Server components by default. 'use client' only when needed. Tailwind CSS. TypeScript. Prefer server actions over API routes.",
    description: "Next.js 14+ App Router patterns",
  },
  {
    id: "python-api",
    name: "Python FastAPI",
    domain: "general_coding",
    constraints: "Use FastAPI with Pydantic models. Type hints everywhere. Async endpoints. Include OpenAPI docs. SQLAlchemy for database. Alembic for migrations.",
    description: "FastAPI with async + SQLAlchemy",
  },
  {
    id: "aws-terraform",
    name: "AWS + Terraform",
    domain: "devops",
    constraints: "Use Terraform for all infrastructure. AWS as cloud provider. Follow module pattern. Include state management (S3 + DynamoDB). Always run plan before apply.",
    description: "AWS infrastructure with Terraform",
  },
  {
    id: "docker-k8s",
    name: "Docker + Kubernetes",
    domain: "devops",
    constraints: "Containerize with Docker. Deploy to Kubernetes. Include health checks and resource limits. Use Helm charts. Implement rolling deployments.",
    description: "Container orchestration with K8s",
  },
  {
    id: "github-actions",
    name: "GitHub Actions CI/CD",
    domain: "devops",
    constraints: "Use GitHub Actions for CI/CD. Include linting, testing, building, and deploying stages. Cache dependencies. Use environment secrets. Matrix builds for multiple versions.",
    description: "GitHub-native CI/CD pipelines",
  },
  {
    id: "api-docs",
    name: "API Documentation",
    domain: "documentation",
    constraints: "Use OpenAPI 3.0 format. Include request/response examples for every endpoint. Document error codes. Add authentication section. Include curl examples.",
    description: "OpenAPI 3.0 with examples",
  },
  {
    id: "executive-reports",
    name: "Executive Reports",
    domain: "business_analytics",
    constraints: "Output as markdown tables. Include executive summary first. Use absolute numbers and percentages. Compare to previous period. Include recommended actions.",
    description: "Business reports with actionable insights",
  },
];
