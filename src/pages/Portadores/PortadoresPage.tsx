import ControlsBar from '../../components/ControlsBar/ControlsBar';
import DiceRoller from '../../components/DiceRoller/DiceRoller';
import CardTable from '../../components/cards/CardTable';
import { CheckField, TextField } from '../../components/fields/Fields';
import { SheetProvider, useSheet } from '../../context/SheetContext';
import { ARQUETIP_BY_ID, ARQUETIPS, DEFAULT_ARQUETIP } from './arquetips';
import { ENCANTERIS } from './encanteris';
import PortadoresMap from './PortadoresMap';
import styles from './PortadoresPage.module.css';

const ATTRS = [
  { key: 'attr_for', label: 'For.' },
  { key: 'attr_des', label: 'Des.' },
  { key: 'attr_ast', label: 'Ast.' },
  { key: 'attr_vol', label: 'Vol.' },
  { key: 'attr_car', label: 'Car.' },
];

function Lines({ prefix, count }: { prefix: string; count: number }) {
  return (
    <>
      {Array.from({ length: count }, (_, i) => (
        <div className={styles.lineRow} key={i}>
          <TextField fieldKey={`${prefix}_${i}`} style={{ width: '100%' }} />
        </div>
      ))}
    </>
  );
}

/** Page 1 — the only part affected by the archetype switch. */
function CharacterSheet() {
  const { getText, setField } = useSheet();
  const arquetipId = getText('arquetip') || DEFAULT_ARQUETIP;
  const arquetip = ARQUETIP_BY_ID[arquetipId] ?? ARQUETIP_BY_ID[DEFAULT_ARQUETIP];

  return (
    <div className={`page ${styles.sheetPage}`}>
      <div className={`${styles.selector} no-print`}>
        {ARQUETIPS.map((a) => (
          <button
            key={a.id}
            className={a.id === arquetip.id ? styles.selectorActive : ''}
            onClick={() => setField('arquetip', a.id)}
          >
            {a.nom}
          </button>
        ))}
      </div>

      <div className={styles.title}>{arquetip.nom}</div>
      <div className={styles.subtitle}>Fitxa de personatge</div>
      {arquetip.descripcio && <p className={styles.descripcio}>{arquetip.descripcio}</p>}

      <div className={styles.nomRow}>
        <label>Nom</label>
        <TextField fieldKey="nom" />
      </div>

      <div className={styles.attrs}>
        {ATTRS.map((a) => (
          <div className={styles.attr} key={a.key}>
            <label>{a.label}</label>
            <TextField fieldKey={a.key} />
          </div>
        ))}
      </div>

      {arquetip.objectesMax != null && (
        <p className={styles.objMax}>Objectes màxims: {arquetip.objectesMax}</p>
      )}

      <div className={styles.threeCol}>
        <div className={styles.colSection}>
          <h2>Equip</h2>
          <h3 className={styles.subhead}>Armes</h3>
          <Lines prefix="equip_armes" count={arquetip.equip.armes} />
          {arquetip.equip.armadura > 0 && (
            <>
              <h3 className={styles.subhead}>Armadura</h3>
              <Lines prefix="equip_armadura" count={arquetip.equip.armadura} />
            </>
          )}
          <h3 className={styles.subhead}>Objectes</h3>
          <Lines prefix="equip_objectes" count={arquetip.equip.objectes} />
        </div>
        <div className={styles.colSection}>
          <h2>Fragments</h2>
          <Lines prefix="fragment" count={5} />
        </div>
        <div className={styles.colSection}>
          <h2>Condicions</h2>
          <Lines prefix="cond" count={5} />
        </div>
      </div>

      <div className={styles.portadora}>
        <h2>Portadora de llum</h2>
        <Lines prefix="portadora" count={3} />
      </div>

      <div className={styles.movimentsTitle}>Moviments</div>
      <div className={styles.movGrid}>
        {arquetip.moviments.map((m, i) => (
          <div className={styles.movItem} key={i}>
            {m.inicial ? (
              <input type="checkbox" checked disabled title="Moviment inicial propi" />
            ) : (
              <CheckField fieldKey={`mov_${arquetip.id}_${i}`} />
            )}
            <span>
              <span className={styles.movName}>{m.name}:</span> {m.text}
            </span>
          </div>
        ))}
      </div>

      {arquetip.teEncanteris && (
        <>
          <div className={styles.movimentsTitle}>Encanteris coneguts</div>
          <div className={styles.encGrid}>
            {ENCANTERIS.map((e) => (
              <div className={styles.encItem} key={e.id}>
                <CheckField fieldKey={`enc_${e.id}`} />
                <span>
                  <span className={styles.encName}>{e.nom}</span>{' '}
                  <span className={styles.encCost}>({e.cost})</span>: {e.text}
                </span>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
}

export default function PortadoresPage({ variant = 'tot' }: { variant?: 'tot' | 'pj' }) {
  const pjOnly = variant === 'pj';
  return (
    <SheetProvider storageKey="portadores_guardia_v1" exportFallbackName="portadores">
      <ControlsBar
        title={`Portadores de llum — Fitxa editable${pjOnly ? ' (PJ)' : ''}`}
      />

      <div className="sheet-layout">
        <CharacterSheet />
        {!pjOnly && (
          <>
            {/* ===== Page 2: cards ===== */}
            <CardTable orientation="landscape" />
            {/* ===== Page 3: map ===== */}
            <PortadoresMap />
          </>
        )}
      </div>

      <DiceRoller />
    </SheetProvider>
  );
}
