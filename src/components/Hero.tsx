import { ArrowDown, MessageCircle } from 'lucide-react';

export default function Hero() {
  const scrollToGallery = () => {
    const element = document.getElementById('gallery');
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <section id="hero" className="relative h-screen flex items-center justify-center overflow-hidden">
      <div
        className="absolute inset-0 bg-cover bg-center bg-no-repeat"
        style={{
          backgroundImage: 'linear-gradient(rgba(0, 0, 0, 0.5), rgba(0, 0, 0, 0.5)), url(https://images.pexels.com/photos/1643389/pexels-photo-1643389.jpeg?auto=compress&cs=tinysrgb&w=1920)',
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
          <button
            onClick={scrollToGallery}
            className="bg-red-700 hover:bg-red-800 text-white px-8 py-4 rounded-lg text-lg font-semibold transition-all shadow-lg hover:shadow-xl flex items-center gap-2"
          >
            Scopri i nostri lavori
            <ArrowDown size={20} />
          </button>
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
        <ArrowDown className="text-white" size={32} />
      </div>
    </section>
  );
}
