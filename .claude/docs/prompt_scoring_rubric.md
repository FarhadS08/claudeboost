# Prompt Evaluation & Scoring Rubric

> A structured framework for measuring, scoring, and improving prompt quality for Claude Code in enterprise environments.

**6 Dimensions • 5 Maturity Levels • Scoring Matrix • Auto-Upgrade Patterns**

Companion to the Enterprise Prompt Playbook.

---

| Purpose | Audience | Usage |
|---------|----------|-------|
| Score any Claude Code prompt on a 1-5 scale across 6 dimensions. Identify weaknesses. Auto-upgrade to production grade. | Individual engineers for self-assessment. Tech leads for prompt reviews. Platform teams for quality gates in CI/CD. | Manual scoring during reviews. Automated scoring in tooling. Training and onboarding exercises. Minimum quality thresholds. |

---

# Section 1 — The Six Scoring Dimensions

Every prompt is evaluated across six dimensions. Each dimension captures a different aspect of prompt quality that directly impacts the quality and reliability of Claude's output.

---

## Dimension 1: Specificity

How precisely does the prompt define what needs to be done? Vague prompts produce vague results.

| Level | Name | Description |
|-------|------|-------------|
| 1 | Vague | No specific files, modules, or scope. Example: *"fix the bug"* |
| 2 | General | Names the area but not the specifics. Example: *"fix the bug in the payment service"* |
| 3 | Targeted | Names specific files and describes the symptom. Example: *"fix the null pointer in PaymentService.ts line 87"* |
| 4 | Precise | Names files, symptom, root cause hypothesis, and desired behavior. Example: *"fix the null pointer in @src/services/PaymentService.ts line 87 where cardId is undefined when user has multiple saved cards"* |
| 5 | Surgical | All of Level 4 plus: references related code, provides error output, names the trigger condition, and defines the exact expected behavior after the fix. |

---

## Dimension 2: Verification

Does the prompt tell Claude how to prove its work is correct? This is the highest-leverage dimension.

| Level | Name | Description |
|-------|------|-------------|
| 1 | None | No verification criteria. Claude decides when it's done. |
| 2 | Implicit | Vague check like *"make sure it works"* without defining what "works" means. |
| 3 | Basic | Single verification method. Example: *"run the tests after implementing"* |
| 4 | Multi-layer | Multiple verification methods. Example: *"write a failing test first, fix the issue, verify the test passes, run the full suite, run lint and typecheck"* |
| 5 | Comprehensive | Multi-layer verification plus edge case coverage, regression checks, and comparison to expected output. Defines what failure looks like, not just success. |

---

## Dimension 3: Context Provision

Does the prompt provide the information Claude needs, or force it to guess?

| Level | Name | Description |
|-------|------|-------------|
| 1 | None | No context provided. Claude must guess everything about the codebase, patterns, and constraints. |
| 2 | Minimal | General domain mentioned but no file references, patterns, or constraints. |
| 3 | Adequate | References specific files with @. Mentions the relevant area of the codebase. |
| 4 | Rich | File references + pattern references + relevant history. Example: *"Follow the pattern in @src/services/UserService.ts. This was introduced in PR #1200."* |
| 5 | Complete | All of Level 4 plus: non-goals stated, constraints listed, domain knowledge provided, related tickets or ADRs referenced. |

---

## Dimension 4: Constraints & Boundaries

Does the prompt define what Claude should NOT do? Unbounded prompts lead to scope creep and over-engineering.

| Level | Name | Description |
|-------|------|-------------|
| 1 | None | No boundaries. Claude can modify any file, add any dependency, change any API. |
| 2 | Implicit | Boundaries are implied but not stated. Example: *"just fix the bug"* (implies don't refactor, but doesn't say it). |
| 3 | Basic | One or two explicit constraints. Example: *"do not add new dependencies"* |
| 4 | Comprehensive | Explicit scope boundaries, dependency rules, API contract preservation, and file scope limits. Example: *"do not modify files outside /src/auth/. Do not change the public API. Do not add dependencies."* |
| 5 | Enterprise-grade | All of Level 4 plus: performance constraints, compliance requirements, security rules, and rollback conditions. Includes what to do when constraints conflict. |

