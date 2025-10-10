-- Script incrementale per aggiornare la tabella orders esistente
-- Aggiunge solo le colonne e funzionalità mancanti senza ricreare la tabella
-- Esegui questo script nel SQL Editor di Supabase

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

-- 3. Aggiungi le colonne mancanti alla tabella orders esistente
DO $$ 
BEGIN
    -- Aggiungi customer_name se non esiste
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'orders' AND column_name = 'customer_name') THEN
        ALTER TABLE public.orders ADD COLUMN customer_name TEXT;
        -- Popola customer_name dai dati esistenti
        UPDATE public.orders SET customer_name = (
            SELECT COALESCE(c.name || ' ' || c.surname, 'Cliente Sconosciuto')
            FROM public.customers c 
            WHERE c.id = orders.customer_id
        ) WHERE customer_name IS NULL;
        -- Rendi la colonna NOT NULL dopo averla popolata
        ALTER TABLE public.orders ALTER COLUMN customer_name SET NOT NULL;
    END IF;
    
    -- Aggiungi paid_amount se non esiste
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'orders' AND column_name = 'paid_amount') THEN
        ALTER TABLE public.orders ADD COLUMN paid_amount DECIMAL(10,2) DEFAULT 0;
    END IF;
    
    -- Aggiungi payment_percentage se non esiste
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'orders' AND column_name = 'payment_percentage') THEN
        ALTER TABLE public.orders ADD COLUMN payment_percentage INTEGER DEFAULT 0;
    END IF;
    
    -- Aggiungi order_date se non esiste
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'orders' AND column_name = 'order_date') THEN
        ALTER TABLE public.orders ADD COLUMN order_date DATE DEFAULT CURRENT_DATE;
        -- Popola order_date dai dati esistenti usando created_at
        UPDATE public.orders SET order_date = created_at::DATE WHERE order_date IS NULL;
        -- Rendi la colonna NOT NULL dopo averla popolata
        ALTER TABLE public.orders ALTER COLUMN order_date SET NOT NULL;
    END IF;
    
    -- Aggiungi delivery_date se non esiste (rinomina installation_date se esiste)
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'orders' AND column_name = 'installation_date') 
       AND NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'orders' AND column_name = 'delivery_date') THEN
        ALTER TABLE public.orders RENAME COLUMN installation_date TO delivery_date;
    ELSIF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'orders' AND column_name = 'delivery_date') THEN
        ALTER TABLE public.orders ADD COLUMN delivery_date DATE;
    END IF;
    
    -- Aggiungi payment_status se non esiste
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'orders' AND column_name = 'payment_status') THEN
        ALTER TABLE public.orders ADD COLUMN payment_status payment_status DEFAULT 'NON_PAGATO';
    END IF;
    
    -- Modifica remaining_amount se esiste deposit_amount
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'orders' AND column_name = 'deposit_amount') 
       AND NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'orders' AND column_name = 'remaining_amount') THEN
        ALTER TABLE public.orders RENAME COLUMN deposit_amount TO remaining_amount;
    ELSIF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'orders' AND column_name = 'remaining_amount') THEN
        ALTER TABLE public.orders ADD COLUMN remaining_amount DECIMAL(10,2) DEFAULT 0;
    END IF;
    
    -- Rinomina title in description se necessario
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'orders' AND column_name = 'title') 
       AND NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'orders' AND column_name = 'description') THEN
        ALTER TABLE public.orders RENAME COLUMN title TO description;
    ELSIF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'orders' AND column_name = 'description') THEN
        ALTER TABLE public.orders ADD COLUMN description TEXT;
    END IF;
    
    -- Assicurati che total_amount sia NOT NULL
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'orders' AND column_name = 'total_amount' AND is_nullable = 'YES') THEN
        UPDATE public.orders SET total_amount = 0 WHERE total_amount IS NULL;
        ALTER TABLE public.orders ALTER COLUMN total_amount SET NOT NULL;
        ALTER TABLE public.orders ALTER COLUMN total_amount SET DEFAULT 0;
    END IF;
    
    -- Assicurati che description sia NOT NULL se esiste
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'orders' AND column_name = 'description' AND is_nullable = 'YES') THEN
        UPDATE public.orders SET description = 'Ordine' WHERE description IS NULL OR description = '';
        ALTER TABLE public.orders ALTER COLUMN description SET NOT NULL;
    END IF;
END $$;

-- 4. Aggiorna il default per status se necessario
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'orders' AND column_name = 'status') THEN
        ALTER TABLE public.orders ALTER COLUMN status SET DEFAULT 'BOZZA'::order_status;
    END IF;
END $$;

-- 5. Crea indici aggiuntivi per le performance (solo se non esistono)
CREATE INDEX IF NOT EXISTS idx_orders_payment_status ON public.orders(payment_status);
CREATE INDEX IF NOT EXISTS idx_orders_order_date ON public.orders(order_date);
CREATE INDEX IF NOT EXISTS idx_orders_delivery_date ON public.orders(delivery_date);

-- 6. Aggiorna la funzione generate_order_number per il nuovo formato
CREATE OR REPLACE FUNCTION generate_order_number()
RETURNS TEXT AS $$
DECLARE
    year_suffix TEXT;
    sequence_num INTEGER;
    order_num TEXT;
