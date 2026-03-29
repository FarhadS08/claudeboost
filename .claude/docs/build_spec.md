# ClaudeBoost — Full Build Specification for Claude Code

> This document is the complete technical specification for building ClaudeBoost.
> Claude Code should read this entire file before writing a single line of code.
> Every file, function, API route, tool, and data structure is defined here.

---

## 1. What Is ClaudeBoost?

ClaudeBoost is a Claude Code MCP (Model Context Protocol) plugin that enhances user prompts before they are sent to Claude. The user writes a prompt, runs the `boost_prompt` tool, and sees a side-by-side comparison of their original prompt vs. an AI-improved version. The user then chooses which version to send. Every boost is logged locally and visible in a Next.js web dashboard where users can rate boosts, leave feedback, and set domain-specific constraints. That feedback is fed back into future enhancements.

### Core User Flow

```
User writes prompt in Claude Code terminal
       ↓
User calls: boost_prompt("their prompt here")
       ↓
MCP server classifies the domain (data_science, data_engineering, etc.)
       ↓
MCP server calls Claude API to generate an enhanced version
       ↓
Terminal displays side-by-side: ORIGINAL vs BOOSTED
       ↓
User types YES → boosted prompt is sent | User types NO → original is sent
       ↓
Both versions + domain + timestamp logged to ~/.claudeboost/history.json
       ↓
Web dashboard at claudeboost.vercel.app shows history, diff, ratings, feedback
       ↓
User rates the boost (1–5 stars) and optionally leaves text feedback
       ↓
Next time a prompt in the same domain is boosted, that feedback is injected
```

---

## 2. Project Folder Structure

Create this exact structure. Do not deviate.

```
/claudeboost
│
├── /mcp-server
│   ├── server.py           ← MCP server entry point, registers tools
│   ├── classifier.py       ← Domain classification logic
│   ├── enhancer.py         ← Prompt rewriting logic per domain
│   ├── feedback.py         ← Read/write history.json and config.json
│   └── requirements.txt    ← Python dependencies
│
├── /web-dashboard
│   ├── package.json
│   ├── tailwind.config.ts
│   ├── next.config.ts
│   └── /app
│       ├── layout.tsx              ← Root layout with nav
│       ├── page.tsx                ← Main history page
│       ├── /stats
│       │   └── page.tsx            ← Evaluation metrics page
│       ├── /constraints
│       │   └── page.tsx            ← Per-domain constraints manager
│       └── /api
│           ├── /history
│           │   └── route.ts        ← GET all history, PATCH single entry
│           └── /constraints
│               └── route.ts        ← GET and POST domain constraints
│
├── /shared
│   └── domains.ts          ← Domain list and display names (shared reference)
│
├── README.md               ← Setup and usage instructions
└── CLAUDEBOOST_EXPLANATION.md  ← This file
```

---

## 3. Data Files (Local Storage)

Both files live at `~/.claudeboost/`. The MCP server creates this directory and both files automatically on first run.

### 3.1 `~/.claudeboost/history.json`

Array of prompt boost entries. Append-only from the MCP server. Updated (rating, feedback, chosen) from the web dashboard via PATCH.

```json
[
  {
    "id": 1,
    "timestamp": "2025-01-15T10:32:00.000Z",
    "domain": "data_science",
    "original": "analyse my churn data",
    "boosted": "Analyse customer churn data for a subscription business. Identify the top 3 predictive features using a logistic regression baseline. Return results as a summary table with feature importance scores and a confusion matrix.",
    "chosen": "boosted",
    "rating": 4,
    "feedback": "Good but always assume Python and sklearn unless told otherwise"
  }
]
```

**Field definitions:**
- `id` — integer, auto-incremented, 1-indexed
- `timestamp` — ISO 8601 string, set at boost time
- `domain` — one of the 7 valid domain strings (see Section 5)
- `original` — the exact string the user typed
- `boosted` — the Claude-enhanced version
- `chosen` — `"boosted"`, `"original"`, or `null` (null until user decides)
- `rating` — integer 1–5 or `null` (null until rated in web UI)
- `feedback` — string, empty string by default, filled in web UI

### 3.2 `~/.claudeboost/config.json`

