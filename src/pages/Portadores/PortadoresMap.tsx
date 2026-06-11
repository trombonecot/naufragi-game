import { useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react';
import { useSheet } from '../../context/SheetContext';
import {
  buildHexGeometry,
  coordLabel,
  TERR_BY_ID,
  TERRITORIS,
  type Territories,
  type Territory,
} from './territoris';
import styles from './PortadoresMap.module.css';

interface PickerState {
  i: number;
  x: number;
  y: number;
}

export default function PortadoresMap() {
  const { getExtra, setExtra } = useSheet();
  const territoris = getExtra<Territories>('territoris') ?? {};
  const { hexes, viewBox } = useMemo(buildHexGeometry, []);

  const [picker, setPicker] = useState<PickerState | null>(null);
  const pageRef = useRef<HTMLDivElement>(null);
  const pickerRef = useRef<HTMLDivElement>(null);

  // Close the picker on any outside click. Registered after the opening click
  // has already propagated, so it never closes itself immediately.
  useEffect(() => {
    if (!picker) return;
    const close = () => setPicker(null);
    document.addEventListener('click', close);
    return () => document.removeEventListener('click', close);
  }, [picker]);

  // Keep the popover inside the page bounds once its size is known.
  useLayoutEffect(() => {
    if (!picker || !pickerRef.current || !pageRef.current) return;
    const page = pageRef.current;
    const el = pickerRef.current;
    const x = Math.max(8, Math.min(picker.x, page.clientWidth - el.offsetWidth - 8));
    const y = Math.max(8, Math.min(picker.y, page.clientHeight - el.offsetHeight - 8));
    el.style.left = `${x}px`;
    el.style.top = `${y}px`;
  }, [picker]);

  function commit(next: Territories) {
    setExtra('territoris', next);
  }

  function setHexType(i: number, typeId: string | null) {
    const next: Territories = { ...territoris };
    if (typeId) {
      next[i] = next[i]
        ? { ...next[i], tipus: typeId }
        : { tipus: typeId, nom: coordLabel(i), loc: ['', '', '', '', ''] };
    } else {
      delete next[i];
    }
    commit(next);
  }

  function updateTerritory(i: number, patch: Partial<Territory>) {
    if (!territoris[i]) return;
    commit({ ...territoris, [i]: { ...territoris[i], ...patch } });
  }

  function updateLoc(i: number, j: number, value: string) {
    const terr = territoris[i];
    if (!terr) return;
    const loc = terr.loc.slice();
    loc[j] = value;
    updateTerritory(i, { loc });
  }

  function openPicker(i: number, e: React.MouseEvent) {
    e.stopPropagation();
    e.nativeEvent.stopPropagation();
    const rect = pageRef.current?.getBoundingClientRect();
    setPicker({
      i,
      x: rect ? e.clientX - rect.left : 0,
      y: rect ? e.clientY - rect.top : 0,
    });
  }

  const filled = Object.keys(territoris)
    .map(Number)
    .sort((a, b) => a - b);

  return (
    <div className={`page landscape ${styles.mapPage}`} ref={pageRef}>
      <div className={styles.mapLayout}>
        {/* Left: hex map + legend */}
        <div className={styles.mapCol}>
          <h2 className={styles.mapTitle}>Terres interiors</h2>
          <p className={styles.instructions}>
            Cada hexàgon és un territori. Fes clic per assignar-li un tipus i la seva icona es
            dibuixa sola. (En viatjar, tira la carta per decidir el tipus.)
          </p>
          <div className={styles.hexMapWrap}>
            <svg className={styles.hexMap} viewBox={viewBox} xmlns="http://www.w3.org/2000/svg">
              {hexes.map((h) => {
                const terr = territoris[h.i];
                const type = terr ? TERR_BY_ID[terr.tipus] : undefined;
                return (
                  <g key={h.i} className={styles.hexCell} onClick={(e) => openPicker(h.i, e)}>
                    <polygon
                      className={`${styles.hex} ${type ? styles.filled : ''}`}
                      points={h.points}
                    />
                    <text className={styles.hexIcon} x={h.cx.toFixed(1)} y={h.cy.toFixed(1)}>
                      {type ? type.icon : ''}
                    </text>
                  </g>
                );
              })}
            </svg>
          </div>
          <div className={styles.hexLegend}>
            {TERRITORIS.map((t) => (
              <div className={styles.leg} key={t.id}>
                <span className={styles.ic}>{t.icon}</span>
                <span>{t.nom}</span>
                <span className={styles.card}>{t.carta}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Right: linked territory cards */}
        <div className={styles.terrCol}>
          <h2 className={styles.mapTitle}>Territoris</h2>
          {filled.length === 0 ? (
            <p className={`${styles.instructions} ${styles.terrEmpty}`}>
              Assigna un tipus a un hexàgon del mapa i el seu territori apareixerà aquí.
            </p>
          ) : (
            <div className={styles.terrGrid}>
              {filled.map((i) => {
                const data = territoris[i];
                return (
                  <div className={styles.terrCard} key={i}>
                    <div className={styles.terrRow}>
                      <span className={styles.terrCoord}>{coordLabel(i)}</span>
                      <input
                        type="text"
                        value={data.nom}
                        onChange={(e) => updateTerritory(i, { nom: e.target.value })}
                      />
                    </div>
                    <div className={styles.terrRow}>
                      <label>Tipus</label>
                      <select
                        value={data.tipus}
                        onChange={(e) => updateTerritory(i, { tipus: e.target.value })}
                      >
                        {TERRITORIS.map((t) => (
                          <option key={t.id} value={t.id}>
                            {t.icon} {t.nom}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div className={styles.terrRow}>
                      <label>Loc.</label>
                    </div>
                    <div className={styles.terrLocLines}>
                      {data.loc.map((val, j) => (
                        <input
                          key={j}
                          type="text"
                          value={val}
                          onChange={(e) => updateLoc(i, j, e.target.value)}
                        />
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* Territory type picker popover */}
      {picker && (
        <div
          className={`${styles.terrPicker} no-print`}
          ref={pickerRef}
          onClick={(e) => {
            e.stopPropagation();
            e.nativeEvent.stopPropagation();
          }}
        >
          {TERRITORIS.map((t) => (
            <button
              key={t.id}
              onClick={() => {
                setHexType(picker.i, t.id);
                setPicker(null);
              }}
            >
              <span className={styles.ic}>{t.icon}</span>
              <span>{t.nom}</span>
            </button>
          ))}
          <button
            className={styles.clear}
            onClick={() => {
              setHexType(picker.i, null);
              setPicker(null);
            }}
          >
            Esborrar
          </button>
        </div>
      )}
    </div>
  );
}
