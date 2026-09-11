// Favors divins de la Sacerdotessa de la llum. Unlike spells these aren't
// learnt one by one: the whole list is available once the cost is paid.

export interface Favor {
  id: string;
  nom: string;
  text: string;
}

export const FAVORS: Favor[] = [
  {
    id: 'sanacio',
    nom: 'Sanació',
    text: "Permet curar totes les condicions temporals teves o d'un aliat, o bé una condició permanent.",
  },
  {
    id: 'expulsar',
    nom: 'Expulsar criatures de la foscor',
    text: 'Obtens avantatge al combatre contra criatures de la foscor durant el següent dia.',
  },
  {
    id: 'guia',
    nom: 'Guia',
    text: "Permet agafar tres cartes de la pila d'aventura i escollir-ne una que passa a recursos; la resta tornen a aventura i es barreja.",
  },
  {
    id: 'inspirar',
    nom: 'Inspirar',
    text: 'Tu i cada aliat teniu un +1 a la següent tirada que escolliu.',
  },
];