---

## Dimension 5: Structure & Organization

Is the prompt organized in a way that's easy for Claude to parse and follow?

| Level | Name | Description |
|-------|------|-------------|
| 1 | Unstructured | A single run-on sentence or paragraph with multiple concerns mixed together. |
| 2 | Semi-structured | Multiple sentences but no clear sections. Task and context are interleaved. |
| 3 | Sectioned | Uses markdown headers or numbered lists. Task steps are separated from context. |
| 4 | Well-organized | Clear sections: Context, Task, Verification, Constraints. Numbered steps for the task. Uses the prompt structure from the Playbook. |
| 5 | Template-perfect | Follows a consistent template with all six Playbook sections (Context, Symptom/Goal, Task, Verification, Constraints, Output). Can be parsed programmatically. |

---

## Dimension 6: Output Definition

Does the prompt specify what Claude should produce and where to put it?

| Level | Name | Description |
|-------|------|-------------|
| 1 | Undefined | No indication of expected output. Claude decides the format, location, and scope of deliverables. |
| 2 | Vague | Mentions output type but not specifics. Example: *"write some tests"* |
| 3 | Defined | Specifies output type and location. Example: *"write tests in @tests/payment.test.ts"* |
| 4 | Detailed | Output type, location, format, and naming. Example: *"write integration tests in @tests/payment.integration.test.ts using Jest. Each test name should describe the scenario."* |
| 5 | Complete | All of Level 4 plus: specifies artifacts (files, reports, docs), their relationships, and success criteria for each artifact. |

---

# Section 2 — The Scoring Matrix

Use this matrix to score any prompt. Rate each dimension 1-5, then compute the overall score.

---

## 2.1 Scoring Card Template

For each prompt, fill in this card:

```
PROMPT SCORE CARD
═══════════════════════════════════════════════════
Prompt: [paste or describe the prompt]
Author: [name]          Date: [date]
Task type: [debugging / feature / refactor / EDA / etc.]
═══════════════════════════════════════════════════

Dimension              Score (1-5)    Notes
───────────────────────────────────────────────────
1. Specificity         [ ]            
2. Verification        [ ]            
3. Context             [ ]            
4. Constraints         [ ]            
5. Structure           [ ]            
6. Output Definition   [ ]            
───────────────────────────────────────────────────
TOTAL                  [ ] / 30
AVERAGE                [ ] / 5.0
LEVEL                  [ ]
═══════════════════════════════════════════════════
```

---

## 2.2 Overall Level Calculation

The overall prompt level is determined by the average score across all six dimensions:

| Average Score | Overall Level | Label | Action Required |
|--------------|---------------|-------|-----------------|
| 1.0 — 1.4 | **Level 1** | Unacceptable | Must rewrite entirely. Should not be used in any environment. |
| 1.5 — 2.4 | **Level 2** | Needs Work | Significant improvement needed. Use only for exploration and throwaway experiments. |
| 2.5 — 3.4 | **Level 3** | Acceptable | Usable for development. Adequate for non-critical tasks. Improve before CI/CD use. |
| 3.5 — 4.4 | **Level 4** | Production-Grade | Suitable for automated pipelines, team sharing, and production workflows. |
| 4.5 — 5.0 | **Level 5** | Enterprise-Grade | Gold standard. Suitable for regulated environments, audit trails, and organizational templates. |

---

## 2.3 Minimum Thresholds by Context

Different contexts require different minimum levels:

| Context | Minimum Level | Rationale |
|---------|--------------|-----------|
| Personal exploration / learning | Level 1 | Low stakes. Iterate freely. |
| Development work (feature branch) | Level 3 | Mistakes are caught in review. |
| Shared team prompts (skills, templates) | Level 4 | Others depend on prompt quality. |
| CI/CD pipeline prompts | Level 4 | Runs unattended. Failures are costly. |
| Production hotfixes | Level 4 | Time pressure but high stakes. |
| Regulated / auditable workflows | Level 5 | Compliance requires traceability. |
| Organizational prompt templates | Level 5 | Used at scale. Errors multiply. |

---

## 2.4 Dimension Weights by Task Type

