-- Script completo per standardizzare i nomi dei campi in TUTTE le tabelle
-- Risolve l'errore "Could not find the 'client_id' column of 'orders' in the schema cache"
-- Standardizza customer_id -> client_id e customer_name -> client_name ovunque
-- Esegui questo script nel SQL Editor di Supabase

-- ========================================
-- 1. TABELLA ORDERS
-- ========================================

-- Rinomina customer_id in client_id nella tabella orders
DO $$ 
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'orders' AND column_name = 'customer_id')
       AND NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'orders' AND column_name = 'client_id') THEN
        
        ALTER TABLE public.orders RENAME COLUMN customer_id TO client_id;
        
        -- Rinomina anche l'indice associato se esiste
        IF EXISTS (SELECT 1 FROM pg_indexes WHERE indexname = 'idx_orders_customer_id') THEN
            ALTER INDEX idx_orders_customer_id RENAME TO idx_orders_client_id;
        END IF;
        
        RAISE NOTICE 'ORDERS: customer_id rinominato in client_id';
    ELSE
        RAISE NOTICE 'ORDERS: customer_id non esiste o client_id esiste già';
    END IF;
END $$;

-- Rinomina customer_name in client_name nella tabella orders
DO $$ 
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'orders' AND column_name = 'customer_name')
       AND NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'orders' AND column_name = 'client_name') THEN
        
        ALTER TABLE public.orders RENAME COLUMN customer_name TO client_name;
        RAISE NOTICE 'ORDERS: customer_name rinominato in client_name';
    ELSE
        RAISE NOTICE 'ORDERS: customer_name non esiste o client_name esiste già';
    END IF;
END $$;

-- ========================================
-- 2. TABELLA APPOINTMENTS
-- ========================================

-- Rinomina customer_id in client_id nella tabella appointments
DO $$ 
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'appointments' AND column_name = 'customer_id')
       AND NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'appointments' AND column_name = 'client_id') THEN
        
        ALTER TABLE public.appointments RENAME COLUMN customer_id TO client_id;
        
        -- Rinomina anche l'indice associato se esiste
        IF EXISTS (SELECT 1 FROM pg_indexes WHERE indexname = 'idx_appointments_customer_id') THEN
            ALTER INDEX idx_appointments_customer_id RENAME TO idx_appointments_client_id;
        END IF;
        
        RAISE NOTICE 'APPOINTMENTS: customer_id rinominato in client_id';
    ELSE
        RAISE NOTICE 'APPOINTMENTS: customer_id non esiste o client_id esiste già';
    END IF;
END $$;

-- Rinomina customer_name in client_name nella tabella appointments
DO $$ 
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'appointments' AND column_name = 'customer_name')
       AND NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'appointments' AND column_name = 'client_name') THEN
        
        ALTER TABLE public.appointments RENAME COLUMN customer_name TO client_name;
        RAISE NOTICE 'APPOINTMENTS: customer_name rinominato in client_name';
    ELSE
        RAISE NOTICE 'APPOINTMENTS: customer_name non esiste o client_name esiste già';
    END IF;
END $$;

-- ========================================
-- 3. TABELLA INVOICES
-- ========================================

-- Rinomina customer_id in client_id nella tabella invoices
DO $$ 
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'invoices' AND column_name = 'customer_id')
       AND NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'invoices' AND column_name = 'client_id') THEN
        
        ALTER TABLE public.invoices RENAME COLUMN customer_id TO client_id;
        RAISE NOTICE 'INVOICES: customer_id rinominato in client_id';
    ELSE
        RAISE NOTICE 'INVOICES: customer_id non esiste o client_id esiste già';
    END IF;
END $$;

-- Rinomina customer_name in client_name nella tabella invoices
DO $$ 
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'invoices' AND column_name = 'customer_name')
       AND NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'invoices' AND column_name = 'client_name') THEN
        
        ALTER TABLE public.invoices RENAME COLUMN customer_name TO client_name;
        RAISE NOTICE 'INVOICES: customer_name rinominato in client_name';
    ELSE
        RAISE NOTICE 'INVOICES: customer_name non esiste o client_name esiste già';
    END IF;
END $$;

-- ========================================
-- 4. TABELLA DOCUMENTS (se esiste)
-- ========================================

-- Rinomina customer_id in client_id nella tabella documents
DO $$ 
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'documents') THEN
        IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'documents' AND column_name = 'customer_id')
           AND NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'documents' AND column_name = 'client_id') THEN
            
            ALTER TABLE public.documents RENAME COLUMN customer_id TO client_id;
            
            -- Rinomina anche l'indice associato se esiste
            IF EXISTS (SELECT 1 FROM pg_indexes WHERE indexname = 'idx_documents_customer_id') THEN
                ALTER INDEX idx_documents_customer_id RENAME TO idx_documents_client_id;
            END IF;
            
            RAISE NOTICE 'DOCUMENTS: customer_id rinominato in client_id';
        ELSE
            RAISE NOTICE 'DOCUMENTS: customer_id non esiste o client_id esiste già';
        END IF;
    ELSE
        RAISE NOTICE 'DOCUMENTS: tabella non esiste';
    END IF;
END $$;

-- ========================================
-- 5. CREA INDICI MANCANTI
-- ========================================

CREATE INDEX IF NOT EXISTS idx_orders_client_id ON public.orders(client_id);
CREATE INDEX IF NOT EXISTS idx_appointments_client_id ON public.appointments(client_id);
CREATE INDEX IF NOT EXISTS idx_invoices_client_id ON public.invoices(client_id);

-- Solo se la tabella documents esiste
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'documents') THEN
        CREATE INDEX IF NOT EXISTS idx_documents_client_id ON public.documents(client_id);
    END IF;
END $$;

-- ========================================
-- 6. VERIFICA FINALE
-- ========================================

-- Mostra la struttura aggiornata di tutte le tabelle
DO $$
BEGIN
    RAISE NOTICE '========================================';
    RAISE NOTICE 'VERIFICA FINALE - STRUTTURE AGGIORNATE:';
    RAISE NOTICE '========================================';
END $$;

-- Verifica tabella orders
SELECT 'ORDERS' as tabella, column_name, data_type, is_nullable
FROM information_schema.columns 
WHERE table_name = 'orders' AND table_schema = 'public'
  AND column_name IN ('client_id', 'client_name', 'customer_id', 'customer_name')
ORDER BY column_name;

-- Verifica tabella appointments
SELECT 'APPOINTMENTS' as tabella, column_name, data_type, is_nullable
FROM information_schema.columns 
WHERE table_name = 'appointments' AND table_schema = 'public'
  AND column_name IN ('client_id', 'client_name', 'customer_id', 'customer_name')
ORDER BY column_name;

-- Verifica tabella invoices
SELECT 'INVOICES' as tabella, column_name, data_type, is_nullable
FROM information_schema.columns 
WHERE table_name = 'invoices' AND table_schema = 'public'
  AND column_name IN ('client_id', 'client_name', 'customer_id', 'customer_name')
ORDER BY column_name;