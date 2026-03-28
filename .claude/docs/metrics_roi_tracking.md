# Metrics & ROI Tracking Template

> Measure the impact of Claude Code adoption across your engineering and data science teams.

**4 Metric Categories • KPI Definitions • Tracking Templates • Executive Reports**

Companion to the Enterprise Prompt Playbook.

---

| Purpose | Audience | Outcome |
|---------|----------|---------|
| Quantify the value Claude Code delivers. Track adoption, efficiency, quality, and cost. Generate executive-ready reports. | Engineering managers and tech leads for sprint reports. VPs and directors for quarterly reviews. Platform teams for adoption tracking. | Data-driven answers to: "Is Claude Code worth it?" "Where is it most effective?" "How should we invest further?" |

---

# Section 1 — The Four Metric Categories

Every metric falls into one of four categories. Together, they give a complete picture of Claude Code's impact on your organization. Track all four — efficiency alone doesn't prove value if quality drops.

| Category | What It Measures | Key Question | Example KPIs |
|----------|-----------------|--------------|-------------|
| **Efficiency** | Time saved per task, iteration speed, throughput | Are we faster? | Time-to-completion, prompt iterations, tasks per sprint |
| **Quality** | Code correctness, bug rates, review feedback | Is the output better? | Defect rate, review pass rate, test coverage delta |
| **Adoption** | Usage breadth, depth, and consistency | Is the team using it? | Active users, sessions/week, task type distribution |
| **Cost** | API spend, time investment, ROI ratio | Is it worth the money? | Cost per task, cost per developer, ROI multiplier |

---

# Section 2 — KPI Definitions: What to Measure and How

## 2.1 Efficiency Metrics

> **TIP:** Always compare to a baseline. Measure the same task type with and without Claude Code.

| KPI | Definition | How to Measure | Target / Benchmark |
|-----|-----------|---------------|-------------------|
| **Time-to-Completion** | Wall-clock time from starting a task to verified completion. | Log session start/end times. Track per task type. | 30-70% reduction vs. manual baseline, depending on task type. |
| **Prompt Iterations** | Number of prompts needed to complete a task (including corrections). | Count user messages per session per task. | Simple tasks: 1-3. Complex: 5-10. If >15, prompt quality is low. |
| **First-Attempt Success Rate** | % of tasks where Claude's first output requires zero corrections. | Track tasks with only 1 user prompt before completion. | Target: >40% for Level 4+ prompts. <20% indicates poor prompts. |
| **Context Efficiency** | % of context window used vs. task complexity. | Monitor /compact triggers and /clear frequency. | If >50% of sessions trigger compaction, prompts need tightening. |
| **Throughput** | Tasks completed per developer per sprint with Claude assistance. | Count completed tasks tagged as Claude-assisted. | Track trend over time. Expect 20-50% increase after onboarding. |
| **Cycle Time Reduction** | Time from PR open to PR merge for Claude-assisted work. | Compare cycle times for Claude-assisted vs. manual PRs. | Target: 25-40% reduction in cycle time. |

---

## 2.2 Quality Metrics

> **TIP:** Quality must not degrade as speed increases. Track both together.

| KPI | Definition | How to Measure | Target / Benchmark |
|-----|-----------|---------------|-------------------|
| **Defect Escape Rate** | Bugs found in staging/production from Claude-assisted code. | Tag tickets originating from Claude-assisted PRs. Compare to baseline. | Should be equal or better than manual baseline. Alert if >10% worse. |
| **Review Pass Rate** | % of Claude-assisted PRs approved on first review. | Track PR approval history. Compare to non-assisted PRs. | Target: >70%. Below 50% indicates quality issues. |
| **Test Coverage Delta** | Change in test coverage for Claude-assisted changes. | Measure coverage before and after Claude's changes. | Should be positive or neutral. Negative delta is a red flag. |
| **Code Review Findings** | Number and severity of issues found during review of Claude's output. | Track review comments by severity: Critical, High, Medium, Low. | Critical/High findings should trend downward over time. |
| **Technical Debt Impact** | Does Claude add or reduce technical debt? | Track SonarQube or similar metrics before/after. | Neutral or positive. Alert if code smells increase >10%. |
| **Security Issue Rate** | Security vulnerabilities introduced by Claude-assisted code. | Track SAST/DAST findings on Claude-assisted PRs. | Zero critical. High findings should be below manual baseline. |
| **Prompt Score Average** | Average prompt quality score (from the Scoring Rubric). | Score a sample of prompts weekly. Track trend. | Target: team average of 3.5+ (Level 4) within 6 weeks. |

---

## 2.3 Adoption Metrics

> **TIP:** Low adoption with high satisfaction is a training problem. High adoption with low satisfaction is a tooling problem.

