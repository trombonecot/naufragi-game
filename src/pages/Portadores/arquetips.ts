// Arquetips de "Portadores de llum". Switching archetype only changes the
// first sheet (class-specific moves / spells); cards and map are shared.

export interface Moviment {
  name: string;
  text: string;
  /** Innate starting move: always active, not toggleable. */
  inicial?: boolean;
}

/** Attribute spread offered at character creation, in ATTRS order. */
export interface AtributsInicials {
  for: number;
  des: number;
  ast: number;
  vol: number;
  car: number;
}

export interface Arquetip {
  id: string;
  nom: string;
  /** Optional flavour text shown under the subtitle. */
  descripcio?: string;
  /** Maximum carried objects, when the archetype specifies one. */
  objectesMax?: number;
  /** Available equipment slots, split by category. */
  equip: { armes: number; armadura: number; objectes: number };
  /** Attribute spreads to choose between when creating the character. */
  atributsInicials: AtributsInicials[];
  /** Starting gear: everyone gets `base`, plus one option from `tria`. */
  equipInicial: { base: string[]; tria: string[] };
  /** Note about which own move the character starts with. */
  movimentInicial?: string;
  moviments: Moviment[];
  /** Whether the archetype has a selectable spell list. */
  teEncanteris?: boolean;
  /** Whether the archetype uses the divine favours list. */
  teFavors?: boolean;
}

const EQUIP_BASE = [
  "un objecte d'aventura (tria quin)",
  'un objecte personal (tria quin)',
  'un fragment',
];

export const GUARDIA: Arquetip = {
  id: 'guardia',
  nom: "Guardià de l'esperança",
  descripcio:
    'Ets un personatge destre en les armes, amb un lideratge impertérrit i una gran promesa de defensar els més dèbils. Domines les armes de cos a cos com espases i llances o bé les de distància, com arcs o fones.',
  equip: { armes: 2, armadura: 1, objectes: 7 },
  atributsInicials: [
    { for: 1, des: 0, ast: -1, vol: 1, car: 0 },
    { for: 1, des: 1, ast: -1, vol: 0, car: 0 },
  ],
  equipInicial: {
    base: EQUIP_BASE,
    tria: [
      'una arma de mà (espasa curta, destral, llança) i una cota de malla',
      'un arc amb fletxes i una daga',
      "una arma a dues mans (mandoble, martell gegant) i una armadura de pell",
    ],
  },
  movimentInicial: "Tria'n un entre Atac entrenat i Defensar.",
  moviments: [
    {
      name: 'Atac entrenat',
      text: 'una vegada al dia pots repetir una tirada de combat que hagis fallat.',
    },
    {
      name: 'Defensar',
      text: "permet perdre una carta aleatòria de recursos a canvi d'evitar les condicions conseqüències d'un atac a tu o a un aliat.",
    },
    {
      name: 'Inspirar',
      text: 'permet curar una condició mental adicional en el moviment de descansar si fas una reflexió o discurs inspirador.',
    },
    {
      name: 'Reparar arma/armadura',
      text: 'permet gastar una carta qualsevol de recursos per reparar una arma o armadura desgastada.',
    },
    {
      name: 'Intimidant',
      text: 'permet fer el moviment de parlamentar sumant els atributs de carisma i força alhora.',
    },
    {
      name: 'Pell de ferro',
      text: "si no tens cap condició, la primera condició que reps en un combat s'ignora.",
    },
    {
      name: 'Atac brutal',
      text: 'en èxit en combat, cada sis tret als daus és una marca adicional.',
    },
  ],
};

export const PASTORA: Arquetip = {
  id: 'pastora',
  nom: "Pastora d'energia",
  descripcio:
    'De manera natural sempre has notat una connexió estranya amb una força desconeguda que ho rodeja tot. Amb el temps has après a manipular-ho en el teu benefici i has descobert que hi ha gent que porta generacions estudiant-ho: és la màgia.',
  objectesMax: 8,
  equip: { armes: 2, armadura: 0, objectes: 6 },
  atributsInicials: [
    { for: 0, des: 0, ast: 1, vol: 1, car: 0 },
    { for: 0, des: 1, ast: 1, vol: 0, car: 0 },
  ],
  equipInicial: {
    base: [...EQUIP_BASE, 'dos encanteris (de valor màxim 6)'],
    tria: ['un bastó', 'una daga', 'una fona'],
  },
  movimentInicial: 'Tirar encanteri. Només el pot fer una vegada al dia.',
  teEncanteris: true,
  moviments: [
    {
      name: 'Tirar encanteri',
      text: 'permet tirar un encanteri al dia (descrit a la referència de moviments).',
      inicial: true,
    },
    {
      name: 'Aprenent de màgia',
      text: 'en el moviment treure conclusions pots fer servir la combinació de trio per guanyar un encanteri nou. Aquest nou encanteri només pot ser un nivell per sobre dels ja coneguts.',
    },
    {
      name: 'Oracle',
      text: "permet gastar dues cartes aleatòries de recursos per tornar una carta de la pila de destí a la pila d'aventura.",
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
      text: 'permet tirar encanteris ignorant el cost de la carta, simplement gastant una carta sense importar-ne el valor.',
    },
    {
      name: 'Resistència màgica',
      text: "ignora la primera condició de cada combat procedent d'un atac màgic.",
    },
  ],
};