User constraints per domain. Written from the web dashboard constraints page. Read by the MCP server enhancer to inject into the enhancement prompt.

```json
{
  "data_science": "Always use Python and sklearn. Never use R. Prefer tabular output.",
  "data_engineering": "Always assume dbt + BigQuery stack. Output must be idempotent.",
  "business_analytics": "Always include a time range. Output as markdown table.",
  "general_coding": "Always use TypeScript. Include JSDoc comments.",
  "documentation": "",
  "devops": "",
  "other": ""
}
```

---

## 4. MCP Server — Python

### 4.1 `requirements.txt`

```
mcp
anthropic
```

Install with: `pip install -r requirements.txt`

---

### 4.2 `server.py` — MCP Entry Point

This file starts the MCP server, registers the `boost_prompt` tool, and handles incoming tool calls.

**Imports required:**
```python
from mcp.server import Server
from mcp.server.stdio import stdio_server
from mcp.types import Tool, TextContent
import asyncio
import json
from classifier import classify_domain
from enhancer import enhance_prompt
from feedback import load_feedback_context, log_to_history
```

**Server setup:**
```python
app = Server("claudeboost")
```

**`list_tools()` function** — registered with `@app.list_tools()`:
- Returns a list containing one `Tool` object
- Tool name: `"boost_prompt"`
- Tool description: `"Boost your prompt before sending to Claude. Detects domain, rewrites for clarity and specificity, shows original vs boosted side by side. You choose which to send."`
- Input schema: object with one required property `"prompt"` of type string

**`call_tool()` function** — registered with `@app.call_tool()`:
- Accepts `name: str` and `arguments: dict`
- If name is not `"boost_prompt"`, raise `ValueError`
- Extract `original = arguments["prompt"]`
- Call `classify_domain(original)` → `domain`
- Call `load_feedback_context(domain)` → `feedback_context`
- Call `enhance_prompt(original, domain, feedback_context)` → `boosted`
- Call `log_to_history(original, boosted, domain)`
- Build and return the terminal display string (see Section 4.2.1 below)
- Return as `[TextContent(type="text", text=output)]`

**Main block:**
```python
if __name__ == "__main__":
    asyncio.run(stdio_server(app))
```

#### 4.2.1 Terminal Display Format

The output string must look exactly like this:

```
╔══════════════════════════════════════════════════╗
║              ⚡ CLAUDEBOOST                      ║
╚══════════════════════════════════════════════════╝

🔵 ORIGINAL PROMPT
──────────────────
{original}

✨ BOOSTED PROMPT  [Domain: {domain}]
──────────────────────────────────────
{boosted}

──────────────────────────────────────────────────
Reply YES to use the boosted prompt, or NO to keep your original.
View history and rate boosts at: https://claudeboost.vercel.app
```

Use an f-string. Replace `{original}`, `{boosted}`, and `{domain}` with actual values.

---

### 4.3 `classifier.py` — Domain Classifier

**Purpose:** Takes a prompt string, returns the domain as a lowercase string.

**Valid domains (exactly these 7 strings):**
```python
DOMAINS = [
    "data_science",
    "data_engineering",
    "business_analytics",
    "general_coding",
    "documentation",
    "devops",
    "other"
]
```

**`classify_domain(prompt: str) -> str` function:**
- Creates an `anthropic.Anthropic()` client
- Calls `client.messages.create()` with:
  - `model`: `"claude-opus-4-5"`
  - `max_tokens`: `20`
  - `system`: `"You are a domain classifier. Classify the user's prompt into exactly one of these domains: data_science, data_engineering, business_analytics, general_coding, documentation, devops, other. Reply with only the domain name. No punctuation, no explanation."`
  - `messages`: `[{"role": "user", "content": prompt}]`
- Strip and lowercase the response text
- If result is in DOMAINS, return it. Otherwise return `"other"`

---

### 4.4 `enhancer.py` — Prompt Enhancer

**Purpose:** Takes a prompt + domain + optional feedback context, returns the enhanced prompt string.

**Domain rules dictionary** — define `DOMAIN_RULES` as a Python dict:

