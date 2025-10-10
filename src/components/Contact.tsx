import { MapPin, Phone, Clock, MessageCircle, Instagram, Facebook } from 'lucide-react';

export default function Contact() {
  return (
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
                    Via Nettunense 235<br />
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
                  <a href="tel:+393998760" className="text-gray-600 text-lg hover:text-red-700 transition-colors">
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
                    Chatta con noi
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
                  <h3 className="text-xl font-bold text-gray-900 mb-3">Orari di Apertura</h3>
                  <div className="space-y-2 text-gray-600">
                    <p className="flex justify-between">
                      <span className="font-semibold">Lunedì - Venerdì:</span>
                      <span>9:00 - 13:00 / 15:00 - 19:00</span>
                    </p>
                    <p className="flex justify-between">
                      <span className="font-semibold">Sabato:</span>
                      <span>9:00 - 13:00</span>
                    </p>
                    <p className="flex justify-between">
                      <span className="font-semibold">Domenica:</span>
                      <span>Chiuso</span>
                    </p>
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
                  className="bg-gradient-to-br from-purple-600 to-pink-500 p-4 rounded-lg hover:shadow-lg transition-all"
                >
                  <Instagram className="text-white" size={28} />
                </a>
                <a
                  href="https://www.facebook.com/adinfissi"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="bg-blue-600 p-4 rounded-lg hover:shadow-lg transition-all"
                >
                  <Facebook className="text-white" size={28} />
                </a>
              </div>
            </div>
          </div>

          <div className="h-[600px] rounded-xl overflow-hidden shadow-xl">
            <iframe
              src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d2988.4!2d12.64!3d41.59!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x0%3A0x0!2zNDHCsDM1JzI0LjQiTiAxMsKwMzgnMjQuMCJF!5e0!3m2!1sit!2sit!4v1234567890!5m2!1sit!2sit"
              width="100%"
              height="100%"
              style={{ border: 0 }}
              allowFullScreen
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
              title="Mappa AD INFISSI srl"
            ></iframe>
          </div>
        </div>
      </div>
    </section>
  );
}
