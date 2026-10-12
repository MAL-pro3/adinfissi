import { useEffect, useRef, useState } from 'react';
import { Star, ExternalLink, ChevronLeft, ChevronRight } from 'lucide-react';
import {
  googleReviews,
  googleStats,
  type GoogleReview,
} from '../../data/googleReviews';

const AUTO_SCROLL_MS = 4500;

function StelleRating({ rating, small = false }: { rating: number; small?: boolean }) {
  const size = small ? 14 : 18;
  return (
    <div className="flex items-center gap-0.5">
      {[...Array(5)].map((_, i) => (
        <Star
          key={i}
          size={size}
          className={`${
            i < rating
              ? 'text-brand-yellow-400 fill-brand-yellow-400'
              : 'text-gray-300'
          }`}
        />
      ))}
    </div>
  );
}

function ReviewCard({ review }: { review: GoogleReview }) {
  return (
    <div className="bg-white border border-gray-100 p-4 sm:p-5 rounded-2xl shadow-sm hover:shadow-lg transition-all duration-300 w-[290px] sm:w-[320px] flex-shrink-0 snap-center h-full flex flex-col">
      <div className="flex items-start gap-3 mb-3">
        <img
          src={review.profile_photo_url}
          alt={review.author_name}
          className="w-10 h-10 rounded-full object-cover flex-shrink-0 border-2 border-brand-yellow-200"
          onError={(e) => {
            const fallback = `https://ui-avatars.com/api/?name=${encodeURIComponent(
              review.author_name,
            )}&background=FACC15&color=1f2937&bold=true&size=128`;
            (e.currentTarget as HTMLImageElement).src = fallback;
          }}
        />
        <div className="flex-1 min-w-0">
          <h4 className="font-bold text-gray-900 truncate text-sm sm:text-base">
            {review.author_name}
          </h4>
          <p className="text-[11px] sm:text-xs text-gray-500 mt-0.5">
            {review.relative_time_description}
          </p>
        </div>
      </div>

      <div className="mb-2.5">
        <StelleRating rating={review.rating} small />
      </div>

      <p className="text-gray-700 leading-relaxed italic text-xs sm:text-sm flex-1 line-clamp-6">
        &ldquo;{review.text}&rdquo;
      </p>
    </div>
  );
}

export default function GoogleReviews() {
  const trackRef = useRef<HTMLDivElement>(null);
  const [activeIndex, setActiveIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);

  const total = googleReviews.length;

  const goTo = (index: number) => {
    const el = trackRef.current;
    if (!el) return;
    const safeIndex = ((index % total) + total) % total;
    const card = el.children[safeIndex] as HTMLElement | undefined;
    if (card) {
      el.scrollTo({ left: card.offsetLeft - el.offsetLeft, behavior: 'smooth' });
    }
    setActiveIndex(safeIndex);
  };

  const next = () => goTo(activeIndex + 1);
  const prev = () => goTo(activeIndex - 1);

  useEffect(() => {
    if (isPaused || total <= 1) return;
    const id = window.setInterval(next, AUTO_SCROLL_MS);
    return () => window.clearInterval(id);
  }, [isPaused, activeIndex, total]);

  return (
    <section
      id="google-reviews"
      className="py-16 sm:py-20 bg-gray-50 overflow-hidden"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12 sm:mb-14">
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-gray-900 mb-4">
            ⭐ Recensioni Google
          </h2>
          <div className="w-24 h-1 bg-brand-yellow-500 mx-auto mb-6" />
          <p className="text-lg sm:text-xl text-gray-600 max-w-3xl mx-auto mb-8">
            La voce dei nostri clienti oltre 300 recensioni certificate su
            Google My Business — sempre aggiornate in tempo reale
          </p>

          <div className="inline-flex flex-col sm:flex-row items-center justify-center gap-5 sm:gap-10 bg-white px-5 sm:px-10 py-4 sm:py-5 rounded-2xl shadow-md border border-gray-100">
            <div className="flex items-center gap-3 sm:gap-4">
              <span className="text-4xl sm:text-5xl font-black text-gray-900 font-brand">
                {googleStats.avgRating}
              </span>
              <div className="flex flex-col items-start">
                <StelleRating rating={Math.round(googleStats.avgRating)} />
                <span className="text-xs sm:text-sm text-gray-500 font-medium mt-1">
                  su 5 stelle
                </span>
              </div>
            </div>

            <div className="hidden sm:block h-12 w-px bg-gray-200" />

            <div className="text-center sm:text-left">
              <p className="text-2xl sm:text-3xl font-black text-gray-900 font-brand">
                {googleStats.totalReviews}+
              </p>
              <p className="text-xs sm:text-sm text-gray-500 font-medium">
                recensioni totali su Google
              </p>
            </div>
          </div>
        </div>

        <div className="relative mb-10 sm:mb-12">
          <button
            onClick={prev}
            aria-label="Recensione precedente"
            className="hidden sm:flex absolute top-1/2 -translate-y-1/2 -left-2 lg:-left-5 z-20 w-11 h-11 items-center justify-center bg-white border border-gray-200 text-gray-700 hover:text-brand-yellow-700 hover:border-brand-yellow-400 shadow-md rounded-full transition-all"
          >
            <ChevronLeft size={22} />
          </button>
          <button
            onClick={next}
            aria-label="Recensione successiva"
            className="hidden sm:flex absolute top-1/2 -translate-y-1/2 -right-2 lg:-right-5 z-20 w-11 h-11 items-center justify-center bg-white border border-gray-200 text-gray-700 hover:text-brand-yellow-700 hover:border-brand-yellow-400 shadow-md rounded-full transition-all"
          >
            <ChevronRight size={22} />
          </button>

          <div
            ref={trackRef}
            className="flex gap-4 sm:gap-5 overflow-x-auto scroll-smooth snap-x snap-mandatory px-1 py-2 sm:px-4 -mx-4 sm:-mx-0 scrollbar-hide"
            style={{ scrollbarWidth: 'none' }}
          >
            {googleReviews.map((r, i) => (
              <ReviewCard key={i} review={r} />
            ))}
          </div>
        </div>

        <div className="flex items-center justify-center gap-2 mb-10 sm:mb-12">
          {googleReviews.map((_, i) => (
            <button
              key={i}
              aria-label={`Vai alla recensione ${i + 1}`}
              onClick={() => goTo(i)}
              className={`transition-all rounded-full ${
                i === activeIndex
                  ? 'w-7 h-2 bg-brand-yellow-500'
                  : 'w-2 h-2 bg-gray-300 hover:bg-gray-400'
              }`}
            />
          ))}
        </div>

        <div className="text-center">
          <a
            href={googleStats.googleUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 bg-brand-yellow-400 hover:bg-brand-yellow-500 text-gray-900 px-8 sm:px-10 py-3.5 sm:py-4 rounded-xl text-base sm:text-lg font-semibold transition-all shadow-lg hover:shadow-xl"
          >
            Vedi tutte le recensioni su Google
            <ExternalLink size={18} />
          </a>
        </div>
      </div>
    </section>
  );
}
