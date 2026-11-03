import { useCallback, useEffect, useRef, useState } from 'react';
import { TextField } from '../../components/fields/Fields';
import { useSheet } from '../../context/SheetContext';
import styles from './NaufragiMap.module.css';
import { STAMPS, drawStamp, type StampId } from './stamps';

// Fixed drawing resolution, independent of how wide the map is displayed, so a
// map drawn on a phone looks the same on desktop. Matches the CSS aspect-ratio.
const MAP_W = 1100;
const MAP_H = 950;
/** Canvas px per on-screen px at the printed/desktop size (~183mm wide). */
const LINE_SCALE = MAP_W / 690;
const HISTORY_MAX = 15;

const stampRadius = (size: number) => (14 + size * 4) * LINE_SCALE;
const eraserWidth = (size: number) => (size * 5 + 6) * LINE_SCALE;

const LOC_COUNT = 20;

type Tool = 'llapis' | 'cami' | 'goma' | StampId;
const isStamp = (t: Tool): t is StampId => t !== 'llapis' && t !== 'cami' && t !== 'goma';
/** Location pins, keyed by location number; x/y are percentages of the map. */
type Pins = Record<string, { x: number; y: number }>;

interface PinDrag {
  n: number;
  from: 'legend' | 'map';
  startX: number;
  startY: number;
  x: number;
  y: number;
  moved: boolean;
}

/**
 * Island map page: a freehand canvas (persisted as a data URL in extra.mapData)
 * with drawing tools and stamps, plus numbered location pins (extra.mapPins)
 * dragged from the locations legend.
 */