| KPI | Definition | How to Measure | Target / Benchmark |
|-----|-----------|---------------|-------------------|
| **Active Users** | Number of engineers using Claude Code at least once per week. | Track unique users per week from session logs. | Target: >80% of licensed users within 8 weeks of rollout. |
| **Session Frequency** | Average sessions per user per week. | Count sessions per user. Track trend. | Power users: 15-30/week. Casual: 3-5/week. <1 indicates abandonment. |
| **Task Type Distribution** | Which task types are most commonly done with Claude? | Categorize sessions by task type. | Healthy: diverse mix. Unhealthy: only used for simple tasks. |
| **Feature Utilization** | Which Claude Code features are being used? | Track: Plan Mode, subagents, skills, hooks, MCP, non-interactive mode. | Advanced features (subagents, skills) indicate maturity. |
| **Retention Rate** | % of users still active after 30/60/90 days. | Cohort analysis: % of users active in week 1 who are still active. | 30-day: >85%. 90-day: >70%. Below these, investigate friction. |
| **Satisfaction Score** | Developer satisfaction with Claude Code. | Monthly survey: 1-10 scale. Include open-ended feedback. | Target: >7.5 average. Track trend, not absolute. |

---

## 2.4 Cost & ROI Metrics

> **TIP:** ROI = (Value of time saved - Claude Code costs) / Claude Code costs. Simple, defensible, executive-friendly.

| KPI | Definition | How to Measure | Target / Benchmark |
|-----|-----------|---------------|-------------------|
| **Cost Per Task** | Average API/license cost per completed task. | Total Claude Code spend / number of completed tasks. | Track by task type. Complex tasks cost more but save more. |
| **Cost Per Developer** | Monthly Claude Code cost per active developer. | Total spend / active users per month. | Compare to developer hourly cost × hours saved. |
| **Time Value Saved** | Dollar value of engineering time saved. | Hours saved × fully loaded hourly rate. | Should exceed Claude Code costs by at least 3x. |
| **ROI Multiplier** | Return on investment as a multiplier. | (Value of time saved) / (Claude Code total costs). | Target: >3x within 3 months. >5x at maturity. |
| **Cost Avoidance** | Bugs, incidents, and rework prevented by Claude-assisted QA. | Estimate cost of prevented defects based on historical data. | Track: bugs caught by Claude-suggested tests, security issues found. |
| **Token Efficiency** | Tokens consumed per successful task completion. | Track tokens per session. Compare high-scoring vs. low-scoring prompts. | High-scoring prompts typically use 30-50% fewer tokens. |

---

# Section 3 — Tracking Templates

Use these templates to collect data consistently. Start with the Session Log — it feeds all other reports.

---

## 3.1 Session Log Template

Log this for every Claude Code session. Can be automated via hooks or manual entry.

```
SESSION LOG
═══════════════════════════════════════════════════════
Date:           [YYYY-MM-DD]
Developer:      [name or ID]
Team:           [team name]
Session ID:     [auto or manual]
Duration:       [minutes]
═══════════════════════════════════════════════════════

TASK
───────────────────────────────────────────────────────
Type:           [ ] Debugging    [ ] Feature     [ ] Refactor
                [ ] Code Review  [ ] Testing     [ ] EDA
                [ ] Data Pipeline [ ] ML Training [ ] Migration
                [ ] Security     [ ] DevOps      [ ] Other: ___
Description:    [one-line summary]
Complexity:     [ ] Simple  [ ] Medium  [ ] Complex  [ ] Critical
───────────────────────────────────────────────────────

PERFORMANCE
───────────────────────────────────────────────────────
Prompt iterations:      [count]
Prompt score (avg):     [1-5, from Scoring Rubric]
First-attempt success:  [ ] Yes  [ ] No
Context resets (/clear): [count]
Subagents used:         [ ] Yes  [ ] No
Plan Mode used:         [ ] Yes  [ ] No
───────────────────────────────────────────────────────

OUTCOME
───────────────────────────────────────────────────────
Result:         [ ] Success  [ ] Partial  [ ] Failed  [ ] Abandoned
Estimated time without Claude: [minutes]
Time saved:     [minutes]
Output quality: [ ] Better than manual  [ ] Same  [ ] Worse
───────────────────────────────────────────────────────

NOTES
───────────────────────────────────────────────────────
[What worked well? What didn't? Any friction?]
═══════════════════════════════════════════════════════
```

---

## 3.2 Weekly Team Digest Template

Aggregate session logs into a weekly summary for the team.

