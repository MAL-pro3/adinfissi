import { useEffect, useMemo, useState } from 'react';
import { categorieLavori, type CategoriaLavori, type FotoLavoro } from '../data/lavori';
import { GalleryService, type GalleryImage } from '../services/galleryService';

// Immagine hero di fallback (usata finché la segretaria non ne carica di nuove)
const FALLBACK_HERO =
  'https://images.pexels.com/photos/1643389/pexels-photo-1643389.jpeg?auto=compress&cs=tinysrgb&w=1920';

export interface SiteImages {
  /** Immagini di sfondo della home (slideshow se più di una). */
  heroImages: string[];
  /** Categorie lavori con copertine e foto dinamiche (fallback ai dati statici). */
  categorie: CategoriaLavori[];
  loading: boolean;
}

const bySort = (a: GalleryImage, b: GalleryImage) =>
  a.sort_order - b.sort_order || a.created_at.localeCompare(b.created_at);

/**
 * Carica le immagini gestite dal pannello "Gestione Sito Web".
 * Se per una sezione non ci sono immagini su Supabase, usa i dati statici di
 * `categorieLavori` (così il sito non resta mai vuoto).
 */
export function useSiteImages(): SiteImages {
  const [images, setImages] = useState<GalleryImage[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let alive = true;

    GalleryService.list()
      .then((data) => {
        if (alive) setImages(data);
      })
      .catch((err) => {
        console.error('Errore nel caricamento immagini dinamiche:', err);
        if (alive) setImages([]);
      })
      .finally(() => {
        if (alive) setLoading(false);
      });

    return () => {
      alive = false;
    };
  }, []);

  const activeImages = useMemo(() => images.filter((i) => i.is_active), [images]);

  const heroImages = useMemo(() => {
    const hero = activeImages.filter((i) => i.section === 'HERO').sort(bySort).map((i) => i.image_url);
    return hero.length > 0 ? hero : [FALLBACK_HERO];
  }, [activeImages]);

  const categorie = useMemo<CategoriaLavori[]>(() => {
    return categorieLavori.map((cat) => {
      const imgs = activeImages.filter((i) => i.section === cat.key).sort(bySort);
      if (imgs.length === 0) return cat; // fallback statico per questa categoria

      const cover = imgs.find((i) => i.is_cover) ?? imgs[0];
      const foto: FotoLavoro[] = imgs.map((i) => ({
        url: i.image_url,
        titolo: i.title?.trim() || cat.nome,
        descrizione: i.description?.trim() || undefined,
      }));

      return { ...cat, copertina: cover.image_url, foto };
    });
  }, [activeImages]);

  return { heroImages, categorie, loading };
}
