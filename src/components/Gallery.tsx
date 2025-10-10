import { useState } from 'react';
import { X, ChevronLeft, ChevronRight } from 'lucide-react';

const galleryImages = [
  {
    url: 'https://images.pexels.com/photos/1643389/pexels-photo-1643389.jpeg?auto=compress&cs=tinysrgb&w=800',
    title: 'Infissi moderni',
    category: 'Infissi'
  },
  {
    url: 'https://images.pexels.com/photos/323780/pexels-photo-323780.jpeg?auto=compress&cs=tinysrgb&w=800',
    title: 'Cancello in alluminio',
    category: 'Cancelli'
  },
  {
    url: 'https://images.pexels.com/photos/271816/pexels-photo-271816.jpeg?auto=compress&cs=tinysrgb&w=800',
    title: 'Pergolato elegante',
    category: 'Pergolati'
  },
  {
    url: 'https://images.pexels.com/photos/3555615/pexels-photo-3555615.jpeg?auto=compress&cs=tinysrgb&w=800',
    title: 'Finestre su misura',
    category: 'Infissi'
  },
  {
    url: 'https://images.pexels.com/photos/1643389/pexels-photo-1643389.jpeg?auto=compress&cs=tinysrgb&w=800',
    title: 'Tenda da sole moderna',
    category: 'Tende'
  },
  {
    url: 'https://images.pexels.com/photos/323780/pexels-photo-323780.jpeg?auto=compress&cs=tinysrgb&w=800',
    title: 'Cancello automatico',
    category: 'Cancelli'
  },
  {
    url: 'https://images.pexels.com/photos/271816/pexels-photo-271816.jpeg?auto=compress&cs=tinysrgb&w=800',
    title: 'Pergolato con tende',
    category: 'Pergolati'
  },
  {
    url: 'https://images.pexels.com/photos/3555615/pexels-photo-3555615.jpeg?auto=compress&cs=tinysrgb&w=800',
    title: 'Porta blindata design',
    category: 'Infissi'
  }
];

export default function Gallery() {
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(0);

  const openLightbox = (index: number) => {
    setCurrentIndex(index);
    setLightboxOpen(true);
  };

  const nextImage = () => {
    setCurrentIndex((prev) => (prev + 1) % galleryImages.length);
  };

  const prevImage = () => {
    setCurrentIndex((prev) => (prev - 1 + galleryImages.length) % galleryImages.length);
  };

  return (
    <section id="gallery" className="py-20 bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-4xl sm:text-5xl font-bold text-gray-900 mb-4">
            I Nostri Lavori
          </h2>
          <div className="w-24 h-1 bg-red-700 mx-auto mb-6"></div>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Scopri alcuni dei progetti realizzati con passione e professionalità
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {galleryImages.map((image, index) => (
            <div
              key={index}
              className="group relative overflow-hidden rounded-lg shadow-lg cursor-pointer aspect-square"
              onClick={() => openLightbox(index)}
            >
              <img
                src={image.url}
                alt={image.title}
                className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col justify-end p-4">
                <span className="text-red-500 text-sm font-semibold mb-1">{image.category}</span>
                <h3 className="text-white font-bold text-lg">{image.title}</h3>
              </div>
            </div>
          ))}
        </div>
      </div>

      {lightboxOpen && (
        <div className="fixed inset-0 bg-black/95 z-50 flex items-center justify-center">
          <button
            onClick={() => setLightboxOpen(false)}
            className="absolute top-4 right-4 text-white hover:text-red-500 transition-colors"
          >
            <X size={40} />
          </button>

          <button
            onClick={prevImage}
            className="absolute left-4 text-white hover:text-red-500 transition-colors"
          >
            <ChevronLeft size={48} />
          </button>

          <button
            onClick={nextImage}
            className="absolute right-4 text-white hover:text-red-500 transition-colors"
          >
            <ChevronRight size={48} />
          </button>

          <div className="max-w-5xl max-h-[90vh] px-4">
            <img
              src={galleryImages[currentIndex].url}
              alt={galleryImages[currentIndex].title}
              className="max-w-full max-h-[80vh] object-contain rounded-lg"
            />
            <div className="text-center mt-4">
              <span className="text-red-500 text-sm font-semibold">
                {galleryImages[currentIndex].category}
              </span>
              <h3 className="text-white text-2xl font-bold mt-2">
                {galleryImages[currentIndex].title}
              </h3>
              <p className="text-gray-400 mt-2">
                {currentIndex + 1} / {galleryImages.length}
              </p>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
