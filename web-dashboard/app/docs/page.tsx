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

              <SubHeading>1. Install</SubHeading>
              <CodeBlock title="Terminal">{`# Add ClaudeBoost as an MCP server
claude mcp add claudeboost -- python3 /path/to/claudeboost/mcp-server/server.py

# Or add manually to ~/.claude/mcp_settings.json
{
  "mcpServers": {
    "claudeboost": {
      "command": "python3",
      "args": ["/path/to/claudeboost/mcp-server/server.py"]
    }
  }
}`}</CodeBlock>

              <SubHeading>2. Install dependencies</SubHeading>
              <CodeBlock title="Terminal">{`cd /path/to/claudeboost/mcp-server
pip3 install -r requirements.txt`}</CodeBlock>

              <SubHeading>3. Set your API key</SubHeading>
              <Paragraph>
                ClaudeBoost uses the Anthropic API for prompt classification and enhancement.
                Make sure your ANTHROPIC_API_KEY environment variable is set.
              </Paragraph>
              <CodeBlock title="Terminal">{`export ANTHROPIC_API_KEY=sk-ant-...`}</CodeBlock>

              <SubHeading>4. Start Claude Code</SubHeading>
              <Paragraph>
                That&apos;s it. Launch Claude Code and ClaudeBoost will automatically enhance
                every prompt you type. You&apos;ll see the boost comparison before anything executes.
              </Paragraph>
              <CodeBlock title="Terminal">{`claude
# ⚡ ClaudeBoost active · boost level: medium · auto-boost: on`}</CodeBlock>

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
                    title: "Classify",
                    desc: "Your prompt is sent to Claude Haiku which classifies it into one of 7 domains (data science, DevOps, general coding, etc.).",
                  },
                  {
                    step: "2",
                    title: "Score",
                    desc: "The original prompt is scored across 6 quality dimensions: Specificity, Verification, Context, Constraints, Structure, and Output Definition.",
                  },
                  {
                    step: "3",
                    title: "Enhance",
                    desc: "Claude Sonnet rewrites your prompt using domain-specific enterprise playbook rules, your past feedback, and your domain constraints.",
                  },
                  {
                    step: "4",
                    title: "Present",
                    desc: "You see the original vs boosted prompt side-by-side with scores. Choose to use the boost, refine it, or keep your original.",
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
                  ["/boost <prompt>", "Manually boost a specific prompt with the full comparison UI"],
                  ["/boost-settings", "View current boost settings (level and auto-boost status)"],
                  ["/boost-settings --level <light|medium|full>", "Change the boost intensity level"],
                  ["/boost-settings --auto <true|false>", "Toggle automatic prompt boosting on/off"],
                  ["/boost-help", "Show all available commands and usage guide"],
                  ["--raw", "Append to any prompt to skip auto-boost for that single prompt"],
                ]}
              />

              <SubHeading>Examples</SubHeading>
              <CodeBlock title="Claude Code">{`# Auto-boost is on by default — just type naturally
> build me an API endpoint for user auth
⚡ CLAUDEBOOST · general_coding · Level: L4
...

# Manually boost a specific prompt
> /boost analyze our quarterly churn data

# Skip boost for one prompt
> fix this typo in readme.md --raw

# Change boost level
> /boost-settings --level full

# Turn off auto-boost
> /boost-settings --auto false`}</CodeBlock>

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
                    target: "Level 3 (15+/30)",
                    desc: "Fixes only dimensions scoring 1-2. Clarifies and structures your prompt while staying close to the original. Best for quick tasks.",
                  },
                  {
                    level: "Medium",
                    target: "Level 4 (21+/30)",
                    desc: "Fixes dimensions below 3. Adds verification criteria, constraints, and structure. The balanced default for everyday use.",
                  },
                  {
                    level: "Full",
                    target: "Level 5 (27+/30)",
                    desc: "Pushes all 6 dimensions to maximum. Full enterprise playbook with anti-patterns, metrics, and acceptance criteria. For critical tasks.",
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
                Constraints, or they&apos;re stored in
                <code className="text-primary bg-primary/10 px-1.5 py-0.5 rounded text-xs font-mono mx-1">~/.claudeboost/config.json</code>.
              </Paragraph>

              <SubHeading>Examples</SubHeading>
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
                ClaudeBoost includes a web dashboard at
                <code className="text-primary bg-primary/10 px-1.5 py-0.5 rounded text-xs font-mono mx-1">localhost:3000</code>
                that reads live data from ~/.claudeboost/ with 5-second auto-polling.
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
                    desc: "Configure boost level (light/medium/full), toggle auto-boost, and set per-domain constraint rules.",
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
# Dashboard available at http://localhost:3000`}</CodeBlock>

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
                    a: "All data is local. History, settings, and constraints are stored in ~/.claudeboost/ as JSON files. Nothing is sent to external servers except the prompt text going to Claude API for enhancement.",
                  },
                  {
                    q: "Can I use ClaudeBoost with other AI tools?",
                    a: "ClaudeBoost is designed specifically for Claude Code via the MCP protocol. It hooks directly into the Claude Code CLI workflow.",
                  },
                  {
                    q: "What models does ClaudeBoost use?",
                    a: "Claude Haiku for domain classification (fast, cheap) and Claude Sonnet for prompt enhancement (high quality). These are configurable in the server code.",
                  },
                  {
                    q: "How do I reset my history?",
                    a: "Delete or empty the file at ~/.claudeboost/history.json. ClaudeBoost will recreate it on the next boost.",
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
