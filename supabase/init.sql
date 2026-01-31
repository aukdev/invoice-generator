-- =============================================
-- INVOICE GENERATOR DATABASE SCHEMA
-- =============================================
-- Clean, relational structure optimized for 
-- a professional invoice management system
-- =============================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- =============================================
-- SUPABASE REQUIRED ROLES
-- =============================================
DO $$
BEGIN
    IF NOT EXISTS (SELECT FROM pg_catalog.pg_roles WHERE rolname = 'anon') THEN
        CREATE ROLE anon NOLOGIN NOINHERIT;
    END IF;
    IF NOT EXISTS (SELECT FROM pg_catalog.pg_roles WHERE rolname = 'authenticated') THEN
        CREATE ROLE authenticated NOLOGIN NOINHERIT;
    END IF;
    IF NOT EXISTS (SELECT FROM pg_catalog.pg_roles WHERE rolname = 'service_role') THEN
        CREATE ROLE service_role NOLOGIN NOINHERIT BYPASSRLS;
    END IF;
    IF NOT EXISTS (SELECT FROM pg_catalog.pg_roles WHERE rolname = 'authenticator') THEN
        CREATE ROLE authenticator NOINHERIT LOGIN PASSWORD 'postgres';
    END IF;
END
$$;

-- Grant role memberships
GRANT anon TO authenticator;
GRANT authenticated TO authenticator;
GRANT service_role TO authenticator;
GRANT anon TO postgres;
GRANT authenticated TO postgres;
GRANT service_role TO postgres;

