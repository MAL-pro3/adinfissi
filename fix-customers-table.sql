-- Fix customers table to match TypeScript types
-- This script updates the customers table to include missing fields and correct types

-- First, drop the existing client_status type and create a new one with correct values
DROP TYPE IF EXISTS client_status CASCADE;
CREATE TYPE client_status AS ENUM (
  'PREVENTIVO_INIZIALE',
  'SOPRALLUOGO_PROGRAMMATO', 
  'PREVENTIVO_UFFICIALE',
  'CONTRATTO_FIRMATO',
  'ORDINE_INVIATO',
  'ORDINE_ARRIVATO',
  'CONSEGNATO'
);

-- Add missing columns to customers table
ALTER TABLE public.customers 
ADD COLUMN IF NOT EXISTS surname TEXT NOT NULL DEFAULT '',
ADD COLUMN IF NOT EXISTS is_active BOOLEAN DEFAULT true;

-- Update the status column to use the new enum type
ALTER TABLE public.customers 
ALTER COLUMN status TYPE client_status USING status::text::client_status;

-- Set default status
ALTER TABLE public.customers 
ALTER COLUMN status SET DEFAULT 'PREVENTIVO_INIZIALE';

-- Make name and surname NOT NULL
ALTER TABLE public.customers 
ALTER COLUMN name SET NOT NULL,
ALTER COLUMN surname SET NOT NULL;

-- Update existing records to have surname if empty
UPDATE public.customers 
SET surname = 'N/A' 
WHERE surname IS NULL OR surname = '';

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_customers_surname ON public.customers(surname);
CREATE INDEX IF NOT EXISTS idx_customers_is_active ON public.customers(is_active);
CREATE INDEX IF NOT EXISTS idx_customers_name_surname ON public.customers(name, surname);

-- Update RLS policies to include new fields
DROP POLICY IF EXISTS "Authenticated users can view customers" ON public.customers;
CREATE POLICY "Authenticated users can view customers" ON public.customers
  FOR SELECT USING (auth.role() = 'authenticated');

DROP POLICY IF EXISTS "Authenticated users can insert customers" ON public.customers;
CREATE POLICY "Authenticated users can insert customers" ON public.customers
  FOR INSERT WITH CHECK (auth.role() = 'authenticated');

DROP POLICY IF EXISTS "Authenticated users can update customers" ON public.customers;
CREATE POLICY "Authenticated users can update customers" ON public.customers
  FOR UPDATE USING (auth.role() = 'authenticated');

DROP POLICY IF EXISTS "Authenticated users can delete customers" ON public.customers;
CREATE POLICY "Authenticated users can delete customers" ON public.customers
  FOR DELETE USING (auth.role() = 'authenticated');

-- Enable RLS
ALTER TABLE public.customers ENABLE ROW LEVEL SECURITY;

RAISE NOTICE 'Customers table updated successfully with surname and is_active fields';