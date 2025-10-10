-- CONFIGURAZIONE SUPABASE STORAGE PER DOCUMENTI
-- Eseguire questo script nel SQL Editor di Supabase per configurare lo storage

-- 1. CREA IL BUCKET PER I DOCUMENTI
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
    'documents',
    'documents',
    false, -- Bucket privato per sicurezza
    10485760, -- 10MB limite per file
    ARRAY[
        'application/pdf',
        'application/msword',
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        'application/vnd.ms-excel',
        'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        'image/jpeg',
        'image/png',
        'image/gif',
        'image/webp',
        'application/zip',
        'application/x-rar-compressed'
    ]
)
ON CONFLICT (id) DO NOTHING;

-- 2. POLICY PER VISUALIZZARE I DOCUMENTI
-- Gli utenti autenticati possono vedere solo i propri documenti
CREATE POLICY "Users can view own documents" ON storage.objects
FOR SELECT USING (
    auth.role() = 'authenticated' AND
    bucket_id = 'documents' AND
    (storage.foldername(name))[1] = auth.uid()::text
);

-- 3. POLICY PER CARICARE DOCUMENTI
-- Gli utenti autenticati possono caricare documenti nella propria cartella
CREATE POLICY "Users can upload own documents" ON storage.objects
FOR INSERT WITH CHECK (
    auth.role() = 'authenticated' AND
    bucket_id = 'documents' AND
    (storage.foldername(name))[1] = auth.uid()::text
);

-- 4. POLICY PER AGGIORNARE DOCUMENTI
-- Gli utenti possono aggiornare i propri documenti
CREATE POLICY "Users can update own documents" ON storage.objects
FOR UPDATE USING (
    auth.role() = 'authenticated' AND
    bucket_id = 'documents' AND
    (storage.foldername(name))[1] = auth.uid()::text
);

-- 5. POLICY PER ELIMINARE DOCUMENTI
-- Gli utenti possono eliminare i propri documenti
CREATE POLICY "Users can delete own documents" ON storage.objects
FOR DELETE USING (
    auth.role() = 'authenticated' AND
    bucket_id = 'documents' AND
    (storage.foldername(name))[1] = auth.uid()::text
);

-- 6. CREA TABELLA PER METADATI DOCUMENTI
-- Questa tabella conterrà i metadati dei documenti mentre i file saranno nello storage
CREATE TABLE IF NOT EXISTS public.client_documents (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    client_id UUID REFERENCES public.customers(id) ON DELETE CASCADE,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    file_name TEXT NOT NULL,
    file_path TEXT NOT NULL, -- Path nel bucket storage
    file_size BIGINT NOT NULL,
    mime_type TEXT NOT NULL,
    category TEXT NOT NULL CHECK (category IN ('PREVENTIVO', 'CONTRATTO', 'FATTURA', 'FOTO', 'DOCUMENTO_IDENTITA', 'ALTRO')),
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 7. ABILITA RLS SULLA TABELLA DOCUMENTI
ALTER TABLE public.client_documents ENABLE ROW LEVEL SECURITY;

-- 8. POLICY RLS PER LA TABELLA DOCUMENTI
-- Gli utenti possono vedere solo i propri documenti
CREATE POLICY "Users can view own client documents" ON public.client_documents
FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own client documents" ON public.client_documents
FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own client documents" ON public.client_documents
FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own client documents" ON public.client_documents
FOR DELETE USING (auth.uid() = user_id);

-- 9. INDICI PER PERFORMANCE
CREATE INDEX IF NOT EXISTS idx_client_documents_client_id ON public.client_documents(client_id);
CREATE INDEX IF NOT EXISTS idx_client_documents_user_id ON public.client_documents(user_id);
CREATE INDEX IF NOT EXISTS idx_client_documents_category ON public.client_documents(category);

-- 10. TRIGGER PER AGGIORNARE TIMESTAMP
CREATE TRIGGER update_client_documents_updated_at
    BEFORE UPDATE ON public.client_documents
    FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- 11. FUNZIONE PER PULIRE DOCUMENTI ORFANI
-- Questa funzione elimina i file dallo storage quando viene eliminato il record dal database
CREATE OR REPLACE FUNCTION public.delete_storage_object()
RETURNS TRIGGER AS $$
BEGIN
    -- Elimina il file dallo storage
    PERFORM storage.delete_object('documents', OLD.file_path);
    RETURN OLD;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 12. TRIGGER PER ELIMINARE FILE DALLO STORAGE
CREATE TRIGGER on_client_document_deleted
    AFTER DELETE ON public.client_documents
    FOR EACH ROW EXECUTE FUNCTION public.delete_storage_object();

-- Messaggio di conferma
DO $$
BEGIN
    RAISE NOTICE 'Configurazione Supabase Storage completata!';
    RAISE NOTICE 'Bucket "documents" creato con policy di sicurezza';
    RAISE NOTICE 'Tabella "client_documents" creata per metadati';
    RAISE NOTICE 'RLS e trigger configurati correttamente';
    RAISE NOTICE 'Limite file: 10MB per documento';
END $$;