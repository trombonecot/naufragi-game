import { useEffect, useRef, useState, type ReactNode } from 'react';
import { Link } from 'react-router-dom';
import { useSheet } from '../../context/SheetContext';
import styles from './ControlsBar.module.css';

/* ---------- Icons (inline, stroke-based) ---------- */
function Icon({ children }: { children: ReactNode }) {
  return (
    <svg
      className={styles.icon}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.7"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      {children}
    </svg>
  );
}
const IconBack = () => (
  <Icon>
    <path d="M15 5l-7 7 7 7" />
  </Icon>
);
const IconSave = () => (
  <Icon>
    <path d="M5 4h11l3 3v13H5z" />
    <path d="M8 4v5h7V4" />
    <rect x="8" y="13" width="8" height="5" />
  </Icon>
);
const IconLoad = () => (
  <Icon>
    <path d="M3 7h6l2 2h10v10H3z" />
    <path d="M3 7V5h6" />
  </Icon>
);
const IconExport = () => (
  <Icon>
    <path d="M12 15V3" />
    <path d="M7 8l5-5 5 5" />
    <path d="M4 15v5h16v-5" />
  </Icon>
);
const IconImport = () => (
  <Icon>
    <path d="M12 3v12" />
    <path d="M7 10l5 5 5-5" />
    <path d="M4 15v5h16v-5" />
  </Icon>
);
const IconPrint = () => (
  <Icon>
    <path d="M7 9V3h10v6" />
    <rect x="3" y="9" width="18" height="8" rx="1" />
    <path d="M7 14h10v7H7z" />
  </Icon>
);
const IconTrash = () => (
  <Icon>
    <path d="M4 7h16" />
    <path d="M9 7V4h6v3" />
    <path d="M6 7l1 13h10l1-13" />
  </Icon>
);
const IconClose = () => (
  <Icon>
    <path d="M6 6l12 12M18 6L6 18" />
  </Icon>
);

