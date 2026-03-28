# Enterprise Prompt Playbook for Claude Code

> A comprehensive guide for developers and data scientists working in enterprise environments.

**Deep prompt templates • Before/After pairs • Multi-step chains • Anti-patterns**

Built on official Claude Code best practices from Anthropic. Designed for enterprise teams at scale.

---

| Target Audience | Use Cases |
|----------------|-----------|
| Software Engineers & Architects | Enterprise application development |
| Data Scientists & ML Engineers | Data pipelines & analytics |
| DevOps / Platform Engineers | Legacy modernization & migrations |
| Tech Leads & Engineering Managers | ML model lifecycle management |
| | CI/CD & infrastructure automation |

---

## Table of Contents

**PART I — Foundation: Core Prompting Principles**
- 1.1 The Verification-First Mindset
- 1.2 The Explore-Plan-Implement-Verify Loop
- 1.3 Context Engineering
- 1.4 Environment Configuration for Enterprise

**PART II — Developer Workflows**
- 2.1 Debugging & Root Cause Analysis
- 2.2 Code Review & Quality Assurance
- 2.3 Refactoring & Technical Debt
- 2.4 API Design & Implementation
- 2.5 Legacy Migration
- 2.6 Security Review
- 2.7 CI/CD & DevOps Automation
- 2.8 Testing Strategies

**PART III — Data Science Workflows**
- 3.1 Exploratory Data Analysis (EDA)
- 3.2 Data Cleaning & Validation
- 3.3 Feature Engineering
- 3.4 Model Training & Evaluation
- 3.5 Data Pipeline Engineering
- 3.6 Statistical Analysis & Hypothesis Testing
- 3.7 Model Documentation & Reporting
- 3.8 ML Monitoring & Drift Detection

**PART IV — Multi-Step Prompt Chains**
- 4.1 End-to-End Feature Development Chain
- 4.2 Data Science Project Chain
- 4.3 Incident Response Chain
- 4.4 Architecture Decision Chain
- 4.5 Model Deployment Chain

**PART V — Anti-Patterns & Rescue Prompts**
- 5.1 Developer Anti-Patterns
- 5.2 Data Science Anti-Patterns
- 5.3 Enterprise-Specific Anti-Patterns
- 5.4 General Rescue Prompt Templates

**APPENDIX — Quick Reference**
- A. Prompt Structure Cheat Sheet
- B. Session Management Commands
- C. CLAUDE.md Template for Enterprise

---

# PART I — Foundation: Core Prompting Principles

These principles apply to every prompt you write, regardless of whether you're building a microservice or training a classifier. Master these before diving into domain-specific workflows.

---

## 1.1 The Verification-First Mindset

> **TIP:** Every prompt should answer: "How will Claude know it succeeded?" If you can't define success, Claude can't verify it.

In enterprise environments, unverified code is a liability. Claude performs dramatically better when it can verify its own work. The difference between a junior engineer's output and a senior engineer's output is often verification — the senior checks edge cases, runs the test suite, and validates assumptions.

**Verification strategies by task type:**

| Task Type | Verification Method | Prompt Addition |
|-----------|-------------------|-----------------|
| Backend logic | Unit tests + integration tests | *"write tests covering happy path, edge cases, and error states. run them."* |
| API endpoint | curl / httpie + schema validation | *"hit the endpoint with valid and invalid payloads. validate against the OpenAPI spec."* |
| UI component | Screenshot comparison | *"take a screenshot and compare to the design. list every deviation."* |
| Data pipeline | Row counts + schema checks + sample inspection | *"validate row counts at each stage. check for nulls in required columns. show 5 sample rows."* |
| ML model | Metrics on holdout set + baseline comparison | *"evaluate on the test set. compare accuracy/F1 to the baseline model. report per-class metrics."* |
| Database migration | Rollback test + data integrity check | *"run the migration, verify data integrity, then rollback and verify again."* |
| Infrastructure | Dry run + drift detection | *"run terraform plan first. show what will change. only apply after I confirm."* |

---

## 1.2 The Explore-Plan-Implement-Verify Loop

> **TIP:** For any task that touches more than 2 files or that you're uncertain about, use the full loop.

Enterprise codebases are large, interconnected, and full of hidden conventions. Jumping straight to coding produces solutions that ignore existing patterns, break implicit contracts, or duplicate functionality that already exists.

**The four phases with enterprise context:**

| Phase | Mode | What to Do |
|-------|------|-----------|
| **Explore** | Plan Mode | Read relevant code, understand patterns, check git history for context. *"Read /src/auth and /src/middleware. What patterns do we use? Check git blame for recent changes."* |
| **Plan** | Plan Mode | Create a detailed plan with file list, dependencies, and risks. *"Create a plan. List every file that needs changing, the order of changes, and rollback steps."* |
| **Implement** | Normal Mode | Execute the plan, following existing patterns. *"Implement the plan. Follow the patterns in AuthMiddleware.ts. Write tests as you go."* |
| **Verify** | Normal Mode | Run tests, linters, type checks. Validate end-to-end. *"Run the full test suite, lint, and typecheck. Then manually test the happy path and primary error case."* |

> **WARNING:** Skip the loop only for trivial changes: typo fixes, log line additions, config value updates. If you're unsure whether to skip, don't skip.

---

## 1.3 Context Engineering

> **TIP:** Think of every prompt as a briefing document. Include what you'd tell a new senior hire on their first day working on this task.

Context engineering is the practice of providing exactly the right information — not too much, not too little. In enterprise environments, this means referencing specific files, mentioning internal naming conventions, pointing to existing patterns, and specifying compliance requirements.

**The context checklist — include when relevant:**

