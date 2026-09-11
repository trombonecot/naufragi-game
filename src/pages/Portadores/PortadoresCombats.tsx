import { useSheet } from '../../context/SheetContext';
import {
  createCombat,
  DIF_BY_ID,
  DIFICULTATS,
  JUGADORS_OPCIONS,
  marquesFor,
  normalitzaJugadors,
  resizeMarques,
  type Combat,
  type DificultatId,
} from './combats';
import styles from './PortadoresCombats.module.css';

export default function PortadoresCombats() {
  const { getExtra, setExtra } = useSheet();
  const combats = getExtra<Combat[]>('combats') ?? [];

  function commit(next: Combat[]) {
    setExtra('combats', next);
  }

  function addCombat() {
    commit([...combats, createCombat(combats.length)]);
  }

  function removeCombat(id: string) {
    commit(combats.filter((c) => c.id !== id));
  }

  function updateCombat(id: string, patch: Partial<Combat>) {
    commit(combats.map((c) => (c.id === id ? { ...c, ...patch } : c)));
  }

  function setDificultat(c: Combat, dificultat: DificultatId) {
    updateCombat(c.id, {
      dificultat,
      marques: resizeMarques(c.marques, marquesFor(dificultat, c.jugadors)),
    });
  }

  function setJugadors(c: Combat, jugadors: number) {
    updateCombat(c.id, {
      jugadors,
      marques: resizeMarques(c.marques, marquesFor(c.dificultat, jugadors)),
    });
  }

  function toggleMarca(c: Combat, i: number) {
    const marques = resizeMarques(c.marques, marquesFor(c.dificultat, c.jugadors));
    marques[i] = !marques[i];
    updateCombat(c.id, { marques });
  }

  return (
    <div className={`page landscape ${styles.combatsPage}`}>
      <h2 className={styles.title}>Combats</h2>
      <p className={styles.instructions}>
        Un combat dura fins que guanyes 5 condicions o l&apos;enemic rep totes les seves marques.
        Cada moviment dins del combat es fa amb el penalitzador de la dificultat.
      </p>

      <div className={`${styles.toolbar} no-print`}>
        <button className={styles.addBtn} onClick={addCombat}>
          + Nou combat
        </button>
        <span className={styles.legend}>
          {DIFICULTATS.map((d) => (
            <span key={d.id}>
              {d.nom}: {d.base} + {d.perJugador} per jugador ({d.penalitzador})
            </span>
          ))}
        </span>
      </div>

      {combats.length === 0 ? (
        <p className={`${styles.instructions} ${styles.empty}`}>
          Encara no hi ha cap combat. Afegeix-ne un en iniciar un enfrontament.
        </p>
      ) : (
        <div className={styles.combatList}>
          {combats.map((c) => {
            const dif = DIF_BY_ID[c.dificultat] ?? DIF_BY_ID.normal;
            const jugadors = normalitzaJugadors(c.jugadors);
            const total = marquesFor(c.dificultat, jugadors);
            const marques = resizeMarques(c.marques, total);
            const fetes = marques.filter(Boolean).length;
            const vencut = fetes >= total;
            return (
              <div className={`${styles.combat} ${vencut ? styles.vencut : ''}`} key={c.id}>
                <div className={styles.headRow}>
                  <input
                    type="text"
                    className={styles.nom}
                    placeholder="Nom de l'enemic"
                    value={c.nom ?? ''}
                    onChange={(e) => updateCombat(c.id, { nom: e.target.value })}
                  />
                  <button
                    className={`${styles.removeBtn} no-print`}
                    title="Esborrar combat"
                    onClick={() => removeCombat(c.id)}
                  >
                    ×
                  </button>
                </div>

                <div className={styles.selectRow}>
                  <select
                    className={styles.dif}
                    title="Dificultat"
                    value={c.dificultat}
                    onChange={(e) => setDificultat(c, e.target.value as DificultatId)}
                  >
                    {DIFICULTATS.map((d) => (
                      <option key={d.id} value={d.id}>
                        {d.nom}
                      </option>
                    ))}
                  </select>
                  <select
                    className={styles.dif}
                    title="Nombre de jugadors"
                    value={jugadors}
                    onChange={(e) => setJugadors(c, Number(e.target.value))}
                  >
                    {JUGADORS_OPCIONS.map((n) => (
                      <option key={n} value={n}>
                        {n} {n === 1 ? 'jugador' : 'jugadors'}
                      </option>
                    ))}
                  </select>
                </div>

                <div className={styles.marquesRow}>
                  <label>Marques</label>
                  <div className={styles.marques}>
                    {marques.map((on, i) => (
                      <input
                        key={i}
                        type="checkbox"
                        checked={on}
                        onChange={() => toggleMarca(c, i)}
                      />
                    ))}
                  </div>
                  <span className={styles.comptador}>
                    {fetes}/{total}
                  </span>
                </div>

                <div className={styles.meta}>
                  Tirades: {dif.penalitzador} · Fracàs: {dif.fracas}
                  {vencut && <span className={styles.vencutTag}>Tancar combat</span>}
                </div>

                <input
                  type="text"
                  className={styles.notes}
                  placeholder="Notes"
                  value={c.notes ?? ''}
                  onChange={(e) => updateCombat(c.id, { notes: e.target.value })}
                />
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
