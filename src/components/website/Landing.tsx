import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Menu,
  X,
  ArrowRight,
  MessageCircle,
  Building2,
  Users,
  Award,
  MapPin,
  Phone,
  Clock,
  Instagram,
  Facebook,
} from 'lucide-react';
import { categorieLavori } from '../../data/lavori';

const Landing: React.FC = () => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const scrollToSection = (id: string) => {
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
      setIsMobileMenuOpen(false);
    }
  };

  const [selectedCategoria, setSelectedCategoria] = useState<string | null>(null);

  return (
    <div className="min-h-screen bg-white">
      <header className="fixed top-0 left-0 right-0 bg-gray-900 text-white z-50 shadow-lg">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-20">
            <Link to="/" className="flex items-center">
              <div className="text-2xl font-bold tracking-tight">
                <span className="text-white">AD</span>
                <span className="text-red-700"> INFISSI</span>
              </div>
            </Link>

            <nav className="hidden md:flex space-x-8 items-center">
              <button
                onClick={() => scrollToSection('hero')}
                className="hover:text-red-700 transition-colors"
              >
                Home
              </button>
              <button
                onClick={() => scrollToSection('about')}
                className="hover:text-red-700 transition-colors"
              >
                Chi Siamo
              </button>
              <Link
                to="/lavori"
                onClick={() => setIsMobileMenuOpen(false)}
                className="hover:text-red-700 transition-colors"
              >
                I Nostri Lavori
              </Link>
              <button
                onClick={() => scrollToSection('contact')}
                className="hover:text-red-700 transition-colors"
              >
                Contatti
              </button>
              <Link
                to="/app"
                className="text-red-700 hover:text-red-600 font-semibold transition-colors"
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
              <button
                onClick={() => scrollToSection('hero')}
                className="block w-full text-left py-2 hover:text-red-700 transition-colors"
              >
                Home
              </button>
              <button
                onClick={() => scrollToSection('about')}
                className="block w-full text-left py-2 hover:text-red-700 transition-colors"
              >
                Chi Siamo
              </button>
              <Link
                to="/lavori"
                onClick={() => setIsMobileMenuOpen(false)}
                className="block w-full text-left py-2 hover:text-red-700 transition-colors"
              >
                I Nostri Lavori
              </Link>
              <button
                onClick={() => scrollToSection('contact')}
                className="block w-full text-left py-2 hover:text-red-700 transition-colors"
              >
                Contatti
              </button>
              <Link
                to="/app"
                onClick={() => setIsMobileMenuOpen(false)}
                className="block w-full text-left py-2 text-red-700 font-semibold"
              >
                Area Riservata
              </Link>
            </div>
          </div>
        )}
      </header>

      <section
        id="hero"
        className="relative h-screen flex items-center justify-center overflow-hidden"
      >
        <div
          className="absolute inset-0 bg-cover bg-center bg-no-repeat"
          style={{
            backgroundImage:
              'linear-gradient(rgba(0, 0, 0, 0.5), rgba(0, 0, 0, 0.5)), url(https://images.pexels.com/photos/1643389/pexels-photo-1643389.jpeg?auto=compress&cs=tinysrgb&w=1920)',
          }}
        />

        <div className="relative z-10 text-center text-white max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <h1 className="text-5xl sm:text-6xl lg:text-7xl font-bold mb-6 leading-tight">
            AD INFISSI srl
          </h1>
          <p className="text-xl sm:text-2xl lg:text-3xl mb-4 font-light">
            Da 20 anni costruiamo sicurezza, comfort e design
          </p>
          <p className="text-lg sm:text-xl mb-12 text-gray-200">
            Infissi, cancelli, pergolati e soluzioni su misura in alluminio e acciaio
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <Link
              to="/lavori"
              className="bg-red-700 hover:bg-red-800 text-white px-8 py-4 rounded-lg text-lg font-semibold transition-all shadow-lg hover:shadow-xl flex items-center gap-2"
            >
              Scopri i nostri lavori
              <ArrowRight size={20} />
            </Link>
            <a
              href="https://wa.me/393998760"
              target="_blank"
              rel="noopener noreferrer"
              className="bg-green-600 hover:bg-green-700 text-white px-8 py-4 rounded-lg text-lg font-semibold transition-all shadow-lg hover:shadow-xl flex items-center gap-2"
            >
              <MessageCircle size={20} />
              Contattaci su WhatsApp
            </a>
          </div>
        </div>

        <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 animate-bounce">
          <button
            onClick={() => scrollToSection('about')}
            aria-label="Scorri giù"
            className="text-white"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="32"
              height="32"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M12 5v14M5 12l7 7 7-7" />
            </svg>
          </button>
        </div>
      </section>

      <section id="about" className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl sm:text-5xl font-bold text-gray-900 mb-4">
              Chi Siamo
            </h2>
            <div className="w-24 h-1 bg-red-700 mx-auto"></div>
          </div>

          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div className="space-y-6">
              <p className="text-lg text-gray-700 leading-relaxed">
                <strong className="text-red-700">AD INFISSI srl</strong> nasce oltre 20 anni fa
                ad Aprilia (RM), in via Nettunense 235.
              </p>
              <p className="text-lg text-gray-700 leading-relaxed">
                Specializzati nella produzione e installazione di{' '}
                <strong>infissi, cancelli, tende da sole e pergolati in alluminio</strong>,
                offriamo soluzioni innovative e su misura per ogni esigenza.
              </p>
              <p className="text-lg text-gray-700 leading-relaxed">
                Alla guida c'è <strong>Giovanni</strong>, fondatore e cuore dell'azienda,
                affiancato da una squadra di operai esperti e da due segretarie pronte ad
                accogliere i clienti nel nostro showroom.
              </p>
              <p className="text-lg text-gray-700 leading-relaxed">
                Siamo un'<strong>azienda familiare</strong> con un team unito e competente,
                che crede nel lavoro fatto con passione e precisione.
              </p>
            </div>

            <div className="grid grid-cols-1 gap-6">
              <div className="bg-gray-50 p-8 rounded-xl shadow-md hover:shadow-lg transition-shadow">
                <div className="flex items-start gap-4">
                  <div className="bg-red-700 p-3 rounded-lg">
                    <Building2 className="text-white" size={32} />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-gray-900 mb-2">
                      Showroom Moderno
                    </h3>
                    <p className="text-gray-600">
                      Vieni a visitare il nostro showroom in via Nettunense 235, Aprilia.
                      Potrai toccare con mano la qualità dei nostri prodotti.
                    </p>
                  </div>
                </div>
              </div>

              <div className="bg-gray-50 p-8 rounded-xl shadow-md hover:shadow-lg transition-shadow">
                <div className="flex items-start gap-4">
                  <div className="bg-red-700 p-3 rounded-lg">
                    <Users className="text-white" size={32} />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-gray-900 mb-2">
                      Team Esperto
                    </h3>
                    <p className="text-gray-600">
                      Un team di 10 professionisti dedicati, guidati dalla passione per il
                      lavoro ben fatto e l'attenzione al dettaglio.
                    </p>
                  </div>
                </div>
              </div>

              <div className="bg-gray-50 p-8 rounded-xl shadow-md hover:shadow-lg transition-shadow">
                <div className="flex items-start gap-4">
                  <div className="bg-red-700 p-3 rounded-lg">
                    <Award className="text-white" size={32} />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-gray-900 mb-2">
                      Qualità Garantita
                    </h3>
                    <p className="text-gray-600">
                      Oltre 20 anni di esperienza e migliaia di clienti soddisfatti
                      testimoniano la qualità del nostro lavoro.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section id="categorie-lavori" className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl sm:text-5xl font-bold text-gray-900 mb-4">
              I Nostri Lavori
            </h2>
            <div className="w-24 h-1 bg-red-700 mx-auto mb-6"></div>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Esplora le nostre categorie e scopri tutti i progetti realizzati
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {categorieLavori.map((cat) => (
              <Link
                key={cat.key}
                to={`/lavori?cat=${cat.key}`}
                onMouseEnter={() => setSelectedCategoria(cat.key)}
                onMouseLeave={() => setSelectedCategoria(null)}
                className="group relative overflow-hidden rounded-xl shadow-lg aspect-[3/4] block focus:outline-none focus:ring-4 focus:ring-red-500/40 transition-all duration-300"
              >
                <img
                  src={cat.copertina}
                  alt={cat.nome}
                  className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                  loading="lazy"
                />

                <div
                  className={`absolute inset-0 bg-gradient-to-t via-black/50 to-transparent transition-opacity duration-300 ${
                    selectedCategoria === cat.key
                      ? 'from-black/90 opacity-100'
                      : 'from-black/80 opacity-90'
                  }`}
                />

                <div className="absolute inset-0 flex flex-col justify-end p-6 text-white">
                  <div className="w-12 h-1 bg-red-600 mb-4 transition-all duration-500 group-hover:w-20" />
                  <h3 className="text-2xl sm:text-3xl font-bold mb-2 uppercase tracking-wide">
                    {cat.nome}
                  </h3>
                  <p className="text-sm text-gray-200 mb-4 line-clamp-2">
                    {cat.descrizione}
                  </p>
                  <div className="flex items-center gap-2 text-white font-semibold text-sm group-hover:text-red-500 transition-colors">
                    Vedi tutti i lavori
                    <ArrowRight
                      size={16}
                      className="transition-transform group-hover:translate-x-1"
                    />
                  </div>
                </div>
              </Link>
            ))}
          </div>

          <div className="mt-16 text-center">
            <Link
              to="/lavori"
              className="inline-flex items-center gap-2 bg-red-700 hover:bg-red-800 text-white px-8 py-4 rounded-lg text-lg font-semibold transition-all shadow-lg hover:shadow-xl"
            >
              Visualizza galleria completa
              <ArrowRight size={20} />
            </Link>
          </div>
        </div>
      </section>

      <section id="contact" className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl sm:text-5xl font-bold text-gray-900 mb-4">
              Vieni a Trovarci
            </h2>
            <div className="w-24 h-1 bg-red-700 mx-auto mb-6"></div>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Contattaci per un preventivo gratuito o visita il nostro showroom
            </p>
          </div>

          <div className="grid lg:grid-cols-2 gap-12">
            <div className="space-y-8">
              <div className="bg-white p-8 rounded-xl shadow-lg hover:shadow-xl transition-shadow">
                <div className="flex items-start gap-4">
                  <div className="bg-red-700 p-3 rounded-lg flex-shrink-0">
                    <MapPin className="text-white" size={28} />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-gray-900 mb-2">Indirizzo</h3>
                    <p className="text-gray-600 text-lg">
                      Via Nettunense 235
                      <br />
                      Aprilia (RM)
                    </p>
                  </div>
                </div>
              </div>

              <div className="bg-white p-8 rounded-xl shadow-lg hover:shadow-xl transition-shadow">
                <div className="flex items-start gap-4">
                  <div className="bg-red-700 p-3 rounded-lg flex-shrink-0">
                    <Phone className="text-white" size={28} />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-gray-900 mb-2">Telefono</h3>
                    <a
                      href="tel:+393998760"
                      className="text-gray-600 text-lg hover:text-red-700 transition-colors"
                    >
                      393 998 7060
                    </a>
                  </div>
                </div>
              </div>

              <div className="bg-white p-8 rounded-xl shadow-lg hover:shadow-xl transition-shadow">
                <div className="flex items-start gap-4">
                  <div className="bg-red-700 p-3 rounded-lg flex-shrink-0">
                    <MessageCircle className="text-white" size={28} />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-gray-900 mb-2">WhatsApp</h3>
                    <a
                      href="https://wa.me/393998760"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-gray-600 text-lg hover:text-red-700 transition-colors"
                    >
                      393 998 7060
                    </a>
                  </div>
                </div>
              </div>

              <div className="bg-white p-8 rounded-xl shadow-lg hover:shadow-xl transition-shadow">
                <div className="flex items-start gap-4">
                  <div className="bg-red-700 p-3 rounded-lg flex-shrink-0">
                    <Clock className="text-white" size={28} />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-gray-900 mb-2">Orari</h3>
                    <div className="text-gray-600 text-lg space-y-1">
                      <p>Lunedì - Venerdì: 8:00 - 18:00</p>
                      <p>Sabato: 8:00 - 12:00</p>
                      <p>Domenica: Chiuso</p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="bg-white p-8 rounded-xl shadow-lg hover:shadow-xl transition-shadow">
                <h3 className="text-xl font-bold text-gray-900 mb-4">Seguici sui Social</h3>
                <div className="flex gap-4">
                  <a
                    href="https://www.instagram.com/adinfissi"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="bg-gradient-to-br from-purple-600 to-pink-500 p-3 rounded-lg hover:shadow-lg transition-all"
                  >
                    <Instagram size={24} className="text-white" />
                  </a>
                  <a
                    href="https://www.facebook.com/adinfissi"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="bg-blue-600 p-3 rounded-lg hover:shadow-lg transition-all"
                  >
                    <Facebook size={24} className="text-white" />
                  </a>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl shadow-lg overflow-hidden">
              <div className="p-8">
                <h3 className="text-2xl font-bold text-gray-900 mb-6">Dove Siamo</h3>
                <p className="text-gray-600 mb-6">
                  Vieni a trovarci nel nostro showroom in Via Nettunense 235, Aprilia (RM).
                  Potrai vedere da vicino i nostri prodotti e ricevere una consulenza
                  personalizzata.
                </p>
              </div>

              <div className="h-96 w-full">
                <iframe
                  src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d2982.123456789!2d12.6428!3d41.5928!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x132f61b6e7c8a123%3A0x123456789abcdef!2sVia%20Nettunense%2C%20235%2C%2004011%20Aprilia%20LT%2C%20Italy!5e0!3m2!1sen!2sit!4v1234567890123!5m2!1sen!2sit"
                  width="100%"
                  height="100%"
                  style={{ border: 0 }}
                  allowFullScreen
                  loading="lazy"
                  referrerPolicy="no-referrer-when-downgrade"
                  title="Mappa AD INFISSI - Via Nettunense 235, Aprilia"
                ></iframe>
              </div>

              <div className="p-8 bg-gray-50">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  <div>
                    <h4 className="font-bold text-gray-900 mb-2">Indirizzo Completo</h4>
                    <p className="text-gray-600">
                      Via Nettunense 235
                      <br />
                      04011 Aprilia (LT)
                      <br />
                      Lazio, Italia
                    </p>
                  </div>
                  <div>
                    <h4 className="font-bold text-gray-900 mb-2">Come Raggiungerci</h4>
                    <p className="text-gray-600 text-sm">
                      Facilmente raggiungibile dalla SS7 Via Appia e dall'autostrada A1.
                      Parcheggio disponibile.
                    </p>
                  </div>
                </div>

                <div className="mt-6 pt-6 border-t border-gray-200">
                  <div className="flex flex-col sm:flex-row gap-4">
                    <a
                      href="https://wa.me/393998760?text=Ciao,%20vorrei%20informazioni%20sui%20vostri%20servizi"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex-1 bg-green-600 hover:bg-green-700 text-white px-6 py-3 rounded-lg font-semibold transition-all shadow-lg hover:shadow-xl flex items-center justify-center gap-2"
                    >
                      <MessageCircle size={20} />
                      Scrivici su WhatsApp
                    </a>
                    <a
                      href="tel:+393998760"
                      className="flex-1 bg-red-700 hover:bg-red-800 text-white px-6 py-3 rounded-lg font-semibold transition-all shadow-lg hover:shadow-xl flex items-center justify-center gap-2"
                    >
                      <Phone size={20} />
                      Chiamaci Ora
                    </a>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <footer className="bg-gray-900 text-white pt-16 pb-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-12 mb-12">
            <div>
              <Link to="/" className="inline-block">
                <div className="text-3xl font-bold mb-4">
                  <span className="text-white">AD</span>
                  <span className="text-red-700"> INFISSI</span>
                </div>
              </Link>
              <p className="text-gray-400 mb-6">
                Da oltre 20 anni costruiamo sicurezza, comfort e design per la tua casa e
                la tua azienda.
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
                  <button
                    onClick={() => scrollToSection('hero')}
                    className="text-gray-400 hover:text-red-700 transition-colors"
                  >
                    Home
                  </button>
                </li>
                <li>
                  <button
                    onClick={() => scrollToSection('about')}
                    className="text-gray-400 hover:text-red-700 transition-colors"
                  >
                    Chi Siamo
                  </button>
                </li>
                <li>
                  <Link
                    to="/lavori"
                    onClick={() => setIsMobileMenuOpen(false)}
                    className="text-gray-400 hover:text-red-700 transition-colors"
                  >
                    I Nostri Lavori
                  </Link>
                </li>
                <li>
                  <button
                    onClick={() => scrollToSection('contact')}
                    className="text-gray-400 hover:text-red-700 transition-colors"
                  >
                    Contatti
                  </button>
                </li>
                <li>
                  <Link
                    to="/app"
                    className="text-red-700 hover:text-red-600 font-semibold transition-colors"
                  >
                    Area Riservata
                  </Link>
                </li>
              </ul>
            </div>

            <div>
              <h3 className="text-xl font-bold mb-4">Contatti</h3>
              <ul className="space-y-3 text-gray-400">
                <li>Via Nettunense 235</li>
                <li>Aprilia (RM)</li>
                <li>
                  <a
                    href="tel:+393998760"
                    className="hover:text-red-700 transition-colors"
                  >
                    Tel: 393 998 7060
                  </a>
                </li>
                <li>
                  <a
                    href="https://wa.me/393998760"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="hover:text-red-700 transition-colors"
                  >
                    WhatsApp: 393 998 7060
                  </a>
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

export default Landing;
