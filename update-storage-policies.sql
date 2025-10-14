-- AGGIORNAMENTO POLICY PER VISIBILITÀ CONDIVISA DEI DOCUMENTI
-- Eseguire questo script nel SQL Editor di Supabase

-- 1) STORAGE: permettere a tutti gli utenti autenticati di leggere i file nel bucket 'documents'
-- Usa DROP POLICY IF EXISTS per evitare l'uso di pg_policies
DROP POLICY IF EXISTS "Users can view own documents" ON storage.objects;
CREATE POLICY "Authenticated users can view documents" ON storage.objects 
  FOR SELECT USING (auth.role() = 'authenticated' AND bucket_id = 'documents');

-- NOTA: manteniamo INSERT/UPDATE/DELETE limitate al proprietario (come in setup-storage-supabase.sql)

-- 2) TABELLA client_documents: permettere SELECT a tutti gli utenti autenticati
-- DROP/CREATE diretto delle policy su client_documents
DROP POLICY IF EXISTS "Users can view own client documents" ON public.client_documents;
DROP POLICY IF EXISTS "Users can update own client documents" ON public.client_documents;
DROP POLICY IF EXISTS "Users can delete own client documents" ON public.client_documents;

CREATE POLICY "Authenticated users can view client documents" ON public.client_documents 
  FOR SELECT USING (auth.role() = 'authenticated');
CREATE POLICY "Authenticated users can update client documents" ON public.client_documents 
  FOR UPDATE USING (auth.role() = 'authenticated');
CREATE POLICY "Authenticated users can delete client documents" ON public.client_documents 
  FOR DELETE USING (auth.role() = 'authenticated');

-- Verifica
SELECT 'Policies aggiornate: SELECT consentito a tutti gli utenti autenticati per client_documents e storage.objects nel bucket documents' AS message;