BEGIN
    year_suffix := EXTRACT(YEAR FROM NOW())::TEXT;
    
    -- Cerca il numero più alto esistente con il nuovo formato ORD-YYYY-NNNN
    SELECT COALESCE(MAX(CAST(SUBSTRING(order_number FROM 'ORD-' || year_suffix || '-(\d+)') AS INTEGER)), 0) + 1
    INTO sequence_num
    FROM public.orders
    WHERE order_number ~ ('^ORD-' || year_suffix || '-\d+$');
    
    -- Se non trova nessun ordine con il nuovo formato, cerca con il vecchio formato ORDYYYYNNNN
    IF sequence_num = 1 THEN
        SELECT COALESCE(MAX(CAST(SUBSTRING(order_number FROM 'ORD' || year_suffix || '(\d+)') AS INTEGER)), 0) + 1
        INTO sequence_num
        FROM public.orders
        WHERE order_number ~ ('^ORD' || year_suffix || '\d+$');
    END IF;
    
    order_num := 'ORD-' || year_suffix || '-' || LPAD(sequence_num::TEXT, 4, '0');
    
    RETURN order_num;
END;
$$ LANGUAGE plpgsql;

-- 7. Crea/aggiorna il trigger per auto-generare numero ordine
CREATE OR REPLACE FUNCTION set_order_number()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.order_number IS NULL OR NEW.order_number = '' THEN
        NEW.order_number := generate_order_number();
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Rimuovi il trigger esistente se esiste e ricrealo
DROP TRIGGER IF EXISTS trigger_set_order_number ON public.orders;
CREATE TRIGGER trigger_set_order_number
    BEFORE INSERT ON public.orders
    FOR EACH ROW
    EXECUTE FUNCTION set_order_number();

-- 8. Crea trigger per calcolare automaticamente i campi di pagamento
CREATE OR REPLACE FUNCTION calculate_payment_fields()
RETURNS TRIGGER AS $$
BEGIN
    -- Calcola remaining_amount
    NEW.remaining_amount := NEW.total_amount - COALESCE(NEW.paid_amount, 0);
    
    -- Calcola payment_percentage
    IF NEW.total_amount > 0 THEN
        NEW.payment_percentage := ROUND((COALESCE(NEW.paid_amount, 0) / NEW.total_amount) * 100);
    ELSE
        NEW.payment_percentage := 0;
    END IF;
    
    -- Aggiorna automaticamente payment_status
    IF COALESCE(NEW.paid_amount, 0) = 0 THEN
        NEW.payment_status := 'NON_PAGATO';
    ELSIF NEW.paid_amount >= NEW.total_amount THEN
        NEW.payment_status := 'COMPLETAMENTE_PAGATO';
    ELSE
        NEW.payment_status := 'PARZIALMENTE_PAGATO';
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Rimuovi il trigger esistente se esiste e ricrealo
DROP TRIGGER IF EXISTS trigger_calculate_payment_fields ON public.orders;
CREATE TRIGGER trigger_calculate_payment_fields
    BEFORE INSERT OR UPDATE ON public.orders
    FOR EACH ROW
    EXECUTE FUNCTION calculate_payment_fields();

-- 9. Aggiorna i dati esistenti per calcolare i campi di pagamento
UPDATE public.orders SET 
    paid_amount = COALESCE(paid_amount, 0),
    remaining_amount = total_amount - COALESCE(paid_amount, 0),
    payment_percentage = CASE 
        WHEN total_amount > 0 THEN ROUND((COALESCE(paid_amount, 0) / total_amount) * 100)
        ELSE 0 
    END,
    payment_status = CASE 
        WHEN COALESCE(paid_amount, 0) = 0 THEN 'NON_PAGATO'::payment_status
        WHEN paid_amount >= total_amount THEN 'COMPLETAMENTE_PAGATO'::payment_status
        ELSE 'PARZIALMENTE_PAGATO'::payment_status
    END
WHERE payment_status IS NULL OR remaining_amount IS NULL OR payment_percentage IS NULL;

-- 10. Aggiorna le policy RLS se necessario
-- Rimuovi le policy esistenti se ci sono conflitti
DROP POLICY IF EXISTS "Admins can manage orders" ON public.orders;
DROP POLICY IF EXISTS "Authenticated users can view orders" ON public.orders;
DROP POLICY IF EXISTS "Authenticated users can insert orders" ON public.orders;
DROP POLICY IF EXISTS "Authenticated users can update orders" ON public.orders;
DROP POLICY IF EXISTS "Authenticated users can delete orders" ON public.orders;

-- Ricrea le policy
CREATE POLICY "Authenticated users can view orders" ON public.orders
    FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "Authenticated users can insert orders" ON public.orders
    FOR INSERT WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Authenticated users can update orders" ON public.orders
    FOR UPDATE USING (auth.role() = 'authenticated');

CREATE POLICY "Authenticated users can delete orders" ON public.orders
    FOR DELETE USING (auth.role() = 'authenticated');

-- Policy per admin (se esiste la tabella profiles)
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'profiles') THEN
        EXECUTE 'CREATE POLICY "Admins can manage orders" ON public.orders FOR ALL USING (
            EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = ''admin'')
        )';
    END IF;
END $$;

-- Messaggio di conferma
SELECT 'Tabella orders aggiornata con successo! Tutte le colonne e funzionalità mancanti sono state aggiunte.' as message;