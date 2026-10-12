import React, { useEffect, useMemo, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import {
  Menu,
  X,
  MessageCircle,
  MapPin,
  Phone,
  Clock,
  Instagram,
  Facebook,
  ChevronLeft,
  ChevronRight,
  ArrowLeft,
} from 'lucide-react';
import {
  categorieLavori,
  getCategoriaByKey,
  type FotoLavoro,
  type LavoroCategoria,
} from '../../data/lavori';

type FiltroCategoria = 'TUTTE' | LavoroCategoria;

const FILTRI: { key: FiltroCategoria; label: string }[] = [
  { key: 'TUTTE', label: 'Tutti i lavori' },
  ...categorieLavori.map((c) => ({ key: c.key as LavoroCategoria, label: c.nome })),
];

const NostriLavori: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const paramCat = searchParams.get('cat');

  const initialFiltro: FiltroCategoria = useMemo(() => {
    if (!paramCat) return 'TUTTE';
    const match = FILTRI.find((f) => f.key === paramCat.toUpperCase());
    return (match?.key as FiltroCategoria) || 'TUTTE';
  }, [paramCat]);

  const [filtro, setFiltro] = useState<FiltroCategoria>(initialFiltro);

  useEffect(() => {
    if (paramCat && filtro !== initialFiltro) {
      setFiltro(initialFiltro);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [paramCat]);

  const scrollToSection = (id: string) => {
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
      setIsMobileMenuOpen(false);
    }
  };

  const cambiaFiltro = (nuovo: FiltroCategoria) => {
    setFiltro(nuovo);
    if (nuovo === 'TUTTE') {
      setSearchParams({});
    } else {
      setSearchParams({ cat: nuovo });
    }
    // Scrolla in modo che la barra filtri (sticky) sia subito sotto l'header.
    // Uso setTimeout per evitare che il re-render di setSearchParams interrompa lo scroll smooth.
    setTimeout(() => {
      const filtriBar = document.querySelector('#gallery-griglia .sticky');
      if (filtriBar) {
        const rect = (filtriBar as HTMLElement).getBoundingClientRect();
        const headerOffset = 80;
        const scrollTop = window.pageYOffset + rect.top - headerOffset;
        window.scrollTo({ top: scrollTop, behavior: 'smooth' });
      }
    }, 0);
  };

  const fotoVisibili: { foto: FotoLavoro; categoriaNome: string }[] = useMemo(() => {
    if (filtro === 'TUTTE') {
      return categorieLavori.flatMap((c) =>
        c.foto.map((f) => ({ foto: f, categoriaNome: c.nome })),
      );
    }
    const cat = getCategoriaByKey(filtro);
    if (!cat) return [];
    return cat.foto.map((f) => ({ foto: f, categoriaNome: cat.nome }));
  }, [filtro]);

  const categoriaAttiva = filtro !== 'TUTTE' ? getCategoriaByKey(filtro) : undefined;

  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(0);

  // Scrolla sempre all'inizio della pagina quando si entra in /lavori
  useEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: 'auto' });
  }, []);

  const openLightbox = (index: number) => {
    setCurrentIndex(index);
    setLightboxOpen(true);
  };

  const nextImage = () => {
    setCurrentIndex((prev) => (prev + 1) % fotoVisibili.length);
  };
  const prevImage = () => {
    setCurrentIndex(
      (prev) => (prev - 1 + fotoVisibili.length) % fotoVisibili.length,
    );
  };

  useEffect(() => {
    if (lightboxOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [lightboxOpen]);

  return (
    <div className="min-h-screen bg-white">
      <header className="fixed top-0 left-0 right-0 bg-gray-900 text-white z-50 shadow-lg overflow-visible">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-20">
            <Link to="/" className="flex items-center">
              <img
                src="/logo/logo_adinfissi.svg"
                alt="AD INFISSI"
                className="h-[100px] w-auto object-contain my-auto"
                onError={(e) => {
                  (e.currentTarget as HTMLImageElement).src = '/logo/logo-placeholder.svg';
                }}
              />
            </Link>

            <nav className="hidden md:flex space-x-8 items-center">
              <Link to="/" className="hover:text-brand-yellow-400 transition-colors">
                Home
              </Link>
              <Link
                to="/#about"
                className="hover:text-brand-yellow-400 transition-colors"
                onClick={(e) => {
                  e.preventDefault();
                  window.location.href = '/#about';
                }}
              >
                Chi Siamo
              </Link>
              <Link
                to="/lavori"
                onClick={() => setIsMobileMenuOpen(false)}
                className="text-brand-yellow-400 font-semibold hover:text-brand-yellow-300 transition-colors"
              >
                I Nostri Lavori
              </Link>
              <Link
                to="/#contact"
                className="hover:text-brand-yellow-400 transition-colors"
                onClick={(e) => {
                  e.preventDefault();
                  window.location.href = '/#contact';
                }}
              >
                Contatti
              </Link>
              <Link
                to="/app"
                className="text-brand-yellow-400 hover:text-brand-yellow-300 font-semibold transition-colors"
              >
                Area Riservata
              </Link>
            </nav>

            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="md:hidden"
            >
              {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>

        {isMobileMenuOpen && (
          <div className="md:hidden bg-gray-800">
            <div className="px-4 pt-2 pb-4 space-y-2">
              <Link
                to="/"
                onClick={() => setIsMobileMenuOpen(false)}
                className="block w-full text-left py-2 hover:text-brand-yellow-400 transition-colors"
              >
                Home
              </Link>
              <Link
                to="/#about"
                onClick={() => setIsMobileMenuOpen(false)}
                className="block w-full text-left py-2 hover:text-brand-yellow-400 transition-colors"
              >
                Chi Siamo
              </Link>
              <Link
                to="/lavori"
                onClick={() => setIsMobileMenuOpen(false)}
                className="block w-full text-left py-2 text-brand-yellow-400 font-semibold transition-colors"
              >
                I Nostri Lavori
              </Link>
              <Link
                to="/#contact"
                onClick={() => setIsMobileMenuOpen(false)}
                className="block w-full text-left py-2 hover:text-brand-yellow-400 transition-colors"
              >
                Contatti
              </Link>
              <Link
                to="/app"
                onClick={() => setIsMobileMenuOpen(false)}
                className="block w-full text-left py-2 text-brand-yellow-400 font-semibold"
              >
                Area Riservata
              </Link>
            </div>
          </div>
        )}
      </header>

      <section
        id="lavori-hero"
        className="relative pt-40 pb-24 bg-gray-900 overflow-hidden"
      >
        <div
          className="absolute inset-0 opacity-20 bg-cover bg-center"
          style={{
            backgroundImage:
              'url(https://images.pexels.com/photos/271816/pexels-photo-271816.jpeg?auto=compress&cs=tinysrgb&w=1920)',
          }}
        />
        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-white">
          <Link
            to="/"
            className="inline-flex items-center gap-2 text-gray-300 hover:text-brand-yellow-400 transition-colors mb-6"
          >
            <ArrowLeft size={18} />
            Torna alla home
          </Link>
          <h1 className="text-5xl sm:text-6xl lg:text-7xl font-bold mb-4 leading-tight">
            I Nostri Lavori
          </h1>
          <div className="w-24 h-1 bg-brand-yellow-500 mb-6" />
          <p className="text-xl sm:text-2xl text-gray-300 max-w-3xl leading-relaxed">
            Una selezione dei nostri progetti realizzati su misura: infissi,
            pergolati, cancelli e porte. Ogni lavoro è frutto di artigianato,
            attenzione al dettaglio e materiali di prima qualità.
          </p>

          <div className="mt-10 flex flex-wrap gap-3">
            {categorieLavori.map((c) => (
              <button
                key={c.key}
                onClick={() => cambiaFiltro(c.key)}
                className={`px-5 py-2.5 rounded-full font-medium transition-all border border-white/20 ${
                  categoriaAttiva?.key === c.key
                    ? 'bg-brand-yellow-400 text-gray-900 border-brand-yellow-400 shadow-lg shadow-brand-yellow-900/20'
                    : 'bg-white/5 text-white hover:bg-white/10'
                }`}
              >
                {c.nome} <span className="opacity-70 ml-1 text-sm">({c.foto.length})</span>
              </button>
            ))}
          </div>
        </div>
      </section>

      <section id="gallery-griglia" className="py-16 bg-gray-50 scroll-mt-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Barra filtri categorie: resta sticky sotto l'header mentre si scrolla */}
          <div className="sticky top-20 z-30 bg-gray-50 pt-3 pb-6 -mx-4 px-4 sm:-mx-6 sm:px-6 lg:-mx-8 lg:px-8">
            <div className="flex flex-wrap gap-2 sm:gap-3 p-1 bg-white rounded-xl shadow-sm border border-gray-200 inline-flex">
              {FILTRI.map((f) => (
                <button
                  key={f.key}
                  onClick={() => cambiaFiltro(f.key)}
                  className={`px-4 sm:px-6 py-2.5 rounded-lg font-semibold transition-all text-sm sm:text-base ${
                    filtro === f.key
                      ? 'bg-brand-yellow-400 text-gray-900 shadow-md'
                      : 'bg-transparent text-gray-700 hover:bg-gray-100'
                  }`}
                >
                  {f.label}
                </button>
              ))}
            </div>
          </div>

          {categoriaAttiva && (
            <div className="mb-10 bg-white rounded-2xl shadow-md p-6 sm:p-8 border border-gray-100">
              <div className="flex items-start gap-5 flex-col md:flex-row">
                <img
                  src={categoriaAttiva.copertina}
                  alt={categoriaAttiva.nome}
                  className="w-full md:w-60 h-40 object-cover rounded-xl flex-shrink-0"
                />
                <div className="flex-1">
                  <h2 className="text-3xl font-bold text-gray-900 mb-2">
                    {categoriaAttiva.nome}
                  </h2>
                  <div className="w-16 h-1 bg-brand-yellow-500 mb-4" />
                  <p className="text-gray-700 leading-relaxed text-lg">
                    {categoriaAttiva.descrizione}
                  </p>
                  <div className="mt-4 text-sm text-gray-500 font-medium">
                    {categoriaAttiva.foto.length} progetti in questa categoria
                  </div>
                </div>
              </div>
            </div>
          )}

          {fotoVisibili.length === 0 ? (
            <div className="text-center py-20 text-gray-500">
              Nessun lavoro presente per questa categoria.
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {fotoVisibili.map((item, index) => (
                <button
                  key={`${item.categoriaNome}-${item.foto.titolo}-${index}`}
                  onClick={() => openLightbox(index)}
                  className="group relative overflow-hidden rounded-2xl shadow-md aspect-[4/3] block w-full text-left focus:outline-none focus:ring-4 focus:ring-brand-yellow-400/30 hover:shadow-2xl transition-all duration-300"
                >
                  <img
                    src={item.foto.url}
                    alt={item.foto.titolo}
                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                    loading="lazy"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                  <div className="absolute inset-x-0 bottom-0 p-5 text-white translate-y-4 group-hover:translate-y-0 transition-transform duration-300 opacity-0 group-hover:opacity-100">
                    <span className="inline-block text-xs uppercase tracking-wider font-bold bg-brand-yellow-400 text-gray-900 px-2.5 py-1 rounded mb-2">
                      {item.categoriaNome}
                    </span>
                    <h3 className="text-lg sm:text-xl font-bold leading-tight mb-1">
                      {item.foto.titolo}
                    </h3>
                    {item.foto.descrizione && (
                      <p className="text-sm text-gray-200">{item.foto.descrizione}</p>
                    )}
                  </div>
                </button>
              ))}
            </div>
          )}

          <div className="mt-16 text-center">
            <a
              href="https://wa.me/3939987060?text=Ciao,%20ho%20visto%20i%20vostri%20lavori%20e%20vorrei%20un%20preventivo"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white px-8 py-4 rounded-lg text-lg font-semibold transition-all shadow-lg hover:shadow-xl"
            >
              <MessageCircle size={22} />
              Vuoi un lavoro simile? Chiedi un preventivo
            </a>
          </div>
        </div>
      </section>

      {lightboxOpen && fotoVisibili[currentIndex] && (
        <div
          className="fixed inset-0 bg-black/95 z-[60] flex items-center justify-center px-4"
          onClick={(e) => {
            if (e.target === e.currentTarget) setLightboxOpen(false);
          }}
        >
          <button
            onClick={() => setLightboxOpen(false)}
            aria-label="Chiudi"
            className="absolute top-4 right-4 text-white hover:text-brand-yellow-400 transition-colors p-2 rounded-full hover:bg-white/10"
          >
            <X size={36} />
          </button>

          <button
            onClick={prevImage}
            aria-label="Foto precedente"
            className="absolute left-2 sm:left-6 text-white hover:text-brand-yellow-400 transition-colors p-2 rounded-full hover:bg-white/10"
          >
            <ChevronLeft size={48} />
          </button>

          <button
            onClick={nextImage}
            aria-label="Foto successiva"
            className="absolute right-2 sm:right-6 text-white hover:text-brand-yellow-400 transition-colors p-2 rounded-full hover:bg-white/10"
          >
            <ChevronRight size={48} />
          </button>

          <div className="max-w-6xl w-full max-h-[90vh] flex flex-col">
            <img
              src={fotoVisibili[currentIndex].foto.url}
              alt={fotoVisibili[currentIndex].foto.titolo}
              className="max-w-full max-h-[70vh] mx-auto object-contain rounded-lg shadow-2xl"
            />
            <div className="text-center mt-5 px-4">
              <span className="text-brand-yellow-400 text-xs sm:text-sm uppercase tracking-wider font-bold">
                {fotoVisibili[currentIndex].categoriaNome}
              </span>
              <h3 className="text-white text-xl sm:text-2xl font-bold mt-2">
                {fotoVisibili[currentIndex].foto.titolo}
              </h3>
              {fotoVisibili[currentIndex].foto.descrizione && (
                <p className="text-gray-300 mt-2 text-sm sm:text-base">
                  {fotoVisibili[currentIndex].foto.descrizione}
                </p>
              )}
              <p className="text-gray-500 mt-3 text-sm">
                {currentIndex + 1} / {fotoVisibili.length}
              </p>
            </div>
          </div>
        </div>
      )}

      <footer className="bg-gray-900 text-white pt-16 pb-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-12 mb-12">
            <div>
              <Link to="/" className="inline-block">
                <img
                  src="/logo/logo_adinfissi.svg"
                  alt="AD INFISSI"
                  className="h-16 w-auto object-contain mb-4"
                  onError={(e) => {
                    (e.currentTarget as HTMLImageElement).src = '/logo/logo-placeholder.svg';
                  }}
                />
              </Link>
              <p className="text-gray-400 mb-6">
                Da oltre 20 anni costruiamo sicurezza, comfort e design per la tua
                casa e la tua azienda.
              </p>
              <div className="flex gap-4">
                <a
                  href="https://www.instagram.com/adinfissi"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="bg-gradient-to-br from-purple-600 to-pink-500 p-3 rounded-lg hover:shadow-lg transition-all"
                >
                  <Instagram size={24} />
                </a>
                <a
                  href="https://www.facebook.com/adinfissi"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="bg-blue-600 p-3 rounded-lg hover:shadow-lg transition-all"
                >
                  <Facebook size={24} />
                </a>
              </div>
            </div>

            <div>
              <h3 className="text-xl font-bold mb-4">Link Rapidi</h3>
              <ul className="space-y-3">
                <li>
                  <Link
                    to="/"
                    className="text-gray-400 hover:text-brand-yellow-400 transition-colors"
                  >
                    Home
                  </Link>
                </li>
                <li>
                  <Link
                    to="/#about"
                    className="text-gray-400 hover:text-brand-yellow-400 transition-colors"
                  >
                    Chi Siamo
                  </Link>
                </li>
                <li>
                  <Link
                    to="/lavori"
                    className="text-brand-yellow-400 font-semibold hover:text-brand-yellow-300 transition-colors"
                  >
                    I Nostri Lavori
                  </Link>
                </li>
                <li>
                  <Link
                    to="/#contact"
                    className="text-gray-400 hover:text-brand-yellow-400 transition-colors"
                  >
                    Contatti
                  </Link>
                </li>
                <li>
                  <Link
                    to="/app"
                    className="text-brand-yellow-400 hover:text-brand-yellow-300 font-semibold transition-colors"
                  >
                    Area Riservata
                  </Link>
                </li>
              </ul>
            </div>

            <div>
              <h3 className="text-xl font-bold mb-4">Contatti</h3>
              <ul className="space-y-3 text-gray-400">
                <li className="flex items-start gap-3">
                  <MapPin size={18} className="mt-1 flex-shrink-0 text-brand-yellow-400" />
                  <span>Via Nettunense 235, Aprilia (RM)</span>
                </li>
                <li className="flex items-start gap-3">
                  <Phone size={18} className="mt-1 flex-shrink-0 text-brand-yellow-400" />
                  <a
                    href="tel:+3939987060"
                    className="hover:text-brand-yellow-400 transition-colors"
                  >
                    Tel: 393 998 7060
                  </a>
                </li>
                <li className="flex items-start gap-3">
                  <MessageCircle
                    size={18}
                    className="mt-1 flex-shrink-0 text-brand-yellow-400"
                  />
                  <a
                    href="https://wa.me/3939987060"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="hover:text-brand-yellow-400 transition-colors"
                  >
                    WhatsApp: 393 998 7060
                  </a>
                </li>
                <li className="flex items-start gap-3">
                  <Clock size={18} className="mt-1 flex-shrink-0 text-brand-yellow-400" />
                  <div>
                    <p>Lun-Ven: 8:00 - 18:00</p>
                    <p>Sab: 8:00 - 12:00</p>
                  </div>
                </li>
              </ul>
            </div>
          </div>

          <div className="border-t border-gray-800 pt-8 text-center text-gray-400">
            <p>Copyright © 2025 AD INFISSI srl - Tutti i diritti riservati</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default NostriLavori;
