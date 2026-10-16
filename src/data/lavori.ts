export interface FotoLavoro {
  url: string;
  titolo: string;
  descrizione?: string;
}

export interface CategoriaLavori {
  slug: string;
  nome: string;
  descrizione: string;
  copertina: string;
  foto: FotoLavoro[];
}

/**
 * ⚠️ FALLBACK STATICO
 * La fonte di verità delle categorie è la tabella Supabase `gallery_categories`
 * (gestibile dal pannello /gestionesitoweb). Questo elenco viene usato SOLO se
 * il database non è raggiungibile, per evitare che il sito resti vuoto.
 */
export const categorieLavori: CategoriaLavori[] = [
  {
    slug: 'INFISSI',
    nome: 'Infissi',
    descrizione:
      'Infissi in alluminio e PVC di ultima generazione: finestre, porte-finestre, vetrate scorrevoli e sistemi oscillo-battenti. Isolamento termico e acustico garantito.',
    copertina:
      'https://images.pexels.com/photos/1643389/pexels-photo-1643389.jpeg?auto=compress&cs=tinysrgb&w=1200',
    foto: [
      {
        url: 'https://images.pexels.com/photos/1643389/pexels-photo-1643389.jpeg?auto=compress&cs=tinysrgb&w=1200',
        titolo: 'Finestre moderne in alluminio',
        descrizione: 'Villa privata - Aprilia',
      },
      {
        url: 'https://images.pexels.com/photos/3555615/pexels-photo-3555615.jpeg?auto=compress&cs=tinysrgb&w=1200',
        titolo: 'Vetrate scorrevoli su misura',
        descrizione: 'Attico con vista panoramica',
      },
      {
        url: 'https://images.pexels.com/photos/1029599/pexels-photo-1029599.jpeg?auto=compress&cs=tinysrgb&w=1200',
        titolo: 'Finestra con cornice minimal',
        descrizione: 'Ristrutturazione appartamento',
      },
      {
        url: 'https://images.pexels.com/photos/3288104/pexels-photo-3288104.jpeg?auto=compress&cs=tinysrgb&w=1200',
        titolo: 'Portafinestra scura design',
        descrizione: 'Open space moderno',
      },
      {
        url: 'https://images.pexels.com/photos/6489664/pexels-photo-6489664.jpeg?auto=compress&cs=tinysrgb&w=1200',
        titolo: 'Grande vetrata facciata',
        descrizione: 'Villa bifamiliare',
      },
      {
        url: 'https://images.pexels.com/photos/667838/pexels-photo-667838.jpeg?auto=compress&cs=tinysrgb&w=1200',
        titolo: 'Finestra ad arco personalizzata',
        descrizione: 'Casa in stile classico',
      },
    ],
  },
  {
    slug: 'PERGOTENDA_BIOCLIMATICHE',
    nome: 'Pergotenda/bioclimatiche',
    descrizione:
      'Pergotende e pergolati bioclimatici con lame orientabili o tessuto. Soluzioni ideali per vivere il giardino e la terrazza in ogni stagione.',
    copertina:
      'https://images.pexels.com/photos/271816/pexels-photo-271816.jpeg?auto=compress&cs=tinysrgb&w=1200',
    foto: [
      {
        url: 'https://images.pexels.com/photos/271816/pexels-photo-271816.jpeg?auto=compress&cs=tinysrgb&w=1200',
        titolo: 'Pergolato classico con tende',
        descrizione: 'Giardino residenziale',
      },
      {
        url: 'https://images.pexels.com/photos/271805/pexels-photo-271805.jpeg?auto=compress&cs=tinysrgb&w=1200',
        titolo: 'Pergolato bioclimatico in alluminio',
        descrizione: 'Terrazzo rooftop',
      },
      {
        url: 'https://images.pexels.com/photos/1640770/pexels-photo-1640770.jpeg?auto=compress&cs=tinysrgb&w=1200',
        titolo: 'Pergolato con zona living esterno',
        descrizione: 'Villa con piscina',
      },
      {
        url: 'https://images.pexels.com/photos/1571459/pexels-photo-1571459.jpeg?auto=compress&cs=tinysrgb&w=1200',
        titolo: 'Pensilina moderna su terrazzo',
        descrizione: 'Attico centro città',
      },
      {
        url: 'https://images.pexels.com/photos/5997989/pexels-photo-5997989.jpeg?auto=compress&cs=tinysrgb&w=1200',
        titolo: 'Pergolato addossato alla casa',
        descrizione: 'Soluzione continuativa copertura',
      },
      {
        url: 'https://images.pexels.com/photos/1457842/pexels-photo-1457842.jpeg?auto=compress&cs=tinysrgb&w=1200',
        titolo: 'Gazebo/pergolato elegante',
        descrizione: 'Area relax giardino',
      },
    ],
  },
  {
    slug: 'CANCELLI',
    nome: 'Cancelli',
    descrizione:
      'Cancelli pedonali e carrabili in alluminio, ferro battuto e acciaio, con automazioni di ultima generazione. Design personalizzati per ogni ingresso.',
    copertina:
      'https://images.pexels.com/photos/323780/pexels-photo-323780.jpeg?auto=compress&cs=tinysrgb&w=1200',
    foto: [
      {
        url: 'https://images.pexels.com/photos/323780/pexels-photo-323780.jpeg?auto=compress&cs=tinysrgb&w=1200',
        titolo: 'Cancello scorrevole in alluminio',
        descrizione: 'Ingresso villa moderna',
      },
      {
        url: 'https://images.pexels.com/photos/271804/pexels-photo-271804.jpeg?auto=compress&cs=tinysrgb&w=1200',
        titolo: 'Cancello a battente con montanti',
        descrizione: 'Ingresso rustico elegante',
      },
      {
        url: 'https://images.pexels.com/photos/1571460/pexels-photo-1571460.jpeg?auto=compress&cs=tinysrgb&w=1200',
        titolo: 'Cancello automatico design',
        descrizione: 'Cancello con motore integrato',
      },
      {
        url: 'https://images.pexels.com/photos/1641834/pexels-photo-1641834.jpeg?auto=compress&cs=tinysrgb&w=1200',
        titolo: 'Cancelletto pedonale abbinato',
        descrizione: 'Combinazione cancello+pedonale',
      },
      {
        url: 'https://images.pexels.com/photos/6937850/pexels-photo-6937850.jpeg?auto=compress&cs=tinysrgb&w=1200',
        titolo: 'Cancello in ferro battuto classico',
        descrizione: 'Villa in stile storico',
      },
      {
        url: 'https://images.pexels.com/photos/6780650/pexels-photo-6780650.jpeg?auto=compress&cs=tinysrgb&w=1200',
        titolo: 'Cancello con ringhiera coordinata',
        descrizione: 'Perimetro completo villa',
      },
    ],
  },
  {
    slug: 'PORTONI_BLINDATI',
    nome: 'Portoni blindati',
    descrizione:
      'Portoni d\'ingresso blindati, in vari materiali e finiture. Sicurezza, design e isolamento per l\'accesso principale della tua abitazione.',
    copertina:
      'https://images.pexels.com/photos/3622643/pexels-photo-3622643.jpeg?auto=compress&cs=tinysrgb&w=1200',
    foto: [
      {
        url: 'https://images.pexels.com/photos/3622643/pexels-photo-3622643.jpeg?auto=compress&cs=tinysrgb&w=1200',
        titolo: 'Porta blindata moderna',
        descrizione: 'Classe di sicurezza elevata',
      },
      {
        url: 'https://images.pexels.com/photos/6925008/pexels-photo-6925008.jpeg?auto=compress&cs=tinysrgb&w=1200',
        titolo: 'Porta d\'ingresso minimal con vetro',
        descrizione: 'Design contemporaneo',
      },
      {
        url: 'https://images.pexels.com/photos/6899049/pexels-photo-6899049.jpeg?auto=compress&cs=tinysrgb&w=1200',
        titolo: 'Porta interna in legno',
        descrizione: 'Abitazione ristrutturata',
      },
      {
        url: 'https://images.pexels.com/photos/667838/pexels-photo-667838.jpeg?auto=compress&cs=tinysrgb&w=1200',
        titolo: 'Porta a doppia anta',
        descrizione: 'Ingresso principale villa',
      },
      {
        url: 'https://images.pexels.com/photos/6489662/pexels-photo-6489662.jpeg?auto=compress&cs=tinysrgb&w=1200',
        titolo: 'Porta scura con inserti',
        descrizione: 'Moderno e accogliente',
      },
      {
        url: 'https://images.pexels.com/photos/1571460/pexels-photo-1571460.jpeg?auto=compress&cs=tinysrgb&w=1200',
        titolo: 'Porta di design in alluminio',
        descrizione: 'Soluzione per esterni',
      },
    ],
  },
];
