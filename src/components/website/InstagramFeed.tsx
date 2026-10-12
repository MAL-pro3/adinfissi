import { useEffect, useRef } from 'react';
import { ExternalLink } from 'lucide-react';

/**
 * PID widget Instagram Feed CommonNinja fornito da utente.
 * Griglia configurata: 3 colonne × 2 righe = ultimi 6 post @adinfissi
 * Layout 1:1 quadrato stile IG feed.
 *
 * NOTA IMPORTANTE: CommonNinja identifica il widget tramite la CLASSE CSS
 * `pid-<ID>`, NON tramite un attributo `pid`. Questo è il motivo per cui
 * prima non si vedeva nulla.
 */
const WIDGET_PID = '288c14cd-253a-42a5-867b-3c492df2fbb3';
const SDK_URL = 'https://cdn.commoninja.com/sdk/latest/commonninja.js';
const INSTAGRAM_PROFILE = 'https://www.instagram.com/adinfissi';
const INSTAGRAM_USERNAME = '@adinfissi';

export default function InstagramFeed() {
  const injectedRef = useRef(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (injectedRef.current) return;
    injectedRef.current = true;

    let sdkScript: HTMLScriptElement | null = document.querySelector(
      `script[src="${SDK_URL}"]`
    );

    const initWidget = () => {
      // Attendiamo che il DOM e l'SDK siano pronti, poi forziamo la scansione
      const tryInit = () => {
        if (typeof window !== 'undefined' && (window as any).CommonNinja) {
          try {
            (window as any).CommonNinja.init();
          } catch (e) {
            /* ignore */
          }
        }
      };
      setTimeout(tryInit, 500);
      setTimeout(tryInit, 1500);
      setTimeout(tryInit, 3000);
    };

    if (sdkScript) {
      initWidget();
      return;
    }

    sdkScript = document.createElement('script');
    sdkScript.src = SDK_URL;
    sdkScript.defer = true;
    sdkScript.async = false;
    sdkScript.onload = initWidget;
    document.head.appendChild(sdkScript);
  }, []);

  return (
    <section
      id="instagram-feed"
      className="py-14 sm:py-16 lg:py-20 bg-white overflow-hidden"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-10 sm:mb-12 lg:mb-14">
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-gray-900 mb-4">
            📸 Seguici su Instagram
          </h2>
          <div className="w-24 h-1 bg-brand-yellow-500 mx-auto mb-6" />
          <p className="text-lg sm:text-xl text-gray-600 max-w-3xl mx-auto mb-8">
            Gli ultimi 6 post pubblicati sul nostro profilo{' '}
            <span className="font-semibold">{INSTAGRAM_USERNAME}</span> —
            sempre aggiornati in tempo reale. Clicca su qualsiasi post per
            aprire Instagram e mettere like.
          </p>

          <a
            href={INSTAGRAM_PROFILE}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-3 bg-brand-yellow-400 hover:bg-brand-yellow-500 text-gray-900 px-7 sm:px-10 py-3.5 sm:py-4 rounded-xl text-base sm:text-lg font-semibold transition-all shadow-lg hover:shadow-xl"
          >
            <span
              className="inline-flex items-center justify-center w-7 h-7 rounded-full text-white"
              style={{
                background:
                  'linear-gradient(135deg,#feda75 0%,#fa7e1e 25%,#d62976 50%,#962fbf 75%,#4f5bd5 100%)',
              }}
              aria-hidden="true"
            >
              <svg
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="currentColor"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path d="M12 2.163c-3.205 0-3.584.012-4.85.07-3.252.148-4.778 1.691-4.919 4.919-.058 1.266-.07 1.646-.07 4.85 0 3.206.012 3.585.07 4.85.148 3.252 1.691 4.778 4.919 4.919 1.266.058 1.646.07 4.85.07 3.206 0 3.585-.012 4.85-.07 3.26-.148 4.771-1.664 4.92-4.919.057-1.265.07-1.644.07-4.85 0-3.205-.012-3.584-.07-4.85-.149-3.252-1.664-4.778-4.919-4.919-1.266-.058-1.645-.07-4.85-.07zm0 1.838c3.154 0 3.527.01 4.771.068 2.143.098 3.272 1.2 3.37 3.37.057 1.243.068 1.617.068 4.771 0 3.154-.01 3.526-.068 4.771-.098 2.143-1.2 3.272-3.37 3.37-1.243.057-1.617.068-4.771.068-3.155 0-3.527-.01-4.771-.068-2.174-.098-3.272-1.225-3.37-3.37-.057-1.244-.068-1.617-.068-4.771 0-3.154.01-3.526.068-4.771.098-2.174 1.225-3.272 3.37-3.37 1.244-.057 1.617-.068 4.771-.068zm0 3.164a4.835 4.835 0 100 9.67 4.835 4.835 0 000-9.67zm0 1.838a3 3 0 110 5.994 3 3 0 010-5.994zm6.406-2.04a1.152 1.152 0 100 2.306 1.152 1.152 0 000-2.306z" />
              </svg>
            </span>
            Seguici sul nostro profilo Instagram
            <ExternalLink size={18} />
          </a>
        </div>

        <div
          ref={containerRef}
          className={
            'cn-instagram-feed-wrapper w-full flex justify-center ' +
            'max-w-5xl mx-auto'
          }
          suppressHydrationWarning
        >
          {/*
            IMPORTANTE: CommonNinja richiede il PID come CLASSE CSS
            `pid-<ID>`, non come attributo. Senza questo il div resta vuoto.
          */}
          <div
            className={`commonninja_component pid-${WIDGET_PID}`}
            suppressHydrationWarning
          />
        </div>
      </div>
    </section>
  );
}
