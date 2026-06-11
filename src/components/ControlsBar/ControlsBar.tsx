import { useRef } from 'react';
import { Link } from 'react-router-dom';
import { useSheet } from '../../context/SheetContext';
import styles from './ControlsBar.module.css';

export default function ControlsBar({ title }: { title: string }) {
  const { save, exportJSON, importJSON, clear, saveFlash } = useSheet();
  const fileRef = useRef<HTMLInputElement>(null);

  return (
    <div className={`${styles.controls} no-print`}>
      <Link to="/" className={styles.home}>
        ← Inici
      </Link>
      <strong>{title}</strong>
      <button onClick={save}>Desar</button>
      <button onClick={exportJSON}>Exportar JSON</button>
      <button onClick={() => fileRef.current?.click()}>Carregar JSON</button>
      <input
        ref={fileRef}
        type="file"
        accept=".json"
        style={{ display: 'none' }}
        onChange={(e) => {
          const file = e.target.files?.[0];
          if (file) void importJSON(file);
          e.target.value = '';
        }}
      />
      <button onClick={() => window.print()}>Imprimir / PDF</button>
      <button className={styles.danger} onClick={clear}>
        Esborrar tot
      </button>
      <span className={`${styles.saveStatus} ${saveFlash ? styles.show : ''}`}>
        {saveFlash ?? 'Desat!'}
      </span>
    </div>
  );
}
