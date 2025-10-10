-- SCRIPT SQL PER CREARE IL PROFILO UTENTE MANCANTE
-- Esegui questo nel Dashboard Supabase → SQL Editor

-- 1. Prima trova l'ID dell'utente
-- Vai in Authentication → Users e copia l'ID dell'utente ediliziaedinfissi@hotmail.com

-- 2. Sostituisci 'USER_ID_QUI' con l'ID reale dell'utente
-- 3. Esegui questo script

-- Inserisci il profilo per l'utente esistente
INSERT INTO public.profiles (
    id,
    email,
    role,
    full_name,
    created_at,
    updated_at
) VALUES (
    'USER_ID_QUI',  -- ⚠️ SOSTITUISCI CON L'ID REALE DELL'UTENTE
    'ediliziaedinfissi@hotmail.com',
    'admin',
    'Edilizia e Infissi',
    NOW(),
    NOW()
) ON CONFLICT (id) DO UPDATE SET
    email = EXCLUDED.email,
    role = EXCLUDED.role,
    full_name = EXCLUDED.full_name,
    updated_at = NOW();

-- Verifica che il profilo sia stato creato
SELECT * FROM public.profiles WHERE email = 'ediliziaedinfissi@hotmail.com';

-- Se tutto è andato bene, dovresti vedere il profilo creato
-- Ora prova a fare il login nell'applicazione!