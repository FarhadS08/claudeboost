"use client";

import { useState } from "react";
import { LandingNavbar } from "@/components/landing/LandingNavbar";
import { Footer } from "@/components/landing/Footer";
import {
  Terminal,
  Zap,
  Settings,
  BarChart3,
  Brain,
  Layers,
  BookOpen,
  MessageSquare,
  Download,
  ChevronRight,
} from "lucide-react";

const SECTIONS = [
  { id: "getting-started", label: "Getting Started", icon: Download },
  { id: "how-it-works", label: "How It Works", icon: Zap },
  { id: "commands", label: "Commands", icon: Terminal },
  { id: "boost-levels", label: "Boost Levels", icon: Layers },
  { id: "domains", label: "Domains", icon: BookOpen },
  { id: "scoring", label: "Scoring System", icon: BarChart3 },
  { id: "feedback", label: "Feedback & RLHF", icon: Brain },
  { id: "constraints", label: "Constraints", icon: Settings },
  { id: "dashboard", label: "Dashboard", icon: BarChart3 },
  { id: "faq", label: "FAQ", icon: MessageSquare },
];

function CodeBlock({ children, title }: { children: string; title?: string }) {
  return (
    <div className="bg-[hsl(240,15%,3%)] border border-border rounded-xl overflow-hidden">
      {title && (
        <div className="px-4 py-2 border-b border-border bg-muted/20 flex items-center gap-2">
          <Terminal className="w-3.5 h-3.5 text-muted-foreground" />
          <span className="text-xs text-muted-foreground font-mono">{title}</span>
        </div>
      )}
      <pre className="p-4 text-sm font-mono text-foreground/80 overflow-x-auto leading-relaxed">
        {children}
      </pre>
    </div>
  );
}

function SectionHeading({ id, children }: { id: string; children: React.ReactNode }) {
  return (
    <h2 id={id} className="text-2xl font-bold mt-16 mb-6 scroll-mt-24 flex items-center gap-3">
      <span>{children}</span>
    </h2>
  );
}

function SubHeading({ children }: { children: React.ReactNode }) {
  return <h3 className="text-lg font-semibold mt-8 mb-3">{children}</h3>;
}

function Paragraph({ children }: { children: React.ReactNode }) {
  return <p className="text-muted-foreground leading-relaxed mb-4">{children}</p>;
}

