-- CONFIGURAZIONE TABELLE FATTURE PER SUPABASE
-- Eseguire questo script nel SQL Editor di Supabase

-- 1. TABELLA INVOICES (FATTURE)
CREATE TABLE IF NOT EXISTS public.invoices (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    number VARCHAR(50) NOT NULL UNIQUE,
    customer_id UUID REFERENCES public.customers(id) ON DELETE CASCADE,
    customer_name VARCHAR(255) NOT NULL,
    amount DECIMAL(10,2) NOT NULL DEFAULT 0,
    tax_amount DECIMAL(10,2) DEFAULT 0,
    total_amount DECIMAL(10,2) NOT NULL DEFAULT 0,
    issue_date DATE NOT NULL,
    due_date DATE NOT NULL,
    status VARCHAR(20) NOT NULL DEFAULT 'BOZZA' CHECK (status IN ('BOZZA', 'INVIATA', 'PAGATA', 'SCADUTA', 'ANNULLATA')),
    description TEXT,
    notes TEXT,
    payment_date DATE,
    order_id UUID REFERENCES public.orders(id) ON DELETE SET NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. TABELLA INVOICE_ITEMS (RIGHE FATTURA)
CREATE TABLE IF NOT EXISTS public.invoice_items (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    invoice_id UUID REFERENCES public.invoices(id) ON DELETE CASCADE,
    description TEXT NOT NULL,
    quantity DECIMAL(10,2) NOT NULL DEFAULT 1,
    unit_price DECIMAL(10,2) NOT NULL DEFAULT 0,
    total DECIMAL(10,2) NOT NULL DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3. INDICI PER PERFORMANCE
CREATE INDEX IF NOT EXISTS idx_invoices_customer_id ON public.invoices(customer_id);
CREATE INDEX IF NOT EXISTS idx_invoices_status ON public.invoices(status);
CREATE INDEX IF NOT EXISTS idx_invoices_issue_date ON public.invoices(issue_date);
CREATE INDEX IF NOT EXISTS idx_invoices_number ON public.invoices(number);
CREATE INDEX IF NOT EXISTS idx_invoice_items_invoice_id ON public.invoice_items(invoice_id);

-- 4. TRIGGER PER AGGIORNARE UPDATED_AT
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger per invoices
DROP TRIGGER IF EXISTS update_invoices_updated_at ON public.invoices;
CREATE TRIGGER update_invoices_updated_at
    BEFORE UPDATE ON public.invoices
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Trigger per invoice_items
DROP TRIGGER IF EXISTS update_invoice_items_updated_at ON public.invoice_items;
CREATE TRIGGER update_invoice_items_updated_at
    BEFORE UPDATE ON public.invoice_items
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- 5. FUNZIONE PER CALCOLARE TOTALE FATTURA
CREATE OR REPLACE FUNCTION calculate_invoice_total(invoice_uuid UUID)
RETURNS DECIMAL AS $$
DECLARE
    total_amount DECIMAL(10,2) := 0;
BEGIN
    SELECT COALESCE(SUM(total), 0) INTO total_amount
    FROM public.invoice_items
    WHERE invoice_id = invoice_uuid;
    
    RETURN total_amount;
END;
$$ LANGUAGE plpgsql;

-- 6. TRIGGER PER AGGIORNARE AUTOMATICAMENTE IL TOTALE FATTURA
CREATE OR REPLACE FUNCTION update_invoice_total()
RETURNS TRIGGER AS $$
BEGIN
    -- Aggiorna il totale della fattura quando vengono modificate le righe
    UPDATE public.invoices 
    SET 
        amount = calculate_invoice_total(COALESCE(NEW.invoice_id, OLD.invoice_id)),
        total_amount = calculate_invoice_total(COALESCE(NEW.invoice_id, OLD.invoice_id)) + COALESCE(tax_amount, 0),
        updated_at = NOW()
    WHERE id = COALESCE(NEW.invoice_id, OLD.invoice_id);
    
    RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql;

-- Trigger per aggiornare totale quando si modificano le righe
DROP TRIGGER IF EXISTS update_invoice_total_on_items_change ON public.invoice_items;
CREATE TRIGGER update_invoice_total_on_items_change
    AFTER INSERT OR UPDATE OR DELETE ON public.invoice_items
    FOR EACH ROW EXECUTE FUNCTION update_invoice_total();

-- 7. ABILITARE RLS (Row Level Security)
ALTER TABLE public.invoices ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.invoice_items ENABLE ROW LEVEL SECURITY;

-- 8. POLICY RLS PER INVOICES
DROP POLICY IF EXISTS "Authenticated users can view invoices" ON public.invoices;
CREATE POLICY "Authenticated users can view invoices" ON public.invoices
    FOR SELECT USING (auth.role() = 'authenticated');

DROP POLICY IF EXISTS "Authenticated users can insert invoices" ON public.invoices;
CREATE POLICY "Authenticated users can insert invoices" ON public.invoices
    FOR INSERT WITH CHECK (auth.role() = 'authenticated');

DROP POLICY IF EXISTS "Authenticated users can update invoices" ON public.invoices;
CREATE POLICY "Authenticated users can update invoices" ON public.invoices
    FOR UPDATE USING (auth.role() = 'authenticated');

DROP POLICY IF EXISTS "Authenticated users can delete invoices" ON public.invoices;
CREATE POLICY "Authenticated users can delete invoices" ON public.invoices
    FOR DELETE USING (auth.role() = 'authenticated');

-- 9. POLICY RLS PER INVOICE_ITEMS
DROP POLICY IF EXISTS "Authenticated users can view invoice items" ON public.invoice_items;
CREATE POLICY "Authenticated users can view invoice items" ON public.invoice_items
    FOR SELECT USING (auth.role() = 'authenticated');

DROP POLICY IF EXISTS "Authenticated users can insert invoice items" ON public.invoice_items;
CREATE POLICY "Authenticated users can insert invoice items" ON public.invoice_items
    FOR INSERT WITH CHECK (auth.role() = 'authenticated');

DROP POLICY IF EXISTS "Authenticated users can update invoice items" ON public.invoice_items;
CREATE POLICY "Authenticated users can update invoice items" ON public.invoice_items
    FOR UPDATE USING (auth.role() = 'authenticated');

DROP POLICY IF EXISTS "Authenticated users can delete invoice items" ON public.invoice_items;
CREATE POLICY "Authenticated users can delete invoice items" ON public.invoice_items
    FOR DELETE USING (auth.role() = 'authenticated');

-- 10. FUNZIONE PER GENERARE NUMERO FATTURA
CREATE OR REPLACE FUNCTION generate_invoice_number()
RETURNS VARCHAR AS $$
DECLARE
    current_year INTEGER := EXTRACT(YEAR FROM NOW());
    next_number INTEGER;
    invoice_number VARCHAR(50);
BEGIN
    -- Trova il prossimo numero per l'anno corrente
    SELECT COALESCE(MAX(CAST(SUBSTRING(number FROM '[0-9]+$') AS INTEGER)), 0) + 1
    INTO next_number
    FROM public.invoices
    WHERE number LIKE current_year || '-%';
    
    -- Genera il numero fattura nel formato YYYY-NNNN
    invoice_number := current_year || '-' || LPAD(next_number::TEXT, 4, '0');
    
    RETURN invoice_number;
END;
$$ LANGUAGE plpgsql;

-- 11. VERIFICA CONFIGURAZIONE
DO $$
BEGIN
    RAISE NOTICE 'Configurazione tabelle fatture completata!';
    RAISE NOTICE 'Tabelle create: invoices, invoice_items';
    RAISE NOTICE 'RLS abilitato su entrambe le tabelle';
    RAISE NOTICE 'Policy di sicurezza configurate';
    RAISE NOTICE 'Trigger per calcolo automatico totali attivati';
    RAISE NOTICE 'Funzione per generazione numero fattura creata';
END $$;

-- 12. DATI DI TEST (OPZIONALE)
-- Decommentare per inserire una fattura di esempio
/*
-- Prima inserisci una fattura
INSERT INTO public.invoices (number, customer_name, issue_date, due_date, description, status)
VALUES ('2024-0001', 'Cliente Test', CURRENT_DATE, CURRENT_DATE + INTERVAL '30 days', 'Fattura di test', 'BOZZA');

-- Poi inserisci alcune righe (sostituisci l'UUID con quello generato)
INSERT INTO public.invoice_items (invoice_id, description, quantity, unit_price, total)
VALUES 
    ((SELECT id FROM public.invoices WHERE number = '2024-0001'), 'Finestra PVC 120x150', 2, 450.00, 900.00),
    ((SELECT id FROM public.invoices WHERE number = '2024-0001'), 'Installazione', 1, 200.00, 200.00);
*/