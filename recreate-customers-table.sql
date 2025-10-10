-- Script completo per ricreare la tabella customers da zero
-- Elimina e ricrea la tabella customers con tutti i campi necessari

-- 1. Elimina la tabella esistente (attenzione: questo cancellerà tutti i dati!)
DROP TABLE IF EXISTS public.customers CASCADE;

-- 2. Elimina e ricrea il tipo enum per lo status
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

-- 3. Crea la tabella customers completa
CREATE TABLE public.customers (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  surname TEXT NOT NULL,
  email TEXT,
  phone TEXT,
  address TEXT,
  city TEXT,
  postal_code TEXT,
  province TEXT,
  tax_code TEXT,
  vat_number TEXT,
  status client_status DEFAULT 'PREVENTIVO_INIZIALE',
  notes TEXT,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 4. Crea indici per le performance
CREATE INDEX idx_customers_name ON public.customers(name);
CREATE INDEX idx_customers_surname ON public.customers(surname);
CREATE INDEX idx_customers_email ON public.customers(email);
CREATE INDEX idx_customers_phone ON public.customers(phone);
CREATE INDEX idx_customers_status ON public.customers(status);
CREATE INDEX idx_customers_is_active ON public.customers(is_active);
CREATE INDEX idx_customers_name_surname ON public.customers(name, surname);
CREATE INDEX idx_customers_created_at ON public.customers(created_at);

-- 5. Abilita Row Level Security
ALTER TABLE public.customers ENABLE ROW LEVEL SECURITY;

-- 6. Crea le policy RLS per la sicurezza
CREATE POLICY "Authenticated users can view customers" ON public.customers
  FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "Authenticated users can insert customers" ON public.customers
  FOR INSERT WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Authenticated users can update customers" ON public.customers
  FOR UPDATE USING (auth.role() = 'authenticated');

CREATE POLICY "Authenticated users can delete customers" ON public.customers
  FOR DELETE USING (auth.role() = 'authenticated');

-- 7. Crea trigger per aggiornare automaticamente updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = timezone('utc'::text, now());
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_customers_updated_at 
    BEFORE UPDATE ON public.customers 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

-- 8. Inserisci alcuni dati di esempio (opzionale)
INSERT INTO public.customers (name, surname, email, phone, address, city, postal_code, status) VALUES
('Mario', 'Rossi', 'mario.rossi@email.com', '333-1234567', 'Via Roma 123', 'Milano', '20100', 'PREVENTIVO_INIZIALE'),
('Giulia', 'Bianchi', 'giulia.bianchi@email.com', '333-7654321', 'Via Garibaldi 45', 'Roma', '00100', 'SOPRALLUOGO_PROGRAMMATO'),
('Luca', 'Verdi', 'luca.verdi@email.com', '333-9876543', 'Corso Italia 78', 'Torino', '10100', 'CONTRATTO_FIRMATO');

-- Messaggio di conferma
SELECT 'Tabella customers ricreata con successo!' as message;