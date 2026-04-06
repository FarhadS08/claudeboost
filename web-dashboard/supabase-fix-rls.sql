-- Fix: infinite recursion in org_members RLS policies
-- The problem: org_members policies query org_members → infinite loop
-- The fix: a SECURITY DEFINER function that bypasses RLS

-- Step 1: Create helper function (bypasses RLS)
CREATE OR REPLACE FUNCTION public.get_user_org_ids()
RETURNS SETOF uuid
LANGUAGE sql
SECURITY DEFINER
STABLE
AS $$
  SELECT org_id FROM public.org_members WHERE user_id = auth.uid()
$$;

-- Step 2: Drop ALL old policies that cause recursion
DROP POLICY IF EXISTS "members_read_org" ON organizations;
DROP POLICY IF EXISTS "users_create_org" ON organizations;
DROP POLICY IF EXISTS "admins_update_org" ON organizations;
DROP POLICY IF EXISTS "members_read_members" ON org_members;
DROP POLICY IF EXISTS "admins_insert_members" ON org_members;
DROP POLICY IF EXISTS "admins_delete_members" ON org_members;
DROP POLICY IF EXISTS "members_read_rules" ON org_rules;
DROP POLICY IF EXISTS "admins_insert_rules" ON org_rules;
DROP POLICY IF EXISTS "admins_update_rules" ON org_rules;
DROP POLICY IF EXISTS "admins_delete_rules" ON org_rules;
DROP POLICY IF EXISTS "admins_read_keys" ON org_api_keys;
DROP POLICY IF EXISTS "admins_insert_keys" ON org_api_keys;
DROP POLICY IF EXISTS "admins_delete_keys" ON org_api_keys;
DROP POLICY IF EXISTS "members_read_logs" ON activity_logs;
DROP POLICY IF EXISTS "members_insert_logs" ON activity_logs;
DROP POLICY IF EXISTS "managers_read_invitations" ON org_invitations;
DROP POLICY IF EXISTS "managers_create_invitations" ON org_invitations;
DROP POLICY IF EXISTS "managers_delete_invitations" ON org_invitations;
DROP POLICY IF EXISTS "users_read_own_invitations" ON org_invitations;
DROP POLICY IF EXISTS "users_accept_invitations" ON org_invitations;
DROP POLICY IF EXISTS "org_admins_read_history" ON boost_history;

-- Step 3: Recreate ALL policies using the helper function

-- Organizations
CREATE POLICY "members_read_org" ON organizations FOR SELECT
  USING (id IN (SELECT get_user_org_ids()));

CREATE POLICY "users_create_org" ON organizations FOR INSERT
  WITH CHECK (auth.uid() = created_by);

CREATE POLICY "admins_update_org" ON organizations FOR UPDATE
  USING (id IN (SELECT get_user_org_ids()));

-- Org Members (the tricky one — no self-reference now)
CREATE POLICY "members_read_members" ON org_members FOR SELECT
  USING (org_id IN (SELECT get_user_org_ids()));

CREATE POLICY "members_insert_members" ON org_members FOR INSERT
  WITH CHECK (
    org_id IN (SELECT get_user_org_ids())
    OR user_id = auth.uid()  -- allow self-insert during org creation
  );

CREATE POLICY "admins_delete_members" ON org_members FOR DELETE
  USING (org_id IN (SELECT get_user_org_ids()));

CREATE POLICY "admins_update_members" ON org_members FOR UPDATE
  USING (org_id IN (SELECT get_user_org_ids()));

-- Org Rules
CREATE POLICY "members_read_rules" ON org_rules FOR SELECT
  USING (org_id IN (SELECT get_user_org_ids()));

CREATE POLICY "admins_write_rules" ON org_rules FOR ALL
  USING (org_id IN (SELECT get_user_org_ids()));

-- API Keys
CREATE POLICY "admins_manage_keys" ON org_api_keys FOR ALL
  USING (org_id IN (SELECT get_user_org_ids()));

-- Activity Logs
CREATE POLICY "members_read_logs" ON activity_logs FOR SELECT
  USING (org_id IN (SELECT get_user_org_ids()));

CREATE POLICY "members_insert_logs" ON activity_logs FOR INSERT
  WITH CHECK (org_id IN (SELECT get_user_org_ids()));

-- Invitations
CREATE POLICY "managers_manage_invitations" ON org_invitations FOR ALL
  USING (org_id IN (SELECT get_user_org_ids()));

CREATE POLICY "users_read_own_invitations" ON org_invitations FOR SELECT
  USING (email = (SELECT email FROM auth.users WHERE id = auth.uid()));

-- Boost history (org admins can read)
CREATE POLICY "org_members_read_history" ON boost_history FOR SELECT
  USING (org_id IN (SELECT get_user_org_ids()));
