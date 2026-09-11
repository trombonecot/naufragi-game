import ControlsBar from '../../components/ControlsBar/ControlsBar';
import DiceRoller from '../../components/DiceRoller/DiceRoller';
import MovesReference from '../../components/MovesReference/MovesReference';
import CardTable from '../../components/cards/CardTable';
import { CheckField, TextField } from '../../components/fields/Fields';
import { SheetProvider, useSheet } from '../../context/SheetContext';
import { ARQUETIP_BY_ID, ARQUETIPS, DEFAULT_ARQUETIP, type Arquetip } from './arquetips';
import { ENCANTERIS } from './encanteris';
import { FAVORS } from './favors';
import PortadoresCombats from './PortadoresCombats';
import PortadoresMap from './PortadoresMap';
import styles from './PortadoresPage.module.css';

const ATTRS = [
  { key: 'attr_for', label: 'For.', attr: 'for' },
  { key: 'attr_des', label: 'Des.', attr: 'des' },
  { key: 'attr_ast', label: 'Ast.', attr: 'ast' },
  { key: 'attr_vol', label: 'Vol.', attr: 'vol' },
  { key: 'attr_car', label: 'Car.', attr: 'car' },
] as const;

const fmt = (n: number) => (n > 0 ? `+${n}` : `${n}`);

/** Character-creation helper: pick a spread, fill the attribute fields. */
function Creacio({ arquetip }: { arquetip: Arquetip }) {
  const { setField } = useSheet();
  return (
    <div className={`${styles.creacio} no-print`}>
      <div className={styles.creacioCol}>
        <h3>Atributs inicials</h3>
        <p className={styles.creacioHint}>Tria una opció (omple els atributs):</p>
        {arquetip.atributsInicials.map((opt, i) => (
          <button
            key={i}
            className={styles.creacioOpt}
            onClick={() => ATTRS.forEach((a) => setField(a.key, fmt(opt[a.attr])))}
          >
            {ATTRS.map((a) => `${a.label} ${fmt(opt[a.attr])}`).join(' · ')}
          </button>
        ))}
      </div>
      <div className={styles.creacioCol}>
        <h3>Equip inicial</h3>
        <ul className={styles.creacioList}>
          {arquetip.equipInicial.base.map((it, i) => (
            <li key={i}>{it}</li>
          ))}
        </ul>
        <p className={styles.creacioHint}>Tria entre:</p>
        <ul className={styles.creacioList}>
          {arquetip.equipInicial.tria.map((it, i) => (
            <li key={i}>{it}</li>
          ))}
        </ul>
      </div>
    </div>
  );
}

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

      <Creacio arquetip={arquetip} />

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
      {arquetip.movimentInicial && (
        <p className={styles.movInicial}>
          <span className={styles.movName}>Moviment inicial propi:</span> {arquetip.movimentInicial}
        </p>
      )}
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

      {arquetip.teFavors && (
        <>
          <div className={styles.movimentsTitle}>Favors divins</div>
          <div className={styles.encGrid}>
            {FAVORS.map((f) => (
              <div className={styles.encItem} key={f.id}>
                <span>
                  <span className={styles.encName}>{f.nom}</span>: {f.text}
                </span>
              </div>
            ))}
          </div>
        </>
      )}

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
            {/* ===== Page 4: combats ===== */}
            <PortadoresCombats />
          </>
        )}
      </div>

      <DiceRoller />
      {!pjOnly && <MovesReference />}
    </SheetProvider>
  );
}