- **Files:** Use @ to reference specific files. `@src/services/PaymentService.ts`
- **Patterns:** Point to existing implementations as templates. *"Follow the pattern in UserService.ts"*
- **Constraints:** Mention regulatory, performance, or architectural constraints explicitly.
- **History:** Reference relevant git history, tickets, or ADRs.
- **Non-goals:** State what you do NOT want. *"Do not refactor existing code. Do not add new dependencies."*
- **Acceptance criteria:** Define what "done" means. *"Done means: tests pass, types check, no new lint warnings."*

**Before / After:**

| Vague Prompt | Optimized Prompt |
|-------------|-----------------|
| *"add authentication to the API"* | *"Add JWT authentication to the /api/orders endpoints. Follow the pattern in @src/middleware/auth.ts. Use our existing TokenService. Tokens expire after 1h. Include rate limiting at 100 req/min per user. Write integration tests. Do not modify existing endpoint signatures."* |
| *"fix the data pipeline"* | *"The daily ETL pipeline in @etl/customer_sync.py is failing with a timeout on the Salesforce API call (line 142). The error started 3 days ago. Check if Salesforce changed their rate limits. Fix the root cause, don't just increase the timeout. Add retry logic with exponential backoff. Write a test that simulates rate limiting."* |

---

## 1.4 Environment Configuration for Enterprise

Enterprise teams should standardize their Claude Code configuration across the organization. A well-configured environment eliminates entire categories of repeated mistakes.

### Enterprise CLAUDE.md Template

```markdown
# Architecture
- Monorepo: apps/ (services), packages/ (shared libraries), infra/ (terraform)
- All services use the BaseService pattern from @packages/service-core
- Database: PostgreSQL via TypeORM. Migrations in /migrations.
- Message queue: RabbitMQ via @packages/messaging

# Code Standards
- TypeScript strict mode. No 'any' types.
- All public functions must have JSDoc with @param and @returns
- Error handling: use AppError from @packages/errors, never throw raw Error
- Logging: use logger from @packages/observability, never console.log

# Workflow
- IMPORTANT: Run 'npm run lint && npm run typecheck' after every change
- Tests: 'npm run test:unit' for unit tests, 'npm run test:integration' for integration
- Branch naming: feature/JIRA-123-short-description
- Commit format: 'feat(scope): description' following Conventional Commits

# Security (YOU MUST follow these)
- Never hardcode secrets. Use @packages/config for env vars.
- All API endpoints require authentication unless explicitly marked public
- PII must be encrypted at rest. Use @packages/crypto for field-level encryption
- SQL: always use parameterized queries, never string interpolation
```

### Recommended Skills for Enterprise

- **fix-issue:** Automated GitHub/Jira issue resolution workflow
- **api-conventions:** REST/GraphQL conventions specific to your org
- **migration-guide:** Database migration patterns and safety checks
- **security-review:** OWASP-aligned security review checklist
- **data-quality:** Data validation and quality check patterns

### Recommended Hooks

- **Post-edit:** Run linter and type checker after every file edit
- **Pre-commit:** Run test suite before any commit
- **File guard:** Block writes to protected directories (migrations/, config/)

---

# PART II — Developer Workflows

Each workflow includes: a deep prompt template, before/after pairs, anti-patterns specific to that workflow, and guidance on when to use it.

---

## 2.1 Debugging & Root Cause Analysis

> **TIP:** Always paste the actual error. Never describe the error from memory.

Debugging in enterprise systems is rarely about a single line of code. Issues cascade across services, span multiple log files, and involve complex state. The key is to give Claude the symptoms, the environment, and a definition of "fixed."

**Deep Prompt Template:**

```
## Context
Service: [service name] in @[path]
Environment: [staging/production]
Error frequency: [constant / intermittent / under load]

## Symptom
[Paste the exact error message, stack trace, or log output]

## What I've Already Tried
[List any debugging steps already taken]

## Task
1. Investigate the root cause. Use subagents to explore related code.
2. Write a failing test that reproduces the issue.
3. Fix the root cause (not the symptom).
4. Verify: run the failing test (now passing), run the full test suite,
   check for regressions.

## Constraints
- Do NOT suppress errors or add broad try/catch blocks.
- Do NOT modify the public API signature.
- Log the fix reasoning for the post-mortem.
```

**Before / After:**

| Vague Prompt | Optimized Prompt |
|-------------|-----------------|
| *"the payment service is broken"* | *"The PaymentService in @src/services/PaymentService.ts returns 500 on POST /api/payments when the user has multiple saved cards. Error: 'Cannot read property cardId of undefined' at line 87. This started after PR #1423. Write a failing test, fix the root cause, verify."* |
| *"there's a memory leak"* | *"The user-service container OOMs after ~4 hours in production. Heap grows linearly at ~50MB/hour. Suspect event listener leak in WebSocketManager (@src/ws/WebSocketManager.ts). Investigate the connection lifecycle. Write a test that creates and destroys 1000 connections and checks for listener cleanup."* |

**Anti-Patterns:**

- **Symptom suppression:** Adding try/catch to silence an error instead of fixing it.
- **Shotgun debugging:** Asking Claude to "try a few things" without a hypothesis.
- **Missing reproduction:** Skipping the failing test. If you can't reproduce it, you can't verify the fix.

---

## 2.2 Code Review & Quality Assurance

> **TIP:** Use a subagent for code review — it gets a fresh context without bias from the implementation.

Claude is most effective as a reviewer when it hasn't just written the code. Use the Writer/Reviewer pattern: one session implements, another reviews.

**Deep Prompt Template:**

