-- Script per creare la tabella appointments in Supabase
-- Esegui questo script nel SQL Editor di Supabase

-- 1. Crea la tabella appointments se non esiste
CREATE TABLE IF NOT EXISTS public.appointments (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    customer_id UUID REFERENCES public.customers(id) ON DELETE CASCADE,
    customer_name TEXT NOT NULL,
    type TEXT NOT NULL CHECK (type IN ('SOPRALLUOGO', 'INSTALLAZIONE', 'ASSISTENZA', 'PRODUZIONE')),
    date DATE NOT NULL,
    time TIME NOT NULL,
    status TEXT DEFAULT 'PROGRAMMATO' CHECK (status IN ('PROGRAMMATO', 'COMPLETATO')),
    notes TEXT,
    address TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. Crea indici per le performance
CREATE INDEX IF NOT EXISTS idx_appointments_customer_id ON public.appointments(customer_id);
CREATE INDEX IF NOT EXISTS idx_appointments_date ON public.appointments(date);
CREATE INDEX IF NOT EXISTS idx_appointments_type ON public.appointments(type);
CREATE INDEX IF NOT EXISTS idx_appointments_status ON public.appointments(status);
CREATE INDEX IF NOT EXISTS idx_appointments_date_time ON public.appointments(date, time);

-- 3. Crea trigger per aggiornare automaticamente updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_appointments_updated_at 
    BEFORE UPDATE ON public.appointments 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

-- 4. Abilita Row Level Security
ALTER TABLE public.appointments ENABLE ROW LEVEL SECURITY;

-- 5. Crea le policy RLS per la sicurezza
CREATE POLICY "Authenticated users can view appointments" ON public.appointments
    FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "Authenticated users can insert appointments" ON public.appointments
    FOR INSERT WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Authenticated users can update appointments" ON public.appointments
    FOR UPDATE USING (auth.role() = 'authenticated');

CREATE POLICY "Authenticated users can delete appointments" ON public.appointments
    FOR DELETE USING (auth.role() = 'authenticated');

-- 6. Inserisci alcuni dati di esempio (opzionale)
-- Prima verifica che esistano clienti nella tabella customers
DO $$
DECLARE
    client_id UUID;
BEGIN
    -- Prendi il primo cliente disponibile
    SELECT id INTO client_id FROM public.customers LIMIT 1;
    
    IF client_id IS NOT NULL THEN
        -- Inserisci appuntamenti di esempio solo se ci sono clienti
        INSERT INTO public.appointments (customer_id, customer_name, type, date, time, status, address, notes) 
        SELECT 
            c.id,
            c.name || ' ' || c.surname,
            'SOPRALLUOGO',
            CURRENT_DATE + INTERVAL '3 days',
            '10:00',
            'PROGRAMMATO',
            COALESCE(c.address || ', ' || c.city, 'Indirizzo da definire'),
            'Sopralluogo per preventivo infissi'
        FROM public.customers c 
        LIMIT 1;
        
        INSERT INTO public.appointments (customer_id, customer_name, type, date, time, status, address, notes) 
        SELECT 
            c.id,
            c.name || ' ' || c.surname,
            'INSTALLAZIONE',
            CURRENT_DATE + INTERVAL '7 days',
            '14:00',
            'PROGRAMMATO',
            COALESCE(c.address || ', ' || c.city, 'Indirizzo da definire'),
            'Installazione infissi confermata'
        FROM public.customers c 
        LIMIT 1;
        
        RAISE NOTICE 'Appuntamenti di esempio creati con successo!';
    ELSE
        RAISE NOTICE 'Nessun cliente trovato. Crea prima alcuni clienti per aggiungere appuntamenti di esempio.';
    END IF;
END $$;

-- Messaggio di conferma
SELECT 'Tabella appointments configurata con successo!' as message;