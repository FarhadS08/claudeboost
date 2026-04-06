-- ClaudeBoost Enterprise Schema v3 — Team Workspace
-- Run AFTER v2 schema. Adds invitations, activity logs, updated roles.

-- ═══════════════════════════════════════════════════════════════════════
-- 1. Update org_members role to include 'manager'
-- ═══════════════════════════════════════════════════════════════════════

ALTER TABLE org_members DROP CONSTRAINT IF EXISTS org_members_role_check;
ALTER TABLE org_members ADD CONSTRAINT org_members_role_check
  CHECK (role IN ('admin', 'manager', 'member'));

-- ═══════════════════════════════════════════════════════════════════════
-- 2. Invitations
-- ═══════════════════════════════════════════════════════════════════════

CREATE TABLE IF NOT EXISTS org_invitations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  role TEXT NOT NULL DEFAULT 'member' CHECK (role IN ('admin', 'manager', 'member')),
  invite_code TEXT UNIQUE NOT NULL,
  invited_by UUID NOT NULL REFERENCES auth.users(id),
  accepted_by UUID REFERENCES auth.users(id),
  accepted_at TIMESTAMPTZ,
  expires_at TIMESTAMPTZ DEFAULT now() + interval '7 days',
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_org_invitations_code ON org_invitations(invite_code);
CREATE INDEX IF NOT EXISTS idx_org_invitations_email ON org_invitations(email);
CREATE INDEX IF NOT EXISTS idx_org_invitations_org ON org_invitations(org_id);

ALTER TABLE org_invitations ENABLE ROW LEVEL SECURITY;

-- Admins/managers can manage invitations
CREATE POLICY "managers_read_invitations" ON org_invitations FOR SELECT
  USING (org_id IN (SELECT org_id FROM org_members WHERE user_id = auth.uid() AND role IN ('admin', 'manager')));

CREATE POLICY "managers_create_invitations" ON org_invitations FOR INSERT
  WITH CHECK (org_id IN (SELECT org_id FROM org_members WHERE user_id = auth.uid() AND role IN ('admin', 'manager')));

CREATE POLICY "managers_delete_invitations" ON org_invitations FOR DELETE
  USING (org_id IN (SELECT org_id FROM org_members WHERE user_id = auth.uid() AND role IN ('admin', 'manager')));

-- Anyone can read their own invitation by email (for accept flow)
CREATE POLICY "users_read_own_invitations" ON org_invitations FOR SELECT
  USING (email = (SELECT email FROM auth.users WHERE id = auth.uid()));

-- Allow update for accepting (service role handles this, but just in case)
CREATE POLICY "users_accept_invitations" ON org_invitations FOR UPDATE
  USING (email = (SELECT email FROM auth.users WHERE id = auth.uid()));

-- ═══════════════════════════════════════════════════════════════════════
-- 3. Activity Logs
-- ═══════════════════════════════════════════════════════════════════════

CREATE TABLE IF NOT EXISTS activity_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id),
  action TEXT NOT NULL,  -- 'boost', 'invite_sent', 'invite_accepted', 'rule_updated', 'settings_changed', 'member_removed', 'api_key_generated'
  details JSONB DEFAULT '{}',  -- action-specific metadata
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_activity_logs_org ON activity_logs(org_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_activity_logs_user ON activity_logs(user_id);

ALTER TABLE activity_logs ENABLE ROW LEVEL SECURITY;

-- Members can read their org's logs
CREATE POLICY "members_read_logs" ON activity_logs FOR SELECT
  USING (org_id IN (SELECT org_id FROM org_members WHERE user_id = auth.uid()));

-- Insert via service role (MCP endpoint) or by members
CREATE POLICY "members_insert_logs" ON activity_logs FOR INSERT
  WITH CHECK (org_id IN (SELECT org_id FROM org_members WHERE user_id = auth.uid()));

-- ═══════════════════════════════════════════════════════════════════════
-- 4. Add display_name to profiles if not exists
-- ═══════════════════════════════════════════════════════════════════════

ALTER TABLE profiles ADD COLUMN IF NOT EXISTS avatar_url TEXT;
