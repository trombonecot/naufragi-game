// Reference content for all game moves ("moviments"), shown in the floating
// MovesReference modal. Mirrors the printable reference sheet so players can
// consult any move mid-game. Inline **bold** is parsed by the renderer; suit
// symbols (♣ ♦ ♥ ♠) are written literally.

export type RollKind = 'total' | 'partial' | 'fail';

export type Block =
  | { type: 'p'; text: string }
  | { type: 'list'; items: string[] }
  | { type: 'note'; text: string }
  | { type: 'subtitle'; text: string }
  | { type: 'results'; results: { kind: RollKind; label: string; text: string }[] }
  | { type: 'table'; head?: string[]; rows: string[][]; keyCol?: boolean; scroll?: boolean };

export interface Move {
  id: string;
  title: string;
  when: string;
  blocks: Block[];
}

export interface MoveGroup {
  id: string;
  label: string;
  moves: Move[];
}

// Shared legend, shown as the opening entry of the modal.
export const suitLegend: Block[] = [
  {
    type: 'p',
    text: 'El **pal** de la carta té un significat diferent segons el moviment que estiguis fent. Aquesta és la guia ràpida:',
  },
  {
    type: 'table',
    head: ['Pal', 'Obstacle / Fenomen', 'Encontre', 'Neguit', 'Perill associat'],
    rows: [
      ['♣ Trèvol', 'Senzill (+1)', 'Amistós', 'Intern', 'Neguit'],
      ['♦ Diamant', 'Normal (±0)', 'Neutral', 'Circumstàncies', 'Esdeveniment'],
      ['♥ Cor', 'Difícil (−1)', 'Perillós', 'Relació', 'Encontre'],
      ['♠ Pica', 'Impossible (−2)', 'Hostil', 'Experiències passades', 'Fenomen ambiental'],
    ],
  },
  {
    type: 'note',
    text: 'Obstacle / Fenomen → dificultat · Encontre → actitud · Neguit → origen. La columna "Perill associat" és el que desencadena cada pal al moviment Crear perill.',
  },
];

