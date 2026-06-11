// Arquetips de "Portadores de llum". Switching archetype only changes the
// first sheet (class-specific moves / spells); cards and map are shared.

export interface Moviment {
  name: string;
  text: string;
  /** Innate starting move: always active, not toggleable. */
  inicial?: boolean;
}

export interface Arquetip {
  id: string;
  nom: string;
  /** Optional flavour text shown under the subtitle. */
  descripcio?: string;
  /** Maximum carried objects, when the archetype specifies one. */
  objectesMax?: number;
  moviments: Moviment[];
  /** Whether the archetype has a selectable spell list. */
  teEncanteris?: boolean;
}

export const GUARDIA: Arquetip = {
  id: 'guardia',
  nom: "Guardià de l'esperança",
  moviments: [
    { name: 'Atac poderós', text: 'una vegada al dia pots repetir una tirada de combat.' },
    {
      name: 'Defensar',
      text: "permet perdre una carta aleatòria de recursos a canvi d'evitar les condicions conseqüències d'un atac a tu o a un aliat.",
    },
    {
      name: 'Inspirar',
      text: 'permet curar una condició mental adicional en el moviment de descansar si fas una reflexió o discurs inspirador.',
    },
    {
      name: 'Fabricar arma/armadura',
      text: 'permet gastar una carta de figura de recursos durant la posta per fabricar una arma o armadura. Només en territoris de ciutat o poblat.',
    },
    {
      name: 'Intimidant',
      text: 'permet fer el moviment de parlamentar sumant els atributs de carisma i força alhora.',
    },
    {
      name: 'Pell de ferro',
      text: "si no tens cap condició, la primera condició que reps en un combat s'ignora.",
    },
  ],
};

export const PASTORA: Arquetip = {
  id: 'pastora',
  nom: "Pastora d'energia",
  descripcio:
    'De manera natural sempre has notat una connexió estranya amb una força desconeguda que ho rodeja tot. Amb el temps has après a manipular-ho en el teu benefici i has descobert que hi ha gent que porta generacions estudiant-ho: és la màgia.',
  objectesMax: 8,
  teEncanteris: true,
  moviments: [
    { name: 'Tirar encanteri', text: 'permet tirar un encanteri al dia.', inicial: true },
    {
      name: 'Aprenent de màgia',
      text: "en la posta pots fer servir la combinació de pòquer per guanyar un encanteri nou enlloc d'un punt d'experiència. Aquest nou encanteri només pot ser un nivell per sobre dels ja coneguts.",
    },
    {
      name: 'Oracle',
      text: "permet, durant la fase de posta, gastar dues cartes aleatòries de recursos per tornar una carta de la pila de destí a la pila d'aventura.",
    },
    {
      name: 'Coneixements prohibits',
      text: 'al fer el moviment buscar rastres, si té a veure amb buscar informació sobre temes arcans, ignora si et surt un perill.',
    },
    {
      name: 'Inesgotable',
      text: "permet tirar els encanteris que calguin al dia mentre no es fracassi en el moviment tirar encanteri. Quan es fracassa ja no se'n pot tornar a tirar més fins l'endemà.",
    },
    {
      name: 'Arximag',
      text: "permet tirar encanteris ignorant el cost de la carta, simplement gastant una carta sense importar-ne el valor.",
    },
    {
      name: 'Resistència màgica',
      text: 'ignora la primera condició de cada combat procedent d\'un atac màgic.',
    },
  ],
};

export const ARQUETIPS: Arquetip[] = [GUARDIA, PASTORA];

export const ARQUETIP_BY_ID: Record<string, Arquetip> = Object.fromEntries(
  ARQUETIPS.map((a) => [a.id, a]),
);

export const DEFAULT_ARQUETIP = GUARDIA.id;