```python
DOMAIN_RULES = {
    "data_science": (
        "Improve the prompt to specify: the type and shape of data, "
        "the expected output format (table, chart, summary), "
        "preferred statistical method or model, "
        "error handling requirements, "
        "and whether visualizations are needed."
    ),
    "data_engineering": (
        "Improve the prompt to specify: the pipeline stage (ingestion/transform/load), "
        "data volume and frequency, "
        "tools in the stack (e.g. dbt, Spark, Airflow, BigQuery), "
        "input and output schema, "
        "and idempotency or failure recovery requirements."
    ),
    "business_analytics": (
        "Improve the prompt to specify: exact metric definitions, "
        "time range for analysis, "
        "a comparison baseline or benchmark, "
        "segmentation dimensions (region, product, cohort), "
        "and preferred output format (markdown table, chart, executive summary)."
    ),
    "general_coding": (
        "Improve the prompt to specify: programming language and version, "
        "concrete input/output examples, "
        "edge cases to handle, "
        "performance or memory constraints, "
        "and whether tests or documentation are required."
    ),
    "documentation": (
        "Improve the prompt to specify: the target audience (junior dev, end user, exec), "
        "the output format (markdown, docstring, wiki, README), "
        "the tone (formal, conversational), "
        "and what to explicitly include or exclude."
    ),
    "devops": (
        "Improve the prompt to specify: the environment (dev, staging, prod), "
        "the toolchain (Docker, Kubernetes, Terraform, GitHub Actions), "
        "failure modes and rollback strategy, "
        "and security or compliance requirements."
    ),
    "other": (
        "Make the prompt significantly clearer and more specific. "
        "Add expected output format, define any ambiguous terms, "
        "and include any constraints or requirements."
    )
}
```

**`enhance_prompt(prompt: str, domain: str, feedback_context: str = "") -> str` function:**
- Creates an `anthropic.Anthropic()` client
- Gets rules from `DOMAIN_RULES.get(domain, DOMAIN_RULES["other"])`
- If `feedback_context` is non-empty, append to system prompt: `"\n\nUser feedback from previous boosts in this domain — apply these preferences: {feedback_context}"`
- Calls `client.messages.create()` with:
  - `model`: `"claude-opus-4-5"`
  - `max_tokens`: `600`
  - `system`: `f"You are a prompt enhancement expert for the domain: {domain}.\nRules: {rules}{feedback_instruction}\nRewrite the user's prompt to be significantly better. Return ONLY the improved prompt. No preamble, no explanation, no quotes around the result."`
  - `messages`: `[{"role": "user", "content": prompt}]`
- Return `response.content[0].text.strip()`

---

### 4.5 `feedback.py` — History and Config Manager

**Purpose:** All read/write operations to `~/.claudeboost/history.json` and `~/.claudeboost/config.json`.

**Constants:**
```python
import os, json
from datetime import datetime, timezone

CLAUDEBOOST_DIR = os.path.expanduser("~/.claudeboost")
HISTORY_FILE = os.path.join(CLAUDEBOOST_DIR, "history.json")
CONFIG_FILE = os.path.join(CLAUDEBOOST_DIR, "config.json")

DEFAULT_CONFIG = {
    "data_science": "",
    "data_engineering": "",
    "business_analytics": "",
    "general_coding": "",
    "documentation": "",
    "devops": "",
    "other": ""
}
```

**`ensure_files()` function:**
- Creates `CLAUDEBOOST_DIR` if it does not exist (`os.makedirs(..., exist_ok=True)`)
- If `HISTORY_FILE` does not exist, write `[]` to it
- If `CONFIG_FILE` does not exist, write `DEFAULT_CONFIG` to it

**`log_to_history(original: str, boosted: str, domain: str)` function:**
- Calls `ensure_files()`
- Reads current history JSON
- Appends a new entry dict with fields: `id` (len + 1), `timestamp` (UTC ISO string), `domain`, `original`, `boosted`, `chosen: None`, `rating: None`, `feedback: ""`
- Writes updated list back to `HISTORY_FILE` with `indent=2`

