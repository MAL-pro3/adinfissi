import { useCallback, useEffect, useRef, useState, type CSSProperties } from 'react';
import { Link } from 'react-router-dom';
import { ChevronLeft, ChevronRight, ArrowRight, ImageIcon } from 'lucide-react';
import type { CategoriaLavori } from '../../data/lavori';

interface CategoryCarouselProps {
  categorie: CategoriaLavori[];
}

const AUTOPLAY_MS = 4500;
/** Passo orizzontale tra le card, in % della larghezza della card. */
const STEP_PERCENT = 58;

/**
 * Carosello "coverflow": card centrale in risalto, 2 card più piccole
 * per lato che scorrono in modo circolare. Autoplay + frecce + swipe.
 * Il click sulla card centrale apre la galleria filtrata.
 */
const CategoryCarousel = ({ categorie }: CategoryCarouselProps) => {
  const count = categorie.length;
  const [active, setActive] = useState(0);
  const [paused, setPaused] = useState(false);
  const touchStartX = useRef<number | null>(null);

  const next = useCallback(() => {
    if (count === 0) return;
    setActive((i) => (i + 1) % count);
  }, [count]);

  const prev = useCallback(() => {
    if (count === 0) return;
    setActive((i) => (i - 1 + count) % count);
  }, [count]);

  // Autoplay (si ferma al passaggio del mouse / al tocco)
  useEffect(() => {
    if (paused || count <= 1) return;
    const id = window.setInterval(next, AUTOPLAY_MS);
    return () => window.clearInterval(id);
  }, [paused, count, next]);

  // Se cambia il numero di categorie, riallinea l'indice attivo
  useEffect(() => {
    setActive((i) => (count === 0 ? 0 : i % count));
  }, [count]);

  if (count === 0) return null;

  /** Distanza circolare (più breve) tra una card e quella attiva. */
  const circularOffset = (index: number) => {
    let d = index - active;
    if (d > count / 2) d -= count;
    if (d < -count / 2) d += count;
    return d;
  };

  const cardStyle = (offset: number): CSSProperties => {
    const abs = Math.abs(offset);
    const clamped = Math.max(-2, Math.min(2, offset));
    const scale = clamped === 0 ? 1 : abs === 1 ? 0.78 : 0.6;
    const translate = clamped * STEP_PERCENT;

    return {
      transform: `translate(-50%, -50%) translateX(${translate}%) scale(${scale})`,
      opacity: abs > 2 ? 0 : 1 - abs * 0.18,
      zIndex: 30 - abs,
      pointerEvents: abs > 2 ? 'none' : 'auto',
    };
  };

  const onTouchStart = (e: React.TouchEvent) => {
    touchStartX.current = e.touches[0].clientX;
    setPaused(true);
  };
  const onTouchEnd = (e: React.TouchEvent) => {
    if (touchStartX.current !== null) {
      const delta = e.changedTouches[0].clientX - touchStartX.current;
      if (Math.abs(delta) > 45) {
        if (delta < 0) next();
        else prev();
      }
    }
    touchStartX.current = null;
    setPaused(false);
  };

  const onKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowLeft') {
      e.preventDefault();
      prev();
    }
    if (e.key === 'ArrowRight') {
      e.preventDefault();
      next();
    }
  };

  return (
    <div
      className="relative"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      onTouchStart={onTouchStart}
      onTouchEnd={onTouchEnd}
    >
      <div
        className="relative h-[350px] sm:h-[430px] lg:h-[500px] outline-none"
        tabIndex={0}
        onKeyDown={onKeyDown}
        role="region"
        aria-roledescription="carosello"
        aria-label="Categorie dei nostri lavori"
      >
        {categorie.map((cat, index) => {
          const offset = circularOffset(index);
          const isCenter = offset === 0;
          const hidden = Math.abs(offset) > 2;

          const content = (
            <>
              {cat.copertina ? (
                <img
                  src={cat.copertina}
                  alt={cat.nome}
                  className="absolute inset-0 w-full h-full object-cover"
                  loading="lazy"
                />
              ) : (
                <div className="absolute inset-0 bg-gradient-to-br from-gray-700 to-gray-900 flex items-center justify-center">
                  <ImageIcon className="text-white/30" size={56} />
                </div>
              )}

              <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/30 to-transparent" />

              <div className="absolute inset-x-0 bottom-0 p-5 text-white">
                <h3 className="text-lg sm:text-2xl font-bold leading-tight">{cat.nome}</h3>
                {isCenter && cat.descrizione && (
                  <p className="mt-2 text-sm text-white/85 line-clamp-2">{cat.descrizione}</p>
                )}
                {isCenter && (
                  <span className="mt-3 inline-flex items-center gap-1.5 text-sm font-semibold text-brand-yellow-400">
                    Vedi i lavori <ArrowRight size={16} />
                  </span>
                )}
              </div>
            </>
          );

          return (
            <div
              key={cat.slug}
              className="absolute top-1/2 left-1/2 w-64 sm:w-72 lg:w-80 h-80 sm:h-96 lg:h-[26rem] rounded-2xl overflow-hidden shadow-xl transition-all duration-500 ease-out"
              style={cardStyle(offset)}
              aria-hidden={hidden}
              onClick={() => {
                if (!isCenter) setActive(index);
              }}
            >
              {isCenter ? (
                <Link
                  to={`/lavori?cat=${cat.slug}`}
                  className="block w-full h-full cursor-pointer"
                  aria-label={`Vedi i lavori della categoria ${cat.nome}`}
                >
                  {content}
                </Link>
              ) : (
                <>
                  {content}
                  <div className="absolute inset-0 bg-black/35 cursor-pointer" />
                </>
              )}
            </div>
          );
        })}

        {/* Frecce */}
        <button
          type="button"
          onClick={prev}
          aria-label="Categoria precedente"
          className="absolute left-1 sm:left-4 top-1/2 -translate-y-1/2 z-40 p-2 sm:p-3 rounded-full bg-white/90 hover:bg-white text-gray-900 shadow-lg transition-all hover:scale-110"
        >
          <ChevronLeft size={22} />
        </button>
        <button
          type="button"
          onClick={next}
          aria-label="Categoria successiva"
          className="absolute right-1 sm:right-4 top-1/2 -translate-y-1/2 z-40 p-2 sm:p-3 rounded-full bg-white/90 hover:bg-white text-gray-900 shadow-lg transition-all hover:scale-110"
        >
          <ChevronRight size={22} />
        </button>
      </div>

      {/* Indicatori */}
      <div className="mt-6 flex items-center justify-center gap-2">
        {categorie.map((cat, index) => (
          <button
            key={`dot-${cat.slug}`}
            type="button"
            onClick={() => setActive(index)}
            aria-label={`Vai alla categoria ${cat.nome}`}
            className={`h-2 rounded-full transition-all duration-300 ${
              index === active ? 'w-6 bg-brand-yellow-400' : 'w-2 bg-gray-300 hover:bg-gray-400'
            }`}
          />
        ))}
      </div>
    </div>
  );
};

export default CategoryCarousel;
