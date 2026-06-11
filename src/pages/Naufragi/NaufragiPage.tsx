import ControlsBar from '../../components/ControlsBar/ControlsBar';
import DiceRoller from '../../components/DiceRoller/DiceRoller';
import CardTable from '../../components/cards/CardTable';
import { CheckField, TextField } from '../../components/fields/Fields';
import { SheetProvider } from '../../context/SheetContext';
import NaufragiMap from './NaufragiMap';
import styles from './NaufragiPage.module.css';

interface EsdevItem {
  label: string;
  suffix?: string;
}

// null entries render as vertical spacers between groups.
const ESDEV_ROWS: (EsdevItem | null)[] = [
  { label: 'Parella' },
  { label: 'P. Jotes' },
  { label: 'P. Reines' },
  { label: 'P. Reis' },
  { label: 'P. Asos' },
  null,
  { label: 'Trio' },
  { label: 'T. Jotes' },
  { label: 'T. Reines' },
  { label: 'T. Reis' },
  { label: 'T. Asos' },
  null,
  { label: 'Escala' },
  { label: 'Pòquer' },
  { label: 'P. Jotes', suffix: '2' },
  { label: 'P. Reines', suffix: '2' },
  { label: 'P. Reis', suffix: '2' },
  { label: 'P. Asos', suffix: '2' },
  { label: 'E. Color' },
];

function esdevKey(item: EsdevItem): string {
  return 'esdev_' + item.label.replace(/[\s.]/g, '') + (item.suffix ?? '');
}

const EQUIP_COUNT = 10;
const COND_COUNT = 5;
const DIARY_COUNT = 20;
const LOC_COUNT = 20;

