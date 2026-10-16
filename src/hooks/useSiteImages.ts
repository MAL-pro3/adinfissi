import { useEffect, useMemo, useState } from 'react';
import { categorieLavori, type CategoriaLavori, type FotoLavoro } from '../data/lavori';
import {
  CategoryService,
  GalleryService,
  HERO_SECTION,
  type GalleryCategory,
  type GalleryImage,
} from '../services/galleryService';

// Immagine hero di fallback (usata finché non ne vengono caricate di nuove)
const FALLBACK_HERO =
  'https://images.pexels.com/photos/1643389/pexels-photo-1643389.jpeg?auto=compress&cs=tinysrgb&w=1920';

export interface SiteImages {
  /** Immagini di sfondo della home (slideshow se più di una). */
  heroImages: string[];
  /** Categorie lavori (dal database) con copertine e foto. */
  categorie: CategoriaLavori[];
  loading: boolean;
}

const bySort = (a: GalleryImage, b: GalleryImage) =>
  a.sort_order - b.sort_order || a.created_at.localeCompare(b.created_at);

/**
 * Carica categorie e immagini gestite dal pannello "Gestione Sito Web".
 * Se il database non è raggiungibile, usa i dati statici di `categorieLavori`
 * (così il sito non resta mai vuoto).
 */
export function useSiteImages(): SiteImages {
  const [categories, setCategories] = useState<GalleryCategory[]>([]);
  const [images, setImages] = useState<GalleryImage[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let alive = true;

    Promise.all([CategoryService.list(), GalleryService.list()])
      .then(([cats, imgs]) => {
        if (!alive) return;
        setCategories(cats.filter((c) => c.is_active));
        setImages(imgs);
      })
      .catch((err) => {
        console.error('Errore nel caricamento delle immagini dinamiche:', err);
        if (alive) {
          setCategories([]);
          setImages([]);
        }
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
    const hero = activeImages
      .filter((i) => i.section === HERO_SECTION)
      .sort(bySort)
      .map((i) => i.image_url);
    return hero.length > 0 ? hero : [FALLBACK_HERO];
  }, [activeImages]);

  const categorie = useMemo<CategoriaLavori[]>(() => {
    // Nessuna categoria nel database → fallback statico
    if (categories.length === 0) return categorieLavori;

    return categories.map((cat) => {
      const imgs = activeImages.filter((i) => i.section === cat.slug).sort(bySort);
      const cover = imgs.find((i) => i.is_cover) ?? imgs[0];

      const foto: FotoLavoro[] = imgs.map((i) => ({
        url: i.image_url,
        titolo: i.title?.trim() || cat.nome,
        descrizione: i.description?.trim() || undefined,
      }));

      return {
        slug: cat.slug,
        nome: cat.nome,
        descrizione: cat.descrizione ?? '',
        copertina: cover?.image_url ?? '',
        foto,
      };
    });
  }, [categories, activeImages]);

  return { heroImages, categorie, loading };
}
