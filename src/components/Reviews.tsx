import { Star, ExternalLink } from 'lucide-react';

const reviews = [
  {
    name: 'Marco Rossi',
    rating: 5,
    text: 'Professionalità e competenza. Ho fatto installare gli infissi di casa e il risultato è eccezionale. Consigliato!',
    date: '2 mesi fa'
  },
  {
    name: 'Laura Bianchi',
    rating: 5,
    text: 'Personale gentile e disponibile. Il cancello automatico funziona perfettamente, siamo molto soddisfatti del lavoro svolto.',
    date: '1 mese fa'
  },
  {
    name: 'Giuseppe Ferrara',
    rating: 5,
    text: 'Azienda seria e affidabile. Il pergolato è stato realizzato a regola d\'arte, rispettando tempi e budget. Bravi!',
    date: '3 settimane fa'
  },
  {
    name: 'Francesca Romano',
    rating: 5,
    text: 'Ottima esperienza dall\'inizio alla fine. Giovanni e il suo team hanno trasformato il nostro terrazzo. Qualità top!',
    date: '2 settimane fa'
  },
  {
    name: 'Antonio Greco',
    rating: 5,
    text: 'Dopo 20 anni nel settore si vede l\'esperienza. Lavoro impeccabile, materiali di qualità e prezzi onesti.',
    date: '1 settimana fa'
  }
];

export default function Reviews() {
  return (
    <section className="py-20 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-4xl sm:text-5xl font-bold text-gray-900 mb-4">
            Cosa Dicono i Nostri Clienti
          </h2>
          <div className="w-24 h-1 bg-red-700 mx-auto mb-6"></div>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            La nostra miglior pubblicità sono i clienti soddisfatti
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-12">
          {reviews.slice(0, 3).map((review, index) => (
            <div
              key={index}
              className="bg-gray-50 p-8 rounded-xl shadow-md hover:shadow-xl transition-shadow"
            >
              <div className="flex items-center gap-1 mb-4">
                {[...Array(review.rating)].map((_, i) => (
                  <Star key={i} className="text-yellow-400 fill-yellow-400" size={20} />
                ))}
              </div>
              <p className="text-gray-700 mb-6 leading-relaxed italic">
                "{review.text}"
              </p>
              <div className="flex justify-between items-center">
                <div>
                  <p className="font-bold text-gray-900">{review.name}</p>
                  <p className="text-sm text-gray-500">{review.date}</p>
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-12">
          {reviews.slice(3, 5).map((review, index) => (
            <div
              key={index}
              className="bg-gray-50 p-8 rounded-xl shadow-md hover:shadow-xl transition-shadow"
            >
              <div className="flex items-center gap-1 mb-4">
                {[...Array(review.rating)].map((_, i) => (
                  <Star key={i} className="text-yellow-400 fill-yellow-400" size={20} />
                ))}
              </div>
              <p className="text-gray-700 mb-6 leading-relaxed italic">
                "{review.text}"
              </p>
              <div className="flex justify-between items-center">
                <div>
                  <p className="font-bold text-gray-900">{review.name}</p>
                  <p className="text-sm text-gray-500">{review.date}</p>
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="text-center">
          <a
            href="https://www.google.com/maps/search/AD+INFISSI+srl+Aprilia"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 bg-red-700 hover:bg-red-800 text-white px-8 py-4 rounded-lg text-lg font-semibold transition-all shadow-lg hover:shadow-xl"
          >
            Leggi tutte le recensioni su Google
            <ExternalLink size={20} />
          </a>
        </div>
      </div>
    </section>
  );
}
