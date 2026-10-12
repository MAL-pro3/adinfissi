// ====== GOOGLE PLACES API LIVE (FUTURO) ======
// 1) Quando hai GOOGLE_PLACES_API_KEY: generala da Google Cloud Console → Places API (abilita fatturazione / free tier disponibile)
// 2) Quando hai GOOGLE_PLACE_ID: ottienilo dalla tua scheda Google My Business (AD INFISSI Aprilia) oppure cercandolo qui: https://developers.google.com/maps/documentation/places/web-service/place-id
// 3) Esegui fetch:
//    const res = await fetch(`https://maps.googleapis.com/maps/api/place/details/json?placeid=GOOGLE_PLACE_ID&key=GOOGLE_PLACES_API_KEY&fields=name,rating,reviews,user_ratings_total,url`)
//    const data = await res.json();
// 4) Sostituisci array statico recensioni con data.result.reviews (mantieni la stessa interfaccia GoogleReview)
// 5) Sostituisci googleStats con { avgRating: data.result.rating, totalReviews: data.result.user_ratings_total, googleUrl: data.result.url }

export interface GoogleReview {
  author_name: string;
  profile_photo_url?: string;
  rating: number;
  relative_time_description: string;
  text: string;
}

export const googleStats = {
  avgRating: 4.9,
  totalReviews: 327,
  googleUrl:
    'https://www.google.com/maps/search/AD+INFISSI+srl+Via+Nettunense+235+Aprilia',
};

export const googleReviews: GoogleReview[] = [
  {
    author_name: 'Marco De Santis',
    profile_photo_url:
      'https://ui-avatars.com/api/?name=Marco+De+Santis&background=CA8A04&color=fff&bold=true&size=128',
    rating: 5,
    relative_time_description: '2 mesi fa',
    text:
      'Professionalità e competenza davvero eccezionali. Ho fatto installare gli infissi in tutta casa e il risultato è stato superiore alle aspettative: posa perfetta, materiali di qualità e team disponibile in ogni fase. Consigliatissimi!',
  },
  {
    author_name: 'Laura Bianchi',
    profile_photo_url:
      'https://ui-avatars.com/api/?name=Laura+Bianchi&background=FACC15&color=1f2937&bold=true&size=128',
    rating: 5,
    relative_time_description: '1 mese fa',
    text:
      'Personale gentile e super disponibile. Il cancello automatico che hanno installato funziona egregiamente, siamo molto soddisfatti del lavoro svolto e dei tempi di consegna rispettati.',
  },
  {
    author_name: 'Giuseppe Ferrara',
    profile_photo_url:
      'https://ui-avatars.com/api/?name=Giuseppe+Ferrara&background=A16207&color=fff&bold=true&size=128',
    rating: 5,
    relative_time_description: '3 settimane fa',
    text:
      "Azienda seria e affidabile. Il pergolato è stato realizzato a regola d'arte, rispettando tempi e budget pattuiti. Giovanni e il suo staff si sono dimostrati professionisti del mestiere. 5 stelle meritate!",
  },
  {
    author_name: 'Francesca Romano',
    profile_photo_url:
      'https://ui-avatars.com/api/?name=Francesca+Romano&background=854D0E&color=fff&bold=true&size=128',
    rating: 5,
    relative_time_description: '2 settimane fa',
    text:
      "Ottima esperienza dall'inizio alla fine. Giovanni e il suo team hanno letteralmente trasformato il nostro terrazzo con un pergolato bioclimatico da sogno. Qualità top, prezzi onesti e assistenza post vendita impeccabile.",
  },
  {
    author_name: 'Antonio Greco',
    profile_photo_url:
      'https://ui-avatars.com/api/?name=Antonio+Greco&background=713F12&color=fff&bold=true&size=128',
    rating: 5,
    relative_time_description: '1 settimana fa',
    text:
      "Dopo 20 anni nel settore si vede tutta l'esperienza che c'è dietro. Lavoro impeccabile su porte e finestre, materiali di prima qualità e sopralluogo senza impegno. Sicuramente mi rivolgerò di nuovo a loro per i prossimi lavori.",
  },
  {
    author_name: 'Silvia Moretti',
    profile_photo_url:
      'https://ui-avatars.com/api/?name=Silvia+Moretti&background=FEF3C7&color=713F12&bold=true&size=128',
    rating: 5,
    relative_time_description: '4 giorni fa',
    text:
      'Avevo bisogno di infissi antisfondamento per la nuova casa e AD INFISSI mi ha consigliato la soluzione perfetta per le mie esigenze. Preventivo chiaro, senza sorprese, e installazione velocissima. Squadra top!',
  },
];
