// 52-card French deck shared by every game mode.

export type SuitColor = 'red' | 'black';

export interface Suit {
  id: string;
  sym: string;
  color: SuitColor;
}

export const SUITS: Suit[] = [
  { id: 'spades', sym: '♠', color: 'black' },
  { id: 'hearts', sym: '♥', color: 'red' },
  { id: 'diamonds', sym: '♦', color: 'red' },
  { id: 'clubs', sym: '♣', color: 'black' },
];

export const RANKS = ['A', '2', '3', '4', '5', '6', '7', '8', '9', '10', 'J', 'Q', 'K'] as const;
export type Rank = (typeof RANKS)[number];

/** A drawn card living on the play surface, positioned in page-relative px. */
export interface DrawnCard {
  id: string;
  x: number;
  y: number;
  zIndex: number;
}

/** Card IDs are `suitId-rank` strings, e.g. "hearts-Q". */
export function buildFullDeck(): string[] {
  const cards: string[] = [];
  for (const suit of SUITS) {
    for (const rank of RANKS) {
      cards.push(`${suit.id}-${rank}`);
    }
  }
  return cards;
}

export function parseCardId(id: string): { suit: Suit | undefined; rank: string } {
  const [suitId, rank] = id.split('-');
  return { suit: SUITS.find((s) => s.id === suitId), rank };
}

/** Fisher–Yates shuffle. Returns a new array (does not mutate the input). */
export function shuffle<T>(input: readonly T[]): T[] {
  const arr = input.slice();
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}
