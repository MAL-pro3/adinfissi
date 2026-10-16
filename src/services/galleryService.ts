import { supabase } from './supabase';

/** Sezione speciale riservata all'immagine di sfondo della hero. */
export const HERO_SECTION = 'HERO';

/** Categoria lavori (tabella `gallery_categories`). */
export interface GalleryCategory {
  id: string;
  slug: string;
  nome: string;
  descrizione: string | null;
  sort_order: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

/** Immagine del sito (tabella `gallery_images`). */
export interface GalleryImage {
  id: string;
  section: string;
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

function slugifyFileName(name: string): string {
  return name.replace(/[^a-zA-Z0-9.-]/g, '_');
}

/** Genera uno slug leggibile a partire dal nome categoria (es. "Mobili in alluminio" → "MOBILI_IN_ALLUMINIO"). */
export function generateSlug(nome: string): string {
  const base = nome
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toUpperCase()
    .replace(/[^A-Z0-9]+/g, '_')
    .replace(/^_+|_+$/g, '');
  return base || 'CATEGORIA';
}

export function getPublicUrl(path: string): string {
  return supabase.storage.from(BUCKET).getPublicUrl(path).data.publicUrl;
}

// ==============================================================
// CATEGORIE
// ==============================================================
export class CategoryService {
  static async list(): Promise<GalleryCategory[]> {
    const { data, error } = await supabase
      .from('gallery_categories')
      .select('*')
      .order('sort_order', { ascending: true })
      .order('created_at', { ascending: true });

    if (error) throw error;
    return (data ?? []) as GalleryCategory[];
  }

  static async create(input: { nome: string; descrizione?: string }): Promise<GalleryCategory> {
    const nome = input.nome.trim();
    if (!nome) throw new Error('Il nome della categoria è obbligatorio.');

    // Slug univoco generato dal nome
    const { data: existing, error: existingError } = await supabase
      .from('gallery_categories')
      .select('slug, sort_order');
    if (existingError) throw existingError;

    const taken = new Set((existing ?? []).map((c) => c.slug));
    const base = generateSlug(nome);
    let slug = base;
    let counter = 2;
    while (taken.has(slug)) {
      slug = `${base}_${counter++}`;
    }

    const nextOrder = (existing ?? []).reduce((max, c) => Math.max(max, c.sort_order), 0) + 1;

    const { data, error } = await supabase
      .from('gallery_categories')
      .insert({
        slug,
        nome,
        descrizione: input.descrizione?.trim() || null,
        sort_order: nextOrder,
      })
      .select()
      .single();

    if (error) throw error;
    return data as GalleryCategory;
  }

  /**
   * Aggiorna nome/descrizione/stato/ordine.
   * Lo slug NON è modificabile: cambiandolo le immagini collegate resterebbero orfane.
   */
  static async update(
    id: string,
    patch: Partial<Pick<GalleryCategory, 'nome' | 'descrizione' | 'is_active' | 'sort_order'>>,
  ): Promise<void> {
    const { error } = await supabase.from('gallery_categories').update(patch).eq('id', id);
    if (error) throw error;
  }

  /** Elimina la categoria e TUTTE le sue immagini (record + file su storage). */
  static async remove(category: GalleryCategory): Promise<void> {
    const { data: imgs } = await supabase
      .from('gallery_images')
      .select('storage_path')
      .eq('section', category.slug);

    const paths = (imgs ?? [])
      .map((i) => i.storage_path)
      .filter((p): p is string => Boolean(p));

    if (paths.length > 0) {
      await supabase.storage.from(BUCKET).remove(paths);
    }

    await supabase.from('gallery_images').delete().eq('section', category.slug);

    const { error } = await supabase.from('gallery_categories').delete().eq('id', category.id);
    if (error) throw error;
  }

  /** Salva il nuovo ordinamento (l'array è già nell'ordine desiderato). */
  static async saveOrder(ordered: GalleryCategory[]): Promise<void> {
    await Promise.all(
      ordered.map((c, index) =>
        supabase.from('gallery_categories').update({ sort_order: index + 1 }).eq('id', c.id),
      ),
    );
  }
}

// ==============================================================
// IMMAGINI
// ==============================================================
export class GalleryService {
  /** Elenco immagini (per gli anonimi la RLS restituisce solo quelle attive). */
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
    section: string,
    options?: { title?: string; description?: string; isCover?: boolean },
  ): Promise<GalleryImage> {
    if (file.size > MAX_FILE_SIZE) {
      throw new Error('Il file è troppo grande. Dimensione massima: 10MB');
    }
    if (!file.type.startsWith('image/')) {
      throw new Error('Il file deve essere un\'immagine');
    }

    const path = `${section.toLowerCase()}/${Date.now()}_${slugifyFileName(file.name)}`;

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
  static async setCover(id: string, section: string): Promise<void> {
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

  /** Salva il nuovo ordinamento delle immagini di una sezione. */
  static async saveOrder(ordered: GalleryImage[]): Promise<void> {
    await Promise.all(
      ordered.map((img, index) => this.update(img.id, { sort_order: index })),
    );
  }
}