```
Review the changes in @[file or directory]. Evaluate against:

1. CORRECTNESS: Does the logic handle all edge cases? Are there
   off-by-one errors, null dereferences, or race conditions?
2. PATTERNS: Does it follow our existing patterns? Check @[example file]
   for reference. Flag any deviations.
3. SECURITY: Check for injection, auth bypass, data exposure, secrets.
4. PERFORMANCE: Are there N+1 queries? Unbounded loops? Missing indexes?
5. TESTING: Are the tests sufficient? What scenarios are missing?
6. OBSERVABILITY: Are errors logged with context? Are metrics emitted?

Format: For each finding, provide:
- Severity: CRITICAL / HIGH / MEDIUM / LOW
- File and line number
- What's wrong and why it matters
- Suggested fix
```

**Anti-Patterns:**

- **Self-review:** Having Claude review code it just wrote in the same session — it's biased toward its own output.
- **Style-only review:** Asking only about formatting and naming while missing logic errors.

---

## 2.3 Refactoring & Technical Debt

> **TIP:** Always require tests BEFORE refactoring. If there are no tests, write them first.

**Deep Prompt Template:**

```
## Refactoring Task
Target: @[file or module path]
Goal: [extract class / reduce complexity / decouple dependency / etc.]

## Rules
1. First, verify existing test coverage. If coverage is below 80%,
   write tests for the current behavior BEFORE changing anything.
2. Refactor in small, verifiable steps. Run tests after each step.
3. Preserve all public API contracts. No signature changes.
4. Do not change behavior — this is a pure refactor.
5. Run lint and typecheck after completion.

## Not In Scope
- Do not add new features.
- Do not update dependencies.
- Do not refactor files outside the target module.
```

**Before / After:**

| Vague Prompt | Optimized Prompt |
|-------------|-----------------|
| *"clean up the OrderService"* | *"Refactor @src/services/OrderService.ts. It's 800 lines with 5 responsibilities. Extract payment logic into PaymentProcessor, notification logic into OrderNotifier, and validation into OrderValidator. Follow the Single Responsibility pattern used in UserService.ts. Write tests first if missing. Do not change the public OrderService API — other services depend on it."* |

---

## 2.4 API Design & Implementation

> **TIP:** Always reference your org's API conventions. Provide the OpenAPI spec or link to API guidelines.

**Deep Prompt Template:**

```
## API Requirement
Resource: [resource name, e.g., 'Vehicle Telemetry']
Consumers: [who will call this API]
SLA: [response time, availability]

## Task
1. Design the REST endpoints following conventions in @docs/api-guide.md
2. Write the OpenAPI spec first. Include request/response schemas,
   error codes, and pagination.
3. Implement the endpoints following @src/controllers/UserController.ts
   as a pattern.
4. Add input validation, authentication, rate limiting.
5. Write integration tests covering: valid CRUD, invalid inputs,
   authentication failures, rate limiting.
6. Run tests, lint, typecheck.

## Constraints
- Max response time: 200ms at p95
- Pagination required for all list endpoints
- Versioned: /api/v1/[resource]
- Error format: RFC 7807 Problem Details
```

---

## 2.5 Legacy Migration

> **TIP:** Migrate in vertical slices, not horizontal layers. One feature end-to-end is safer than all controllers at once.

**Deep Prompt Template:**

```
## Migration Task
From: [old framework/language/pattern]
To: [new framework/language/pattern]
Scope: [specific module or feature]

## Task
1. Use a subagent to analyze the current implementation:
   - List all public interfaces and their consumers
   - Map dependencies and side effects
   - Identify tests that cover current behavior
2. Create a migration plan with file-by-file changes.
3. Implement the migration. Maintain backward compatibility.
4. Write adapter/shim if needed for gradual rollout.
5. Verify: all existing tests pass, no new warnings.

## Rules
- Feature parity first. No new features during migration.
- If a test doesn't exist for migrated behavior, write one before migrating.
- Document every behavioral difference in MIGRATION_NOTES.md.
```

**Before / After:**

| Vague Prompt | Optimized Prompt |
|-------------|-----------------|
| *"migrate the frontend from Angular to React"* | *"Migrate the CustomerDashboard module from Angular (@src/app/customer-dashboard/) to React (@src/react/customer-dashboard/). Start with the CustomerList component only. Use the same API calls. Match the current UI exactly — take a screenshot of the Angular version first, implement in React, screenshot, and compare. Preserve all existing Cypress tests."* |

---

## 2.6 Security Review

> **TIP:** Use a dedicated security-reviewer subagent with read-only tools. Never let the reviewer modify code.

**Deep Prompt Template:**

```
Use a subagent to perform a security review on @[path].

Check for:
1. INJECTION: SQL injection, XSS, command injection, LDAP injection
2. AUTHENTICATION: Broken auth flows, missing token validation,
   session fixation, credential exposure
3. AUTHORIZATION: IDOR, privilege escalation, missing access checks
4. DATA EXPOSURE: PII in logs, sensitive data in responses,
   secrets in code or config
5. CRYPTOGRAPHY: Weak algorithms, hardcoded keys, missing encryption
6. DEPENDENCIES: Known CVEs in direct dependencies

Output format:
- CRITICAL/HIGH findings with file:line references
- Exploit scenario for each finding
- Remediation code suggestion
- Reference to relevant OWASP Top 10 category
```

---

## 2.7 CI/CD & DevOps Automation

> **TIP:** Always use --allowedTools to scope permissions when running Claude in CI pipelines.

**Deep Prompt Template — PR Review Bot:**

```bash
claude -p "Review the diff in this PR. Check for:
1. Breaking changes to public APIs
2. Missing tests for new functionality
3. Security issues (injection, auth, data exposure)
4. Performance regressions (N+1 queries, unbounded loops)
5. Adherence to our coding standards in CLAUDE.md

Output a structured review with severity levels.
If CRITICAL issues found, output BLOCK. Otherwise output APPROVE." \
  --allowedTools 'Read,Grep,Glob,Bash(git diff *)'
```

