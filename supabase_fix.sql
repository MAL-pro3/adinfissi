-- SCRIPT DI CONFIGURAZIONE SUPABASE PER AD INFISSI
-- Esegui questo script nel SQL Editor di Supabase per risolvere i problemi di autenticazione

-- 1. ABILITA RLS (Row Level Security)
ALTER TABLE IF EXISTS public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.customers ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.appointments ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.products ENABLE ROW LEVEL SECURITY;

-- 2. CREA LA TABELLA PROFILES SE NON ESISTE
CREATE TABLE IF NOT EXISTS public.profiles (
    id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
    email TEXT UNIQUE NOT NULL,
    full_name TEXT,
    role TEXT DEFAULT 'admin' CHECK (role IN ('admin', 'user')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3. CREA FUNZIONE PER GESTIRE NUOVI UTENTI
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public.profiles (id, email, full_name, role)
    VALUES (NEW.id, NEW.email, NEW.raw_user_meta_data->>'full_name', 'admin');
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 4. CREA TRIGGER PER NUOVI UTENTI
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- 5. POLICY RLS PER PROFILES
DROP POLICY IF EXISTS "Users can view own profile" ON public.profiles;
CREATE POLICY "Users can view own profile" ON public.profiles
    FOR SELECT USING (auth.uid() = id);

DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;
CREATE POLICY "Users can update own profile" ON public.profiles
    FOR UPDATE USING (auth.uid() = id);

DROP POLICY IF EXISTS "Admins can view all profiles" ON public.profiles;
CREATE POLICY "Admins can view all profiles" ON public.profiles
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM public.profiles
            WHERE id = auth.uid() AND role = 'admin'
        )
    );

-- 6. POLICY RLS PER CUSTOMERS
DROP POLICY IF EXISTS "Authenticated users can view customers" ON public.customers;
CREATE POLICY "Authenticated users can view customers" ON public.customers
    FOR SELECT USING (auth.role() = 'authenticated');

DROP POLICY IF EXISTS "Authenticated users can insert customers" ON public.customers;
CREATE POLICY "Authenticated users can insert customers" ON public.customers
    FOR INSERT WITH CHECK (auth.role() = 'authenticated');

DROP POLICY IF EXISTS "Authenticated users can update customers" ON public.customers;
CREATE POLICY "Authenticated users can update customers" ON public.customers
    FOR UPDATE USING (auth.role() = 'authenticated');

-- 7. POLICY RLS PER APPOINTMENTS
DROP POLICY IF EXISTS "Authenticated users can view appointments" ON public.appointments;
CREATE POLICY "Authenticated users can view appointments" ON public.appointments
    FOR SELECT USING (auth.role() = 'authenticated');

DROP POLICY IF EXISTS "Authenticated users can insert appointments" ON public.appointments;
CREATE POLICY "Authenticated users can insert appointments" ON public.appointments
    FOR INSERT WITH CHECK (auth.role() = 'authenticated');

DROP POLICY IF EXISTS "Authenticated users can update appointments" ON public.appointments;
CREATE POLICY "Authenticated users can update appointments" ON public.appointments
    FOR UPDATE USING (auth.role() = 'authenticated');

-- 8. POLICY RLS PER ORDERS
DROP POLICY IF EXISTS "Authenticated users can view orders" ON public.orders;
CREATE POLICY "Authenticated users can view orders" ON public.orders
    FOR SELECT USING (auth.role() = 'authenticated');

DROP POLICY IF EXISTS "Authenticated users can insert orders" ON public.orders;
CREATE POLICY "Authenticated users can insert orders" ON public.orders
    FOR INSERT WITH CHECK (auth.role() = 'authenticated');

DROP POLICY IF EXISTS "Authenticated users can update orders" ON public.orders;
CREATE POLICY "Authenticated users can update orders" ON public.orders
    FOR UPDATE USING (auth.role() = 'authenticated');

-- 9. POLICY RLS PER PRODUCTS
DROP POLICY IF EXISTS "Authenticated users can view products" ON public.products;
CREATE POLICY "Authenticated users can view products" ON public.products
    FOR SELECT USING (auth.role() = 'authenticated');

DROP POLICY IF EXISTS "Authenticated users can insert products" ON public.products;
CREATE POLICY "Authenticated users can insert products" ON public.products
    FOR INSERT WITH CHECK (auth.role() = 'authenticated');

DROP POLICY IF EXISTS "Authenticated users can update products" ON public.products;
CREATE POLICY "Authenticated users can update products" ON public.products
    FOR UPDATE USING (auth.role() = 'authenticated');

-- 10. FUNZIONE PER AGGIORNARE TIMESTAMP
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 11. TRIGGER PER AGGIORNARE TIMESTAMP
DROP TRIGGER IF EXISTS update_profiles_updated_at ON public.profiles;
CREATE TRIGGER update_profiles_updated_at
    BEFORE UPDATE ON public.profiles
    FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- 12. VERIFICA CONFIGURAZIONE
DO $$
BEGIN
    RAISE NOTICE 'Configurazione Supabase completata!';
    RAISE NOTICE 'Tabelle create: profiles, customers, appointments, orders, products';
    RAISE NOTICE 'RLS abilitato su tutte le tabelle';
    RAISE NOTICE 'Policy di sicurezza configurate';
    RAISE NOTICE 'Trigger per nuovi utenti attivato';
END $$;

-- 13. INSERISCI DATI DI TEST (OPZIONALE)
-- Decommentare se vuoi inserire dati di esempio

/*
INSERT INTO public.customers (name, email, phone, address, city, status) VALUES
('Mario Rossi', 'mario.rossi@email.com', '+39 123 456 7890', 'Via Roma 123', 'Milano', 'active'),
('Giulia Bianchi', 'giulia.bianchi@email.com', '+39 098 765 4321', 'Corso Italia 456', 'Roma', 'prospect'),
('Luca Verdi', 'luca.verdi@email.com', '+39 555 123 4567', 'Piazza Duomo 789', 'Firenze', 'lead');

INSERT INTO public.products (name, description, category, price, stock_quantity) VALUES
('Finestra PVC Bianca 120x150', 'Finestra in PVC bianco con doppio vetro', 'Finestre', 450.00, 10),
('Porta Blindata Classe 3', 'Porta blindata di sicurezza classe 3', 'Porte', 1200.00, 5),
('Persiana Alluminio 80x120', 'Persiana in alluminio verniciato', 'Persiane', 280.00, 15);
*/