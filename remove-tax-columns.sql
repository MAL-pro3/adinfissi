-- RIMOZIONE COLONNE TASSAZIONE DALLA TABELLA INVOICES
-- Eseguire questo script nel SQL Editor di Supabase

-- Rimuovi le colonne tax_amount e total_amount dalla tabella invoices
-- poiché ora tutti gli importi sono già netti

ALTER TABLE public.invoices 
DROP COLUMN IF EXISTS tax_amount,
DROP COLUMN IF EXISTS total_amount;

-- Verifica che le modifiche siano state applicate
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'invoices' 
AND table_schema = 'public'
ORDER BY ordinal_position;