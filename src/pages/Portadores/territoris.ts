// Territory types and the "viatjar" card that generates each (see docs/portadores.md).

export interface TerritoryType {
  id: string;
  nom: string;
  icon: string;
  carta: string;
}

export const TERRITORIS: TerritoryType[] = [
  { id: 'poblat', nom: 'Poblat', icon: '🏘️', carta: 'A' },
  { id: 'ciutat', nom: 'Ciutat', icon: '🏰', carta: '2' },
  { id: 'camp', nom: 'Camp', icon: '🌾', carta: '3' },
  { id: 'bosc', nom: 'Bosc', icon: '🌲', carta: '4' },
  { id: 'aiguamolls', nom: 'Aiguamolls', icon: '🪷', carta: '5' },
  { id: 'desert', nom: 'Àrid / Desert', icon: '🏜️', carta: '6' },
  { id: 'muntanyes', nom: 'Muntanyes', icon: '⛰️', carta: '7' },
  { id: 'costa', nom: 'Costa', icon: '🏖️', carta: '8' },
  { id: 'jungla', nom: 'Jungla', icon: '🌴', carta: '9' },
  { id: 'ruines', nom: 'Ruïnes', icon: '🏛️', carta: '10' },
  { id: 'fosca', nom: 'Terra fosca', icon: '🌑', carta: 'J' },
  { id: 'cremada', nom: 'Terra cremada', icon: '🔥', carta: 'Q' },
  { id: 'corrupte', nom: 'Terra corrupte', icon: '☠️', carta: 'K' },
];

export const TERR_BY_ID: Record<string, TerritoryType> = Object.fromEntries(
  TERRITORIS.map((t) => [t.id, t]),
);

/** One filled hex: its type, an editable name (defaults to its coordinate), and 5 location notes. */
export interface Territory {
  tipus: string;
  nom: string;
  loc: string[];
}

export type Territories = Record<number, Territory>;

export const HEX_COLS = 6;
export const HEX_ROWS = 8;
export const HEX_SIZE = 26;
export const HEX_MARGIN = 6;

/** Map a column-major hex index to a coordinate label like "A1". */
export function coordLabel(i: number): string {
  const c = Math.floor(i / HEX_ROWS);
  const r = i % HEX_ROWS;
  return String.fromCharCode(65 + c) + (r + 1);
}

export interface HexGeometry {
  i: number;
  cx: number;
  cy: number;
  points: string;
}

/** Pre-compute the flat-top honeycomb geometry (column-major), plus the SVG viewBox. */
export function buildHexGeometry(): { hexes: HexGeometry[]; viewBox: string } {
  const s = HEX_SIZE;
  const m = HEX_MARGIN;
  const hexW = 2 * s;
  const hexH = Math.sqrt(3) * s;
  const colSp = 1.5 * s;
  const vbW = m * 2 + (HEX_COLS - 1) * colSp + hexW;
  const vbH = m * 2 + HEX_ROWS * hexH + hexH / 2;

  const hexes: HexGeometry[] = [];
  let i = 0;
  for (let c = 0; c < HEX_COLS; c++) {
    for (let r = 0; r < HEX_ROWS; r++) {
      const cx = m + s + c * colSp;
      const cy = m + hexH / 2 + r * hexH + (c % 2 ? hexH / 2 : 0);
      const pts: string[] = [];
      for (let a = 0; a < 6; a++) {
        const ang = (Math.PI / 180) * (60 * a);
        pts.push(`${(cx + s * Math.cos(ang)).toFixed(1)},${(cy + s * Math.sin(ang)).toFixed(1)}`);
      }
      hexes.push({ i, cx, cy, points: pts.join(' ') });
      i++;
    }
  }
  return { hexes, viewBox: `0 0 ${vbW.toFixed(1)} ${vbH.toFixed(1)}` };
}
