/** Combat tracking: one entry per active/closed fight (see "Moviments de combat"). */

export type DificultatId = 'normal' | 'dificil' | 'impossible';

export interface Dificultat {
  id: DificultatId;
  nom: string;
  /** Marks needed to defeat the enemy = `base` + (`perJugador` × players). */
  base: number;
  perJugador: number;
  /** Roll modifier applied to every move made during the fight. */
  penalitzador: string;
  /** Conditions gained when a combat move fails. */
  fracas: string;
}

export const DIFICULTATS: Dificultat[] = [
  {
    id: 'normal',
    nom: 'Normal',
    base: 2,
    perJugador: 1,
    penalitzador: 'tirada normal',
    fracas: '1 condició',
  },
  { id: 'dificil', nom: 'Difícil', base: 3, perJugador: 2, penalitzador: '−1', fracas: '2 condicions' },
  {
    id: 'impossible',
    nom: 'Impossible',
    base: 6,
    perJugador: 2,
    penalitzador: '−2',
    fracas: '2 condicions',
  },
];

export const DIF_BY_ID: Record<string, Dificultat> = Object.fromEntries(
  DIFICULTATS.map((d) => [d.id, d]),
);

export const DEFAULT_DIFICULTAT: DificultatId = 'normal';

export const JUGADORS_OPCIONS = [1, 2, 3];
export const DEFAULT_JUGADORS = 1;

export interface Combat {
  id: string;
  nom: string;
  dificultat: DificultatId;
  /** Party size used to size the mark track. */
  jugadors: number;
  /** One entry per mark slot; length always matches `marquesFor(dificultat, jugadors)`. */
  marques: boolean[];
  notes: string;
}

export function normalitzaJugadors(jugadors: number | undefined): number {
  return JUGADORS_OPCIONS.includes(jugadors as number) ? (jugadors as number) : DEFAULT_JUGADORS;
}

export function marquesFor(dificultat: string, jugadors: number | undefined): number {
  const d = DIF_BY_ID[dificultat] ?? DIF_BY_ID[DEFAULT_DIFICULTAT];
  return d.base + d.perJugador * normalitzaJugadors(jugadors);
}

/** Grow/shrink the mark array to `count`, keeping the marks already made. */
export function resizeMarques(marques: boolean[] | undefined, count: number): boolean[] {
  return Array.from({ length: count }, (_, i) => marques?.[i] ?? false);
}

export function createCombat(index: number, jugadors = DEFAULT_JUGADORS): Combat {
  return {
    // Date.now() would collide across a fast double-click; the index keeps ids unique.
    id: `c${index}_${Math.random().toString(36).slice(2, 8)}`,
    nom: '',
    dificultat: DEFAULT_DIFICULTAT,
    jugadors,
    marques: Array(marquesFor(DEFAULT_DIFICULTAT, jugadors)).fill(false),
    notes: '',
  };
}