/* ---------- Modal dialog wrapper (native <dialog>) ---------- */
function Modal({
  open,
  onClose,
  title,
  children,
}: {
  open: boolean;
  onClose: () => void;
  title: string;
  children: ReactNode;
}) {
  const ref = useRef<HTMLDialogElement>(null);
  useEffect(() => {
    const d = ref.current;
    if (!d) return;
    if (open && !d.open) d.showModal();
    if (!open && d.open) d.close();
  }, [open]);

  return (
    <dialog
      ref={ref}
      className={`${styles.dialog} no-print`}
      // Escape: let React state drive closing (the native async `close` event
      // would otherwise race with opening another dialog right after).
      onCancel={(e) => {
        e.preventDefault();
        onClose();
      }}
      onClick={(e) => {
        // Click on the backdrop closes the dialog.
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className={styles.dialogInner}>
        <header className={styles.dialogHeader}>
          <h2>{title}</h2>
          <button className={styles.closeBtn} onClick={onClose} aria-label="Tancar">
            <IconClose />
          </button>
        </header>
        {children}
      </div>
    </dialog>
  );
}

function formatDate(iso: string): string {
  try {
    return new Date(iso).toLocaleString('ca-ES', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  } catch {
    return iso;
  }
}

/* ---------- Controls bar ---------- */
export default function ControlsBar({ title }: { title: string }) {
  const {
    exportJSON,
    importJSON,
    clear,
    saveFlash,
    savedGames,
    saveAs,
    loadSaved,
    deleteSaved,
    suggestedName,
  } = useSheet();
  const fileRef = useRef<HTMLInputElement>(null);
  const [dialog, setDialog] = useState<'save' | 'load' | null>(null);
  const [name, setName] = useState('');

  const openSave = () => {
    setName(suggestedName);
    setDialog('save');
  };
  const close = () => setDialog(null);

  const existing = savedGames.find((g) => g.name === name.trim());

  return (
    <>
      <div className={`${styles.controls} no-print`}>
        <Link to="/" className={styles.home} title="Tornar a l'inici">
          <IconBack />
          <span className={styles.label}>Inici</span>
        </Link>

        <strong className={styles.title}>{title}</strong>

        <nav className={styles.actions}>
          <div className={styles.group}>
            <button onClick={openSave} title="Desar la partida al navegador">
              <IconSave />
              <span className={styles.label}>Desar</span>
            </button>
            <button onClick={() => setDialog('load')} title="Carregar una partida desada">
              <IconLoad />
              <span className={styles.label}>Carregar</span>
            </button>
          </div>

          <div className={styles.group}>
            <button onClick={exportJSON} title="Descarregar la fitxa com a fitxer">
              <IconExport />
              <span className={styles.label}>Exportar</span>
            </button>
            <button onClick={() => fileRef.current?.click()} title="Obrir una fitxa des d'un fitxer">
              <IconImport />
              <span className={styles.label}>Importar</span>
            </button>
            <input
              ref={fileRef}
              type="file"
              accept=".json,application/json"
              hidden
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) void importJSON(file);
                e.target.value = '';
              }}
            />
          </div>

          <div className={styles.group}>
            <button onClick={() => window.print()} title="Imprimir o desar com a PDF">
              <IconPrint />
              <span className={styles.label}>Imprimir</span>
            </button>
            <button className={styles.danger} onClick={clear} title="Esborrar tota la fitxa">
              <IconTrash />
              <span className={styles.label}>Esborrar</span>
            </button>
          </div>
        </nav>

        <span className={`${styles.saveStatus} ${saveFlash ? styles.show : ''}`} aria-live="polite">
          {saveFlash ?? 'Desat!'}
        </span>
      </div>

      {/* ----- Save dialog ----- */}
      <Modal open={dialog === 'save'} onClose={close} title="Desar partida">
        <form
          className={styles.form}
          onSubmit={(e) => {
            e.preventDefault();
            if (saveAs(name)) close();
          }}
        >
          <label className={styles.fieldLabel} htmlFor="save-name">
            Nom de la partida
          </label>
          <input
            id="save-name"
            type="text"
            className={styles.textInput}
            value={name}
            autoFocus
            onChange={(e) => setName(e.target.value)}
            placeholder="p. ex. Illa del nord, dia 3"
          />
          {existing && (
            <p className={styles.hint}>
              Ja existeix una partida amb aquest nom; se sobreescriurà.
            </p>
          )}
          {savedGames.length > 0 && (
            <>
              <p className={styles.subhead}>O sobreescriu-ne una:</p>
              <ul className={styles.list}>
                {savedGames.map((g) => (
                  <li key={g.id}>
                    <button type="button" className={styles.listItem} onClick={() => setName(g.name)}>
                      <span className={styles.gameName}>{g.name}</span>
                      <span className={styles.gameDate}>{formatDate(g.savedAt)}</span>
                    </button>
                  </li>
                ))}
              </ul>
            </>
          )}
          <div className={styles.dialogActions}>
            <button type="button" className={styles.secondary} onClick={close}>
              Cancel·lar
            </button>
            <button type="submit" className={styles.primary}>
              {existing ? 'Sobreescriure' : 'Desar'}
            </button>
          </div>
        </form>
      </Modal>

      {/* ----- Load dialog ----- */}
      <Modal open={dialog === 'load'} onClose={close} title="Carregar partida">
        {savedGames.length === 0 ? (
          <p className={styles.empty}>
            Encara no hi ha cap partida desada en aquest navegador.
            <br />
            Fes servir <em>Desar</em> per guardar-ne una, o <em>Importar</em> per obrir un fitxer.
          </p>
        ) : (
          <ul className={styles.list}>
            {savedGames.map((g) => (
              <li key={g.id} className={styles.loadRow}>
                <button
                  className={styles.listItem}
                  onClick={() => {
                    loadSaved(g.id);
                    close();
                  }}
                >
                  <span className={styles.gameName}>{g.name}</span>
                  <span className={styles.gameDate}>{formatDate(g.savedAt)}</span>
                </button>
                <button
                  className={styles.deleteBtn}
                  title={`Esborrar «${g.name}»`}
                  aria-label={`Esborrar «${g.name}»`}
                  onClick={() => {
                    if (window.confirm(`Esborrar la partida «${g.name}»?`)) deleteSaved(g.id);
                  }}
                >
                  <IconTrash />
                </button>
              </li>
            ))}
          </ul>
        )}
        <p className={styles.hint}>
          Carregar substitueix la fitxa actual. Desa-la abans si la vols conservar.
        </p>
      </Modal>
    </>
  );
}