```
WEEKLY CLAUDE CODE DIGEST
Team: [team name]           Week: [YYYY-Www]
══════════════════════════════════════════════════════════

SUMMARY
──────────────────────────────────────────────────────────
Active users:           [X] / [Y] licensed  ([Z]%)
Total sessions:         [count]
Total tasks completed:  [count]
Success rate:           [X]%
Estimated hours saved:  [X] hours
Average prompt score:   [X] / 5.0
──────────────────────────────────────────────────────────

BY TASK TYPE
──────────────────────────────────────────────────────────
Task Type        | Tasks | Avg Time Saved | Success Rate
─────────────────|───────|────────────────|─────────────
Debugging        |       |                |
Feature Dev      |       |                |
Code Review      |       |                |
Testing          |       |                |
Data Science     |       |                |
DevOps           |       |                |
Other            |       |                |
──────────────────────────────────────────────────────────

QUALITY
──────────────────────────────────────────────────────────
PRs opened (Claude-assisted):     [count]
First-review approval rate:       [X]%
Critical review findings:         [count]
Bugs escaped to staging:          [count]
──────────────────────────────────────────────────────────

TOP WINS
──────────────────────────────────────────────────────────
1. [Description of biggest time save or quality win]
2. [Description]
3. [Description]

FRICTION POINTS
──────────────────────────────────────────────────────────
1. [Most common complaint or failure mode]
2. [Description]
══════════════════════════════════════════════════════════
```

---

## 3.3 Monthly Executive Report Template

This is the report engineering managers present to leadership. Focus on ROI, trends, and actionable insights. Keep it to one page.

```
CLAUDE CODE — MONTHLY IMPACT REPORT
Organization: [name]       Month: [YYYY-MM]
Prepared by: [name]        Date: [date]
══════════════════════════════════════════════════════════

EXECUTIVE SUMMARY
──────────────────────────────────────────────────────────
[2-3 sentences: overall impact, key wins, key concerns]

KEY METRICS
──────────────────────────────────────────────────────────
                      This Month    Last Month    Trend
Active developers:    [X]           [X]           [+/-]
Tasks completed:      [X]           [X]           [+/-]
Hours saved:          [X]           [X]           [+/-]
Value of time saved:  $[X]          $[X]          [+/-]
Claude Code costs:    $[X]          $[X]          [+/-]
ROI multiplier:       [X]x          [X]x          [+/-]
Avg prompt score:     [X]/5         [X]/5         [+/-]
Defect escape rate:   [X]%          [X]%          [+/-]
──────────────────────────────────────────────────────────

ROI CALCULATION
──────────────────────────────────────────────────────────
Hours saved:                    [X] hours
Fully loaded hourly rate:       $[X]
Value of time saved:            $[X]
License/API costs:              $[X]
Training & onboarding costs:    $[X]
Total costs:                    $[X]
NET VALUE:                      $[X]
ROI:                            [X]x
──────────────────────────────────────────────────────────

TOP IMPACT AREAS
──────────────────────────────────────────────────────────
1. [Task type with highest ROI: description + data]
2. [Task type with second highest ROI]
3. [Emerging use case or growth area]

RISKS & CONCERNS
──────────────────────────────────────────────────────────
1. [Any quality regressions or adoption issues]
2. [Cost trends that need attention]

RECOMMENDATIONS
──────────────────────────────────────────────────────────
1. [Action item with expected impact]
2. [Action item]
══════════════════════════════════════════════════════════
```

---

# Section 4 — Benchmark Targets by Task Type

These benchmarks are based on observed patterns across enterprise teams. Use them as starting points — your actual baselines will vary. The important thing is to track trends, not hit exact numbers.

---

## 4.1 Time Savings Benchmarks

| Task Type | Manual Baseline | With Claude Code | Expected Savings | Confidence |
|-----------|----------------|-----------------|-----------------|------------|
| Bug fix (simple) | 30-60 min | 10-20 min | 50-70% | High |
| Bug fix (complex) | 2-8 hours | 1-3 hours | 40-60% | Medium |
| Feature (small) | 4-8 hours | 2-4 hours | 40-50% | High |
| Feature (medium) | 2-5 days | 1-3 days | 30-45% | Medium |
| Code review | 30-60 min | 10-20 min | 50-70% | High |
| Refactoring | 4-16 hours | 2-6 hours | 40-60% | Medium |
| Test writing | 1-4 hours | 20-60 min | 60-80% | High |
| EDA / Data profiling | 2-6 hours | 30-90 min | 60-80% | High |
| Data cleaning | 2-8 hours | 1-3 hours | 50-65% | Medium |
| Model training setup | 4-8 hours | 1-3 hours | 50-70% | Medium |
| Pipeline development | 1-3 days | 4-12 hours | 40-55% | Medium |
| Security review | 2-4 hours | 30-60 min | 60-75% | High |
| Migration (per file) | 30-60 min | 5-15 min | 70-85% | High |
| Documentation | 2-4 hours | 30-60 min | 70-85% | High |

---

## 4.2 Quality Benchmarks

