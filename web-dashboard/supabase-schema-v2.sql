-- ClaudeBoost Enterprise Schema v2
-- Run this in Supabase SQL Editor

-- ═══════════════════════════════════════════════════════════════════════
-- 1. Organizations
-- ═══════════════════════════════════════════════════════════════════════

CREATE TABLE IF NOT EXISTS organizations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  created_by UUID NOT NULL REFERENCES auth.users(id),
  anthropic_api_key TEXT,  -- stored server-side only
  boost_level TEXT DEFAULT 'medium' CHECK (boost_level IN ('light', 'medium', 'full')),
  max_seats INTEGER DEFAULT 50,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_organizations_slug ON organizations(slug);

-- ═══════════════════════════════════════════════════════════════════════
-- 2. Org Members
-- ═══════════════════════════════════════════════════════════════════════

CREATE TABLE IF NOT EXISTS org_members (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role TEXT NOT NULL DEFAULT 'member' CHECK (role IN ('admin', 'member')),
  joined_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(org_id, user_id)
);

CREATE INDEX IF NOT EXISTS idx_org_members_org ON org_members(org_id);
CREATE INDEX IF NOT EXISTS idx_org_members_user ON org_members(user_id);

-- ═══════════════════════════════════════════════════════════════════════
-- 3. Org Rules (structured text per domain)
-- ═══════════════════════════════════════════════════════════════════════

CREATE TABLE IF NOT EXISTS org_rules (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  domain TEXT NOT NULL,  -- '_global', 'data_science', 'general_coding', etc.
  rule_text TEXT NOT NULL DEFAULT '',
  enabled BOOLEAN DEFAULT true,
  updated_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(org_id, domain)
);

CREATE INDEX IF NOT EXISTS idx_org_rules_org_domain ON org_rules(org_id, domain);

-- ═══════════════════════════════════════════════════════════════════════
-- 4. API Keys for .mcp.json auth
-- ═══════════════════════════════════════════════════════════════════════

CREATE TABLE IF NOT EXISTS org_api_keys (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  key_hash TEXT NOT NULL,
  key_prefix TEXT NOT NULL,
  created_by UUID NOT NULL REFERENCES auth.users(id),
  last_used_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_org_api_keys_hash ON org_api_keys(key_hash);

-- ═══════════════════════════════════════════════════════════════════════
-- 5. Add org_id to existing boost_history
-- ═══════════════════════════════════════════════════════════════════════

ALTER TABLE boost_history ADD COLUMN IF NOT EXISTS org_id UUID REFERENCES organizations(id);
CREATE INDEX IF NOT EXISTS idx_boost_history_org ON boost_history(org_id);

-- ═══════════════════════════════════════════════════════════════════════
-- 6. Row Level Security
-- ═══════════════════════════════════════════════════════════════════════

ALTER TABLE organizations ENABLE ROW LEVEL SECURITY;
ALTER TABLE org_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE org_rules ENABLE ROW LEVEL SECURITY;
ALTER TABLE org_api_keys ENABLE ROW LEVEL SECURITY;

-- Organizations: members can read, admins can update, anyone can create
CREATE POLICY "members_read_org" ON organizations FOR SELECT
  USING (id IN (SELECT org_id FROM org_members WHERE user_id = auth.uid()));

CREATE POLICY "users_create_org" ON organizations FOR INSERT
  WITH CHECK (auth.uid() = created_by);

CREATE POLICY "admins_update_org" ON organizations FOR UPDATE
  USING (id IN (SELECT org_id FROM org_members WHERE user_id = auth.uid() AND role = 'admin'));

-- Org Members
CREATE POLICY "members_read_members" ON org_members FOR SELECT
  USING (org_id IN (SELECT org_id FROM org_members WHERE user_id = auth.uid()));

CREATE POLICY "admins_insert_members" ON org_members FOR INSERT
  WITH CHECK (
    org_id IN (SELECT org_id FROM org_members WHERE user_id = auth.uid() AND role = 'admin')
    OR user_id = auth.uid()  -- allow self-insert during org creation
  );

CREATE POLICY "admins_delete_members" ON org_members FOR DELETE
  USING (org_id IN (SELECT org_id FROM org_members WHERE user_id = auth.uid() AND role = 'admin'));

-- Org Rules: members read, admins write
CREATE POLICY "members_read_rules" ON org_rules FOR SELECT
  USING (org_id IN (SELECT org_id FROM org_members WHERE user_id = auth.uid()));

CREATE POLICY "admins_insert_rules" ON org_rules FOR INSERT
  WITH CHECK (org_id IN (SELECT org_id FROM org_members WHERE user_id = auth.uid() AND role = 'admin'));

CREATE POLICY "admins_update_rules" ON org_rules FOR UPDATE
  USING (org_id IN (SELECT org_id FROM org_members WHERE user_id = auth.uid() AND role = 'admin'));

CREATE POLICY "admins_delete_rules" ON org_rules FOR DELETE
  USING (org_id IN (SELECT org_id FROM org_members WHERE user_id = auth.uid() AND role = 'admin'));

-- API Keys: admins only
CREATE POLICY "admins_read_keys" ON org_api_keys FOR SELECT
  USING (org_id IN (SELECT org_id FROM org_members WHERE user_id = auth.uid() AND role = 'admin'));

CREATE POLICY "admins_insert_keys" ON org_api_keys FOR INSERT
  WITH CHECK (org_id IN (SELECT org_id FROM org_members WHERE user_id = auth.uid() AND role = 'admin'));

CREATE POLICY "admins_delete_keys" ON org_api_keys FOR DELETE
  USING (org_id IN (SELECT org_id FROM org_members WHERE user_id = auth.uid() AND role = 'admin'));

-- Org admins can view org boost history
CREATE POLICY "org_admins_read_history" ON boost_history FOR SELECT
  USING (
    org_id IN (SELECT org_id FROM org_members WHERE user_id = auth.uid() AND role = 'admin')
  );

-- MCP endpoint can insert boost history (using service role, bypasses RLS)
-- No additional policy needed — service role key bypasses all RLS