**`load_feedback_context(domain: str) -> str` function:**
- Calls `ensure_files()`
- Reads history JSON
- Filters entries where `domain` matches AND `feedback` is a non-empty string
- Takes the last 5 matching entries
- Also reads `CONFIG_FILE` and gets the constraint string for this domain
- Combines constraints + recent feedback into one string separated by ` | `
- Returns the combined string (empty string if nothing exists)

---

### 4.6 Registering with Claude Code

After building the MCP server, add this to `~/.claude/mcp_settings.json`:

```json
{
  "mcpServers": {
    "claudeboost": {
      "command": "python",
      "args": ["/absolute/path/to/claudeboost/mcp-server/server.py"]
    }
  }
}
```

Replace `/absolute/path/to/claudeboost` with the real path. Restart Claude Code after saving.

**To use the tool in Claude Code terminal:**
```
Use the boost_prompt tool on this prompt: write a SQL query to find monthly active users
```

---

## 5. Web Dashboard — Next.js + Tailwind

Bootstrap command:
```bash
npx create-next-app@latest web-dashboard --typescript --tailwind --app --no-src-dir
cd web-dashboard
npm install
```

Start dev server: `npm run dev` → runs at `https://claudeboost.vercel.app`

---

### 5.1 Shared Types

Define these types at the top of any file that needs them, or in a shared `types.ts` file:

```typescript
type HistoryEntry = {
  id: number;
  timestamp: string;
  domain: string;
  original: string;
  boosted: string;
  chosen: "boosted" | "original" | null;
  rating: number | null;
  feedback: string;
};

type Constraints = {
  data_science: string;
  data_engineering: string;
  business_analytics: string;
  general_coding: string;
  documentation: string;
  devops: string;
  other: string;
};
```

---

### 5.2 API Routes

#### `GET /api/history`
- File: `/app/api/history/route.ts`
- Reads `~/.claudeboost/history.json` using `fs.readFileSync`
- Parses JSON, reverses the array (newest first)
- Returns `NextResponse.json(data)`

#### `PATCH /api/history`
- File: `/app/api/history/route.ts` (same file, add export async function PATCH)
- Reads request body: `{ id, rating?, feedback?, chosen? }`
- Reads history file, finds entry by `id`
- Updates only the fields provided (check for `undefined` before updating)
- Writes updated array back to file
- Returns `NextResponse.json({ ok: true })`

#### `GET /api/constraints`
- File: `/app/api/constraints/route.ts`
- Reads `~/.claudeboost/config.json`
- Returns `NextResponse.json(data)`

#### `POST /api/constraints`
- File: `/app/api/constraints/route.ts`
- Reads request body: the full `Constraints` object
- Writes it to `~/.claudeboost/config.json` with `indent=2`
- Returns `NextResponse.json({ ok: true })`

**Important:** All API routes must import `fs` from `"fs"` and `path` from `"path"`. Use `process.env.HOME` to resolve the `~` path:
```typescript
const HISTORY_FILE = path.join(process.env.HOME!, ".claudeboost", "history.json");
const CONFIG_FILE = path.join(process.env.HOME!, ".claudeboost", "config.json");
```

---

### 5.3 `app/layout.tsx` — Root Layout

- Sets `<html lang="en">` and `<body>` with Tailwind base classes
- Renders a top navigation bar with:
  - Left: `⚡ ClaudeBoost` as the logo/brand (bold, large)
  - Right: three nav links — `History` (`/`), `Stats` (`/stats`), `Constraints` (`/constraints`)
- Wraps children in a `<main>` with `max-w-5xl mx-auto px-8 py-6`
- Uses `"use client"` only if needed for nav active state; otherwise server component is fine

---

### 5.4 `app/page.tsx` — History Page

This is the main page. It must be a Client Component (`"use client"`).

**State variables:**
- `history: HistoryEntry[]` — loaded from `GET /api/history`
- `expanded: number | null` — which entry is currently expanded (by id)

**On mount:** fetch `/api/history` and set `history`

**Stats bar** at the top — three cards side by side:
1. **Total Boosts** — `history.length`
2. **Avg Rating** — average of all non-null ratings, rounded to 1 decimal. Show `"—"` if no ratings yet.
3. **Most Used Domain** — the domain string that appears most often in history. Replace underscores with spaces, capitalize. Show `"—"` if empty.

**History list** below stats — map over `history` array, render one card per entry:

Each card has two states: **collapsed** and **expanded** (toggled by clicking).

**Collapsed state shows:**
- Domain badge (colored pill — see domain colors below)
- First 80 characters of `original` prompt (truncated with `...`)
- Star rating if `entry.rating` is not null
- Date formatted as `toLocaleDateString()`
- Chevron arrow indicating expand/collapse

**Expanded state additionally shows:**
- Side-by-side diff: left panel shows `original` with a blue header, right panel shows `boosted` with a purple header
- `FeedbackForm` component (see 5.4.1)

**Domain badge colors:**
```typescript
const DOMAIN_COLORS: Record<string, string> = {
  data_science: "bg-blue-100 text-blue-800",
  data_engineering: "bg-purple-100 text-purple-800",
  business_analytics: "bg-green-100 text-green-800",
  general_coding: "bg-yellow-100 text-yellow-800",
  documentation: "bg-orange-100 text-orange-800",
  devops: "bg-red-100 text-red-800",
  other: "bg-gray-100 text-gray-800"
};
```

#### 5.4.1 `FeedbackForm` Component

A sub-component rendered inside each expanded card. Can be defined in the same file or in `/components/FeedbackForm.tsx`.

**Props:**
```typescript
{
  entry: HistoryEntry;
  onSubmit: (id: number, rating: number, feedback: string) => void;
}
```

**Local state:** `rating: number` (initialized from `entry.rating || 0`), `feedback: string` (initialized from `entry.feedback || ""`)

**Renders:**
- Label: "Rate this boost"
- 5 star buttons — clicking star N sets `rating = N`. Stars at or below current rating are yellow (`text-yellow-400`), others are gray
- `<textarea>` with placeholder: `"What should be different next time? (e.g. always use Python, avoid verbose explanations)"`
- Submit button that calls `onSubmit(entry.id, rating, feedback)` — label: "Save Feedback"

**`onSubmit` in parent (`page.tsx`):** calls `PATCH /api/history` with `{ id, rating, feedback }`, then updates local `history` state to reflect the change.

---

### 5.5 `app/stats/page.tsx` — Stats Page

Client component. Fetches history on mount.

**Displays 4 evaluation metrics:**

**1. Boost Acceptance Rate**
- Formula: `(entries where chosen === "boosted") / (entries where chosen !== null) * 100`
- Display as a percentage bar with the number
- Label: "How often users chose the boosted version"

**2. Average Rating by Domain**
- For each domain that has at least one rating, compute average rating
- Display as a horizontal bar chart using plain Tailwind divs (no external chart library needed)
- Bar width = `(avg / 5) * 100%`
- Show domain name and numeric average next to each bar

**3. Feedback Coverage**
- Formula: `(entries with non-empty feedback string) / total entries * 100`
- Display as a percentage with a label: "Prompts with user feedback"

**4. Recent Activity**
- List the last 7 days, show how many boosts were done each day
- Simple table: Date | Count

---

### 5.6 `app/constraints/page.tsx` — Constraints Manager Page

Client component. Fetches constraints on mount from `GET /api/constraints`.

**State:** `constraints: Constraints` (the full config object), `saved: boolean` (shows a "Saved!" confirmation briefly after POST)

**Renders:**
- Page heading: "Domain Constraints"
- Subheading: "Set rules that ClaudeBoost will always apply when enhancing prompts in each domain."
- For each of the 7 domains, render one card containing:
  - Domain name as a label (replace underscores with spaces, capitalize first letter)
  - Domain color badge (same colors as history page)
  - `<textarea>` with the current constraint value for that domain
  - Placeholder: `"e.g. Always use Python. Never use pandas. Output as markdown table."`
  - `onChange` updates the local `constraints` state for that domain key
- One "Save All Constraints" button at the bottom
  - On click: POST the full `constraints` object to `/api/constraints`
  - Show a green "Saved!" message for 2 seconds, then hide it

---

## 6. Claude Code MCP Registration

After building, register the MCP server. Claude Code reads MCP config from `~/.claude/mcp_settings.json`.

The file should look like this:

```json
{
  "mcpServers": {
    "claudeboost": {
      "command": "python",
      "args": ["/absolute/path/to/claudeboost/mcp-server/server.py"]
    }
  }
}
```