Not all dimensions matter equally for every task. This table shows which dimensions are most critical for common enterprise task types:

| Task Type | Specificity | Verification | Context | Constraints | Structure | Output |
|-----------|------------|-------------|---------|------------|-----------|--------|
| Debugging | Critical | Critical | High | Medium | Medium | Medium |
| Feature development | High | Critical | Critical | High | High | High |
| Code review | Medium | Medium | Critical | High | High | Critical |
| Refactoring | High | Critical | High | Critical | Medium | Medium |
| EDA / Data profiling | High | Medium | Critical | Medium | High | Critical |
| Model training | High | Critical | High | High | High | Critical |
| Data pipeline | High | Critical | High | Critical | High | High |
| Security review | Medium | High | Critical | Critical | High | Critical |
| CI/CD automation | Critical | High | High | Critical | Critical | High |
| Migration | High | Critical | Critical | Critical | High | High |

---

# Section 3 — Upgrade Patterns: From Level 1 to Level 5

For each dimension, these patterns show exactly how to upgrade a prompt from one level to the next. Use these as transformation rules in your tooling or as a manual checklist.

---

## 3.1 Upgrading Specificity

| From | To | Transformation |
|------|-----|---------------|
| L1 | L2 | Add the service or module name. *"fix the bug" → "fix the bug in the payment service"* |
| L2 | L3 | Add specific file paths and the symptom. *→ "fix the null pointer in @src/services/PaymentService.ts line 87"* |
| L3 | L4 | Add root cause hypothesis and desired behavior. *→ "...where cardId is undefined when user has multiple saved cards. Should default to primary card."* |
| L4 | L5 | Add trigger condition, related code references, and paste the actual error output. *→ "...Error started after PR #1423. Paste: [stack trace]. Also check @src/models/Card.ts for the schema."* |

---

## 3.2 Upgrading Verification

| From | To | Transformation |
|------|-----|---------------|
| L1 | L2 | Add any check at all. *→ add "make sure it works"* |
| L2 | L3 | Name a specific check. *→ "run the tests after implementing"* |
| L3 | L4 | Add multiple verification layers. *→ "write a failing test first, fix it, run the test (now passing), run full suite, run lint and typecheck"* |
| L4 | L5 | Add edge case coverage, regression checks, and failure definition. *→ "...also test with 0 cards, 1 card, and 10 cards. Verify no regressions in related endpoints. If any test fails, stop and report."* |

---

## 3.3 Upgrading Context

| From | To | Transformation |
|------|-----|---------------|
| L1 | L2 | Name the domain or area. *→ "in the payment processing module"* |
| L2 | L3 | Add @ file references. *→ "in @src/services/PaymentService.ts"* |
| L3 | L4 | Add pattern references and history. *→ "Follow the pattern in @src/services/UserService.ts. Check git history for context on the card handling logic."* |
| L4 | L5 | Add non-goals, constraints, and domain knowledge. *→ "Non-goals: do not touch the Stripe integration. Constraint: PCI compliance requires card numbers are never logged. Related: JIRA-5678."* |

---

## 3.4 Upgrading Constraints

| From | To | Transformation |
|------|-----|---------------|
| L1 | L2 | Add any boundary. *→ "don't break anything"* (still vague but better than nothing) |
| L2 | L3 | Make one constraint explicit. *→ "do not add new dependencies"* |
| L3 | L4 | Add scope, API, and file boundaries. *→ "Do not modify files outside /src/auth/. Preserve all public API signatures. No new dependencies."* |
| L4 | L5 | Add compliance, performance, and conflict resolution rules. *→ "...Max response time: 200ms p95. All PII must be encrypted. If constraints conflict with the fix, raise the conflict — do not resolve silently."* |

---

## 3.5 Upgrading Structure

| From | To | Transformation |
|------|-----|---------------|
| L1 | L2 | Break into multiple sentences. Separate the task from the context. |
| L2 | L3 | Add numbered steps or markdown headers. Separate context from task from verification. |
| L3 | L4 | Use the Playbook template: ## Context, ## Task, ## Verification, ## Constraints sections. |
| L4 | L5 | Add all six Playbook sections. Ensure each step is independently parseable. Add ## Output section with artifact list. |

---

