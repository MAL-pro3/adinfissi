import { supabase } from './supabase';

// Sezioni gestibili dal pannello "Gestione Sito Web"
export type GallerySection = 'HERO' | 'INFISSI' | 'PERGOLATI' | 'CANCELLI' | 'PORTE';

export const GALLERY_SECTIONS: { key: GallerySection; label: string; hint: string }[] = [
  { key: 'HERO', label: 'Immagine Hero', hint: 'Sfondo della home (in alto). Se metti più foto, diventano uno slideshow.' },
  { key: 'INFISSI', label: 'Infissi', hint: 'Copertina della card + foto della galleria.' },
  { key: 'PERGOLATI', label: 'Pergolati', hint: 'Copertina della card + foto della galleria.' },
  { key: 'CANCELLI', label: 'Cancelli', hint: 'Copertina della card + foto della galleria.' },
  { key: 'PORTE', label: 'Porte', hint: 'Copertina della card + foto della galleria.' },
];

export interface GalleryImage {
  id: string;
  section: GallerySection;
  image_url: string;
  storage_path: string | null;
  title: string | null;
  description: string | null;
  is_cover: boolean;
  is_active: boolean;
  sort_order: number;
  created_at: string;
  updated_at: string;
}

const BUCKET = 'website';
const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB

function slugify(name: string): string {
  return name.replace(/[^a-zA-Z0-9.-]/g, '_');
}

export function getPublicUrl(path: string): string {
  return supabase.storage.from(BUCKET).getPublicUrl(path).data.publicUrl;
}

export class GalleryService {
  /** Elenco immagini (la RLS pubblica restituisce solo quelle attive per gli anonimi). */
  static async list(): Promise<GalleryImage[]> {
    const { data, error } = await supabase
      .from('gallery_images')
      .select('*')
      .order('section', { ascending: true })
      .order('sort_order', { ascending: true })
      .order('created_at', { ascending: true });

    if (error) throw error;
    return (data ?? []) as GalleryImage[];
  }

  /** Carica un file nello storage e crea il record nel database. */
  static async upload(
    file: File,
    section: GallerySection,
    options?: { title?: string; description?: string; isCover?: boolean },
  ): Promise<GalleryImage> {
    if (file.size > MAX_FILE_SIZE) {
      throw new Error('Il file è troppo grande. Dimensione massima: 10MB');
    }
    if (!file.type.startsWith('image/')) {
      throw new Error('Il file deve essere un\'immagine');
    }

    const path = `${section.toLowerCase()}/${Date.now()}_${slugify(file.name)}`;

    const { error: uploadError } = await supabase.storage
      .from(BUCKET)
      .upload(path, file, { cacheControl: '31536000', upsert: false });

    if (uploadError) throw uploadError;

    const imageUrl = getPublicUrl(path);

    const { data, error } = await supabase
      .from('gallery_images')
      .insert({
        section,
        image_url: imageUrl,
        storage_path: path,
        title: options?.title?.trim() || null,
        description: options?.description?.trim() || null,
        is_cover: options?.isCover ?? false,
        sort_order: 0,
      })
      .select()
      .single();

    if (error) {
      // Se il DB fallisce, rimuovi il file appena caricato
      await supabase.storage.from(BUCKET).remove([path]);
      throw error;
    }

    // Se richiesta come copertina, togli il flag dalle altre della stessa sezione
    if (options?.isCover) {
      await this.setCover(data.id, section);
    }

    return data as GalleryImage;
  }

  /** Elimina record + file dallo storage. */
  static async remove(image: GalleryImage): Promise<void> {
    if (image.storage_path) {
      await supabase.storage.from(BUCKET).remove([image.storage_path]);
    }
    const { error } = await supabase.from('gallery_images').delete().eq('id', image.id);
    if (error) throw error;
  }

  /** Aggiorna campi (titolo, descrizione, attivo, ordine). */
  static async update(
    id: string,
    patch: Partial<Pick<GalleryImage, 'title' | 'description' | 'is_active' | 'sort_order'>>,
  ): Promise<void> {
    const { error } = await supabase.from('gallery_images').update(patch).eq('id', id);
    if (error) throw error;
  }

  /** Imposta un'immagine come copertina della sezione (esclusiva). */
  static async setCover(id: string, section: GallerySection): Promise<void> {
    const { error: resetError } = await supabase
      .from('gallery_images')
      .update({ is_cover: false })
      .eq('section', section);
    if (resetError) throw resetError;

    const { error } = await supabase
      .from('gallery_images')
      .update({ is_cover: true })
      .eq('id', id);
    if (error) throw error;
  }
}
