-- =============================================
-- STORAGE SCHEMA - Quick Fix Script
-- =============================================
-- Run this on VPS to add storage schema to existing database

-- Create storage schema
CREATE SCHEMA IF NOT EXISTS storage;

-- Grant permissions
GRANT USAGE ON SCHEMA storage TO postgres, anon, authenticated, service_role;
GRANT ALL ON SCHEMA storage TO postgres, anon, authenticated, service_role;

-- Create buckets table
CREATE TABLE IF NOT EXISTS storage.buckets (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL UNIQUE,
    owner UUID,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    public BOOLEAN DEFAULT FALSE,
    avif_autodetection BOOLEAN DEFAULT FALSE,
    file_size_limit BIGINT,
    allowed_mime_types TEXT[]
);

-- Create objects table
CREATE TABLE IF NOT EXISTS storage.objects (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    bucket_id TEXT REFERENCES storage.buckets(id),
    name TEXT,
    owner UUID,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    last_accessed_at TIMESTAMPTZ DEFAULT NOW(),
    metadata JSONB,
    path_tokens TEXT[] GENERATED ALWAYS AS (string_to_array(name, '/')) STORED,
    version TEXT,
    UNIQUE(bucket_id, name)
);

-- Create migrations table
CREATE TABLE IF NOT EXISTS storage.migrations (
    id INTEGER PRIMARY KEY,
    name TEXT NOT NULL,
    hash TEXT NOT NULL,
    executed_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create get_size_by_bucket function
CREATE OR REPLACE FUNCTION storage.get_size_by_bucket()
RETURNS TABLE (
    size BIGINT,
    bucket_id TEXT
)
LANGUAGE sql
SECURITY DEFINER
AS $$
    SELECT 
        SUM(COALESCE(metadata->>'size', '0')::BIGINT) as size,
        bucket_id
    FROM storage.objects
    GROUP BY bucket_id;
$$;

-- Create search function
CREATE OR REPLACE FUNCTION storage.search(
    prefix TEXT,
    bucketname TEXT,
    limits INT DEFAULT 100,
    levels INT DEFAULT 1,
    offsets INT DEFAULT 0,
    search TEXT DEFAULT ''::TEXT,
    sortcolumn TEXT DEFAULT 'name'::TEXT,
    sortorder TEXT DEFAULT 'asc'::TEXT
)
RETURNS TABLE (
    name TEXT,
    id UUID,
    updated_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ,
    last_accessed_at TIMESTAMPTZ,
    metadata JSONB
)
LANGUAGE plpgsql
STABLE
AS $$
BEGIN
    RETURN QUERY
    SELECT 
        o.name,
        o.id,
        o.updated_at,
        o.created_at,
        o.last_accessed_at,
        o.metadata
    FROM storage.objects o
    WHERE o.bucket_id = bucketname
        AND (prefix = '' OR o.name LIKE prefix || '%')
        AND (search = '' OR o.name ILIKE '%' || search || '%')
    ORDER BY
        CASE WHEN sortcolumn = 'name' AND sortorder = 'asc' THEN o.name END ASC,
        CASE WHEN sortcolumn = 'name' AND sortorder = 'desc' THEN o.name END DESC,
        CASE WHEN sortcolumn = 'updated_at' AND sortorder = 'asc' THEN o.updated_at END ASC,
        CASE WHEN sortcolumn = 'updated_at' AND sortorder = 'desc' THEN o.updated_at END DESC
    LIMIT limits
    OFFSET offsets;
END;
$$;

-- Create helper functions
CREATE OR REPLACE FUNCTION storage.extension(name TEXT)
RETURNS TEXT
LANGUAGE plpgsql
IMMUTABLE
AS $$
DECLARE
    parts TEXT[];
BEGIN
    parts := string_to_array(name, '.');
    IF array_length(parts, 1) > 1 THEN
        RETURN lower(parts[array_length(parts, 1)]);
    END IF;
    RETURN '';
END;
$$;

CREATE OR REPLACE FUNCTION storage.filename(name TEXT)
RETURNS TEXT
LANGUAGE plpgsql
IMMUTABLE
AS $$
DECLARE
    parts TEXT[];
BEGIN
    parts := string_to_array(name, '/');
    RETURN parts[array_length(parts, 1)];
END;
$$;

CREATE OR REPLACE FUNCTION storage.foldername(name TEXT)
RETURNS TEXT[]
LANGUAGE plpgsql
IMMUTABLE
AS $$
DECLARE
    parts TEXT[];
BEGIN
    parts := string_to_array(name, '/');
    RETURN parts[1:array_length(parts, 1) - 1];
END;
$$;

-- Insert migration records to prevent auto-migration
INSERT INTO storage.migrations (id, name, hash) VALUES 
    (0, 'create-migrations-table', 'init'),
    (1, 'initialmigration', 'init'),
    (2, 'pathtoken-column', 'init'),
    (3, 'add-version-column', 'init'),
    (4, 'add-owner-column', 'init'),
    (5, 'change-column-name-in-get-size', 'init'),
    (6, 'add-metadata-column', 'init'),
    (7, 'add-path-tokens-column', 'init'),
    (8, 'add-owner-to-objects', 'init')
ON CONFLICT (id) DO NOTHING;

-- Insert logos bucket
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types) 
VALUES ('logos', 'logos', true, 5242880, ARRAY['image/png', 'image/jpeg', 'image/gif', 'image/webp'])
ON CONFLICT (id) DO NOTHING;

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_objects_bucket_id ON storage.objects(bucket_id);
CREATE INDEX IF NOT EXISTS idx_objects_name ON storage.objects(name);
CREATE INDEX IF NOT EXISTS idx_buckets_name ON storage.buckets(name);

-- Enable RLS
ALTER TABLE storage.buckets ENABLE ROW LEVEL SECURITY;
ALTER TABLE storage.objects ENABLE ROW LEVEL SECURITY;

-- Create policies
DROP POLICY IF EXISTS "Allow all access to buckets" ON storage.buckets;
CREATE POLICY "Allow all access to buckets" ON storage.buckets FOR ALL USING (true);

DROP POLICY IF EXISTS "Allow all access to objects" ON storage.objects;
CREATE POLICY "Allow all access to objects" ON storage.objects FOR ALL USING (true);

-- Grant permissions on all objects
GRANT ALL ON ALL TABLES IN SCHEMA storage TO postgres, anon, authenticated, service_role;
GRANT ALL ON ALL FUNCTIONS IN SCHEMA storage TO postgres, anon, authenticated, service_role;
GRANT ALL ON ALL SEQUENCES IN SCHEMA storage TO postgres, anon, authenticated, service_role;

-- Verify installation
SELECT 'Storage schema installed successfully!' as status;
SELECT * FROM storage.buckets;