**Deep Prompt Template — Automated Migration:**

```bash
for file in $(cat files_to_migrate.txt); do
  claude -p "Migrate $file from CommonJS to ESM.
    Replace require() with import statements.
    Replace module.exports with export.
    Preserve all functionality.
    Run 'node --check $file' to verify syntax.
    Return OK or FAIL with reason." \
    --allowedTools 'Edit,Bash(node --check *)' \
    --output-format json
done
```

---

## 2.8 Testing Strategies

> **TIP:** Specify the kind of test (unit, integration, e2e), the framework, and the edge cases you care about.

**Deep Prompt Template:**

```
## Testing Task
Target: @[file or module]
Framework: [Jest / pytest / Go testing / etc.]
Type: [unit / integration / e2e]

## Requirements
Write tests covering:
1. Happy path: [describe the normal flow]
2. Edge cases: [list specific edges — empty input, max values,
   concurrent access, timezone boundaries, unicode, etc.]
3. Error states: [invalid input, network failure, timeout,
   permission denied, resource not found]
4. Security: [auth required, forbidden access, injection attempts]

## Rules
- No mocks unless testing external services. Prefer real objects.
- Each test must have a descriptive name explaining the scenario.
- Tests must be independent — no shared mutable state.
- Run the tests after writing them. Fix any failures.
```

**Before / After:**

| Vague Prompt | Optimized Prompt |
|-------------|-----------------|
| *"add tests for the user service"* | *"Write integration tests for @src/services/UserService.ts using Jest. Cover: creating a user with valid data, creating with duplicate email (expect 409), creating with missing required fields (expect 400), fetching a non-existent user (expect 404), updating email to one that's already taken, deleting a user who has active orders (expect 409). Use a test database — see @test/setup.ts for config. No mocks for the database layer. Run all tests."* |

---

# PART III — Data Science Workflows

Data science prompts require extra precision because the work is exploratory, the data is messy, and the "right answer" is often ambiguous. These templates bring structure to inherently uncertain work.

---

## 3.1 Exploratory Data Analysis (EDA)

> **TIP:** Always start EDA by asking Claude to profile the data BEFORE you ask questions about it.

**Deep Prompt Template:**

```
## Dataset
File: @data/[filename.csv or .parquet]
Domain: [e.g., automotive telemetry, insurance claims, manufacturing IoT]
Business question: [what we're ultimately trying to answer]

## Task: Comprehensive EDA
1. PROFILE: Load the data. Report shape, dtypes, memory usage.
   For each column: unique count, null %, distribution summary.
2. QUALITY: Flag columns with >5% nulls, constant columns,
   high cardinality categoricals, potential data type mismatches
   (e.g., numbers stored as strings), outliers beyond 3 sigma.
3. DISTRIBUTIONS: Plot histograms for numeric columns,
   bar charts for categoricals (top 15 values).
4. CORRELATIONS: Compute and plot a correlation matrix for
   numeric features. Flag pairs with |r| > 0.8.
5. TEMPORAL: If date/time columns exist, plot time series
   of key metrics. Identify seasonality, trends, anomalies.
6. SUMMARY: Write a 1-page executive summary of findings,
   data quality issues, and recommended next steps.

## Output
- Save all plots to /outputs/eda/
- Write summary to EDA_REPORT.md
- Do NOT clean the data yet — this is exploration only.
```

**Before / After:**

| Vague Prompt | Optimized Prompt |
|-------------|-----------------|
| *"explore this dataset"* | *"Run a comprehensive EDA on @data/vehicle_telemetry_2024.parquet. This contains sensor readings from 50K vehicles. Profile all columns, flag quality issues, plot speed and fuel consumption distributions by vehicle_type. Check for temporal patterns in the timestamp column — we suspect seasonal effects. Write findings to EDA_REPORT.md. Don't clean the data yet."* |
| *"any interesting patterns?"* | *"Investigate the relationship between engine_temperature and failure_flag in @data/maintenance_logs.csv. Segment by vehicle_model and operating_region. Plot failure rates by temperature decile. Run a chi-squared test for each segment. Report findings with p-values and effect sizes."* |

**Anti-Patterns:**

- **Premature cleaning:** Dropping nulls or outliers before understanding why they exist.
- **Unscoped exploration:** Asking Claude to "find patterns" without specifying the business question.
- **Ignoring data types:** Not checking if numeric columns are stored as strings, dates as integers, etc.

---

## 3.2 Data Cleaning & Validation

> **TIP:** Define validation rules as code, not prose. Claude should produce a reusable validation function.

**Deep Prompt Template:**

```
## Data Cleaning Task
Input: @data/raw/[filename]
Output: @data/clean/[filename]

## Cleaning Rules
1. SCHEMA: Enforce these dtypes: [col: type, col: type, ...]
2. NULLS:
   - [col_a]: impute with median (by group if grouped data)
   - [col_b]: drop rows where null (required field)
   - [col_c]: fill with 'UNKNOWN'
3. OUTLIERS: For [col_x], cap at 1st/99th percentile.
4. DEDUPLICATION: Deduplicate on [key_columns]. Keep latest.
5. VALIDATION: After cleaning, assert:
   - No nulls in required columns
   - All dates in range [start, end]
   - Row count within 5% of input count
   - [custom business rules]

## Output
- Save cleaned data to output path
- Generate a cleaning report: rows in, rows out, rows dropped (with reasons),
  imputation counts per column
- Create a reusable validate_dataset() function in @src/data/validators.py
```

---

## 3.3 Feature Engineering

> **TIP:** Describe the prediction target and the business domain. Claude needs domain context to engineer meaningful features.

**Deep Prompt Template:**