function Table({ headers, rows }: { headers: string[]; rows: string[][] }) {
  return (
    <div className="overflow-x-auto mb-6">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-border">
            {headers.map((h) => (
              <th key={h} className="text-left py-3 px-4 text-muted-foreground font-semibold text-xs uppercase tracking-wider">
                {h}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row, i) => (
            <tr key={i} className="border-b border-border/50">
              {row.map((cell, j) => (
                <td key={j} className="py-3 px-4 text-foreground/80">
                  {j === 0 ? (
                    <code className="text-primary bg-primary/10 px-1.5 py-0.5 rounded text-xs font-mono">{cell}</code>
                  ) : (
                    cell
                  )}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default function DocsPage() {
  const [activeSection, setActiveSection] = useState("getting-started");

  return (
    <>
      <LandingNavbar />
      <main className="pt-24 pb-16">
        <div className="max-w-6xl mx-auto px-6">
          {/* Header */}
          <div className="mb-12">
            <p className="text-sm font-semibold uppercase tracking-wider text-primary mb-3">
              Documentation
            </p>
            <h1 className="text-4xl md:text-5xl font-bold tracking-tight">
              Learn how to use <span className="text-primary">ClaudeBoost</span>
            </h1>
            <p className="text-muted-foreground mt-4 text-lg max-w-2xl">
              Everything you need to install, configure, and get the most out of
              ClaudeBoost in your Claude Code workflow.
            </p>
          </div>

          {/* Layout: sidebar + content */}
          <div className="flex gap-12">
            {/* Sidebar */}
            <nav className="hidden lg:block w-56 shrink-0">
              <div className="sticky top-24 space-y-1">
                {SECTIONS.map((section) => (
                  <a
                    key={section.id}
                    href={`#${section.id}`}
                    onClick={() => setActiveSection(section.id)}
                    className={`flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm transition-all ${
                      activeSection === section.id
                        ? "bg-primary/10 text-primary font-medium"
                        : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
                    }`}
                  >
                    <section.icon className="w-4 h-4 shrink-0" />
                    {section.label}
                  </a>
                ))}
              </div>
            </nav>

            {/* Content */}
            <div className="flex-1 min-w-0 max-w-3xl">

              {/* Getting Started */}
              <SectionHeading id="getting-started">Getting Started</SectionHeading>
              <Paragraph>
                ClaudeBoost is a free MCP (Model Context Protocol) plugin for Claude Code
                that automatically enhances your prompts before they reach Claude. Install
                it in 30 seconds.
              </Paragraph>

              <SubHeading>1. Install from PyPI</SubHeading>
              <CodeBlock title="Terminal">{`pip install claudeboost-mcp`}</CodeBlock>

              <SubHeading>2. Run setup</SubHeading>
              <Paragraph>
                The setup command configures everything: MCP server, slash commands, and your
                Anthropic API key. It will prompt you for the key if not already set.
              </Paragraph>
              <CodeBlock title="Terminal">{`claudeboost-mcp --setup`}</CodeBlock>

              <SubHeading>3. Restart Claude Code</SubHeading>
              <Paragraph>
                That&apos;s it. Two commands and you&apos;re done. Auto-boost is on by default —
                every task prompt you type is automatically enhanced. You don&apos;t need to type
                /boost every time, just type normally.
              </Paragraph>
              <CodeBlock title="Terminal">{`claude
# Just type any prompt — ClaudeBoost enhances it automatically
> build me a REST API for user management
# ⚡ CLAUDEBOOST · general_coding · Score: 8/30 → 22/30 (+14)
# 🔧 Boost added: tests & success criteria, organized sections`}</CodeBlock>

              <SubHeading>4. Sign in (optional)</SubHeading>
              <Paragraph>
                Sign in to sync your boost history, settings, and constraints across
                devices via the web dashboard.
              </Paragraph>
              <CodeBlock title="Terminal">{`/boost --login
# Opens browser → sign in → CLI connected`}</CodeBlock>

              {/* How It Works */}
              <SectionHeading id="how-it-works">How It Works</SectionHeading>
              <Paragraph>
                When you type a prompt in Claude Code, ClaudeBoost intercepts it and runs
                a 4-step pipeline before Claude sees your instruction:
              </Paragraph>

              <div className="space-y-4 mb-6">
                {[
                  {
                    step: "1",
                    title: "Score",
                    desc: "Your prompt is scored across 6 dimensions (Specificity, Verification, Context, Constraints, Structure, Output). If it scores 20+/30, ClaudeBoost skips the boost — your prompt is already well-structured.",
                  },
                  {
                    step: "2",
                    title: "Classify",
                    desc: "Claude Haiku classifies your prompt into one of 7 domains (data science, DevOps, general coding, etc.) to apply domain-specific enhancement rules.",
                  },
                  {
                    step: "3",
                    title: "Enhance",
                    desc: "The weakest scoring dimensions are identified and targeted. Light/medium boosts use Haiku (~3s), full boosts use Sonnet (~12s). Your past feedback and domain constraints are injected.",
                  },
                  {
                    step: "4",
                    title: "Present",
                    desc: "You see the original vs boosted prompt with scores, what was added, and a breakdown by dimension. Choose to use the boost, add notes to refine it, or keep your original.",
                  },
                ].map((item) => (
                  <div key={item.step} className="flex gap-4 items-start">
                    <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center shrink-0 text-primary font-bold text-sm">
                      {item.step}
                    </div>
                    <div>
                      <p className="font-semibold">{item.title}</p>
                      <p className="text-sm text-muted-foreground mt-0.5">{item.desc}</p>
                    </div>
                  </div>
                ))}
              </div>

              {/* Commands */}
              <SectionHeading id="commands">Commands</SectionHeading>
              <Paragraph>
                ClaudeBoost adds several slash commands and modifiers to Claude Code:
              </Paragraph>

              <Table
                headers={["Command", "Description"]}
                rows={[
                  ["Just type normally", "Auto-boosts every task prompt (when auto-boost is on)"],
                  ["/boost <prompt>", "Manually boost a specific prompt with the full comparison UI"],
                  ["/boost --login", "Sign in to ClaudeBoost (opens browser for authentication)"],
                  ["/boost --logout", "Sign out of ClaudeBoost"],
                  ["/boost-settings", "View current boost settings (level and auto-boost status)"],
                  ["/boost-settings --level <light|medium|full>", "Change boost intensity. Short flag: -l"],
                  ["/boost-settings --auto <true|false>", "Toggle automatic prompt boosting. Short flag: -a"],
                  ["/boost-help", "Show all available commands and usage guide"],
                  ["<prompt> --raw", "Skip auto-boost for that single prompt"],
                ]}
              />

              <SubHeading>Examples</SubHeading>
              <CodeBlock title="Claude Code">{`# Auto-boost is on — just type normally
> build me an API endpoint for user auth
⚡ CLAUDEBOOST · general_coding · Score: 8/30 → 22/30 (+14)
🔧 Boost added: tests & success criteria, organized sections
🔥 3-day streak · 15 total boosts · 4 today

# Manually boost a specific prompt
> /boost analyze our quarterly churn data

# Skip boost for one prompt
> fix this typo in readme.md --raw

# Sign in to sync across devices
> /boost --login

# Change boost level
> /boost-settings -l full

# Turn off auto-boost
> /boost-settings -a false

# Well-structured prompts skip automatically
> /boost fix the 403 error in src/auth/session.ts by adding token refresh
✅ Your prompt scores 22/30 — already well-structured!`}</CodeBlock>

              {/* Boost Levels */}
              <SectionHeading id="boost-levels">Boost Levels</SectionHeading>
              <Paragraph>
                ClaudeBoost offers three intensity levels. Each targets a different
                quality score threshold:
              </Paragraph>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                {[
                  {
                    level: "Light",
                    target: "Level 3 · Haiku · ~2-3s",
                    desc: "Fixes only dimensions scoring 1-2. Clarifies and structures your prompt while staying close to the original. Uses Haiku for speed.",
                  },
                  {
                    level: "Medium",
                    target: "Level 4 · Haiku · ~3-5s",
                    desc: "Fixes dimensions below 3. Adds verification criteria, constraints, and structure. Fast and balanced — the default.",
                  },
                  {
                    level: "Full",
                    target: "Level 5 · Sonnet · ~10-15s",
                    desc: "Pushes all 6 dimensions to maximum. Full enterprise playbook with anti-patterns, metrics, and acceptance criteria. Uses Sonnet for quality.",
                  },
                ].map((l) => (
                  <div key={l.level} className="bg-card border border-border rounded-xl p-5">
                    <p className="font-semibold">{l.level}</p>
                    <p className="text-xs text-primary mt-0.5 font-mono">{l.target}</p>
                    <p className="text-sm text-muted-foreground mt-2 leading-relaxed">{l.desc}</p>
                  </div>
                ))}
              </div>

              {/* Domains */}
              <SectionHeading id="domains">Domains</SectionHeading>
              <Paragraph>
                ClaudeBoost auto-classifies every prompt into one of 7 domains using Claude Haiku.
                Each domain has tailored enhancement rules:
              </Paragraph>

              <Table
                headers={["Domain", "Description", "Example Prompt"]}
                rows={[
                  ["data_science", "ML, statistics, data analysis, visualization", "train a churn prediction model"],
                  ["data_engineering", "ETL, pipelines, databases, data infrastructure", "build a Spark pipeline for user events"],
                  ["business_analytics", "Reporting, dashboards, KPIs, business logic", "create a quarterly revenue dashboard"],
                  ["general_coding", "Web dev, APIs, frontend, backend, debugging", "build a REST API with auth"],
                  ["documentation", "Docs, READMEs, API specs, technical writing", "write API docs for the payment module"],
                  ["devops", "CI/CD, infrastructure, Docker, deployment", "set up GitHub Actions pipeline"],
                  ["other", "Anything that doesn't fit the above", "organize my desktop files"],
                ]}
              />

              {/* Scoring */}
              <SectionHeading id="scoring">Scoring System</SectionHeading>
              <Paragraph>
                Every prompt is scored 1-5 on six dimensions, for a total of 6-30.
                Scoring is automated via text analysis — no API calls required.
              </Paragraph>

              <Table
                headers={["Dimension", "What It Measures", "Score 1", "Score 5"]}
                rows={[
                  ["Specificity", "Are files, functions, and behaviors named?", "\"fix the bug\"", "\"fix the 403 error in src/auth/session.ts\""],
                  ["Verification", "Are tests or success criteria defined?", "No mention of testing", "\"Jest tests, >90% coverage, CI green\""],
                  ["Context", "Are relevant files and patterns referenced?", "No file references", "\"See src/auth/, follows existing OAuth pattern\""],
                  ["Constraints", "Are boundaries and non-goals stated?", "No limits given", "\"Don't break SSO flow, no new deps\""],
                  ["Structure", "Is it organized with sections/steps?", "Single run-on sentence", "Numbered steps with clear sections"],
                  ["Output", "Are deliverables and formats specified?", "No output described", "\"Single PR with migration + tests + docs\""],
                ]}
              />

              <SubHeading>Quality Levels</SubHeading>
              <Table
                headers={["Level", "Average Score", "Label"]}
                rows={[
                  ["L1", "< 1.5", "Unacceptable — too vague to act on"],
                  ["L2", "1.5 - 2.4", "Needs Work — missing key dimensions"],
                  ["L3", "2.5 - 3.4", "Acceptable — clear enough for most tasks"],
                  ["L4", "3.5 - 4.4", "Production — well-structured with constraints"],
                  ["L5", "4.5+", "Enterprise — comprehensive, auditable prompt"],
                ]}
              />

              {/* Feedback */}
              <SectionHeading id="feedback">Feedback &amp; RLHF</SectionHeading>
              <Paragraph>
                ClaudeBoost learns from your preferences through a feedback loop inspired by
                Reinforcement Learning from Human Feedback (RLHF).
              </Paragraph>

              <div className="bg-card border border-border rounded-xl p-6 mb-6">
                <div className="flex items-center justify-between gap-2 text-center">
                  {[
                    { icon: "&#9997;", label: "You write\na prompt" },
                    { icon: "&#8594;", label: "" },
                    { icon: "&#9889;", label: "ClaudeBoost\nenhances it" },
                    { icon: "&#8594;", label: "" },
                    { icon: "&#9733;", label: "You rate &\ngive feedback" },
                    { icon: "&#8594;", label: "" },
                    { icon: "&#129504;", label: "Next boost\nimproves" },
                  ].map((step, i) => (
                    <div key={i} className={step.label ? "flex-1" : "shrink-0 text-muted-foreground"}>
                      <div className="text-2xl" dangerouslySetInnerHTML={{ __html: step.icon }} />
                      {step.label && (
                        <p className="text-[10px] mt-1 whitespace-pre-line leading-tight text-muted-foreground">{step.label}</p>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              <Paragraph>
                When you rate a boost (1-5 stars) or leave text feedback, it&apos;s stored in
                <code className="text-primary bg-primary/10 px-1.5 py-0.5 rounded text-xs font-mono mx-1">~/.claudeboost/history.json</code>.
                Next time ClaudeBoost enhances a prompt in the same domain, it loads your
                last 5 feedback entries + your domain constraints and injects them into the
                enhancement prompt. The more feedback you give, the more personalized your boosts become.
              </Paragraph>

              {/* Constraints */}
              <SectionHeading id="constraints">Constraints</SectionHeading>
              <Paragraph>
                Domain constraints are persistent rules that ClaudeBoost always applies when
                enhancing prompts in a specific domain. Set them in the Dashboard under
                Constraints, or via the CLI settings.
              </Paragraph>

              <SubHeading>Quick Presets</SubHeading>
              <Paragraph>
                The Dashboard includes 12 one-click presets for common stacks: Python Data Science,
                PyTorch ML, dbt+BigQuery, Spark Pipeline, React+TypeScript, Next.js App Router,
                FastAPI, AWS+Terraform, Docker+Kubernetes, GitHub Actions CI/CD, API Documentation,
                and Executive Reports. Click one to fill in the domain constraints instantly.
              </Paragraph>

              <SubHeading>Custom Constraints</SubHeading>
              <div className="space-y-3 mb-6">
                {[
                  { domain: "Data Science", constraint: "Always use Python 3.11+. Prefer scikit-learn over custom implementations. Output as Jupyter notebooks." },
                  { domain: "General Coding", constraint: "Use TypeScript strict mode. Prefer Zod for validation. Follow existing project patterns." },
                  { domain: "DevOps", constraint: "Use GitHub Actions, not Jenkins. All Docker images must be multi-stage. No hardcoded secrets." },
                  { domain: "Documentation", constraint: "Use OpenAPI 3.1 for API docs. Include curl examples. Write for junior developers." },
                ].map((ex) => (
                  <div key={ex.domain} className="bg-card border border-border rounded-xl p-4">
                    <p className="text-xs font-bold text-primary mb-1">{ex.domain}</p>
                    <p className="text-sm text-muted-foreground italic">&quot;{ex.constraint}&quot;</p>
                  </div>
                ))}
              </div>

              {/* Dashboard */}
              <SectionHeading id="dashboard">Dashboard</SectionHeading>
              <Paragraph>
                ClaudeBoost includes a web dashboard with authentication. Sign up at the
                landing page and your data syncs between CLI and web. The dashboard
                auto-refreshes every 5 seconds.
              </Paragraph>

              <SubHeading>Pages</SubHeading>
              <div className="space-y-3 mb-6">
                {[
                  {
                    title: "History",
                    path: "/dashboard",
                    desc: "Browse all boosted prompts. Filter by domain or quality level. Expand cards to see original vs boosted, score breakdown, and leave feedback.",
                  },
                  {
                    title: "Stats",
                    path: "/dashboard/stats",
                    desc: "Analytics dashboard with boost acceptance rate, domain distribution, average ratings, 6-dimension score histograms, ROI metrics, feedback coverage, and daily activity.",
                  },
                  {
                    title: "Constraints",
                    path: "/dashboard/constraints",
                    desc: "Configure boost level, toggle auto-boost, choose from 12 quick presets for common stacks, and set custom per-domain constraint rules.",
                  },
                ].map((page) => (
                  <div key={page.title} className="bg-card border border-border rounded-xl p-5">
                    <div className="flex items-center gap-2 mb-1">
                      <p className="font-semibold">{page.title}</p>
                      <code className="text-xs text-muted-foreground font-mono">{page.path}</code>
                    </div>
                    <p className="text-sm text-muted-foreground">{page.desc}</p>
                  </div>
                ))}
              </div>

              <SubHeading>Running the Dashboard</SubHeading>
              <CodeBlock title="Terminal">{`cd web-dashboard
npm install
npm run dev
# Dashboard available at https://claudeboost.vercel.app`}</CodeBlock>

              {/* FAQ */}
              <SectionHeading id="faq">FAQ</SectionHeading>
              <div className="space-y-4">
                {[
                  {
                    q: "Does ClaudeBoost modify my prompt before Claude sees it?",
                    a: "Yes. When auto-boost is on, ClaudeBoost rewrites your prompt and shows you the comparison. You choose whether to use the boosted version, refine it, or keep your original. You're always in control.",
                  },
                  {
                    q: "What happens when the MCP server isn't running?",
                    a: "Claude Code works normally without ClaudeBoost. Your prompts go directly to Claude without enhancement. You'll see a message that the MCP server is not connected.",
                  },
                  {
                    q: "Where is my data stored?",
                    a: "If signed in, data syncs to Supabase (our cloud database) so you can access it from the web dashboard and across devices. If not signed in, everything is stored locally in ~/.claudeboost/ as JSON files. Prompt text goes to the Anthropic API for enhancement.",
                  },
                  {
                    q: "Can I use ClaudeBoost with other AI tools?",
                    a: "ClaudeBoost is designed specifically for Claude Code via the MCP protocol. It hooks directly into the Claude Code CLI workflow.",
                  },
                  {
                    q: "What models does ClaudeBoost use?",
                    a: "Claude Haiku 4.5 for classification and light/medium enhancement (~2-5s). Claude Sonnet 4 for full-level enhancement (~10-15s). You provide your own Anthropic API key.",
                  },
                  {
                    q: "How do I install it?",
                    a: "Two commands: pip install claudeboost-mcp, then claudeboost-mcp --setup. Restart Claude Code and you're done. Works from any directory.",
                  },
                  {
                    q: "Do I need to type /boost every time?",
                    a: "No. Auto-boost is on by default — just type your prompt normally and it gets enhanced automatically. Use /boost only when you want to manually boost a specific prompt.",
                  },
                  {
                    q: "What if my prompt is already good?",
                    a: "ClaudeBoost skips prompts that score 20+/30 automatically. You'll see '✅ Your prompt is already well-structured!' and it proceeds without boosting.",
                  },
                  {
                    q: "Can I disable ClaudeBoost temporarily?",
                    a: "Use /boost-settings --auto false to turn off auto-boost. You can still manually boost with /boost <prompt>. Or append --raw to any prompt to skip just that one.",
                  },
                ].map((faq) => (
                  <div key={faq.q} className="bg-card border border-border rounded-xl p-5">
                    <p className="font-semibold mb-2">{faq.q}</p>
                    <p className="text-sm text-muted-foreground leading-relaxed">{faq.a}</p>
                  </div>
                ))}
              </div>

            </div>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
