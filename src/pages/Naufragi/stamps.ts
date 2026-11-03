/** Hand-drawn-looking map stamps, drawn with canvas paths in the current ink colour. */

export type StampId = 'muntanya' | 'palmera' | 'bosc' | 'cova' | 'aigua' | 'roques';

export const STAMPS: { id: StampId; label: string }[] = [
  { id: 'muntanya', label: 'Muntanya' },
  { id: 'palmera', label: 'Palmera' },
  { id: 'bosc', label: 'Bosc' },
  { id: 'cova', label: 'Cova' },
  { id: 'aigua', label: 'Aigua' },
  { id: 'roques', label: 'Roques' },
];

/**
 * Draw a stamp centred on (cx, cy). `r` is the half-size: the stamp fits
 * roughly in a 2r × 2r box. Coordinates below are in that unit box (-1..1).
 */
export function drawStamp(
  ctx: CanvasRenderingContext2D,
  id: StampId,
  cx: number,
  cy: number,
  r: number,
  color: string,
) {
  const P = (x: number, y: number): [number, number] => [cx + x * r, cy + y * r];
  ctx.save();
  ctx.globalCompositeOperation = 'source-over';
  ctx.setLineDash([]);
  ctx.strokeStyle = color;
  ctx.fillStyle = color;
  ctx.lineWidth = Math.max(1.5, r / 11);
  ctx.lineCap = 'round';
  ctx.lineJoin = 'round';

  const line = (...pts: [number, number][]) => {
    ctx.beginPath();
    ctx.moveTo(...P(...pts[0]));
    for (const p of pts.slice(1)) ctx.lineTo(...P(...p));
    ctx.stroke();
  };
  const quad = (a: [number, number], c: [number, number], b: [number, number]) => {
    ctx.beginPath();
    ctx.moveTo(...P(...a));
    ctx.quadraticCurveTo(...P(...c), ...P(...b));
    ctx.stroke();
  };

  switch (id) {
    case 'muntanya':
      line([-1, 0.6], [-0.3, -0.65], [0.1, 0.05], [0.45, -0.3], [1, 0.6]);
      // shading strokes on the left flank
      line([-0.42, -0.2], [-0.55, 0.1]);
      line([-0.3, -0.05], [-0.42, 0.3]);
      line([0.42, -0.05], [0.33, 0.2]);
      break;

    case 'palmera': {
      quad([-0.05, 0.85], [0.25, 0.2], [0.05, -0.4]);
      line([-0.35, 0.85], [0.3, 0.85]);
      const top: [number, number] = [0.05, -0.4];
      quad(top, [-0.45, -0.75], [-0.9, -0.2]);
      quad(top, [-0.35, -0.95], [-0.55, -0.85]);
      quad(top, [0.45, -0.95], [0.6, -0.8]);
      quad(top, [0.55, -0.7], [0.95, -0.15]);
      quad(top, [-0.1, -0.6], [-0.35, -0.05]);
      break;
    }

    case 'bosc':
      for (const [dx, dy, s] of [
        [-0.5, 0.1, 0.55],
        [0.45, 0.15, 0.5],
        [0, -0.2, 0.65],
      ] as const) {
        line([dx - 0.6 * s, dy + 0.6 * s], [dx, dy - s], [dx + 0.6 * s, dy + 0.6 * s], [dx - 0.6 * s, dy + 0.6 * s]);
        line([dx, dy + 0.6 * s], [dx, dy + 0.95 * s]);
      }
      break;

    case 'cova':
      // hill
      quad([-1, 0.6], [0, -1.1], [1, 0.6]);
      // dark mouth
      ctx.beginPath();
      ctx.moveTo(...P(-0.35, 0.6));
      ctx.quadraticCurveTo(...P(-0.35, -0.05), ...P(0, -0.05));
      ctx.quadraticCurveTo(...P(0.35, -0.05), ...P(0.35, 0.6));
      ctx.closePath();
      ctx.fill();
      line([-1, 0.6], [1, 0.6]);
      break;

    case 'aigua':
      for (const y of [-0.45, 0, 0.45]) {
        ctx.beginPath();
        ctx.moveTo(...P(-0.9, y));
        ctx.quadraticCurveTo(...P(-0.675, y - 0.25), ...P(-0.45, y));
        ctx.quadraticCurveTo(...P(-0.225, y + 0.25), ...P(0, y));
        ctx.quadraticCurveTo(...P(0.225, y - 0.25), ...P(0.45, y));
        ctx.quadraticCurveTo(...P(0.675, y + 0.25), ...P(0.9, y));
        ctx.stroke();
      }
      break;

    case 'roques':
      line([-0.95, 0.5], [-0.8, 0.0], [-0.45, -0.25], [-0.1, -0.05], [0.0, 0.5], [-0.95, 0.5]);
      line([-0.1, 0.5], [0.15, -0.45], [0.55, -0.6], [0.85, -0.1], [0.95, 0.5], [-0.1, 0.5]);
      line([0.4, -0.3], [0.5, 0.2]);
      line([-0.55, -0.05], [-0.6, 0.3]);
      break;
  }
  ctx.restore();
}