```
## Feature Engineering Task
Dataset: @data/clean/[filename]
Target variable: [column name] (type: [binary/continuous/multiclass])
Business domain: [e.g., predictive maintenance, churn prediction,
  fraud detection, demand forecasting]

## Task
1. TEMPORAL FEATURES: If timestamp exists, extract:
   hour, day_of_week, month, is_weekend, is_holiday,
   time_since_last_event, rolling_mean_7d, rolling_std_7d
2. AGGREGATION FEATURES: Group by [entity_id] and compute:
   count, mean, std, min, max, trend (slope) for numeric columns
3. INTERACTION FEATURES: Create domain-relevant interactions:
   [describe expected interactions, e.g., 'speed * temperature']
4. ENCODING:
   - Low cardinality categoricals (<20): one-hot encode
   - High cardinality: target encode with 5-fold CV to prevent leakage
5. SELECTION: Compute mutual information with target.
   Drop features with MI < 0.01. Report top 20 features.

## Rules
- No data leakage. All aggregations must respect temporal ordering.
- All transformations must be wrapped in a sklearn Pipeline or
  equivalent for reproducibility.
- Write unit tests for each transformation function.
```

**Before / After:**

| Vague Prompt | Optimized Prompt |
|-------------|-----------------|
| *"create some features for the model"* | *"Engineer features for predicting vehicle_breakdown (binary) from @data/clean/telemetry.parquet. Domain: predictive maintenance for commercial fleet. Create rolling 7-day and 30-day aggregations of engine_temp, oil_pressure, vibration per vehicle_id. Add time_since_last_service and km_since_last_service. Target-encode dealer_region with 5-fold CV. Wrap everything in a sklearn Pipeline. Test for leakage by verifying no future data is used in any transformation."* |

---

## 3.4 Model Training & Evaluation

> **TIP:** Always define the baseline model, the evaluation metric, and the cross-validation strategy BEFORE training.

**Deep Prompt Template:**

```
## Model Training Task
Dataset: @data/features/[filename]
Target: [column] | Type: [classification/regression]
Baseline: [e.g., 'logistic regression with default params achieves 0.72 AUC']

## Task
1. SPLIT: Temporal split if time-series, else stratified 80/20.
   Hold out test set. Do NOT touch it until final evaluation.
2. BASELINE: Train [baseline model]. Report metrics on validation.
3. EXPERIMENT: Train [model_a, model_b, model_c] with default params.
   Compare on validation set using [primary_metric].
4. TUNE: Take the best model. Run hyperparameter search:
   - Method: [Optuna / GridSearch / RandomSearch]
   - Budget: [n_trials or time limit]
   - CV: [5-fold stratified / time-series split]
5. EVALUATE on test set. Report:
   - Primary metric: [AUC / RMSE / F1 / etc.]
   - Confusion matrix (classification) or residual plot (regression)
   - Per-class metrics if imbalanced
   - Feature importance (top 15)
   - Calibration curve (classification)
6. SAVE: Model artifact, feature list, hyperparameters,
   evaluation metrics — all to /outputs/models/

## Rules
- Report confidence intervals for all metrics (bootstrap, n=1000).
- If test AUC < baseline AUC + 0.02, do not recommend deployment.
- Log everything for reproducibility.
```

**Anti-Patterns:**

- **Test set peeking:** Using the test set for any decision before final evaluation.
- **Metric shopping:** Switching the primary metric after seeing results.
- **Missing baseline:** Training a complex model without comparing to a simple one.
- **No confidence intervals:** Reporting point estimates without uncertainty.

---

## 3.5 Data Pipeline Engineering

> **TIP:** Always include validation gates between pipeline stages. Each stage should verify its inputs and outputs.

**Deep Prompt Template:**

```
## Pipeline Task
Source: [database / API / file system / S3]
Destination: [data warehouse / feature store / ML model input]
Schedule: [frequency: hourly / daily / weekly]
SLA: [max latency, e.g., 'data must be available by 06:00 UTC']

## Task
1. Design the DAG with these stages:
   Extract -> Validate Input -> Transform -> Validate Output -> Load
2. Each stage must:
   - Log row counts, execution time, and any anomalies
   - Have a retry policy with exponential backoff
   - Write to a dead-letter queue on failure
3. Implement data quality checks between stages:
   - Schema validation
   - Null percentage thresholds
   - Row count anomaly detection (>20% deviation from 7-day avg)
   - Value range checks for critical columns
4. Write integration tests with sample data.
5. Add monitoring: alert on failure, late arrival, or quality breach.

## Constraints
- Idempotent: re-running must not create duplicates.
- Follow @src/pipelines/BasePipeline.py pattern.
- Use @packages/data-quality for validation utilities.
```

---

## 3.6 Statistical Analysis & Hypothesis Testing

> **TIP:** Always state the null hypothesis, the test, the significance level, and the sample size requirements upfront.

**Deep Prompt Template:**

```
## Analysis Task
Question: [specific business question]
Data: @data/[filename]

## Task
1. STATE the hypothesis formally:
   H0: [null hypothesis]
   H1: [alternative hypothesis]
   Alpha: [significance level, e.g., 0.05]
2. CHECK assumptions:
   - Normality (Shapiro-Wilk if n<5000, else Q-Q plot)
   - Equal variances (Levene's test)
   - Independence
   If assumptions violated, use non-parametric alternative.
3. COMPUTE: Run the appropriate test. Report:
   - Test statistic and p-value
   - Effect size (Cohen's d, eta-squared, or odds ratio)
   - 95% confidence interval
   - Power analysis (post-hoc if sample is fixed)
4. INTERPRET: Write a plain-English summary suitable for
   a non-technical stakeholder.

## Rules
- Never say 'the data proves'. Use 'the data provides
  evidence for/against'.
- Report effect size alongside p-value. Statistical significance
  without practical significance is misleading.
- If multiple comparisons, apply Bonferroni or Holm correction.
```

