import { useEffect, useState } from 'react';

// TEMPORARY, dev-only: try candidate background paintings. Remove once one is chosen.
const OPTIONS: [string, string][] = [
  ['/img/naufragi-fons.jpg', 'Actual (llibre)'],
  ['/img/fons/vernet-nga.jpg', 'Vernet — The Shipwreck (1772, NGA)'],
  ['/img/fons/kobell.jpg', 'Kobell — De schipbreuk (1775, Rijksmuseum)'],
  ['/img/fons/backhuysen-nga.jpg', 'Backhuysen — Ships in Distress (1667, NGA)'],
  ['/img/fons/nuijen.jpg', 'Nuijen — Schipbreuk (1837, Rijksmuseum)'],
  ['/img/fons/aivazovsky.jpg', 'Aivazovsky — La novena onada (1850)'],
];
const KEY = 'dev-fons';

export default function DevBgPicker() {
  const [src, setSrc] = useState(() => {
    try {
      return localStorage.getItem(KEY) ?? OPTIONS[0][0];
    } catch {
      return OPTIONS[0][0];
    }
  });
  useEffect(() => {
    document.documentElement.style.setProperty('--fons', `url('${src}')`);
    try {
      localStorage.setItem(KEY, src);
    } catch {
      /* ignore */
    }
  }, [src]);

  return (
    <select
      className="no-print"
      value={src}
      onChange={(e) => setSrc(e.target.value)}
      style={{
        position: 'fixed',
        left: 12,
        bottom: 12,
        zIndex: 200,
        font: '14px var(--font-body)',
        padding: '4px 6px',
        borderRadius: 6,
        background: 'rgba(14,19,22,0.9)',
        color: 'var(--parchment)',
        border: '1px solid var(--brass)',
      }}
    >
      {OPTIONS.map(([v, label]) => (
        <option key={v} value={v}>
          {label}
        </option>
      ))}
    </select>
  );
}
