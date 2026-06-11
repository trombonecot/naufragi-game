import { useEffect, useRef, useState } from 'react';
import { useSheet } from '../../context/SheetContext';
import styles from './NaufragiMap.module.css';

/** Freehand drawing canvas; the image is persisted as a data URL in extra.mapData. */
export default function NaufragiMap() {
  const { getExtra, setExtra } = useSheet();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const wrapRef = useRef<HTMLDivElement>(null);
  const drawing = useRef(false);
  const lastSaved = useRef<string | null>(null);
  const [color, setColor] = useState('#1a1a1a');
  const [size, setSize] = useState(1);
  const sizeRef = useRef(size);
  const colorRef = useRef(color);
  sizeRef.current = size;
  colorRef.current = color;

  // Size the canvas to its container once on mount.
  useEffect(() => {
    const canvas = canvasRef.current;
    const wrap = wrapRef.current;
    if (!canvas || !wrap) return;
    canvas.width = wrap.offsetWidth;
    canvas.height = wrap.offsetHeight;
    const ctx = canvas.getContext('2d');
    if (ctx) {
      ctx.lineCap = 'round';
      ctx.lineJoin = 'round';
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
    if (data) {
      const img = new Image();
      img.onload = () => ctx.drawImage(img, 0, 0);
      img.src = data;
    }
    lastSaved.current = data ?? null;
  }, [getExtra]);

  function point(e: React.PointerEvent<HTMLCanvasElement>) {
    const canvas = canvasRef.current!;
    const r = canvas.getBoundingClientRect();
    return {
      x: (e.clientX - r.left) * (canvas.width / r.width),
      y: (e.clientY - r.top) * (canvas.height / r.height),
    };
  }

  function onPointerDown(e: React.PointerEvent<HTMLCanvasElement>) {
    const ctx = canvasRef.current?.getContext('2d');
    if (!ctx) return;
    drawing.current = true;
    ctx.beginPath();
    const p = point(e);
    ctx.moveTo(p.x, p.y);
    ctx.strokeStyle = colorRef.current;
    ctx.lineWidth = sizeRef.current;
  }

  function onPointerMove(e: React.PointerEvent<HTMLCanvasElement>) {
    if (!drawing.current) return;
    const ctx = canvasRef.current?.getContext('2d');
    if (!ctx) return;
    const p = point(e);
    ctx.lineTo(p.x, p.y);
    ctx.stroke();
  }

  function commit() {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const data = canvas.toDataURL();
    lastSaved.current = data;
    setExtra('mapData', data);
  }

  function endDraw() {
    if (!drawing.current) return;
    drawing.current = false;
    commit();
  }

  function clearMap() {
    if (!window.confirm('Esborrar tot el mapa?')) return;
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext('2d');
    if (canvas && ctx) ctx.clearRect(0, 0, canvas.width, canvas.height);
    lastSaved.current = '';
    setExtra('mapData', '');
  }

  return (
    <>
      <div className={styles.mapArea} ref={wrapRef}>
        <canvas
          ref={canvasRef}
          onPointerDown={onPointerDown}
          onPointerMove={onPointerMove}
          onPointerUp={endDraw}
          onPointerLeave={endDraw}
        />
      </div>
      <div className={`${styles.mapControls} no-print`}>
        <label>
          Color:{' '}
          <input
            type="color"
            className={styles.colorPick}
            value={color}
            onChange={(e) => setColor(e.target.value)}
          />
        </label>
        <label>
          Gruix:{' '}
          <select value={size} onChange={(e) => setSize(Number(e.target.value))}>
            {[1, 2, 3, 5, 8].map((n) => (
              <option key={n} value={n}>
                {n}
              </option>
            ))}
          </select>
        </label>
        <button onClick={clearMap}>Esborra mapa</button>
      </div>
    </>
  );
}
