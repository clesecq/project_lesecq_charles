-- Migration: Add photo blob and photoMimeType columns to pollutions table
-- Date: 2026-01-15
-- Description: Adds support for storing uploaded photos as BLOB data

ALTER TABLE pollutions
ADD COLUMN photo BYTEA,
ADD COLUMN photo_mime_type VARCHAR(100);

-- Add comment to columns
COMMENT ON COLUMN pollutions.photo IS 'Uploaded photo stored as binary data';
COMMENT ON COLUMN pollutions.photo_mime_type IS 'MIME type of the uploaded photo (e.g., image/jpeg, image/png)';
