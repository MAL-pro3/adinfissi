import { Building2, Users, Award } from 'lucide-react';

export default function About() {
  return (
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
              <strong className="text-red-700">AD INFISSI srl</strong> nasce oltre 20 anni fa ad Aprilia (RM), in via Nettunense 235.
            </p>
            <p className="text-lg text-gray-700 leading-relaxed">
              Specializzati nella produzione e installazione di <strong>infissi, cancelli, tende da sole e pergolati in alluminio</strong>, offriamo soluzioni innovative e su misura per ogni esigenza.
            </p>
            <p className="text-lg text-gray-700 leading-relaxed">
              Alla guida c'è <strong>Giovanni</strong>, fondatore e cuore dell'azienda, affiancato da una squadra di operai esperti e da due segretarie pronte ad accogliere i clienti nel nostro showroom.
            </p>
            <p className="text-lg text-gray-700 leading-relaxed">
              Siamo un'<strong>azienda familiare</strong> con un team unito e competente, che crede nel lavoro fatto con passione e precisione.
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
                    Vieni a visitare il nostro showroom in via Nettunense 235, Aprilia. Potrai toccare con mano la qualità dei nostri prodotti.
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
                    Un team di 10 professionisti dedicati, guidati dalla passione per il lavoro ben fatto e l'attenzione al dettaglio.
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
                    Oltre 20 anni di esperienza e migliaia di clienti soddisfatti testimoniano la qualità del nostro lavoro.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
