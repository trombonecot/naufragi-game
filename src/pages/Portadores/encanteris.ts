// Encanteris de la Pastora d'energia. The player selects which ones the
// character knows; only the basic effect + cost is shown on the sheet.

export interface Encanteri {
  id: string;
  nom: string;
  /** Cost in resource-card points (figures count as 10). */
  cost: number;
  text: string;
}

export const ENCANTERIS: Encanteri[] = [
  { id: 'encantar-persona', nom: 'Encantar persona', cost: 5, text: 'Tira parlamentar amb avantatge.' },
  { id: 'armadura-magica', nom: 'Armadura màgica', cost: 5, text: 'Permet absorbir una condició abans de rebre-la.' },
  { id: 'refugi', nom: 'Refugi', cost: 5, text: 'Durant la nit es recupera una condició adicional.' },
  { id: 'guia', nom: 'Guia', cost: 6, text: 'Permet fer el moviment de viatjar sense crear perill.' },
  { id: 'arma-magica', nom: 'Arma màgica', cost: 6, text: '+1 a una tirada de combat.' },
  {
    id: 'multiplicar',
    nom: 'Multiplicar',
    cost: 7,
    text: "Durant la posta pots fer que una carta valgui com una parella d'aquella mateixa carta. Amb això podries passar també d'una parella a un trio, o d'un trio a un pòquer.",
  },
  { id: 'curar', nom: 'Curar', cost: 7, text: 'Permet treure una condició.' },
  {
    id: 'beneir-arma',
    nom: 'Beneir arma',
    cost: 8,
    text: 'Permet beneir una arma per lluitar contra les forces de la foscor amb avantatge durant tot un dia.',
  },
  { id: 'oracle', nom: 'Oracle', cost: 8, text: "Robar una carta de destí i la tornes a la pila d'aventura." },
  { id: 'bola-de-foc', nom: 'Bola de foc', cost: 9, text: 'Avantatge en una tirada de combat.' },
  { id: 'dominar-desti', nom: 'Dominar destí', cost: 10, text: 'Roba una carta de destí i passa-la a recursos.' },
  {
    id: 'invisibilitat',
    nom: 'Invisibilitat',
    cost: 10,
    text: 'Permet evitar un perill o obstacle i passar la carta directament a recursos. O narrativament el que vulguis.',
  },
];
