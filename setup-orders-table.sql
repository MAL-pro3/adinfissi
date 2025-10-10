-- Script per creare la tabella orders in Supabase
-- Esegui questo script nel SQL Editor di Supabase

-- 1. Crea ENUM per lo status degli ordini
DO $$ BEGIN
    CREATE TYPE order_status AS ENUM ('BOZZA', 'CONFERMATO', 'IN_PRODUZIONE', 'PRONTO', 'CONSEGNATO', 'ANNULLATO');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- 2. Crea ENUM per lo status di pagamento
DO $$ BEGIN
    CREATE TYPE payment_status AS ENUM ('NON_PAGATO', 'PARZIALMENTE_PAGATO', 'COMPLETAMENTE_PAGATO');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- 3. Crea la tabella orders se non esiste
CREATE TABLE IF NOT EXISTS public.orders (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    customer_id UUID REFERENCES public.customers(id) ON DELETE CASCADE,
    customer_name TEXT NOT NULL,
    order_number TEXT UNIQUE NOT NULL,
    description TEXT NOT NULL,
    total_amount DECIMAL(10,2) NOT NULL DEFAULT 0,
    paid_amount DECIMAL(10,2) DEFAULT 0,
    remaining_amount DECIMAL(10,2) DEFAULT 0,
    payment_percentage INTEGER DEFAULT 0,
    order_date DATE NOT NULL,
    delivery_date DATE,
    status order_status DEFAULT 'BOZZA',
    payment_status payment_status DEFAULT 'NON_PAGATO',
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 4. Crea indici per le performance
CREATE INDEX IF NOT EXISTS idx_orders_customer_id ON public.orders(customer_id);
CREATE INDEX IF NOT EXISTS idx_orders_status ON public.orders(status);
CREATE INDEX IF NOT EXISTS idx_orders_payment_status ON public.orders(payment_status);
CREATE INDEX IF NOT EXISTS idx_orders_order_date ON public.orders(order_date);
CREATE INDEX IF NOT EXISTS idx_orders_order_number ON public.orders(order_number);

-- 5. Crea trigger per aggiornare automaticamente updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_orders_updated_at 
    BEFORE UPDATE ON public.orders 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

-- 6. Funzione per generare numero ordine automatico
CREATE OR REPLACE FUNCTION generate_order_number()
RETURNS TEXT AS $$
DECLARE
    year_suffix TEXT;
    sequence_num INTEGER;
    order_num TEXT;
BEGIN
    year_suffix := EXTRACT(YEAR FROM NOW())::TEXT;
    
    SELECT COALESCE(MAX(CAST(SUBSTRING(order_number FROM 5) AS INTEGER)), 0) + 1
    INTO sequence_num
    FROM public.orders
    WHERE order_number LIKE 'ORD-' || year_suffix || '%';
    
    order_num := 'ORD-' || year_suffix || '-' || LPAD(sequence_num::TEXT, 4, '0');
    
    RETURN order_num;
END;
$$ LANGUAGE plpgsql;

-- 7. Trigger per auto-generare numero ordine
CREATE OR REPLACE FUNCTION set_order_number()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.order_number IS NULL OR NEW.order_number = '' THEN
        NEW.order_number := generate_order_number();
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_set_order_number
    BEFORE INSERT ON public.orders
    FOR EACH ROW
    EXECUTE FUNCTION set_order_number();

-- 8. Trigger per calcolare automaticamente remaining_amount e payment_percentage
CREATE OR REPLACE FUNCTION calculate_payment_fields()
RETURNS TRIGGER AS $$
BEGIN
    NEW.remaining_amount := NEW.total_amount - COALESCE(NEW.paid_amount, 0);
    
    IF NEW.total_amount > 0 THEN
        NEW.payment_percentage := ROUND((COALESCE(NEW.paid_amount, 0) / NEW.total_amount) * 100);
    ELSE
        NEW.payment_percentage := 0;
    END IF;
    
    -- Aggiorna automaticamente payment_status
    IF NEW.paid_amount = 0 THEN
        NEW.payment_status := 'NON_PAGATO';
    ELSIF NEW.paid_amount >= NEW.total_amount THEN
        NEW.payment_status := 'COMPLETAMENTE_PAGATO';
    ELSE
        NEW.payment_status := 'PARZIALMENTE_PAGATO';
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_calculate_payment_fields
    BEFORE INSERT OR UPDATE ON public.orders
    FOR EACH ROW
    EXECUTE FUNCTION calculate_payment_fields();

-- 9. Abilita Row Level Security
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;

-- 10. Crea le policy RLS per la sicurezza
CREATE POLICY "Authenticated users can view orders" ON public.orders
    FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "Authenticated users can insert orders" ON public.orders
    FOR INSERT WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Authenticated users can update orders" ON public.orders
    FOR UPDATE USING (auth.role() = 'authenticated');

CREATE POLICY "Authenticated users can delete orders" ON public.orders
    FOR DELETE USING (auth.role() = 'authenticated');

-- 11. Inserisci alcuni dati di esempio (opzionale)
-- Prima verifica che esistano clienti nella tabella customers
DO $$
DECLARE
    client_id UUID;
    client_name TEXT;
BEGIN
    -- Prendi il primo cliente disponibile
    SELECT id, name || ' ' || surname INTO client_id, client_name 
    FROM public.customers 
    WHERE is_active = true 
    LIMIT 1;
    
    IF client_id IS NOT NULL THEN
        -- Inserisci ordini di esempio solo se ci sono clienti
        INSERT INTO public.orders (customer_id, customer_name, description, total_amount, order_date, delivery_date, status, notes) 
        VALUES 
        (client_id, client_name, 'Installazione finestre PVC', 2500.00, CURRENT_DATE, CURRENT_DATE + INTERVAL '15 days', 'CONFERMATO', 'Ordine di esempio'),
        (client_id, client_name, 'Sostituzione porta blindata', 1200.00, CURRENT_DATE - INTERVAL '5 days', CURRENT_DATE + INTERVAL '10 days', 'IN_PRODUZIONE', 'Ordine urgente');
        
        RAISE NOTICE 'Dati di esempio inseriti con successo!';
    ELSE
        RAISE NOTICE 'Nessun cliente attivo trovato. Dati di esempio non inseriti.';
    END IF;
END $$;

-- Messaggio di conferma
SELECT 'Tabella orders configurata con successo!' as message;