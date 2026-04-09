-- ClaudeBoost Enterprise Schema v4 — Prompt Registry
-- Run AFTER v2 + v3 + fix-rls schemas.

-- ═══════════════════════════════════════════════════════════════════════
-- 1. Prompt Registry (main table)
-- ═══════════════════════════════════════════════════════════════════════

CREATE TABLE IF NOT EXISTS prompt_registry (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  type TEXT NOT NULL CHECK (type IN ('boost', 'template', 'constraint')),
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  domain TEXT,  -- optional domain tag
  tags TEXT[] DEFAULT '{}',
  variables TEXT[] DEFAULT '{}',  -- extracted {{variable}} names for templates
  created_by UUID NOT NULL REFERENCES auth.users(id),
  updated_by UUID NOT NULL REFERENCES auth.users(id),
  is_public BOOLEAN DEFAULT true,
  version INTEGER DEFAULT 1,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_prompt_registry_org ON prompt_registry(org_id);
CREATE INDEX IF NOT EXISTS idx_prompt_registry_org_type ON prompt_registry(org_id, type);
CREATE INDEX IF NOT EXISTS idx_prompt_registry_org_domain ON prompt_registry(org_id, domain);
CREATE INDEX IF NOT EXISTS idx_prompt_registry_search ON prompt_registry USING gin(to_tsvector('english', title || ' ' || content));

-- ═══════════════════════════════════════════════════════════════════════
-- 2. Prompt Versions (git-like commit history)
-- ═══════════════════════════════════════════════════════════════════════

CREATE TABLE IF NOT EXISTS prompt_versions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  prompt_id UUID NOT NULL REFERENCES prompt_registry(id) ON DELETE CASCADE,
  version INTEGER NOT NULL,
  content TEXT NOT NULL,
  change_summary TEXT,  -- like a commit message
  changed_by UUID NOT NULL REFERENCES auth.users(id),
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(prompt_id, version)
);

CREATE INDEX IF NOT EXISTS idx_prompt_versions_prompt ON prompt_versions(prompt_id, version DESC);

-- ═══════════════════════════════════════════════════════════════════════
-- 3. RLS (using existing get_user_org_ids helper)
-- ═══════════════════════════════════════════════════════════════════════

ALTER TABLE prompt_registry ENABLE ROW LEVEL SECURITY;
ALTER TABLE prompt_versions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "members_read_prompts" ON prompt_registry FOR SELECT
  USING (org_id IN (SELECT get_user_org_ids()));

CREATE POLICY "members_manage_prompts" ON prompt_registry FOR ALL
  USING (org_id IN (SELECT get_user_org_ids()));

CREATE POLICY "members_read_versions" ON prompt_versions FOR SELECT
  USING (prompt_id IN (SELECT id FROM prompt_registry WHERE org_id IN (SELECT get_user_org_ids())));

CREATE POLICY "members_insert_versions" ON prompt_versions FOR INSERT
  WITH CHECK (prompt_id IN (SELECT id FROM prompt_registry WHERE org_id IN (SELECT get_user_org_ids())));