**Steps:**
1. Find the absolute path of `server.py` on the machine
2. Add the above JSON to `~/.claude/mcp_settings.json` (create the file if it doesn't exist)
3. Restart Claude Code

**Testing the registration:**
In Claude Code, type: `What MCP tools are available?`
Claude Code should list `boost_prompt` as an available tool.

**Using the tool:**
```
Use the boost_prompt tool with this prompt: "build me an ETL pipeline"
```

---

## 7. Build Order for Claude Code

Follow this exact order to avoid import errors and missing dependencies:

1. Create the full folder structure
2. Write `requirements.txt` and run `pip install -r requirements.txt`
3. Write `feedback.py` (no imports from other custom files)
4. Write `classifier.py` (no imports from other custom files)
5. Write `enhancer.py` (no imports from other custom files)
6. Write `server.py` (imports from all three above)
7. Test MCP server: `python server.py` — should start without errors
8. Register MCP server with Claude Code and restart
9. Bootstrap Next.js web dashboard
10. Write API routes (`/api/history/route.ts`, `/api/constraints/route.ts`)
11. Write `app/layout.tsx`
12. Write `app/page.tsx` with `FeedbackForm`
13. Write `app/stats/page.tsx`
14. Write `app/constraints/page.tsx`
15. Run `npm run dev` and verify all pages load
16. End-to-end test: boost a prompt in Claude Code → check it appears in web dashboard → rate it → boost again in same domain → verify feedback was applied

---

## 8. Environment Variables

No `.env` file needed for MVP. The Anthropic API key is read from the environment automatically by the `anthropic` Python library. Make sure it is set:

```bash
export ANTHROPIC_API_KEY="sk-ant-..."
```

Add this to `~/.zshrc` or `~/.bashrc` so it persists across sessions.

---

## 9. Error Handling Requirements

Every file must handle these cases gracefully:

**In `feedback.py`:**
- If `history.json` is malformed, catch `json.JSONDecodeError` and reset the file to `[]`
- If `config.json` is malformed, reset to `DEFAULT_CONFIG`

**In `classifier.py`:**
- If the API call fails, catch the exception and return `"other"` (never crash the server)

**In `enhancer.py`:**
- If the API call fails, catch the exception and return the original prompt unchanged with a note appended: `"[ClaudeBoost: enhancement failed, original prompt returned]"`

**In Next.js API routes:**
- Wrap all `fs` operations in `try/catch`
- If the file doesn't exist, return an empty array or default config object rather than a 500 error
- All routes return proper HTTP status codes: 200 for success, 400 for bad input, 500 for server errors

---

## 10. What NOT to Build in MVP

Do not build these — they are explicitly out of scope for day one:

- User authentication or accounts
- Cloud sync or database (all storage is local JSON files)
- Real-time dashboard updates (polling or websockets)
- Multi-user support
- Prompt history search or filtering
- Billing or usage limits
- Mobile responsive design (desktop only is fine)
- Automated tests

---

## 11. Summary of All Functions

| File | Function | Input | Output |
|---|---|---|---|
| `server.py` | `list_tools()` | none | list of Tool objects |
| `server.py` | `call_tool()` | name, arguments | list of TextContent |
| `classifier.py` | `classify_domain()` | prompt: str | domain: str |
| `enhancer.py` | `enhance_prompt()` | prompt, domain, feedback_context | boosted: str |
| `feedback.py` | `ensure_files()` | none | none (side effect: creates files) |
| `feedback.py` | `log_to_history()` | original, boosted, domain | none (side effect: appends to JSON) |
| `feedback.py` | `load_feedback_context()` | domain: str | context string |

| Route | Method | Input | Output |
|---|---|---|---|
| `/api/history` | GET | none | HistoryEntry[] (reversed) |
| `/api/history` | PATCH | `{id, rating?, feedback?, chosen?}` | `{ok: true}` |
| `/api/constraints` | GET | none | Constraints object |
| `/api/constraints` | POST | Constraints object | `{ok: true}` |

---

*End of specification. Claude Code should now have everything needed to build ClaudeBoost from scratch.*