## 3.6 Upgrading Output Definition

| From | To | Transformation |
|------|-----|---------------|
| L1 | L2 | Mention what you want. *→ "write tests"* |
| L2 | L3 | Name the file. *→ "write tests in @tests/payment.test.ts"* |
| L3 | L4 | Specify format and naming. *→ "write integration tests in @tests/payment.integration.test.ts using Jest. Descriptive test names."* |
| L4 | L5 | List all artifacts and their success criteria. *→ "Produce: (1) tests in @tests/, (2) updated docs in @docs/api.md, (3) migration in @migrations/. Each must pass their respective checks."* |

---

# Section 4 — Worked Examples: Scoring Real Prompts

These examples show how to apply the rubric to real-world prompts, with full scoring and upgrade suggestions.

---

## Example 1: Developer — Debugging

**Original prompt:**

```
fix the login bug
```

| Dimension | Score | Reasoning |
|-----------|-------|-----------|
| Specificity | 1 | No file, no symptom, no error message. |
| Verification | 1 | No success criteria defined. |
| Context | 1 | No references, no domain, no history. |
| Constraints | 1 | No boundaries — Claude might refactor the entire auth system. |
| Structure | 1 | Single sentence with no organization. |
| Output | 1 | No expected deliverables. |

**Total: 6/30 | Average: 1.0 | Level 1 — Unacceptable**

**Upgraded to Level 5:**

```
## Context
Service: AuthService in @src/services/AuthService.ts
Environment: Production (affects ~2% of login attempts)
Error: intermittent, correlates with session timeout

## Symptom
Users report 'Invalid credentials' error after session timeout,
even with correct password. Error log:
[paste actual error and stack trace]
Started after deploy on 2024-03-15 (PR #1890).

## Task
1. Use a subagent to investigate the token refresh flow in
   @src/auth/ and @src/middleware/session.ts
2. Check git blame on PR #1890 for the change that triggered this
3. Write a failing test that reproduces the timeout-then-login scenario
4. Fix the root cause
5. Verify: failing test now passes, full auth test suite passes,
   lint and typecheck pass, no regressions in session management

## Constraints
- Do NOT modify the public AuthService API
- Do NOT change session duration config
- Preserve backward compatibility with existing tokens
- All auth changes require security review (note in PR)

## Output
- Fix with passing tests
- Root cause summary for post-mortem doc
- PR with descriptive commit referencing JIRA-2345
```

**Total: 30/30 | Average: 5.0 | Level 5 — Enterprise-Grade**

---

## Example 2: Data Science — EDA

**Original prompt:**

```
explore this dataset and find interesting patterns
```

| Dimension | Score | Reasoning |
|-----------|-------|-----------|
| Specificity | 1 | No dataset named, no business question, no definition of "interesting". |
| Verification | 1 | No way to verify completeness or correctness. |
| Context | 1 | No domain, no column descriptions, no business background. |
| Constraints | 1 | No scope limits — Claude might spend 30 minutes reading every column. |
| Structure | 1 | Single sentence. |
| Output | 1 | No expected deliverables or format. |

**Total: 6/30 | Average: 1.0 | Level 1 — Unacceptable**

**Upgraded to Level 5:**

```
## Context
Dataset: @data/vehicle_telemetry_2024.parquet
Domain: Predictive maintenance for commercial vehicle fleet
Business question: Can we predict engine failures 7 days in advance?
Key columns: vehicle_id, timestamp, engine_temp, oil_pressure,
  vibration, speed, fuel_consumption, failure_flag, vehicle_model

## Task: Comprehensive EDA
1. PROFILE: Shape, dtypes, memory. Per-column: unique count,
   null %, distribution (mean/std/min/max for numeric, top 10 for categorical)
2. QUALITY: Flag >5% nulls, constant columns, type mismatches,
   outliers beyond 3 sigma
3. TARGET ANALYSIS: Distribution of failure_flag. Class balance.
   Failure rate by vehicle_model and month.
4. CORRELATIONS: Correlation matrix for numeric features.
   Flag pairs with |r| > 0.8.
5. TEMPORAL: Time series of engine_temp and failure_flag.
   Check for seasonality, trends, lead-up patterns before failure.
6. SUMMARY: 1-page executive summary for the data science team.

## Constraints
- Do NOT clean data — exploration only
- Do NOT train any models
- Focus on features relevant to failure prediction

## Output
- Save plots to /outputs/eda/ (PNG, 300 DPI)
- Write EDA_REPORT.md with findings and recommendations
- Include a 'Data Quality Issues' section listing every problem found
```

