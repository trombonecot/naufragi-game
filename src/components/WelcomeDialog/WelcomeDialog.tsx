import type { ReactNode } from 'react';
import Modal from '../Modal/Modal';
import styles from './WelcomeDialog.module.css';

function Glyph({ children }: { children: ReactNode }) {
  return (
    <svg
      className={styles.glyph}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.6"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      {children}
    </svg>
  );
}

/** First-visit guide to the Naufragi sheet; reopened from the bar's help button. */
export default function WelcomeDialog({ open, onClose }: { open: boolean; onClose: () => void }) {
  return (
    <Modal open={open} onClose={onClose} title="Et donem la benvinguda a l’illa" wide>
      <p className={styles.lead}>
        Aquesta és la teva fitxa de <i>Naufragi</i>. Tot el que necessites per jugar és aquí:
      </p>

      <ul className={styles.tips}>
        <li>
          <Glyph>
            <path d="M4 20h4L19 9l-4-4L4 16z" />
            <path d="M13.5 6.5l4 4" />
          </Glyph>
          <span>
            <b>Escriu directament.</b> Clica qualsevol línia de la fitxa i escriu-hi. Al mapa de
            l’illa hi pots dibuixar amb el ratolí o amb el dit.
          </span>
        </li>
        <li>
          <Glyph>
            <rect x="3" y="6" width="10" height="14" rx="1.5" />
            <path d="M9 4.5l1-.5 9 3-3.5 12.5" />
          </Glyph>
          <span>
            <b>Treu cartes.</b> Clica la <i>Pila d’aventura</i> (o <i>Treure carta</i>) i arrossega
            cada carta a la <i>Pila de recursos</i> o a la <i>Pila del destí</i>. Amb doble clic, o
            amb la ×, la tornes a la pila.
          </span>
        </li>
        <li>
          <Glyph>
            <rect x="3" y="3" width="18" height="18" rx="3" />
            <circle cx="8" cy="8" r="1" fill="currentColor" />
            <circle cx="16" cy="16" r="1" fill="currentColor" />
            <circle cx="12" cy="12" r="1" fill="currentColor" />
          </Glyph>
          <span>
            <b>Tira els daus.</b> El botó rodó de baix a la dreta llança 2d6.
          </span>
        </li>
        <li>
          <Glyph>
            <path d="M7 9V3h10v6" />
            <rect x="3" y="9" width="18" height="8" rx="1" />
            <path d="M7 14h10v7H7z" />
          </Glyph>
          <span>
            <b>Prefereixes el paper?</b> Amb <i>Imprimir</i> obtens la fitxa en A4, a punt per al
            llapis.
          </span>
        </li>
      </ul>

      <div className={styles.notice}>
        <h3>On es guarda la partida?</h3>
        <p>
          Tot es desa automàticament <b>al navegador d’aquest dispositiu</b>, no en cap servidor.
          Amb <i>Desar</i> i <i>Carregar</i> pots tenir diverses partides amb nom.
        </p>
        <p>
          Però si esborres les dades de navegació o la memòria cau, fas servir una finestra privada,
          o canvies de navegador o de dispositiu, <b>la partida es pot perdre</b>. Si en vols una
          còpia segura, fes servir <i>Exportar</i>: descarregaràs un fitxer <code>.json</code> que
          després podràs recuperar amb <i>Importar</i>.
        </p>
      </div>

      <div className={styles.actions}>
        <button className={styles.cta} onClick={onClose} autoFocus>
          Vull jugar!
        </button>
      </div>
    </Modal>
  );
}