---

## 3.7 Model Documentation & Reporting

> **TIP:** Generate documentation as part of the modeling workflow, not as an afterthought.

**Deep Prompt Template — Model Card:**

```
Generate a model card for the [model_name] model.
Read the training code at @src/models/[model].py and
the evaluation results at @outputs/models/[model]/metrics.json.

The model card must include:
1. MODEL OVERVIEW: Purpose, type, version, owner, date
2. INTENDED USE: Primary use case, out-of-scope uses
3. TRAINING DATA: Source, size, date range, preprocessing steps
4. FEATURES: Complete list with descriptions and importance ranks
5. PERFORMANCE: Metrics table with CI, per-segment breakdown,
   comparison to baseline and previous version
6. LIMITATIONS: Known failure modes, data drift sensitivity,
   groups with lower performance
7. ETHICAL CONSIDERATIONS: Bias assessment, fairness metrics
   across protected groups if applicable
8. MONITORING: Recommended drift detection approach, retrain triggers

Output as MODEL_CARD.md following the format in @docs/model-card-template.md
```

---

## 3.8 ML Monitoring & Drift Detection

> **TIP:** Build monitoring into the deployment from day one, not after the first production failure.

**Deep Prompt Template:**

```
## Monitoring Task
Model: [model_name] deployed at [endpoint/service]
Training data reference: @data/reference/[filename]

## Task
Build a monitoring module that tracks:
1. INPUT DRIFT: Compare incoming feature distributions to
   the reference dataset using PSI (Population Stability Index).
   Alert if PSI > 0.2 for any feature.
2. OUTPUT DRIFT: Track prediction distribution over time.
   Alert if mean prediction shifts by >10% from reference.
3. PERFORMANCE: If ground truth is available with delay,
   compute rolling metrics and compare to baseline.
4. DATA QUALITY: Monitor for nulls, out-of-range values,
   and schema violations in incoming data.
5. LATENCY: Track p50, p95, p99 inference latency.

## Output
- Monitoring module at @src/monitoring/[model_name]_monitor.py
- Dashboard config for [Grafana / Datadog / custom]
- Alert definitions with severity levels and escalation paths
- Write tests with synthetic drift scenarios.
```

---

# PART IV — Multi-Step Prompt Chains

Real enterprise work is never a single prompt. These chains show how to sequence prompts across sessions, using /clear between phases and subagents for parallel work. Each chain is designed to maintain quality while managing context window constraints.

---

## 4.1 End-to-End Feature Development Chain

A complete chain for building a production feature from ticket to deployed PR.

### Step 1: Understand
*Session 1 — Plan Mode*

```
Read JIRA-1234 using 'gh issue view' or the Jira MCP.
Read the relevant codebase area using subagents.
Interview me about requirements using AskUserQuestion.
Write the spec to SPEC.md.
```

**Output:** SPEC.md with requirements, acceptance criteria, and technical design.

### Step 2: Plan
*Session 1 — Plan Mode*

```
Based on SPEC.md, create a detailed implementation plan.
List every file to create or modify, in order.
Identify risks and dependencies.
Write the plan to PLAN.md.
```

**Output:** PLAN.md. Review and edit with Ctrl+G before proceeding.

### Step 3: Implement
*Session 2 — Normal Mode (fresh context)*

```
Read @SPEC.md and @PLAN.md.
Implement the feature following the plan.
Write tests as you go — unit and integration.
Run lint and typecheck after each file change.
```

**Output:** Working implementation with tests.

### Step 4: Review
*Session 3 — Fresh context (subagent)*

```
Use a subagent to review the implementation against @SPEC.md.
Check for: correctness, security, performance, test coverage,
adherence to patterns.
Write findings to REVIEW.md.
```

**Output:** REVIEW.md with actionable findings.

### Step 5: Fix & Ship
*Session 2 — Resume*

```
Read @REVIEW.md. Address all CRITICAL and HIGH findings.
Run the full test suite. Fix any failures.
Commit with Conventional Commits format.
Open a PR with a description that references JIRA-1234.
```

**Output:** PR ready for human review.

---

## 4.2 Data Science Project Chain

A complete chain from raw data to deployed model with monitoring.

### Step 1: Data Profiling
*Session 1*

```
Run comprehensive EDA on @data/raw/[dataset].
Profile all columns, flag quality issues, identify
the target variable distribution.
Write EDA_REPORT.md. Save plots to /outputs/eda/.
Do NOT clean data yet.
```

**Output:** EDA_REPORT.md with data quality assessment.

### Step 2: Data Cleaning
*Session 2 (fresh context)*

```
Read @EDA_REPORT.md for quality issues found.
Clean the dataset following the rules in
@src/data/cleaning_standards.md.
Write a reusable cleaning pipeline.
Generate a cleaning report with before/after stats.
Save to @data/clean/.
```

**Output:** Clean dataset + reusable cleaning pipeline + report.

### Step 3: Feature Engineering
*Session 3*

```
Read @EDA_REPORT.md for insights.
Engineer features for predicting [target].
Wrap in sklearn Pipeline. Test for leakage.
Save feature set to @data/features/.
```

**Output:** Feature pipeline + feature importance report.

### Step 4: Model Training
*Session 4*

```
Train baseline and 3 candidate models.
Tune the best with Optuna (50 trials, 5-fold CV).
Evaluate on held-out test set.
Save model, metrics, and artifacts to /outputs/models/.
```

**Output:** Trained model + evaluation report.

### Step 5: Documentation
*Session 5 (subagent)*

```
Read the training code and evaluation metrics.
Generate a model card following @docs/model-card-template.md.
Include performance, limitations, and monitoring plan.
```

