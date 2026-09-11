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
  {
    id: 'armadura-magica',
    nom: 'Armadura màgica',
    cost: 5,
    text: "Permet absorbir totes les condicions d'un atac.",
  },
  {
    id: 'refugi',
    nom: 'Refugi',
    cost: 5,
    text: 'Durant la nit es recupera una condició adicional i si al despertar es treu una carta de figura no cal manipular el destí.',
  },
  {
    id: 'guia',
    nom: 'Guia',
    cost: 6,
    text: 'Permet fer el moviment de viatjar sense manipular el destí.',
  },
  {
    id: 'arma-magica',
    nom: 'Arma màgica',
    cost: 6,
    text: '+1 a tots els moviments de combatre durant un combat.',
  },
  { id: 'curar', nom: 'Curar', cost: 6, text: 'Permet treure fins a dues condicions.' },
  {
    id: 'encantar-persona',
    nom: 'Encantar persona',
    cost: 7,
    text: 'Pots tirar parlamentar amb avantatge.',
  },
  {
    id: 'reparar',
    nom: 'Reparar',
    cost: 7,
    text: 'Permet reparar qualsevol objecte, arma o armadura desgastada.',
  },
  {
    id: 'oracle',
    nom: 'Oracle',
    cost: 8,
    text: "Robar una carta de destí i la tornes a la pila d'aventura.",
  },
  {
    id: 'bola-de-foc',
    nom: 'Bola de foc',
    cost: 8,
    text: 'Tira el moviment de combatre; si tens èxit fas tantes marques com el resultat més baix.',
  },
  {
    id: 'dominar-desti',
    nom: 'Dominar destí',
    cost: 9,
    text: 'Roba una carta de destí i passa-la a recursos.',
  },
  {
    id: 'raig-electrificant',
    nom: 'Raig electrificant',
    cost: 10,
    text: 'Tira el moviment de combatre; si tens èxit fas tantes marques com el resultat més alt.',
  },
];