export const moveGroups: MoveGroup[] = [
  {
    id: 'viatge',
    label: 'Flux de viatge',
    moves: [
      {
        id: 'viatjar',
        title: 'Viatjar',
        when: 'Quan vulguis moure’t cap a un territori desconegut. (Només 1 cop per dia de joc.)',
        blocks: [
          {
            type: 'p',
            text: 'Agafa el mapa d’hexàgons i tria el següent hexàgon a visitar. Treu una carta: és la **Carta de viatge** i la faràs servir durant tot el moviment.',
          },
          {
            type: 'p',
            text: 'Primer defineix un perill amb ella → **Crear perill**. Juga l’escena pertinent; en acabar arribes al nou territori.',
          },
          {
            type: 'p',
            text: 'Defineix el tipus de territori (per trama, o segons el número/figura de la carta). Dibuixa alguna cosa a l’hexàgon i pensa en quina localització hi arribes. Anota el nom del territori i la primera localització a la llegenda del mapa.',
          },
          {
            type: 'table',
            keyCol: true,
            rows: [
              ['A', 'Poblat'],
              ['2', 'Ciutat'],
              ['3', 'Camp'],
              ['4', 'Bosc'],
              ['5', 'Aiguamolls'],
              ['6', 'Àrid'],
              ['7', 'Muntanyes'],
              ['8', 'Costa'],
              ['9', 'Jungla'],
              ['10', 'Ruïnes'],
              ['J', 'Terra fosca'],
              ['Q', 'Terra cremada'],
              ['K', 'Terra corrupte'],
            ],
          },
        ],
      },
      {
        id: 'crear-perill',
        title: 'Crear perill',
        when: 'Quan hagis de definir un perill.',
        blocks: [
          {
            type: 'p',
            text: 'Treu una carta de la **pila d’aventura**. Busca entre les cartes de **destí** (tenint en compte també aquesta nova carta):',
          },
          {
            type: 'list',
            items: [
              'Si hi ha alguna **parella** → has de definir un perill.',
              'Si no n’hi ha → el que semblava un perill en realitat no ho era.',
            ],
          },
          {
            type: 'note',
            text: 'Retorna a la pila d’aventura les cartes de destí que formaven la parella (o només la de destí, si combinava amb la nova carta de perill).',
          },
          {
            type: 'p',
            text: 'Si jugues una aventura definida, mira els perills d’allà i executa el que toqui si es donen les condicions. Si no, el **pal** de la carta marca el problema:',
          },
          {
            type: 'list',
            items: [
              '**♠ Pica** — fenomen ambiental → **Crear fenomen ambiental**',
              '**♥ Cor** — encontre → **Crear encontre**',
              '**♦ Diamant** — esdeveniment → **Crear obstacle**',
              '**♣ Trèvol** — neguit → **Crear neguit**',
            ],
          },
        ],
      },
    ],
  },
  {
    id: 'definir',
    label: 'Definir perills',
    moves: [
      {
        id: 'crear-obstacle',
        title: 'Crear obstacle',
        when: 'Quan hagis de definir un obstacle.',
        blocks: [
          {
            type: 'p',
            text: 'Treu una nova carta de la pila d’aventura: defineix l’obstacle. El **pal marca la dificultat**:',
          },
          {
            type: 'list',
            items: [
              '**♣ Trèvol** — senzill (+1 a la tirada associada)',
              '**♦ Diamant** — normal',
              '**♥ Cor** — difícil (−1 a la tirada associada)',
              '**♠ Pica** — impossible (−2 a la tirada associada)',
            ],
          },
          {
            type: 'p',
            text: 'Defineix l’obstacle per trama, o pel número/figura de la carta:',
          },
          {
            type: 'table',
            keyCol: true,
            rows: [
              ['A', 'Trencament — camí tallat: riu, sotrac, penya-segat, senyals confuses…'],
              ['2', 'Feixuc — camí difícil: fang, tarteres, densitat d’arbustos, escarpat…'],
              ['3', 'Impossible — camí impossible: incendi…'],
              ['4', 'Recursos — pocs recursos: s’ha esgotat el menjar, s’ha trencat alguna cosa essencial…'],
              ['5', 'Tancat — espai tancat: muralla, campaments enemics…'],
              ['6', 'Traïdor — arenes movedisses, gel prim, lava petrificada…'],
              ['7', 'Cec — boira, foscor…'],
              ['8', 'Trampa — fossa, punxes, detonador…'],
              ['9', 'Altura — abisme, fondària, alçada impossible…'],
              ['10', 'Inestable — gel trencadís, despreniments…'],
              ['J', 'Corrupte — núvol tòxic, zona pestilent, aigua enverinada…'],
              ['Q', 'Màgic — barrera màgica: camp d’energia, gravetat estranya, petrificació…'],
              ['K', 'Fosc — terra fosca…'],
            ],
          },
          {
            type: 'p',
            text: 'Quan tinguis l’obstacle definit, **Enfronta’t al perill** per superar-lo.',
          },
        ],
      },
      {
        id: 'crear-encontre',
        title: 'Crear encontre',
        when: 'Quan hagis de definir un encontre que has tingut.',
        blocks: [
          {
            type: 'p',
            text: 'Treu una nova carta de la pila d’aventura. El **pal marca l’actitud**: ♣ amistós · ♦ neutral · ♥ perillós · ♠ hostil.',
          },
          {
            type: 'p',
            text: 'Tira **2d6** per veure qui és (cada territori pot tenir la seva pròpia taula que substitueixi aquesta):',
          },
          {
            type: 'table',
            scroll: true,
            head: ['2d6', 'Amistós', 'Neutral', 'Perillós', 'Hostil'],
            rows: [
              ['2', 'Nens', 'Camperols', 'Animals salvatges', 'Animals salvatges'],
              ['3', 'Camperols', 'Camperols', 'Animals salvatges', 'No-morts'],
              ['4', 'Camperols', 'Soldats', 'Soldats', 'Soldats'],
              ['5', 'Camperols', 'Soldats', 'Soldats', 'Mercenaris'],
              ['6', 'Soldats', 'Soldats', 'Soldats', 'Bandits'],
              ['7', 'Soldats', 'Mercenaris', 'Mercenaris', 'Trolls'],
              ['8', 'Refugiats', 'Mercenaris', 'Mercenaris', 'Gòblins'],
              ['9', 'Refugiats', 'Elf del bosc', 'Elf del bosc', 'Elf del bosc'],
              ['10', 'Mercader', 'Mercader', 'Mercader', 'Soldats corruptes'],
              ['11', 'Sanador', 'Sacerdotessa', 'Sacerdotessa', 'Seguidors de la foscor'],
              ['12', 'Aventurera', 'Cavaller', 'Cavaller', 'Paladí de la foscor'],
            ],
          },
          { type: 'subtitle', text: 'Preguntes per definir-lo (respon les que vulguis)' },
          {
            type: 'list',
            items: [
              '**Amistós:** Quina informació important et pot donar? Quina ajuda et demana? Per què creus que ja us heu trobat abans?',
              '**Neutral:** Què vol de tu? A canvi d’alguna cosa et donaria informació? Quina cosa t’amaga?',
              '**Perillós:** Pots passar desapercebut? Què pots fer perquè no t’ataqui? És possible enganyar-lo?',
              '**Hostil:** Com has caigut a la seva emboscada? Per què és un tema d’honor enfrontar-s’hi? Per què et guarda tant rancor?',
            ],
          },
          {
            type: 'note',
            text: 'Munta l’escena. Si és només narratiu, la carta torna a la pila d’aventura i es barreja. Si motiva un altre moviment (enfrontar-se, parlamentar o combatre), la carta anirà on indiqui aquell moviment.',
          },
        ],
      },
      {
        id: 'crear-neguit',
        title: 'Crear neguit',
        when: 'Quan hagis de definir un neguit que pateixes.',
        blocks: [
          {
            type: 'p',
            text: 'Treu una nova carta de la pila d’aventura. El **pal marca l’origen**: ♣ intern · ♦ circumstàncies · ♥ relació · ♠ experiències passades.',
          },
          { type: 'p', text: 'Defineix el neguit per trama, o pel número/figura de la carta:' },
          {
            type: 'table',
            keyCol: true,
            rows: [
              ['A', 'Anhel'],
              ['2', 'Tristesa'],
              ['3', 'Culpa'],
              ['4', 'Ràbia'],
              ['5', 'Fatiga'],
              ['6', 'Avorriment'],
              ['7', 'Paranoia'],
              ['8', 'Deliri'],
              ['9', 'Ansietat'],
              ['10', 'Soledat'],
              ['J', 'Desesperació'],
              ['Q', 'Bogeria'],
              ['K', 'Terror'],
            ],
          },
          {
            type: 'p',
            text: 'Narra un petit flashback sobre el neguit i per què ha perseguit el personatge fins aquí. Després **Enfronta’t al perill** per superar el mal moment: a vegades els perills són al nostre interior.',
          },
        ],
      },
      {
        id: 'crear-fenomen',
        title: 'Crear fenomen ambiental',
        when: 'Quan hagis de definir un fenomen ambiental.',
        blocks: [
          {
            type: 'p',
            text: 'Treu una nova carta de la pila d’aventura. El **pal marca la magnitud**: ♣ senzill (+1) · ♦ normal · ♥ difícil (−1) · ♠ impossible (−2).',
          },
          { type: 'p', text: 'Defineix el fenomen per trama, o pel número/figura de la carta:' },
          {
            type: 'table',
            keyCol: true,
            rows: [
              ['A', 'Esclafit, pedregada, tempesta, llamp, gel'],
              ['2', 'Arrels, planta carnívora, arbre, arbust'],
              ['3', 'Bolet, molsa, liquen, succió'],
              ['4', 'Boira, toll, pluja àcida, verí'],
              ['5', 'Flames, vent, arenes, cicló'],
              ['6', 'Gorg, guèiser, riu de lava'],
              ['7', 'Temperatura, roent, gèlid'],
              ['8', 'Veus, mur de llum, pedres'],
              ['9', 'Precipici, esquerda, coll, rugós, escarpat'],
              ['10', 'Cova, foscor, riu, tornado'],
              ['J', 'Malaltia, febre, vòmits'],
              ['Q', 'Màgia'],
              ['K', 'Foscor'],
            ],
          },
          { type: 'p', text: 'Després **Enfronta’t al perill** per superar-lo.' },
        ],
      },
    ],
  },
  {
    id: 'resoldre',
    label: 'Resoldre',
    moves: [
      {
        id: 'enfrontar-perill',
        title: 'Enfrontar-se al perill',
        when: 'Per superar una carta d’obstacle o quan la teva vida està en perill. Sempre es resol amb una sola tirada.',
        blocks: [
          { type: 'p', text: 'Descriu la situació i què farà el personatge per superar-la. Fes una tirada:' },
          {
            type: 'results',
            results: [
              { kind: 'total', label: 'Èxit total', text: 'Aconsegueixes una posició avantatjosa i superes el perill. La carta passa a **recursos**. Explica què ha passat.' },
              { kind: 'partial', label: 'Èxit parcial', text: 'A males penes superes el perill. La carta passa a **destí**. Explica què ha passat.' },
              { kind: 'fail', label: 'Fracàs', text: 'La situació se’t descontrola i no el superes; quedes vulnerable. Si era d’exploració, imagina’t com el deixes enrere (potser momentàniament); la carta passa a **destí**. **Guanyes una condició o perds un objecte.**' },
            ],
          },
          {
            type: 'note',
            text: 'Hi hagi èxit o fracàs, el personatge deixa enrere el perill — a vegades victoriós, a vegades ferit. Si ha estat un fracàs, aprofita més endavant perquè torni a sorgir.',
          },
        ],
      },
      {
        id: 'combatre',
        title: 'Combatre l’enemic',
        when: 'Quan t’enfrontis a un enemic mitjançant les armes.',
        blocks: [
          {
            type: 'p',
            text: 'Defineix la **dificultat** (normal, difícil o impossible; puja-la o baixa-la segons el combat). Si hi ha diversos enemics, queda’t amb la dificultat més alta. Necessitaràs un comptador de marques.',
          },
          {
            type: 'p',
            text: 'El combat dura rondes fins que arribes a les 5 condicions o fas a l’enemic tantes marques com marca la seva dificultat:',
          },
          {
            type: 'table',
            head: ['Dificultat', 'Marques', 'Tirada'],
            rows: [
              ['Senzill', '2', '+1'],
              ['Normal', '3', '±0'],
              ['Difícil', '4', '−1'],
              ['Impossible', '6', '−2'],
            ],
          },
          {
            type: 'note',
            text: 'Què representen les marques i el desenllaç (mort, inconsciència, fugida…) ho decideixes tu narrativament. Abans de tirar pots abandonar el combat: la carta en joc passa a destí, i també una carta aleatòria de la pila de recursos.',
          },
          {
            type: 'results',
            results: [
              { kind: 'total', label: 'Èxit total', text: 'Causes dues marques. Explica què ha passat.' },
              { kind: 'partial', label: 'Èxit parcial', text: 'Causes una marca. Pots causar-ne una d’addicional si a canvi guanyes una condició o perds un objecte.' },
              { kind: 'fail', label: 'Fracàs', text: 'Guanyes una condició si l’enemic és senzill o normal, dues si és difícil o impossible. La carta passa a **destí**.' },
            ],
          },
          {
            type: 'note',
            text: 'En acabar: si no hi ha hagut cap fracàs la carta passa a recursos; en cas contrari, a destí.',
          },
        ],
      },
      {
        id: 'parlamentar',
        title: 'Parlamentar',
        when: 'Per treure informació o favor d’algú neutral o amistós, o per calmar algú perillós.',
        blocks: [
          { type: 'p', text: 'Fes una tirada amb **carisma** o **astúcia**:' },
          {
            type: 'results',
            results: [
              { kind: 'total', label: 'Èxit total', text: 'Aconsegueixes el teu objectiu. Si hi havia una carta en joc, passa a **recursos**.' },
              { kind: 'partial', label: 'Èxit parcial', text: 'Aconsegueixes l’objectiu a canvi d’alguna cosa: perdre aleatòriament una carta de recursos, o perdre un objecte.' },
              { kind: 'fail', label: 'Fracàs', text: 'No ho aconsegueixes i s’enfada. Si és neutral o amistós no en vol saber res per avui; si és perillós, t’ataca (**Combatre**). Si hi ha carta en joc, passa a **destí**.' },
            ],
          },
        ],
      },
      {
        id: 'buscar-rastres',
        title: 'Buscar rastres',
        when: 'Per trobar pistes, rastres o indicis que t’acostin al teu objectiu.',
        blocks: [
          {
            type: 'note',
            text: 'No intentis respondre la pregunta-objectiu de l’aventura amb aquest moviment: construeix el món al seu voltant i troba pistes. Respondràs la pregunta a la posta, quan tinguis la combinació de cartes necessària.',
          },
          { type: 'p', text: 'Descriu què fas, com és l’entorn i de quina manera busques. Agafa una carta de la pila:' },
          {
            type: 'list',
            items: [
              'Si és una **figura** (As, J, Q, K) hi ha un perill relacionat: **Crear perill** fent servir aquesta carta com a carta de perill.',
              'Si **no** és una figura, passa a la teva pila de **recursos**.',
            ],
          },
          {
            type: 'p',
            text: 'Quan hagis superat l’obstacle (o si no calia), consulta l’**oracle descriptor genèric** amb la carta que tens a la mà per obtenir adjectius sobre el que investigues. Amb l’adjectiu, intenta respondre les preguntes del que tens al davant.',
          },
        ],
      },
    ],
  },
  {
    id: 'descans',
    label: 'Reflexió i descans',
    moves: [
      {
        id: 'treure-conclusions',
        title: 'Treure conclusions',
        when: 'Quan et pares a examinar tot el que has descobert. Ha de ser un moment de relativa tranquil·litat.',
        blocks: [
          {
            type: 'p',
            text: 'Agafa la pila de **recursos** i busca combinacions (parelles, trios o pòquers). Pots gastar-les per obtenir una recompensa de la taula d’esperança:',
          },
          {
            type: 'table',
            head: ['Combinació', 'Efecte'],
            rows: [
              ['Parella', 'Has trobat un objecte durant el dia. Apunta’l (recorda el teu màxim d’objectes). Què has trobat i en quin moment del dia t’encaixa?'],
              ['Parella de figures', 'Consulta la fulla d’aventura: si es reuneixen les condicions, pots fer un avançament de trama. Normalment cal una parella i ser en un tipus de territori concret. Màxim 1 avançament per dia.'],
              ['Trio', 'Marca un punt d’experiència. Si és múltiple de 3 (3, 6, 9…) puges de nivell → activa Pujar de nivell.'],
              ['Pòquer', 'Fragment: has trobat un nou tros de fragment de portadora de llum. Descriu-lo a la teva fulla.'],
            ],
          },
        ],
      },
      {
        id: 'descansar',
        title: 'Descansar',
        when: 'Quan busques un lloc on fer foc i passar la nit.',
        blocks: [
          {
            type: 'list',
            items: [
              'Pots treure’t la **meitat de les condicions**, arrodonint cap amunt.',
              'Pots desmarcar objectes o moviments d’ús diari.',
              'Narra algun record de l’illa, del que t’han explicat o de l’èxode cap aquí.',
            ],
          },
        ],
      },
    ],
  },
  {
    id: 'estat',
    label: 'Estat i progressió',
    moves: [
      {
        id: 'caure-derrotat',
        title: 'Caure derrotat',
        when: 'Quan arribes a cinc condicions.',
        blocks: [
          {
            type: 'p',
            text: 'Ja no et queda alè i caus derrotat. La vida i la mort ja no estan a les teves mans, però tens temps per a una última decisió. Tria:',
          },
          {
            type: 'list',
            items: [
              'Fas una última cosa i **retires el personatge per sempre**.',
              'Fas una **tirada** i, segons el resultat, escapes intacte o mors.',
              'Decideixes **sobreviure** perdent tots els objectes i la meitat de les cartes de recursos (només si tens com a mínim una carta de recursos).',
            ],
          },
        ],
      },
      {
        id: 'pujar-nivell',
        title: 'Pujar de nivell',
        when: 'Quan hagis marcat prou marcadors com per pujar de nivell.',
        blocks: [
          {
            type: 'list',
            items: [
              'Puja **+1 un atribut** (fins a un màxim de 2).',
              'Guanya un **nou moviment** (màxim pel número de l’atribut).',
            ],
          },
        ],
      },
      {
        id: 'activar-fragment',
        title: 'Activar fragment',
        when: 'Quan vulguis activar el teu fragment per obtenir avantatge contra les tropes de la foscor.',
        blocks: [
          { type: 'p', text: 'Treu **3 cartes** de la pila d’aventura:' },
          {
            type: 'list',
            items: [
              'Si alguna és una **figura** → no funciona.',
              'Si hi ha **parella** → no funciona i reps una condició a causa de l’energia.',
              'En cas contrari → el fragment et dóna una visió sobre la lluita contra aquell tipus de tropa: **tires amb avantatge** (o elimines el desavantatge).',
            ],
          },
        ],
      },
      {
        id: 'forjar-portadora',
        title: 'Forjar portadora',
        when: 'Entre aventures, quan hagis reunit 5 fragments i viatgis a una forja nana per construir la teva portadora de llum.',
        blocks: [
          { type: 'p', text: 'Narra la forja i escull el **nom** i el **tipus d’arma**.' },
          {
            type: 'p',
            text: '**Avantatge** (sempre perds el desavantatge contra tropes de la foscor) — escull-ne un:',
          },
          {
            type: 'list',
            items: ['+2 a Combatre', '+2 a Parlamentar', '+2 a Enfrontar-se al perill', 'Conté un encanteri'],
          },
        ],
      },
    ],
  },
];
