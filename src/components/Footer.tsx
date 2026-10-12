import { Instagram, Facebook } from 'lucide-react';

interface FooterProps {
  onLoginClick: () => void;
}

export default function Footer({ onLoginClick }: FooterProps) {
  const scrollToSection = (id: string) => {
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <footer className="bg-gray-900 text-white pt-16 pb-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-12 mb-12">
          <div>
            <img
              src="/logo/logo_adinfissi.svg"
              alt="AD INFISSI"
              className="h-16 w-auto object-contain mb-4"
              onError={(e) => {
                (e.currentTarget as HTMLImageElement).src = '/logo/logo-placeholder.svg';
              }}
            />
            <p className="text-gray-400 mb-6">
              Da oltre 20 anni costruiamo sicurezza, comfort e design per la tua casa e la tua azienda.
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
                  className="text-gray-400 hover:text-brand-yellow-400 transition-colors"
                >
                  Home
                </button>
              </li>
              <li>
                <button
                  onClick={() => scrollToSection('about')}
                  className="text-gray-400 hover:text-brand-yellow-400 transition-colors"
                >
                  Chi Siamo
                </button>
              </li>
              <li>
                <button
                  onClick={() => scrollToSection('gallery')}
                  className="text-gray-400 hover:text-brand-yellow-400 transition-colors"
                >
                  I Nostri Lavori
                </button>
              </li>
              <li>
                <button
                  onClick={() => scrollToSection('contact')}
                  className="text-gray-400 hover:text-brand-yellow-400 transition-colors"
                >
                  Contatti
                </button>
              </li>
              <li>
                <button
                  onClick={onLoginClick}
                  className="text-brand-yellow-400 hover:text-brand-yellow-300 font-semibold transition-colors"
                >
                  Area Riservata
                </button>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="text-xl font-bold mb-4">Contatti</h3>
            <ul className="space-y-3 text-gray-400">
              <li>Via Nettunense 235</li>
              <li>Aprilia (RM)</li>
              <li>
                <a href="tel:+3939987060" className="hover:text-brand-yellow-400 transition-colors">
                  Tel: 393 998 7060
                </a>
              </li>
              <li>
                <a
                  href="https://wa.me/3939987060"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-brand-yellow-400 transition-colors"
                >
                  WhatsApp: 393 998 7060
                </a>
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t border-gray-800 pt-8 text-center text-gray-400">
          <p>
            Copyright © 2025 AD INFISSI srl - Tutti i diritti riservati
          </p>
        </div>
      </div>
    </footer>
  );
}
