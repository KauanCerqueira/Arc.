-- Migration: Add MaxUses, CurrentUses and IsActive to workspace_invitations table
-- Date: 2025-01-23
-- Description: Adds support for link-based invites with usage limits

-- Add new columns to workspace_invitations
ALTER TABLE workspace_invitations
ADD COLUMN IF NOT EXISTS max_uses INTEGER NULL,
ADD COLUMN IF NOT EXISTS current_uses INTEGER NOT NULL DEFAULT 0,
ADD COLUMN IF NOT EXISTS is_active BOOLEAN NOT NULL DEFAULT TRUE;

-- Create index on is_active for faster queries
CREATE INDEX IF NOT EXISTS idx_workspace_invitations_is_active
ON workspace_invitations(is_active);
 
-- Update existing rows to have is_active = true
UPDATE workspace_invitations
SET is_active = TRUE
WHERE is_active IS NULL;

-- Add comment to columns
COMMENT ON COLUMN workspace_invitations.max_uses IS 'Maximum number of times this invite can be used. NULL means unlimited.';
COMMENT ON COLUMN workspace_invitations.current_uses IS 'Current number of times this invite has been used.';
COMMENT ON COLUMN workspace_invitations.is_active IS 'Whether this invitation is still active and can be used.';
