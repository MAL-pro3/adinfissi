-- =============================================================
-- GESTIONE DINAMICA IMMAGINI SITO WEB (AD INFISSI)
-- Tabella + bucket storage + policy RLS
-- Eseguibile in modo idempotente
-- =============================================================

-- 1. TABELLA IMMAGINI
CREATE TABLE IF NOT EXISTS public.gallery_images (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    section TEXT NOT NULL CHECK (section IN ('HERO', 'INFISSI', 'PERGOLATI', 'CANCELLI', 'PORTE')),
    image_url TEXT NOT NULL,
    storage_path TEXT,
    title TEXT,
    description TEXT,
    is_cover BOOLEAN NOT NULL DEFAULT FALSE,
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    sort_order INTEGER NOT NULL DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. INDICI
CREATE INDEX IF NOT EXISTS idx_gallery_images_section ON public.gallery_images(section);
CREATE INDEX IF NOT EXISTS idx_gallery_images_active ON public.gallery_images(is_active);
CREATE INDEX IF NOT EXISTS idx_gallery_images_sort ON public.gallery_images(section, sort_order);

-- 3. RLS
ALTER TABLE public.gallery_images ENABLE ROW LEVEL SECURITY;

-- Lettura pubblica: il sito mostra solo le immagini attive (anon key)
DROP POLICY IF EXISTS "gallery_images_public_read" ON public.gallery_images;
CREATE POLICY "gallery_images_public_read" ON public.gallery_images
    FOR SELECT TO anon, authenticated
    USING (is_active = TRUE);

-- Gestione completa per utenti autenticati (segretaria / admin)
DROP POLICY IF EXISTS "gallery_images_auth_all" ON public.gallery_images;
CREATE POLICY "gallery_images_auth_all" ON public.gallery_images
    FOR ALL TO authenticated
    USING (TRUE)
    WITH CHECK (TRUE);

-- 4. TRIGGER updated_at
DROP TRIGGER IF EXISTS update_gallery_images_updated_at ON public.gallery_images;
CREATE TRIGGER update_gallery_images_updated_at
    BEFORE UPDATE ON public.gallery_images
    FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- 5. BUCKET PUBBLICO PER LE IMMAGINI DEL SITO
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
    'website',
    'website',
    TRUE, -- Bucket pubblico: le immagini devono essere visibili sul sito
    10485760, -- 10MB limite per file
    ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/gif', 'image/avif']
)
ON CONFLICT (id) DO NOTHING;

-- 6. POLICY STORAGE
-- Lettura pubblica delle immagini del sito
DROP POLICY IF EXISTS "website_public_read" ON storage.objects;
CREATE POLICY "website_public_read" ON storage.objects
    FOR SELECT TO anon, authenticated
    USING (bucket_id = 'website');

-- Upload / modifica / eliminazione per utenti autenticati
DROP POLICY IF EXISTS "website_auth_insert" ON storage.objects;
CREATE POLICY "website_auth_insert" ON storage.objects
    FOR INSERT TO authenticated
    WITH CHECK (bucket_id = 'website');

DROP POLICY IF EXISTS "website_auth_update" ON storage.objects;
CREATE POLICY "website_auth_update" ON storage.objects
    FOR UPDATE TO authenticated
    USING (bucket_id = 'website');

DROP POLICY IF EXISTS "website_auth_delete" ON storage.objects;
CREATE POLICY "website_auth_delete" ON storage.objects
    FOR DELETE TO authenticated
    USING (bucket_id = 'website');

-- Conferma
DO $$
BEGIN
    RAISE NOTICE 'Gestione Sito Web: tabella gallery_images e bucket website configurati!';
END $$;