export default function NaufragiMap() {
  const { getExtra, setExtra, getText } = useSheet();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  /** Overlay showing the stamp / eraser under the cursor (never saved or printed). */
  const previewRef = useRef<HTMLCanvasElement>(null);
  const areaRef = useRef<HTMLDivElement>(null);
  const drawing = useRef(false);
  const lastSaved = useRef<string | null>(null);
  const history = useRef<ImageData[]>([]);
  const [canUndo, setCanUndo] = useState(false);
  const [color, setColor] = useState('#1a1a1a');
  const [size, setSize] = useState(2);
  const [tool, setTool] = useState<Tool>('llapis');
  const [drag, setDrag] = useState<PinDrag | null>(null);
  const [placing, setPlacing] = useState<number | null>(null);

  const pins = getExtra<Pins>('mapPins') ?? {};

  const ctx2d = () => canvasRef.current?.getContext('2d') ?? null;

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    canvas.width = MAP_W;
    canvas.height = MAP_H;
    if (previewRef.current) {
      previewRef.current.width = MAP_W;
      previewRef.current.height = MAP_H;
    }
  }, []);

  // Draw / redraw whenever the persisted image changes (load, import, clear).
  useEffect(() => {
    const data = getExtra<string>('mapData');
    if (data === lastSaved.current) return;
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext('2d');
    if (!canvas || !ctx) return;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    history.current = [];
    setCanUndo(false);
    if (data) {
      const img = new Image();
      img.onload = () => {
        // Older saves used a different (portrait) size; scale and centre them.
        const scale = Math.min(canvas.width / img.width, canvas.height / img.height);
        const w = img.width * scale;
        const h = img.height * scale;
        ctx.drawImage(img, (canvas.width - w) / 2, (canvas.height - h) / 2, w, h);
      };
      img.src = data;
    }
    lastSaved.current = data ?? null;
  }, [getExtra]);

  /* ---------- drawing ---------- */

  function canvasPoint(e: React.PointerEvent<HTMLCanvasElement>) {
    const canvas = canvasRef.current!;
    const r = canvas.getBoundingClientRect();
    return {
      x: (e.clientX - r.left) * (canvas.width / r.width),
      y: (e.clientY - r.top) * (canvas.height / r.height),
    };
  }

  function pushHistory() {
    const ctx = ctx2d();
    if (!ctx) return;
    history.current.push(ctx.getImageData(0, 0, MAP_W, MAP_H));
    if (history.current.length > HISTORY_MAX) history.current.shift();
    setCanUndo(true);
  }

  function commit() {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const data = canvas.toDataURL();
    lastSaved.current = data;
    setExtra('mapData', data);
  }

  const undo = useCallback(() => {
    const ctx = canvasRef.current?.getContext('2d');
    const snap = history.current.pop();
    if (!ctx || !snap) return;
    ctx.putImageData(snap, 0, 0);
    setCanUndo(history.current.length > 0);
    const data = canvasRef.current!.toDataURL();
    lastSaved.current = data;
    setExtra('mapData', data);
  }, [setExtra]);

  // Ctrl/Cmd+Z undoes on the map (but not while typing in a field); Esc cancels placing.
  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === 'Escape') setPlacing(null);
      const t = e.target as HTMLElement | null;
      if (t && (t.tagName === 'INPUT' || t.tagName === 'TEXTAREA' || t.isContentEditable)) return;
      if ((e.ctrlKey || e.metaKey) && !e.shiftKey && e.key.toLowerCase() === 'z') {
        e.preventDefault();
        undo();
      }
    }
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [undo]);

  function onPointerDown(e: React.PointerEvent<HTMLCanvasElement>) {
    if (placing !== null) {
      placePin(placing, e.clientX, e.clientY);
      setPlacing(null);
      return;
    }
    const ctx = ctx2d();
    if (!ctx) return;
    const p = canvasPoint(e);
    pushHistory();

    if (isStamp(tool)) {
      drawStamp(ctx, tool, p.x, p.y, stampRadius(size), color);
      commit();
      return;
    }

    drawing.current = true;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    ctx.globalCompositeOperation = tool === 'goma' ? 'destination-out' : 'source-over';
    ctx.strokeStyle = color;
    const lw = (tool === 'goma' ? eraserWidth(size) : size * LINE_SCALE);
    ctx.lineWidth = lw;
    ctx.setLineDash(tool === 'cami' ? [lw * 2.5, lw * 3] : []);
    ctx.beginPath();
    ctx.moveTo(p.x, p.y);
    // A single click leaves a dot.
    ctx.lineTo(p.x + 0.01, p.y);
    ctx.stroke();
  }

  function clearPreview() {
    const pc = previewRef.current?.getContext('2d');
    pc?.clearRect(0, 0, MAP_W, MAP_H);
  }

  /** Show what the current tool will leave at this point (stamps and eraser). */
  function drawPreview(p: { x: number; y: number }) {
    const pc = previewRef.current?.getContext('2d');
    if (!pc) return;
    pc.clearRect(0, 0, MAP_W, MAP_H);
    if (placing !== null) return;
    if (isStamp(tool)) {
      pc.globalAlpha = 0.45;
      drawStamp(pc, tool, p.x, p.y, stampRadius(size), color);
      pc.globalAlpha = 1;
    } else if (tool === 'goma') {
      pc.beginPath();
      pc.arc(p.x, p.y, eraserWidth(size) / 2, 0, Math.PI * 2);
      pc.setLineDash([4, 4]);
      pc.lineWidth = 1.5;
      pc.strokeStyle = '#555';
      pc.stroke();
      pc.setLineDash([]);
    }
  }

  // Changing tool, size or colour invalidates the preview until the pointer moves.
  useEffect(clearPreview, [tool, size, color, placing]);

  function onPointerMove(e: React.PointerEvent<HTMLCanvasElement>) {
    if (e.pointerType === 'mouse' || e.pointerType === 'pen') drawPreview(canvasPoint(e));
    if (!drawing.current) return;
    const ctx = ctx2d();
    if (!ctx) return;
    const p = canvasPoint(e);
    ctx.lineTo(p.x, p.y);
    ctx.stroke();
  }

  function endDraw() {
    if (!drawing.current) return;
    drawing.current = false;
    const ctx = ctx2d();
    if (ctx) {
      ctx.globalCompositeOperation = 'source-over';
      ctx.setLineDash([]);
    }
    commit();
  }

  function clearMap() {
    if (!window.confirm('Esborrar el dibuix del mapa? (Els punts de les localitzacions es mantenen.)'))
      return;
    const ctx = ctx2d();
    if (!ctx) return;
    pushHistory();
    ctx.clearRect(0, 0, MAP_W, MAP_H);
    commit();
  }

  /* ---------- location pins ---------- */

  function placePin(n: number, clientX: number, clientY: number) {
    const r = areaRef.current?.getBoundingClientRect();
    if (!r) return;
    const clamp = (v: number) => Math.min(100, Math.max(0, v));
    setExtra('mapPins', {
      ...pins,
      [n]: {
        x: clamp(((clientX - r.left) / r.width) * 100),
        y: clamp(((clientY - r.top) / r.height) * 100),
      },
    });
  }

  function removePin(n: number) {
    const next = { ...pins };
    delete next[n];
    setExtra('mapPins', next);
  }

  /**
   * Drag a location pin (from the legend or the map). Window listeners are
   * attached right away so even a very quick drag is caught; the drag lives in
   * a local variable and is mirrored to state only to render the ghost.
   */
  function startPinDrag(e: React.PointerEvent, n: number, from: PinDrag['from']) {
    if (e.button !== 0) return;
    e.preventDefault();
    e.stopPropagation();
    let d: PinDrag = { n, from, startX: e.clientX, startY: e.clientY, x: e.clientX, y: e.clientY, moved: false };
    setDrag(d);

    const onMove = (ev: PointerEvent) => {
      const moved = d.moved || Math.hypot(ev.clientX - d.startX, ev.clientY - d.startY) > 4;
      d = { ...d, x: ev.clientX, y: ev.clientY, moved };
      setDrag(d);
    };
    const finish = () => {
      window.removeEventListener('pointermove', onMove);
      window.removeEventListener('pointerup', onUp);
      window.removeEventListener('pointercancel', finish);
      setDrag(null);
    };
    const onUp = (ev: PointerEvent) => {
      finish();
      const moved = d.moved || Math.hypot(ev.clientX - d.startX, ev.clientY - d.startY) > 4;
      if (!moved) {
        // A tap on a legend number arms "tap the map to place it" (handy on phones).
        if (from === 'legend') setPlacing((p) => (p === n ? null : n));
        return;
      }
      const r = areaRef.current?.getBoundingClientRect();
      const inside =
        r && ev.clientX >= r.left && ev.clientX <= r.right && ev.clientY >= r.top && ev.clientY <= r.bottom;
      if (inside) placePin(n, ev.clientX, ev.clientY);
      else if (from === 'map') removePin(n);
    };
    window.addEventListener('pointermove', onMove);
    window.addEventListener('pointerup', onUp);
    window.addEventListener('pointercancel', finish);
  }

  const draggingFromMap = drag?.moved && drag.from === 'map' ? drag.n : null;

  const tools: { id: Tool; label: string }[] = [
    { id: 'llapis', label: 'Llapis' },
    { id: 'cami', label: 'Camí' },
    { id: 'goma', label: 'Goma' },
  ];

  return (
    <div className={styles.mapPage}>
      <div className={styles.mapCol}>
        <div className={styles.titleRow}>
          <label>Nom de l'illa</label>
          <TextField fieldKey="illa_nom" style={{ flex: 1 }} />
        </div>
        <p className={styles.instructions}>
          Dibuixa l'illa. Quan descobreixis una localització, escriu-la a la llista i arrossega'n el
          número fins al mapa.
        </p>

        <div
          ref={areaRef}
          className={`${styles.mapArea} ${placing !== null ? styles.placing : ''} ${
            (isStamp(tool) || tool === 'goma') && placing === null ? styles.previewing : ''
          }`}
        >
          <canvas
            ref={canvasRef}
            onPointerDown={onPointerDown}
            onPointerMove={onPointerMove}
            onPointerUp={endDraw}
            onPointerLeave={() => {
              clearPreview();
              endDraw();
            }}
          />
          <canvas ref={previewRef} className={`${styles.preview} no-print`} aria-hidden />
          {Object.entries(pins).map(([key, pos]) => {
            const n = Number(key);
            if (n === draggingFromMap) return null;
            const name = getText(`loc_${n}`);
            return (
              <div
                key={key}
                className={styles.pin}
                style={{ left: `${pos.x}%`, top: `${pos.y}%` }}
                onPointerDown={(e) => startPinDrag(e, n, 'map')}
                onDoubleClick={() => removePin(n)}
                title="Arrossega per moure'l · fora del mapa o doble clic per treure'l"
              >
                <span className={styles.pinNum}>{n}</span>
                {name && <span className={styles.pinLabel}>{name}</span>}
              </div>
            );
          })}
          {placing !== null && (
            <div className={`${styles.placingHint} no-print`}>
              Toca el mapa per col·locar el {placing} · Esc per cancel·lar
            </div>
          )}
        </div>

        <div className={`${styles.mapControls} no-print`}>
          <div className={styles.toolGroup}>
            {tools.map((t) => (
              <button
                key={t.id}
                className={tool === t.id ? styles.on : ''}
                onClick={() => setTool(t.id)}
              >
                {t.label}
              </button>
            ))}
          </div>
          <div className={styles.toolGroup}>
            {STAMPS.map((s) => (
              <button
                key={s.id}
                className={`${styles.stampBtn} ${tool === s.id ? styles.on : ''}`}
                onClick={() => setTool(s.id)}
                title={s.label}
                aria-label={s.label}
              >
                <StampIcon id={s.id} color={color} />
              </button>
            ))}
          </div>
          <label>
            <input
              type="color"
              className={styles.colorPick}
              value={color}
              onChange={(e) => setColor(e.target.value)}
              aria-label="Color"
            />
          </label>
          <label>
            Gruix{' '}
            <select value={size} onChange={(e) => setSize(Number(e.target.value))}>
              {[1, 2, 3, 5, 8].map((n) => (
                <option key={n} value={n}>
                  {n}
                </option>
              ))}
            </select>
          </label>
          <button onClick={undo} disabled={!canUndo} title="Desfer (Ctrl+Z)">
            ↶ Desfer
          </button>
          <button onClick={clearMap}>Esborra</button>
        </div>
      </div>

      <div className={styles.legendCol}>
        <h2>Localitzacions</h2>
        <p className={styles.instructions}>
          Arrossega el número al mapa (o toca'l i després toca el mapa).
        </p>
        {Array.from({ length: LOC_COUNT }, (_, i) => {
          const n = i + 1;
          const placed = pins[n] !== undefined;
          return (
            <div className={styles.locRow} key={n}>
              <span
                className={`${styles.locNum} ${placed ? styles.placed : ''} ${
                  placing === n ? styles.armed : ''
                }`}
                onPointerDown={(e) => startPinDrag(e, n, 'legend')}
                title={placed ? 'Ja és al mapa · arrossega per moure-la' : 'Arrossega al mapa'}
              >
                {n}
              </span>
              <TextField fieldKey={`loc_${n}`} style={{ flex: 1 }} />
            </div>
          );
        })}
      </div>

      {drag?.moved && (
        <div className={styles.ghost} style={{ left: drag.x, top: drag.y }}>
          <span className={styles.pinNum}>{drag.n}</span>
        </div>
      )}
    </div>
  );
}

/** Small preview of a stamp for its toolbar button. */
function StampIcon({ id, color }: { id: StampId; color: string }) {
  const ref = useRef<HTMLCanvasElement>(null);
  useEffect(() => {
    const c = ref.current;
    const ctx = c?.getContext('2d');
    if (!c || !ctx) return;
    ctx.clearRect(0, 0, c.width, c.height);
    drawStamp(ctx, id, c.width / 2, c.height / 2, c.width * 0.4, color);
  }, [id, color]);
  return <canvas ref={ref} width={48} height={48} className={styles.stampIcon} />;
}