**Total: 30/30 | Average: 5.0 | Level 5 — Enterprise-Grade**

---

# Section 5 — Implementation Guide for Tooling

This section provides guidance on how to implement the scoring rubric in an automated tool, a CI/CD gate, or a team review process.

---

## 5.1 Automated Scoring Logic

The rubric can be implemented as a scoring function that analyzes prompt text:

```
SCORING SIGNALS (what to detect in the prompt text):

SPECIFICITY:
  +1: Contains a noun (service name, module name)
  +1: Contains @ file reference or specific file path
  +1: Contains a line number, error message, or specific symptom
  +1: Contains a root cause hypothesis
  +1: Contains trigger condition and expected behavior

VERIFICATION:
  +1: Mentions any check (test, verify, validate, confirm)
  +1: Names a specific tool (jest, pytest, lint, typecheck)
  +1: Includes 'run' + test/check command
  +1: Multiple verification methods mentioned
  +1: Defines failure conditions or edge cases to check

CONTEXT:
  +1: Mentions domain or project area
  +1: Uses @ file references
  +1: References patterns or existing implementations
  +1: Includes history (PR, commit, ticket, ADR)
  +1: States non-goals or domain knowledge

CONSTRAINTS:
  +1: Contains any negative instruction (do not, don't, avoid)
  +1: Scopes files or modules (only, within, limited to)
  +1: Preserves APIs or contracts
  +1: Includes performance or compliance rules
  +1: Defines conflict resolution strategy

STRUCTURE:
  +1: Multiple sentences (not a one-liner)
  +1: Uses numbered steps or bullet points
  +1: Uses markdown headers (## or bold sections)
  +1: Separates context from task from verification
  +1: Follows the 6-section Playbook template

OUTPUT:
  +1: Mentions any output (file, report, PR, commit)
  +1: Names specific output files or paths
  +1: Specifies format (JSON, markdown, test file, etc.)
  +1: Specifies naming conventions
  +1: Lists all artifacts with success criteria
```

---

## 5.2 Integration Points

Where to plug the scoring rubric into your workflow:

| Integration | How | Action |
|------------|-----|--------|
| **CLI pre-check** | Score the prompt before sending to Claude Code | Warn if below threshold. Suggest upgrades. |
| **Team review** | Include score card in PR descriptions for prompts used in skills/hooks | Require Level 4+ for shared prompts. |
| **CI/CD gate** | Score prompts in pipeline configs before execution | Block execution if below Level 4. |
| **Onboarding** | Score prompts during training exercises | Require trainees to reach Level 4 on 5 prompts. |
| **Prompt library** | Score all prompts in the shared library | Tag each prompt with its level. Filter by minimum level. |
| **Retrospectives** | Score prompts from incidents or failed tasks | Identify if prompt quality was a contributing factor. |

---

## 5.3 Team Adoption Strategy

Roll out the rubric incrementally:

| Phase | Duration | Activity | Goal |
|-------|----------|----------|------|
| **Awareness** | Week 1 | Share the rubric. Score 5 existing prompts as a team exercise. | Everyone understands the dimensions. |
| **Self-assessment** | Weeks 2-3 | Engineers score their own prompts before sending. No enforcement. | Build the habit. Identify common weaknesses. |
| **Peer review** | Weeks 4-6 | Add prompt scores to code review process for shared prompts. | Normalize feedback on prompt quality. |
| **Thresholds** | Week 7+ | Enforce minimum Level 3 for dev work, Level 4 for CI/CD and shared prompts. | Quality baseline established. |
| **Automation** | Month 3+ | Integrate scoring into tooling. Auto-suggest upgrades. | Scale beyond manual review. |

---

*Prompt Evaluation & Scoring Rubric*
*Companion to the Enterprise Prompt Playbook for Claude Code*