**Output:** MODEL_CARD.md.

### Step 6: Monitoring Setup
*Session 6*

```
Build drift detection and performance monitoring.
Use the training data as reference distribution.
Create alerts and dashboard configs.
Write integration tests with synthetic drift.
```

**Output:** Monitoring module + dashboard + alerts.

---

## 4.3 Incident Response Chain

A structured chain for investigating and resolving production incidents.

### Step 1: Triage
*Immediate*

```
[Paste alert/error/customer report]

Use subagents to:
1. Check recent deployments (git log --since='24 hours ago')
2. Search logs for the error pattern
3. Identify the blast radius (which users/services affected)

Report: severity, scope, likely cause, and whether to rollback.
```

**Decision:** Rollback or investigate further.

### Step 2: Root Cause
*After triage*

```
Investigate the root cause of [incident].
Focus on @[suspected file/service].
Check git blame for recent changes.
Write a failing test that reproduces the issue.
```

**Output:** Reproduction test + root cause analysis.

### Step 3: Fix & Verify
*After root cause*

```
Fix the root cause identified in step 2.
Run the reproduction test (should now pass).
Run the full test suite.
Create a minimal, safe PR for hotfix.
```

**Output:** Verified fix + hotfix PR.

### Step 4: Post-Mortem
*After resolution*

```
Write a post-mortem document covering:
- Timeline of events
- Root cause analysis
- Impact assessment
- What went well / what didn't
- Action items to prevent recurrence
Follow template at @docs/postmortem-template.md
```

**Output:** POST_MORTEM.md.

---

## 4.4 Architecture Decision Chain

A chain for making and documenting architectural decisions.

### Step 1: Research
*Session 1 — Plan Mode*

```
We need to decide: [architectural question, e.g.,
'should we use event sourcing for the order system?']

Use subagents to:
1. Analyze our current architecture in @src/
2. Research the pros/cons of each option
3. Find similar patterns in our codebase

Report findings. Do not recommend yet.
```

**Output:** Research summary with facts, not opinions.

### Step 2: Evaluate
*Session 1 — Plan Mode (continued)*

```
Based on the research, evaluate each option against:
1. Complexity: how much does it complicate our system?
2. Team capability: can our team maintain this?
3. Migration cost: how hard is the transition?
4. Operational cost: infrastructure and monitoring needs?
5. Reversibility: how hard to undo if it's wrong?

Create a decision matrix with scores 1-5 per criterion.
```

**Output:** Decision matrix.

### Step 3: Document
*Session 2*

```
Write an ADR (Architecture Decision Record) following
the template at @docs/adr-template.md.
Include: context, decision, consequences, alternatives
considered, and a proof-of-concept plan.
Save to @docs/adrs/ADR-[number]-[title].md
```

**Output:** ADR document.

---

## 4.5 Model Deployment Chain

A chain for deploying a trained model to production with proper testing and monitoring.

### Step 1: Package
*Session 1*

```
Package the model at @outputs/models/[model_name] for
production deployment.
1. Create a serving module with predict() and health_check()
2. Pin all dependency versions in requirements.txt
3. Create a Dockerfile following @infra/templates/ml-service/
4. Write load tests: verify p95 latency < [threshold]ms
5. Write contract tests for input/output schemas
```

**Output:** Deployable service package with tests.

### Step 2: Shadow Deploy
*Session 2*

```
Set up shadow deployment:
1. Configure traffic mirroring to the new model
2. Compare predictions with the current production model
3. Log all discrepancies > [threshold]
4. Run for [duration] and generate comparison report
```

**Output:** Shadow deployment config + comparison report.

### Step 3: Canary Release
*Session 3*

```
Configure canary release:
1. Route [x]% of traffic to the new model
2. Monitor: latency, error rate, prediction distribution
3. Define rollback triggers: error rate > [x]% or
   latency p95 > [x]ms
4. Automate gradual traffic increase if healthy
```

**Output:** Canary config + rollback automation.

---

# PART V — Anti-Patterns & Rescue Prompts

When things go wrong, these patterns help you recognize the problem and recover. Each anti-pattern includes a rescue prompt — what to say when you're stuck mid-session.

---

## 5.1 Developer Anti-Patterns

**The Scope Creep**
You ask Claude to fix a bug, and it refactors the entire file.

> **Rescue:** *"STOP. Revert all changes except the bug fix on line [X]. Do not refactor, do not improve, do not clean up. Fix only the reported issue. Show me the minimal diff."*

**The Dependency Addict**
Claude adds a new npm/pip package for something that could be done in 10 lines.

> **Rescue:** *"Remove the [package] dependency. Implement this using only standard library / existing dependencies. Check package.json for what we already have."*

**The Config Drift**
Claude creates a new configuration pattern that doesn't match the rest of the project.

> **Rescue:** *"Look at how config is handled in @src/config/. Follow the exact same pattern. Do not create a new config approach."*

**The Silent Failure**
Claude adds error handling that catches and swallows exceptions.

> **Rescue:** *"Review all error handling you just added. Every catch block must either: (1) re-throw with additional context, (2) return a typed error, or (3) log at ERROR level with context. No empty catch blocks. No catching Error and ignoring it."*

**The Over-Engineer**
Claude builds an abstraction layer for a one-off task.

> **Rescue:** *"This is a one-time operation. Remove the abstraction layer. Write it as a straightforward script with no factory classes, no strategy pattern, no dependency injection. Keep it simple."*

---

## 5.2 Data Science Anti-Patterns

**The Leaky Pipeline**
Claude uses information from the test set during feature engineering or preprocessing.

> **Rescue:** *"Check for data leakage. Verify that all transformations are fitted ONLY on the training set. Target encoding must use cross-validation. Rolling aggregations must not use future data. Re-split the data and retrain if leakage is found."*

