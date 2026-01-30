-- Migration 006: Multi-Tenant Schema Update
-- Created: 2026-01-30
-- Purpose: Add support for individual users (non-organization) and additional form fields

-- ============================================================================
-- Update Users Table
-- ============================================================================

-- Rename clerk_user_id to clerk_id for consistency
ALTER TABLE users RENAME COLUMN clerk_user_id TO clerk_id;
DROP INDEX IF EXISTS idx_users_clerk_id;
CREATE INDEX idx_users_clerk_id ON users(clerk_id);

-- Make organization_id nullable to support individual users
ALTER TABLE users ALTER COLUMN organization_id DROP NOT NULL;

-- Make name nullable (can be populated later)
ALTER TABLE users ALTER COLUMN name DROP NOT NULL;

-- Add tenant_type column (user vs organization)
ALTER TABLE users ADD COLUMN IF NOT EXISTS tenant_type TEXT NOT NULL DEFAULT 'organization';
ALTER TABLE users ADD CONSTRAINT chk_users_tenant_type CHECK (tenant_type IN ('user', 'organization'));
CREATE INDEX idx_users_tenant_type ON users(tenant_type);

-- ============================================================================
-- Update Forms Table
-- ============================================================================

-- Add user_id column for individual user forms
ALTER TABLE forms ADD COLUMN IF NOT EXISTS user_id UUID REFERENCES users(id) ON DELETE CASCADE;
CREATE INDEX idx_forms_user_id ON forms(user_id);

-- Rename organization_id to org_id for consistency
ALTER TABLE forms RENAME COLUMN organization_id TO org_id;
DROP INDEX IF EXISTS idx_forms_org_id;
CREATE INDEX idx_forms_org_id ON forms(org_id);

-- Make org_id nullable (either org_id or user_id must be set)
ALTER TABLE forms ALTER COLUMN org_id DROP NOT NULL;

-- Add tenant_type column
ALTER TABLE forms ADD COLUMN IF NOT EXISTS tenant_type TEXT NOT NULL DEFAULT 'organization';
ALTER TABLE forms ADD CONSTRAINT chk_forms_tenant_type CHECK (tenant_type IN ('user', 'organization'));
CREATE INDEX idx_forms_tenant_type ON forms(tenant_type);

-- Add slug column for URL-friendly form identifiers
ALTER TABLE forms ADD COLUMN IF NOT EXISTS slug TEXT;
CREATE INDEX idx_forms_slug ON forms(slug);

-- Rename name to title for clarity
ALTER TABLE forms RENAME COLUMN name TO title;

-- Add status column (replaces boolean is_active)
ALTER TABLE forms ADD COLUMN IF NOT EXISTS status TEXT NOT NULL DEFAULT 'draft';
ALTER TABLE forms ADD CONSTRAINT chk_forms_status CHECK (status IN ('draft', 'published', 'archived'));
CREATE INDEX idx_forms_status ON forms(status) WHERE deleted_at IS NULL;

-- Add stations column for form workflow stages
ALTER TABLE forms ADD COLUMN IF NOT EXISTS stations JSONB NOT NULL DEFAULT '[]';

-- Add settings column for form configuration
ALTER TABLE forms ADD COLUMN IF NOT EXISTS settings JSONB NOT NULL DEFAULT '{}';

-- Migrate is_active to status
UPDATE forms SET status = CASE
  WHEN is_active = true THEN 'published'
  WHEN is_active = false THEN 'draft'
  ELSE 'draft'
END
WHERE status = 'draft'; -- Only update rows that still have default status

-- Drop is_active column after migration
ALTER TABLE forms DROP COLUMN IF EXISTS is_active;
DROP INDEX IF EXISTS idx_forms_active;

-- Add constraint: either org_id or user_id must be set (but not both)
ALTER TABLE forms ADD CONSTRAINT chk_forms_tenant
  CHECK (
    (org_id IS NOT NULL AND user_id IS NULL) OR
    (org_id IS NULL AND user_id IS NOT NULL)
  );

-- ============================================================================
-- Update Submissions Table (align with forms tenant model)
-- ============================================================================

-- Rename organization_id to org_id
ALTER TABLE submissions RENAME COLUMN organization_id TO org_id;
DROP INDEX IF EXISTS idx_submissions_org_id;
CREATE INDEX idx_submissions_org_id ON submissions(org_id);

-- Make org_id nullable
ALTER TABLE submissions ALTER COLUMN org_id DROP NOT NULL;

-- Add user_id column for individual user submissions
ALTER TABLE submissions ADD COLUMN IF NOT EXISTS user_id UUID REFERENCES users(id) ON DELETE CASCADE;
CREATE INDEX idx_submissions_user_id_owner ON submissions(user_id);

-- Add tenant_type
ALTER TABLE submissions ADD COLUMN IF NOT EXISTS tenant_type TEXT NOT NULL DEFAULT 'organization';
ALTER TABLE submissions ADD CONSTRAINT chk_submissions_tenant_type CHECK (tenant_type IN ('user', 'organization'));

-- Add constraint: either org_id or user_id must be set
ALTER TABLE submissions ADD CONSTRAINT chk_submissions_tenant
  CHECK (
    (org_id IS NOT NULL AND user_id IS NULL) OR
    (org_id IS NULL AND user_id IS NOT NULL)
  );

-- ============================================================================
-- Update other tables to support nullable org_id
-- ============================================================================

-- Webhooks
ALTER TABLE webhooks RENAME COLUMN organization_id TO org_id;
DROP INDEX IF EXISTS idx_webhooks_org_id;
CREATE INDEX idx_webhooks_org_id ON webhooks(org_id);
ALTER TABLE webhooks ALTER COLUMN org_id DROP NOT NULL;
ALTER TABLE webhooks ADD COLUMN IF NOT EXISTS user_id UUID REFERENCES users(id) ON DELETE CASCADE;
CREATE INDEX idx_webhooks_user_id ON webhooks(user_id);

-- Files
ALTER TABLE files RENAME COLUMN organization_id TO org_id;
DROP INDEX IF EXISTS idx_files_org_id;
CREATE INDEX idx_files_org_id ON files(org_id);
ALTER TABLE files ALTER COLUMN org_id DROP NOT NULL;
ALTER TABLE files ADD COLUMN IF NOT EXISTS user_id UUID REFERENCES users(id) ON DELETE CASCADE;
CREATE INDEX idx_files_user_id ON files(user_id);

-- ============================================================================
-- Verification
-- ============================================================================
SELECT
  table_name,
  column_name,
  data_type,
  is_nullable
FROM information_schema.columns
WHERE table_schema = 'public'
  AND table_name IN ('users', 'forms', 'submissions')
  AND column_name IN ('clerk_id', 'tenant_type', 'user_id', 'org_id', 'slug', 'title', 'status', 'stations', 'settings')
ORDER BY table_name, column_name;
