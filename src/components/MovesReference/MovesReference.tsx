import { useEffect, useState } from 'react';
import { moveGroups, suitLegend, type Block, type Move } from '../../lib/moviments';
import styles from './MovesReference.module.css';

// Render inline **bold** segments. Suit symbols are written literally in the data.
function renderInline(text: string) {
  const parts = text.split(/(\*\*[^*]+\*\*)/g);
  return parts.map((part, i) => {
    if (part.startsWith('**') && part.endsWith('**')) {
      return <strong key={i}>{part.slice(2, -2)}</strong>;
    }
    return <span key={i}>{part}</span>;
  });
}

function BlockView({ block }: { block: Block }) {
  switch (block.type) {
    case 'p':
      return <p className={styles.para}>{renderInline(block.text)}</p>;
    case 'note':
      return <p className={styles.note}>{renderInline(block.text)}</p>;
    case 'subtitle':
      return <h4 className={styles.subtitle}>{renderInline(block.text)}</h4>;
    case 'list':
      return (
        <ul className={styles.list}>
          {block.items.map((it, i) => (
            <li key={i}>{renderInline(it)}</li>
          ))}
        </ul>
      );
    case 'results':
      return (
        <div className={styles.results}>
          {block.results.map((r, i) => (
            <div key={i} className={`${styles.result} ${styles[r.kind]}`}>
              <span className={styles.resultLabel}>{r.label}</span>
              <span className={styles.resultText}>{renderInline(r.text)}</span>
            </div>
          ))}
        </div>
      );
    case 'table': {
      const tbl = (
        <table className={`${styles.table} ${block.keyCol ? styles.keyTable : ''}`}>
          {block.head && (
            <thead>
              <tr>
                {block.head.map((h, i) => (
                  <th key={i}>{h}</th>
                ))}
              </tr>
            </thead>
          )}
          <tbody>
            {block.rows.map((row, i) => (
              <tr key={i}>
                {row.map((cell, j) => (
                  <td key={j} className={block.keyCol && j === 0 ? styles.keyCell : ''}>
                    {renderInline(cell)}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      );
      return block.scroll ? <div className={styles.tableScroll}>{tbl}</div> : tbl;
    }
    default:
      return null;
  }
}

const LEGEND_ID = '__legend__';

export default function MovesReference() {
  const [open, setOpen] = useState(false);
  const [selectedId, setSelectedId] = useState<string>(LEGEND_ID);
  const [showDetail, setShowDetail] = useState(false); // mobile: list vs detail

  // Close on Escape.
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setOpen(false);
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open]);

  const allMoves: Move[] = moveGroups.flatMap((g) => g.moves);
  const selectedMove = allMoves.find((m) => m.id === selectedId);

  function pick(id: string) {
    setSelectedId(id);
    setShowDetail(true);
  }

  return (
    <>
      <button
        className={`${styles.fab} no-print`}
        title="Referència de moviments"
        onClick={() => setOpen(true)}
      >
        📖
      </button>

      {open && (
        <div className={`${styles.overlay} no-print`} onClick={() => setOpen(false)}>
          <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
            <header className={styles.header}>
              <h2>Moviments — referència</h2>
              <button className={styles.close} title="Tancar" onClick={() => setOpen(false)}>
                ×
              </button>
            </header>

            <div className={`${styles.body} ${showDetail ? styles.bodyDetail : ''}`}>
              <nav className={styles.nav}>
                <button
                  className={`${styles.navItem} ${styles.legendItem} ${
                    selectedId === LEGEND_ID ? styles.active : ''
                  }`}
                  onClick={() => pick(LEGEND_ID)}
                >
                  Els pals de la carta
                </button>
                {moveGroups.map((group) => (
                  <div key={group.id} className={styles.navGroup}>
                    <div className={styles.navGroupLabel}>{group.label}</div>
                    {group.moves.map((m) => (
                      <button
                        key={m.id}
                        className={`${styles.navItem} ${selectedId === m.id ? styles.active : ''}`}
                        onClick={() => pick(m.id)}
                      >
                        {m.title}
                      </button>
                    ))}
                  </div>
                ))}
              </nav>

              <section className={styles.detail}>
                <button className={styles.back} onClick={() => setShowDetail(false)}>
                  ← Tots els moviments
                </button>
                {selectedId === LEGEND_ID ? (
                  <article>
                    <h3 className={styles.detailTitle}>Els pals de la carta</h3>
                    {suitLegend.map((b, i) => (
                      <BlockView key={i} block={b} />
                    ))}
                  </article>
                ) : (
                  selectedMove && (
                    <article>
                      <h3 className={styles.detailTitle}>{selectedMove.title}</h3>
                      <p className={styles.when}>{selectedMove.when}</p>
                      {selectedMove.blocks.map((b, i) => (
                        <BlockView key={i} block={b} />
                      ))}
                    </article>
                  )
                )}
              </section>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
