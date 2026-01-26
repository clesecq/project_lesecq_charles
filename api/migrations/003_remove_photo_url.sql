-- Migration: Remove photoUrl column from pollutions table
-- This column is being removed as we're using the photo blob instead

ALTER TABLE pollutions DROP COLUMN IF EXISTS "photoUrl";