export default function NaufragiPage() {
  return (
    <SheetProvider storageKey="naufragi_fitxa_v1" exportFallbackName="naufragi">
      <ControlsBar title="Naufragi — Fitxa editable" />

      <div className="sheet-layout">
      {/* ===== Page 1: character sheet + diary ===== */}
      <div className={`page landscape ${styles.sheetPage}`}>
        <div className={styles.p1Grid}>
          <div className={styles.col}>
            <div className={styles.title}>Naufragi</div>
            <div className={styles.subtitle}>Fitxa de personatge</div>

            <div className={styles.fieldRow}>
              <label>Nom</label>
              <TextField fieldKey="nom" style={{ width: '100%' }} />
            </div>
            <div className={styles.fieldRow}>
              <label>Descripció</label>
              <TextField fieldKey="desc1" style={{ width: '100%' }} />
            </div>
            <div className={styles.fieldRow}>
              <label>&nbsp;</label>
              <TextField fieldKey="desc2" style={{ width: '100%' }} />
            </div>
            <div className={styles.fieldRow}>
              <label>&nbsp;</label>
              <TextField fieldKey="desc3" style={{ width: '100%' }} />
            </div>

            <h2>Equip</h2>
            <p className={styles.instructions}>
              Cada vegada que utilitzis un objecte marca'l amb llapis. En arribar a la fase de posta
              pots esborrar totes les marques de cara al dia següent.
            </p>
            <div className={styles.equipGrid}>
              {Array.from({ length: EQUIP_COUNT }, (_, i) => (
                <div className={styles.equipItem} key={i}>
                  <CheckField fieldKey={`equip_chk_${i}`} />
                  <TextField fieldKey={`equip_txt_${i}`} style={{ flex: 1 }} />
                </div>
              ))}
            </div>

            <h2>Condicions</h2>
            <p className={styles.instructions}>Si arribes a la cinquena condició mors a l'illa.</p>
            <div className={styles.condicionsGrid}>
              {Array.from({ length: COND_COUNT }, (_, i) => (
                <div key={i}>
                  <TextField fieldKey={`cond_${i}`} style={{ width: '100%' }} />
                </div>
              ))}
            </div>
          </div>

          <div className={styles.col}>
            <h2>Diari</h2>
            <p className={styles.instructions}>
              Durant la fase de nit escriu a una línia lliure un resum del teu record, després
              escriu l'habilitat escollida.
            </p>
            <p className={styles.instructions}>
              Durant la fase de dia cada vegada que utilitzis una habilitat marca-la amb llapis. En
              arribar a la fase de posta pots esborrar totes les marques de cara al dia següent.
            </p>
            <div className={styles.diaryHeader}>
              <span>
                <i>Record</i>
              </span>
              <span>
                <i>Habilitat</i>
              </span>
            </div>
            {Array.from({ length: DIARY_COUNT }, (_, i) => (
              <div className={styles.diaryRow} key={i}>
                <TextField fieldKey={`diary_rec_${i}`} className={styles.record} />
                <CheckField fieldKey={`diary_chk_${i}`} />
                <TextField fieldKey={`diary_hab_${i}`} className={styles.habilitat} />
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ===== Page 2: island, map, locations, events ===== */}
      <div className={`page landscape ${styles.sheetPage}`}>
        <div className={styles.p2Grid}>
          <div className={styles.p2Illa}>
            <div className={styles.fieldRow}>
              <label style={{ fontSize: '13pt', fontWeight: 600 }}>Nom de l'illa</label>
              <TextField fieldKey="illa_nom" style={{ flex: 1 }} />
            </div>
            <p className={styles.instructions}>
              Cada vegada que descobreixis una localització dibuixa-la al mapa.
            </p>
            <NaufragiMap />
          </div>

          <div className={styles.p2Loc}>
            <h2>Localitzacions</h2>
            <p className={styles.instructions}>
              Apunta aquí la llegenda de les diferents localitzacions que vagis descobrint al mapa.
            </p>
            {Array.from({ length: LOC_COUNT }, (_, i) => (
              <div className={styles.locRow} key={i}>
                <span className={styles.locNum}>{i + 1}</span>
                <TextField fieldKey={`loc_${i + 1}`} style={{ flex: 1 }} />
              </div>
            ))}
          </div>

          <div className={styles.p2Esdev}>
            <h2>Esdeveniments</h2>
            <p className={styles.instructions}>
              Marca aquí els esdeveniments d'alba que vagin sortint per evitar repetir-los.
            </p>
            {ESDEV_ROWS.map((item, idx) =>
              item === null ? (
                <div key={`sp${idx}`} style={{ height: 6 }} />
              ) : (
                <div className={styles.esdevRow} key={esdevKey(item)}>
                  <CheckField fieldKey={`${esdevKey(item)}_chk`} />
                  <span className={styles.esdevLabel}>{item.label}</span>
                  <TextField fieldKey={`${esdevKey(item)}_txt`} style={{ flex: 1 }} />
                </div>
              ),
            )}
          </div>

          <div className={styles.p2Aliat}>
            <h3>Aliat</h3>
            <p className={styles.instructions}>
              Si trobes un aliat posa-li un nom i marca aquí quan rebi condicions.
            </p>
            <div className={styles.fieldRow}>
              <label>Nom</label>
              <TextField fieldKey="aliat_nom" style={{ flex: 1 }} />
            </div>
            <div className={styles.fieldRow}>
              <label>Descripció</label>
              <TextField fieldKey="aliat_desc" style={{ flex: 1 }} />
            </div>
            <div className={styles.fieldRow} style={{ marginTop: 2 }}>
              <label>Condicions</label>
              <CheckField fieldKey="aliat_cond1" />
              <CheckField fieldKey="aliat_cond2" />
              <CheckField fieldKey="aliat_cond3" />
            </div>
          </div>

          <div className={styles.p2Sortir}>
            <div className={styles.sortirBox}>
              <h3>Sortir de l'illa</h3>
              <p className={styles.instructions}>
                Marca aquí quan treguis un pòquer amb cartes de recursos. Si en treus un segon o una
                escala de color narra com surts de l'illa.
              </p>
              <div className={styles.esdevRow}>
                <CheckField fieldKey="sortir_poquer" />
                <span className={styles.esdevLabel}>Pòquer</span>
                <TextField fieldKey="sortir_poquer_txt" style={{ flex: 1 }} />
              </div>
              <div className={styles.esdevRow}>
                <CheckField fieldKey="sortir_ecolor" />
                <span className={styles.esdevLabel}>E. Color</span>
                <TextField fieldKey="sortir_ecolor_txt" style={{ flex: 1 }} />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ===== Page 3: cards ===== */}
      <CardTable orientation="landscape" />
      </div>

      <DiceRoller />
    </SheetProvider>
  );
}
