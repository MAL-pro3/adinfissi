import { Menu, X } from 'lucide-react';
import { useState } from 'react';

interface HeaderProps {
  onLoginClick: () => void;
}

export default function Header({ onLoginClick }: HeaderProps) {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const scrollToSection = (id: string) => {
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
      setIsMobileMenuOpen(false);
    }
  };

  return (
    <header className="fixed top-0 left-0 right-0 bg-gray-900 text-white z-50 shadow-lg">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-20">
          <div className="flex items-center">
            <div className="text-2xl font-bold tracking-tight">
              <span className="text-white">AD</span>
              <span className="text-red-700"> INFISSI</span>
            </div>
          </div>

          <nav className="hidden md:flex space-x-8">
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
            <button
              onClick={() => scrollToSection('gallery')}
              className="hover:text-red-700 transition-colors"
            >
              I Nostri Lavori
            </button>
            <button
              onClick={() => scrollToSection('contact')}
              className="hover:text-red-700 transition-colors"
            >
              Contatti
            </button>
            <button
              onClick={onLoginClick}
              className="text-red-700 hover:text-red-600 font-semibold transition-colors"
            >
              Area Riservata
            </button>
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
            <button
              onClick={() => scrollToSection('gallery')}
              className="block w-full text-left py-2 hover:text-red-700 transition-colors"
            >
              I Nostri Lavori
            </button>
            <button
              onClick={() => scrollToSection('contact')}
              className="block w-full text-left py-2 hover:text-red-700 transition-colors"
            >
              Contatti
            </button>
            <button
              onClick={onLoginClick}
              className="block w-full text-left py-2 text-red-700 font-semibold"
            >
              Area Riservata
            </button>
          </div>
        </div>
      )}
    </header>
  );
}