| Metric | Manual Baseline | With Claude Code (Target) | Alert Threshold |
|--------|----------------|--------------------------|----------------|
| First-review PR approval rate | 60-75% | 70-85% | Below 50% |
| Defect escape rate | Varies by team | Equal or better than baseline | >10% worse than baseline |
| Test coverage change | +0% per feature | +5-15% per feature | Negative coverage change |
| Critical security findings | Varies | 50% fewer than manual baseline | Any increase |
| Code review findings (avg) | 3-5 per PR | 1-3 per PR | >5 per PR consistently |
| Technical debt score change | Neutral | Slight improvement | Worsening trend |

---

## 4.3 Adoption Maturity Model

Track your team's progression through these adoption stages:

| Stage | Timeline | Characteristics | Metrics Signal |
|-------|----------|----------------|---------------|
| **1. Exploration** | Weeks 1-2 | Engineers try Claude for simple tasks. High curiosity, low efficiency. Many low-scoring prompts. | Low task count, high prompt iterations, low satisfaction |
| **2. Learning** | Weeks 3-6 | Engineers develop prompting skills. Start using @ references, Plan Mode. Efficiency begins to improve. | Rising task count, declining iterations, prompt scores improving |
| **3. Productivity** | Weeks 7-12 | Team consistently faster with Claude. Skills and CLAUDE.md refined. Subagents and hooks adopted. | High task count, low iterations, 3.5+ prompt scores, ROI >3x |
| **4. Integration** | Months 4-6 | Claude is part of the workflow, not an add-on. CI/CD integration. Shared prompts and skills. | >80% active users, diverse task types, positive quality metrics |
| **5. Optimization** | Month 6+ | Teams optimize for Claude efficiency. Multi-session patterns. Agent teams. Custom plugins. | Stable high ROI, improving quality, declining cost per task |

---

# Section 5 — Implementation Guide

## 5.1 Data Collection Strategy

Start lightweight and automate over time:

| Phase | Method | Effort | Data Captured |
|-------|--------|--------|--------------|
| **Phase 1: Manual** | Engineers fill in session log template after each session. | Low — 2 min per session | Task type, duration, time saved, outcome, satisfaction |
| **Phase 2: Semi-auto** | Hook that logs session metadata automatically. Engineers add task type and notes. | Medium — hook setup + 30 sec per session | All Phase 1 + session duration, prompt count, feature usage |
| **Phase 3: Automated** | Full instrumentation: session telemetry, PR tagging, prompt scoring integration. | High — platform engineering work | All Phase 2 + prompt scores, quality metrics, cost per session |

> **TIP:** Start with Phase 1 immediately. Don't wait for perfect automation — imperfect data now is more valuable than perfect data in 3 months.

---

## 5.2 Reporting Cadence

| Report | Audience | Frequency | Template |
|--------|----------|-----------|----------|
| **Session Log** | Individual engineer | Per session | Section 3.1 |
| **Team Digest** | Team + tech lead | Weekly | Section 3.2 |
| **Impact Report** | Engineering leadership | Monthly | Section 3.3 |
| **Quarterly Review** | VP / Director level | Quarterly | Aggregated monthly reports + trends |
| **Annual ROI Summary** | C-level / Budget owners | Annually | Year-over-year impact + investment recommendation |

---

## 5.3 Common Pitfalls

**Measuring only speed**
If you only track time saved, you'll miss quality regressions. A team that ships 2x faster but introduces 3x more bugs is not succeeding. Always pair efficiency metrics with quality metrics.

**Self-reported bias**
Engineers tend to overestimate time saved. Counter this by tracking objective metrics (cycle time, defect rates) alongside self-reports. Use the objective data to calibrate.

**Ignoring non-users**
A 90% satisfaction score among active users means nothing if 50% of the team stopped using it. Track retention and investigate abandoned users.

**Vanity metrics**
Session count and total prompts are vanity metrics. They don't tell you if Claude is delivering value. Focus on outcomes: tasks completed, time saved, bugs prevented.

**Short-term measurement**
ROI takes 6-12 weeks to stabilize. Don't evaluate the investment based on week 1-2 data when everyone is still learning. Set expectations for the adoption curve.

---

## 5.4 Connecting to the Scoring Rubric

The Prompt Scoring Rubric and this Metrics Template form a feedback loop:

- **Prompt scores predict efficiency:** Level 4+ prompts complete in fewer iterations and less time.
- **Efficiency data validates the rubric:** If high-scoring prompts don't correlate with better outcomes, the rubric needs adjustment.
- **Quality metrics flag rubric gaps:** If defects increase despite high prompt scores, a dimension is missing.
- **Cost metrics justify investment:** Token efficiency data shows that better prompts cost less to run.

Track prompt scores alongside session outcomes. Over time, you'll build an empirical model of what prompt quality actually predicts — and that model becomes more valuable than any static rubric.

---

*Metrics & ROI Tracking Template*
*Companion to the Enterprise Prompt Playbook for Claude Code*