-- =============================================
-- TABLE: company_settings
-- Stores company profile information (single row per user)
-- =============================================
CREATE TABLE IF NOT EXISTS company_settings (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    company_name VARCHAR(255) NOT NULL,
    company_address TEXT,
    phone_number VARCHAR(50),
    logo_url TEXT,
    email VARCHAR(255),
    website VARCHAR(255),
    tax_id VARCHAR(100),
    -- Footer text for invoices
    footer_note TEXT DEFAULT 'Thank you for your business!',
    -- Currency settings
    currency_symbol VARCHAR(10) DEFAULT '$',
    currency_code VARCHAR(3) DEFAULT 'USD',
    -- Timestamps
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =============================================
-- TABLE: products
-- Master list of products/services
-- =============================================
CREATE TABLE IF NOT EXISTS products (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL,
    unit_price DECIMAL(12, 2) NOT NULL DEFAULT 0.00,
    description TEXT,
    -- For future use: product categories
    category VARCHAR(100),
    -- SKU or product code
    sku VARCHAR(50),
    -- Active/inactive status
    is_active BOOLEAN DEFAULT TRUE,
    -- Timestamps
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Index for faster product searches
CREATE INDEX IF NOT EXISTS idx_products_name ON products(name);
CREATE INDEX IF NOT EXISTS idx_products_active ON products(is_active);

-- =============================================
-- TABLE: customers
-- Customer information for quick selection
-- =============================================
CREATE TABLE IF NOT EXISTS customers (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL,
    address TEXT,
    phone VARCHAR(50),
    email VARCHAR(255),
    -- For quick access to frequent customers
    is_favorite BOOLEAN DEFAULT FALSE,
    -- Timestamps
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Index for customer search
CREATE INDEX IF NOT EXISTS idx_customers_name ON customers(name);

-- =============================================
-- TABLE: invoices
-- Invoice header information
-- =============================================
CREATE TABLE IF NOT EXISTS invoices (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    -- Invoice identification
    invoice_number VARCHAR(50) NOT NULL UNIQUE,
    order_number VARCHAR(100),
    invoice_date DATE NOT NULL DEFAULT CURRENT_DATE,
    due_date DATE,
    -- Customer information (denormalized for historical accuracy)
    customer_id UUID REFERENCES customers(id) ON DELETE SET NULL,
    customer_name VARCHAR(255) NOT NULL,
    customer_address TEXT,
    customer_phone VARCHAR(50),
    -- Company snapshot (in case settings change)
    company_name VARCHAR(255),
    company_address TEXT,
    company_phone VARCHAR(50),
    company_logo_url TEXT,
    -- Financials
    subtotal DECIMAL(12, 2) NOT NULL DEFAULT 0.00,
    delivery_fee DECIMAL(12, 2) DEFAULT 0.00,
    tax_amount DECIMAL(12, 2) DEFAULT 0.00,
    discount_amount DECIMAL(12, 2) DEFAULT 0.00,
    total_amount DECIMAL(12, 2) NOT NULL DEFAULT 0.00,
    -- Currency
    currency_symbol VARCHAR(10) DEFAULT '$',
    -- Status
    status VARCHAR(20) DEFAULT 'draft' CHECK (status IN ('draft', 'sent', 'paid', 'cancelled')),
    -- Notes
    notes TEXT,
    footer_note TEXT,
    -- Timestamps
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes for invoice queries
CREATE INDEX IF NOT EXISTS idx_invoices_number ON invoices(invoice_number);
CREATE INDEX IF NOT EXISTS idx_invoices_date ON invoices(invoice_date DESC);
CREATE INDEX IF NOT EXISTS idx_invoices_status ON invoices(status);
CREATE INDEX IF NOT EXISTS idx_invoices_customer ON invoices(customer_id);

-- =============================================
-- TABLE: invoice_items
-- Line items for each invoice
-- =============================================
CREATE TABLE IF NOT EXISTS invoice_items (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    invoice_id UUID NOT NULL REFERENCES invoices(id) ON DELETE CASCADE,
    product_id UUID REFERENCES products(id) ON DELETE SET NULL,
    -- Item details (denormalized for historical accuracy)
    item_name VARCHAR(255) NOT NULL,
    item_description TEXT,
    unit_price DECIMAL(12, 2) NOT NULL,
    quantity DECIMAL(10, 2) NOT NULL DEFAULT 1,
    -- Calculated total
    line_total DECIMAL(12, 2) NOT NULL,
    -- Order of items in invoice
    sort_order INTEGER DEFAULT 0,
    -- Timestamps
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Index for invoice item retrieval
CREATE INDEX IF NOT EXISTS idx_invoice_items_invoice ON invoice_items(invoice_id);

-- =============================================
-- TABLE: invoice_counter
-- Auto-increment invoice numbers
-- =============================================
CREATE TABLE IF NOT EXISTS invoice_counter (
    id INTEGER PRIMARY KEY DEFAULT 1,
    prefix VARCHAR(10) DEFAULT 'INV',
    current_number INTEGER DEFAULT 0,
    year INTEGER DEFAULT EXTRACT(YEAR FROM CURRENT_DATE)
);

-- Initialize counter
INSERT INTO invoice_counter (id, prefix, current_number, year) 
VALUES (1, 'INV', 0, EXTRACT(YEAR FROM CURRENT_DATE))
ON CONFLICT (id) DO NOTHING;

-- =============================================
-- FUNCTION: Generate next invoice number
-- =============================================
CREATE OR REPLACE FUNCTION generate_invoice_number()
RETURNS VARCHAR(50) AS $$
DECLARE
    new_number INTEGER;
    current_year INTEGER;
    prefix_val VARCHAR(10);
    result VARCHAR(50);
BEGIN
    current_year := EXTRACT(YEAR FROM CURRENT_DATE);
    
    -- Reset counter if new year
    UPDATE invoice_counter 
    SET current_number = 0, year = current_year 
    WHERE id = 1 AND year < current_year;
    
    -- Increment and get new number
    UPDATE invoice_counter 
    SET current_number = current_number + 1 
    WHERE id = 1 
    RETURNING current_number, prefix INTO new_number, prefix_val;
    
    -- Format: INV-2026-00001
    result := prefix_val || '-' || current_year || '-' || LPAD(new_number::TEXT, 5, '0');
    
    RETURN result;
END;
$$ LANGUAGE plpgsql;

-- =============================================
-- FUNCTION: Update timestamp trigger
-- =============================================
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply update triggers
CREATE TRIGGER update_company_settings_updated_at
    BEFORE UPDATE ON company_settings
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_products_updated_at
    BEFORE UPDATE ON products
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_customers_updated_at
    BEFORE UPDATE ON customers
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_invoices_updated_at
    BEFORE UPDATE ON invoices
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- =============================================
-- SEED DATA: Sample company settings
-- =============================================
INSERT INTO company_settings (
    company_name, 
    company_address, 
    phone_number,
    footer_note,
    currency_symbol
) VALUES (
    'Your Business Name',
    '123 Business Street\nCity, State 12345\nCountry',
    '+1 (555) 123-4567',
    'Thank you for your business!',
    '$'
) ON CONFLICT DO NOTHING;

-- =============================================
-- SEED DATA: Sample products
-- =============================================
INSERT INTO products (name, unit_price, description) VALUES
    ('Product A', 29.99, 'Premium quality product'),
    ('Product B', 49.99, 'Best seller item'),
    ('Service Fee', 15.00, 'Standard service charge'),
    ('Consultation', 75.00, 'One hour consultation')
ON CONFLICT DO NOTHING;

-- =============================================
-- ROW LEVEL SECURITY (for future auth)
-- =============================================
-- Enable RLS on all tables
ALTER TABLE company_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
ALTER TABLE customers ENABLE ROW LEVEL SECURITY;
ALTER TABLE invoices ENABLE ROW LEVEL SECURITY;
ALTER TABLE invoice_items ENABLE ROW LEVEL SECURITY;

-- Create policies for public access (for development)
-- In production, replace with proper user-based policies
CREATE POLICY "Allow all access to company_settings" ON company_settings FOR ALL USING (true);
CREATE POLICY "Allow all access to products" ON products FOR ALL USING (true);
CREATE POLICY "Allow all access to customers" ON customers FOR ALL USING (true);
CREATE POLICY "Allow all access to invoices" ON invoices FOR ALL USING (true);
CREATE POLICY "Allow all access to invoice_items" ON invoice_items FOR ALL USING (true);

-- =============================================
-- GRANT PERMISSIONS TO ROLES
-- =============================================
GRANT USAGE ON SCHEMA public TO anon, authenticated, service_role;
GRANT ALL ON ALL TABLES IN SCHEMA public TO anon, authenticated, service_role;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO anon, authenticated, service_role;
GRANT ALL ON ALL FUNCTIONS IN SCHEMA public TO anon, authenticated, service_role;

-- =============================================
-- STORAGE SCHEMA for Supabase Storage
-- =============================================
-- Create storage schema if not exists (required for self-hosted Supabase)
CREATE SCHEMA IF NOT EXISTS storage;

-- Grant permissions on storage schema first
GRANT USAGE ON SCHEMA storage TO postgres, anon, authenticated, service_role;
GRANT ALL ON ALL TABLES IN SCHEMA storage TO postgres, anon, authenticated, service_role;
GRANT ALL ON ALL SEQUENCES IN SCHEMA storage TO postgres, anon, authenticated, service_role;
GRANT ALL ON ALL ROUTINES IN SCHEMA storage TO postgres, anon, authenticated, service_role;

-- Create buckets table with all required columns for Supabase Storage API
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

-- Create objects table with all required columns
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

-- Create migrations table (required by Supabase Storage to track schema version)
CREATE TABLE IF NOT EXISTS storage.migrations (
    id INTEGER PRIMARY KEY,
    name TEXT NOT NULL,
    hash TEXT NOT NULL,
    executed_at TIMESTAMPTZ DEFAULT NOW()
);

-- Required storage functions for Supabase Storage API
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
        CASE WHEN sortcolumn = 'updated_at' AND sortorder = 'desc' THEN o.updated_at END DESC,
        CASE WHEN sortcolumn = 'created_at' AND sortorder = 'asc' THEN o.created_at END ASC,
        CASE WHEN sortcolumn = 'created_at' AND sortorder = 'desc' THEN o.created_at END DESC,
        CASE WHEN sortcolumn = 'last_accessed_at' AND sortorder = 'asc' THEN o.last_accessed_at END ASC,
        CASE WHEN sortcolumn = 'last_accessed_at' AND sortorder = 'desc' THEN o.last_accessed_at END DESC
    LIMIT limits
    OFFSET offsets;
END;
$$;

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

-- Insert migration records to prevent auto-migration attempts
INSERT INTO storage.migrations (id, name, hash) VALUES 
    (0, 'create-migrations-table', 'init'),
    (1, 'initialmigration', 'init'),
    (2, 'pathtoken-column', 'init'),
    (3, 'add-version-column', 'init'),
    (4, 'add-owner-column', 'init'),
    (5, 'change-column-name-in-get-size', 'init'),
    (6, 'add-metadata-column', 'init')
ON CONFLICT (id) DO NOTHING;

-- Insert logos bucket with proper configuration
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types) 
VALUES ('logos', 'logos', true, 5242880, ARRAY['image/png', 'image/jpeg', 'image/gif', 'image/webp'])
ON CONFLICT (id) DO NOTHING;

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_objects_bucket_id ON storage.objects(bucket_id);
CREATE INDEX IF NOT EXISTS idx_objects_name ON storage.objects(name);
CREATE INDEX IF NOT EXISTS idx_buckets_name ON storage.buckets(name);

-- Enable RLS on storage tables
ALTER TABLE storage.buckets ENABLE ROW LEVEL SECURITY;
ALTER TABLE storage.objects ENABLE ROW LEVEL SECURITY;

-- Create storage policies (allow all for development)
DROP POLICY IF EXISTS "Allow all access to buckets" ON storage.buckets;
CREATE POLICY "Allow all access to buckets" ON storage.buckets FOR ALL USING (true);

DROP POLICY IF EXISTS "Allow all access to objects" ON storage.objects;
CREATE POLICY "Allow all access to objects" ON storage.objects FOR ALL USING (true);

-- Re-grant permissions after creating functions
GRANT ALL ON ALL TABLES IN SCHEMA storage TO postgres, anon, authenticated, service_role;
GRANT ALL ON ALL FUNCTIONS IN SCHEMA storage TO postgres, anon, authenticated, service_role;

