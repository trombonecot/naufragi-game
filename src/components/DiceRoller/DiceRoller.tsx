import { useRef, useState } from 'react';
import styles from './DiceRoller.module.css';

// Pip patterns for faces 1-6 (3x3 grid, 1 = pip, 0 = empty).
const PIP_PATTERNS: Record<number, number[]> = {
  1: [0, 0, 0, 0, 1, 0, 0, 0, 0],
  2: [0, 0, 1, 0, 0, 0, 1, 0, 0],
  3: [0, 0, 1, 0, 1, 0, 1, 0, 0],
  4: [1, 0, 1, 0, 0, 0, 1, 0, 1],
  5: [1, 0, 1, 0, 1, 0, 1, 0, 1],
  6: [1, 0, 1, 1, 0, 1, 1, 0, 1],
};

// Rotation that brings face N to the front of the cube.
const FACE_ROTATIONS: Record<number, string> = {
  1: 'rotateX(0deg)    rotateY(0deg)',
  2: 'rotateX(0deg)    rotateY(180deg)',
  3: 'rotateX(0deg)    rotateY(90deg)',
  4: 'rotateX(0deg)    rotateY(-90deg)',
  5: 'rotateX(-90deg)  rotateY(0deg)',
  6: 'rotateX(90deg)   rotateY(0deg)',
};

const EXTRA_SPINS = 720;
function addSpins(rot: string): string {
  return rot.replace(/(-?\d+)deg/g, (_m, val) => `${parseInt(val, 10) + EXTRA_SPINS}deg`);
}

function Die({ cubeRef }: { cubeRef: React.RefObject<HTMLDivElement> }) {
  return (
    <div className={styles.scene}>
      <div className={styles.cube} ref={cubeRef}>
        {[1, 2, 3, 4, 5, 6].map((f) => (
          <div key={f} className={`${styles.face} ${styles[`f${f}`]}`}>
            <div className={styles.pips}>
              {PIP_PATTERNS[f].map((p, i) => (
                <span key={i} className={`${styles.pip} ${p ? '' : styles.empty}`} />
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

type Result = { r1: number; r2: number } | 'rolling' | null;

export default function DiceRoller() {
  const [open, setOpen] = useState(false);
  const [result, setResult] = useState<Result>(null);
  const die1 = useRef<HTMLDivElement>(null);
  const die2 = useRef<HTMLDivElement>(null);
  const ready = useRef(true);

  function roll() {
    if (!ready.current || !die1.current || !die2.current) return;
    ready.current = false;

    const r1 = Math.floor(Math.random() * 6) + 1;
    const r2 = Math.floor(Math.random() * 6) + 1;
    const rot1 = addSpins(FACE_ROTATIONS[r1]);
    const rot2 = addSpins(FACE_ROTATIONS[r2]);

    const cubes = [die1.current, die2.current];
    const rots = [rot1, rot2];
    cubes.forEach((cube, i) => {
      cube.style.setProperty('--final-rotation', rots[i]);
      cube.classList.remove(styles.rolling);
    });
    void die1.current.offsetWidth; // force reflow so the animation restarts
    cubes.forEach((cube) => cube.classList.add(styles.rolling));

    setResult('rolling');
    window.setTimeout(() => {
      cubes.forEach((cube, i) => {
        cube.style.transform = rots[i];
        cube.classList.remove(styles.rolling);
      });
      setResult({ r1, r2 });
      ready.current = true;
    }, 850);
  }

  return (
    <>
      <button
        className={`${styles.fab} no-print`}
        title="Llançar daus"
        onClick={() => setOpen((o) => !o)}
      >
        ⚄
      </button>
      <div className={`${styles.panel} ${open ? styles.panelOpen : ''} no-print`}>
        <h3>2d6</h3>
        <div className={styles.stage}>
          <Die cubeRef={die1} />
          <Die cubeRef={die2} />
        </div>
        <div className={styles.resultBox}>
          {result === 'rolling' && <span className={styles.rollingDots}>…</span>}
          {result && result !== 'rolling' && (
            <>
              <span className={styles.total}>{result.r1 + result.r2}</span>
              <span className={styles.breakdown}>
                ({result.r1} + {result.r2})
              </span>
            </>
          )}
        </div>
        <button className={styles.rollBtn} onClick={roll}>
          Llançar!
        </button>
      </div>
    </>
  );
}
