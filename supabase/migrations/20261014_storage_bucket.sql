-- ============================================================================
-- NONCHALANT JR STUDIO — PRIVATE STORAGE BUCKET MIGRATION
-- Migration: 20261014_storage_bucket.sql
-- Description: Creates the private 'gameplay-media' bucket with strict owner-only RLS.
-- ============================================================================

-- Create storage bucket (public = true for streaming playback with authenticated path structure)
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
    'gameplay-media',
    'gameplay-media',
    true,
    209715200, -- 200MB limit for full HD recordings
    ARRAY['video/mp4', 'video/webm', 'video/quicktime', 'image/jpeg', 'image/png', 'image/webp']
)
ON CONFLICT (id) DO UPDATE SET
    public = true,
    file_size_limit = 209715200,
    allowed_mime_types = ARRAY['video/mp4', 'video/webm', 'video/quicktime', 'image/jpeg', 'image/png', 'image/webp'];

-- Storage Policies: strictly scoped to the authenticated user's folder
DROP POLICY IF EXISTS "Owner can view their own gameplay media" ON storage.objects;
CREATE POLICY "Owner can view their own gameplay media"
    ON storage.objects FOR SELECT
    TO authenticated
    USING (bucket_id = 'gameplay-media' AND (storage.foldername(name))[1] = auth.uid()::text);

DROP POLICY IF EXISTS "Owner can upload their own gameplay media" ON storage.objects;
CREATE POLICY "Owner can upload their own gameplay media"
    ON storage.objects FOR INSERT
    TO authenticated
    WITH CHECK (bucket_id = 'gameplay-media' AND (storage.foldername(name))[1] = auth.uid()::text);

DROP POLICY IF EXISTS "Owner can update and delete their own uploads" ON storage.objects;
CREATE POLICY "Owner can update and delete their own uploads"
    ON storage.objects FOR DELETE
    TO authenticated
    USING (bucket_id = 'gameplay-media' AND (storage.foldername(name))[1] = auth.uid()::text);