**The Metric Shopper**
Claude switches evaluation metrics after seeing poor results on the original metric.

> **Rescue:** *"The primary metric is [X] as defined in the spec. Do not switch metrics. If the model doesn't meet the threshold on [X], report it honestly. Suggest improvements or more data, not a different metric."*

**The Black Box**
Claude trains a complex model without baseline comparison or interpretability.

> **Rescue:** *"Before the complex model, train a logistic regression / decision tree baseline. Report both results side by side. Add SHAP values for the complex model. If the baseline is within 2% of the complex model, recommend the baseline."*

**The Notebook Mess**
Claude writes analysis code that only works interactively and can't be reproduced.

> **Rescue:** *"Refactor this analysis into a reproducible script. All parameters at the top. Random seed set. Data paths configurable. Output saved to files, not just displayed. I should be able to run this end-to-end with 'python run_analysis.py'."*

**The p-Value Hunter**
Claude runs multiple statistical tests until finding a significant result.

> **Rescue:** *"List ALL tests you ran, including non-significant ones. Apply Bonferroni correction for the total number of comparisons. Report adjusted p-values. If nothing is significant after correction, say so."*

---

## 5.3 Enterprise-Specific Anti-Patterns

**The Compliance Blindspot**
Claude writes code that handles PII without encryption or access logging.

> **Rescue:** *"Review all data handling in this change. Any PII (names, emails, addresses, IDs) must be: (1) encrypted at rest using @packages/crypto, (2) masked in logs, (3) access-logged for audit. Check compliance with GDPR Article 32 requirements."*

**The Monolith Creep**
Claude adds functionality to the wrong service instead of the bounded context it belongs to.

> **Rescue:** *"This logic belongs in the [correct service] based on our domain boundaries. Move it there. If the current service needs the result, call the other service's API. Check @docs/service-boundaries.md for our domain model."*

**The Orphan Migration**
Claude writes a database migration without a rollback or without testing on realistic data.

> **Rescue:** *"Every migration must have a rollback. Write both UP and DOWN. Test the migration on a copy of production-like data (not empty tables). Check that the rollback restores the original state exactly."*

---

## 5.4 General Rescue Prompt Templates

Use these when you're stuck mid-session, regardless of the domain.

**When Claude is going in circles:**

```
STOP. You've attempted this 3 times without success.
Let's step back. Explain what's blocking you.
What assumptions are you making? What information do you need that you don't have?
```

**When output quality is degrading (context full):**

```
/clear

Fresh start. Read @[key files]. The specific task is: [restate task clearly].
Here's what the previous attempt got wrong: [list issues]. Avoid those mistakes.
```

**When you need to redirect completely:**

```
Undo all changes from this session. We're taking a different approach.
[Describe new approach]. Start from the current main branch state.
```

**When Claude's plan is too complex:**

```
This plan has too many moving parts. Simplify.
What is the smallest possible change that achieves the core requirement?
Implement only that. We can iterate later.
```

**When you suspect Claude missed something:**

```
Before we commit, use a subagent to review what you just built.
Check for: missed edge cases, broken existing functionality, security issues,
and deviation from the patterns in @[reference file].
```

---

# APPENDIX — Quick Reference

## A. Prompt Structure Cheat Sheet

Every effective prompt has these components. Not all are required for every task.

```
## Context         [WHO and WHERE]
Service/module, environment, relevant files

## Symptom/Goal    [WHAT]
The specific problem or desired outcome

## Task            [HOW]
Numbered steps Claude should follow

## Verification    [PROOF]
How Claude confirms success (tests, checks, comparisons)

## Constraints     [BOUNDARIES]
What NOT to do, performance limits, compliance rules

## Output          [DELIVERABLES]
What files/artifacts to produce and where to save them
```

---

## B. Session Management Commands

| Command | When to Use |
|---------|------------|
| **/clear** | Between unrelated tasks. After 2+ failed corrections on the same issue. |
| **/compact \<instructions\>** | When context is filling up but you need to continue. Add focus instructions. |
| **/rewind** or **Esc+Esc** | To restore code and/or conversation to a previous checkpoint. |
| **/btw** | For quick questions that shouldn't enter conversation history. |
| **Esc** | To stop Claude mid-action and redirect. |
| **claude --continue** | To resume the most recent session. |
| **claude --resume** | To pick from recent sessions by name. |
| **/rename** | To name sessions for later reference. |
| **Plan Mode (Ctrl+G)** | For exploration and planning without code changes. |
| **Auto Mode** | For uninterrupted execution with safety classifier. |

---

## C. CLAUDE.md Template for Enterprise

A complete, production-ready CLAUDE.md template. Customize for your organization.

```markdown
# [Project Name]

## Architecture
- [Describe monorepo/polyrepo structure]
- [List core services and their responsibilities]
- [Database, message queue, cache technologies]

## Build & Test
- Build: [command]
- Unit tests: [command]
- Integration tests: [command]
- Lint: [command]
- Typecheck: [command]
- IMPORTANT: Run lint and typecheck after every change.

## Code Standards
- [Language-specific standards that differ from defaults]
- [Error handling pattern]
- [Logging convention]
- [Naming conventions if non-standard]

## Git Workflow
- Branch naming: [pattern]
- Commit format: [convention]
- PR requirements: [checklist]

## Security (YOU MUST follow these)
- [Secrets management approach]
- [Authentication requirements]
- [Data encryption requirements]
- [PII handling rules]

## Common Gotchas
- [Non-obvious behaviors specific to your project]
- [Known workarounds]
```

---

*Enterprise Prompt Playbook for Claude Code*
*Built on official Anthropic best practices*
*Designed for developers and data scientists working at enterprise scale*
