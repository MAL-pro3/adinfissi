-- PARTE 1: Script per aggiornare gli ENUM della tabella orders
-- Esegui PRIMA questa parte nel SQL Editor di Supabase
-- Dopo aver eseguito questa parte, attendi qualche secondo e poi esegui la Parte 2

-- 1. Aggiorna gli ENUM esistenti per includere i nuovi valori
-- Modifica order_status per includere i nuovi stati italiani
DO $$ 
BEGIN
    -- Aggiungi i nuovi valori all'enum order_status esistente
    IF NOT EXISTS (SELECT 1 FROM pg_enum WHERE enumlabel = 'BOZZA' AND enumtypid = (SELECT oid FROM pg_type WHERE typname = 'order_status')) THEN
        ALTER TYPE order_status ADD VALUE 'BOZZA';
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM pg_enum WHERE enumlabel = 'CONFERMATO' AND enumtypid = (SELECT oid FROM pg_type WHERE typname = 'order_status')) THEN
        ALTER TYPE order_status ADD VALUE 'CONFERMATO';
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM pg_enum WHERE enumlabel = 'IN_PRODUZIONE' AND enumtypid = (SELECT oid FROM pg_type WHERE typname = 'order_status')) THEN
        ALTER TYPE order_status ADD VALUE 'IN_PRODUZIONE';
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM pg_enum WHERE enumlabel = 'PRONTO' AND enumtypid = (SELECT oid FROM pg_type WHERE typname = 'order_status')) THEN
        ALTER TYPE order_status ADD VALUE 'PRONTO';
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM pg_enum WHERE enumlabel = 'CONSEGNATO' AND enumtypid = (SELECT oid FROM pg_type WHERE typname = 'order_status')) THEN
        ALTER TYPE order_status ADD VALUE 'CONSEGNATO';
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM pg_enum WHERE enumlabel = 'ANNULLATO' AND enumtypid = (SELECT oid FROM pg_type WHERE typname = 'order_status')) THEN
        ALTER TYPE order_status ADD VALUE 'ANNULLATO';
    END IF;
END $$;

-- 2. Crea il nuovo ENUM per payment_status se non esiste
DO $$ BEGIN
    CREATE TYPE payment_status AS ENUM ('NON_PAGATO', 'PARZIALMENTE_PAGATO', 'COMPLETAMENTE_PAGATO');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- Messaggio di conferma
SELECT 'PARTE 1 COMPLETATA: ENUM aggiornati con successo! Ora esegui la Parte 2.' as message;