export const CARTOGRAF: Arquetip = {
  id: 'cartograf',
  nom: 'Cartògraf de les terres interiors',
  descripcio:
    "La teva passió sempre ha anat lligada a l'exploració de llocs llunyans i l'aventura. Potser t'has dedicat a dibuixar mapes dels camins més amagats, o a catalogar els animals més estrafolaris, o potser t'agrada establir contacte amb els assentaments més remots.",
  equip: { armes: 2, armadura: 1, objectes: 7 },
  atributsInicials: [
    { for: 0, des: 1, ast: 0, vol: 1, car: 0 },
    { for: 0, des: 1, ast: 1, vol: 0, car: 0 },
  ],
  equipInicial: {
    base: EQUIP_BASE,
    tria: ['un arc amb fletxes i una espasa curta', 'una destral i un escut'],
  },
  moviments: [
    {
      name: 'Explorador expert',
      text: "al fer el moviment de viatjar pots treure dues cartes i quedar-te amb la que més t'agradi.",
    },
    {
      name: 'Supervivent',
      text: "en un moviment on se't digui que has de perdre un objecte, pots perdre una carta de recursos enlloc de l'objecte. Aquesta carta passa a la pila d'aventura i es torna a barrejar.",
    },
    {
      name: 'Atac furtiu',
      text: 'una vegada al dia pots decidir fer el doble de mal en un atac, ho has de dir abans de fer la tirada.',
    },
    {
      name: 'Camuflatge',
      text: "mentre estiguis en territoris no urbans tens un +1 en qualsevol tirada d'enfrontar-se al perill on et serveixi d'alguna manera moure't entre les ombres naturals.",
    },
    {
      name: 'Descans natural',
      text: "mentre estiguis en territoris no urbans pots treure't una condició adicional al descansar.",
    },
    {
      name: 'Erudit dels mapes',
      text: 'tens un +1 al buscar traces relacionades amb orientació, mapes o buscar camins en el món natural.',
    },
  ],
};

export const SACERDOTESSA: Arquetip = {
  id: 'sacerdotessa',
  nom: 'Sacerdotessa de la llum',
  descripcio:
    'Tens una comunió especial amb les deitats dels antics i pots manipular la llum dels artefactes a través de pregàries. La teva llum sana als malalts i debilita a les tropes de la foscor.',
  equip: { armes: 2, armadura: 1, objectes: 5 },
  atributsInicials: [
    { for: 0, des: 0, ast: 1, vol: 1, car: 0 },
    { for: 0, des: 0, ast: 0, vol: 1, car: 1 },
  ],
  equipInicial: {
    base: EQUIP_BASE,
    tria: ['una maça i un escut', 'una llança llarga i un peto cuirassat'],
  },
  movimentInicial: 'Demanar favor als Déus. Només el pot fer una vegada al dia.',
  teFavors: true,
  moviments: [
    {
      name: 'Demanar favor als Déus',
      text: 'pots demanar un favor diví una vegada al dia (descrit a la referència de moviments).',
      inicial: true,
    },
    { name: 'Primers auxilis', text: 'permet curar una condició a un aliat un cop al dia.' },
    {
      name: 'Suplicar als Déus',
      text: 'pots fer servir el moviment de demanar favor als Déus dues vegades al dia.',
    },
    {
      name: 'Protecció divina',
      text: 'el pots activar un cop al dia i les dues següents condicions són ignorades.',
    },
    {
      name: 'Sacrifici',
      text: 'reps una condició a canvi de tirar amb avantatge en la tirada al següent moviment.',
    },
    {
      name: "Predicar amb l'exemple",
      text: 'quan aconsegueixes un èxit total en combat, els teus companys i tu teniu un +1 a la següent tirada de combat.',
    },
    {
      name: 'Predicadora',
      text: "tens un +1 en les tirades de parlamentar relacionades amb la religió, l'inspiració o la fe.",
    },
  ],
};

export const ARQUETIPS: Arquetip[] = [GUARDIA, PASTORA, CARTOGRAF, SACERDOTESSA];

export const ARQUETIP_BY_ID: Record<string, Arquetip> = Object.fromEntries(
  ARQUETIPS.map((a) => [a.id, a]),
);

export const DEFAULT_ARQUETIP = GUARDIA.id;
