# ClaudeBoost Enterprise — Roadmap

## Core Platform (DONE)
- [x] User authentication (email/password via Supabase Auth)
- [x] Google OAuth (placeholder — button wired, needs Supabase provider config)
- [x] Microsoft OAuth (placeholder — button wired, needs Azure AD config)
- [x] Organization creation (name, slug, auto-admin)
- [x] Team invitations (email invite, invite code, accept flow at /join/[code])
- [x] Role-based access control (Admin, Manager, Member)
- [x] Org rules engine (per-domain + global rules, 8 domain tabs)
- [x] Activity logs (who did what, when — all actions logged)
- [x] Remote MCP server (Streamable HTTP at /mcp, JSON-RPC)
- [x] API key auth for MCP (SHA-256 hashed, .mcp.json zero-install)
- [x] Boost pipeline in TypeScript (classify → score → enhance → score → log)
- [x] Domain classifier (Claude Haiku, 7 domains)
- [x] Prompt scorer (6 dimensions, pure regex, no API)
- [x] Prompt enhancer (domain rules + org rules + level instructions)
- [x] Org overview dashboard (stats, setup guide, .mcp.json snippet)
- [x] Boost history page (search, domain filters, expandable before/after)
- [x] Stats page (score improvement, domain distribution, quality levels, daily activity, feedback coverage)
- [x] Members page (list, role management, invite modal, pending invites)
- [x] Settings page (org name, Anthropic API key, boost level)
- [x] Landing page (enterprise messaging)

---

## Phase 1: Workflow Automation (Main Value Driver)
- [ ] Workflow builder UI (step-based, then drag-and-drop)
- [ ] Steps: Input → Prompt → Model → Output → Action
- [ ] Input types: text, file upload (CSV, PDF), API input
- [ ] Output actions: save to database, send email, push to Slack
- [ ] Prebuilt templates (report generator, meeting summarizer)
- [ ] Scheduling workflows (run daily/weekly)
- [ ] Error handling and retry system
- [ ] Execution logs per workflow run

## Phase 2: Analytics Dashboard (Cost & Usage Control)
- [ ] Track token usage per user and per team
- [ ] Cost breakdown (daily, weekly, monthly)
- [ ] Most used prompts and workflows
- [ ] Model usage comparison (Claude vs GPT vs others)
- [ ] Alerts for high usage or budget limits
- [ ] Export reports (CSV/PDF)

## Phase 3: Multi-Model Support (Strategic Layer)
- [ ] Support multiple APIs (Claude, OpenAI GPT)
- [ ] Model selector in UI (choose per task)
- [ ] Auto model recommendation (cheap vs high quality)
- [ ] Fallback system (if one model fails, try another)
- [ ] Cost optimization routing (use cheaper model when possible)
- [ ] Compare outputs from multiple models side-by-side
- [ ] Central API abstraction layer in backend

## Phase 4: Integrations (Adoption Engine)
- [ ] Slack integration (send outputs to channels)
- [ ] Notion integration (write AI outputs to pages)
- [ ] Google Docs integration (generate/edit docs)
- [ ] Webhook support (connect to any system)
- [ ] CRM integrations (HubSpot, Salesforce basic)
- [ ] OAuth per integration
- [ ] Integrations settings page in dashboard

## Phase 5: Billing & Monetization
- [ ] Stripe integration for per-seat pricing
- [ ] Free tier vs paid tier feature gating
- [ ] Usage-based billing option
- [ ] Invoice generation
- [ ] Subscription management page

## Phase 6: Enterprise Security
- [ ] SSO / SAML authentication
- [ ] Audit log (immutable, exportable)
- [ ] Data retention policies
- [ ] IP allowlisting
- [ ] SOC 2 compliance prep

## Phase 7: Document Upload / RAG
- [ ] Upload PDF, markdown, text documents as org context
- [ ] Chunking + embedding pipeline
- [ ] Vector storage (pgvector in Supabase)
- [ ] Retrieval at boost-time (relevant chunks per prompt)
- [ ] Document management UI (upload, delete, preview)

## Phase 8: Shared Prompt Library
- [ ] Save prompts to org library (named, tagged, versioned)
- [ ] Browse/search prompt library
- [ ] Version history for prompts
- [ ] Project folders to organize workflows and outputs
- [ ] Fork and customize shared prompts
