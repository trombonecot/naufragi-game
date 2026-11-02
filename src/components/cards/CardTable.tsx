import { useEffect, useRef, useState } from 'react';
import { useSheet } from '../../context/SheetContext';
import PlayingCard from './PlayingCard';
import styles from './CardTable.module.css';

/**
 * The shared card play surface: two pile zones flanking the adventure deck,
 * plus an overlay of draggable cards positioned relative to this page.
 */
export default function CardTable({
  orientation = 'portrait',
}: {
  orientation?: 'portrait' | 'landscape';
}) {
  const { deck, drawnCards, drawCard, shuffleDeck, returnAllCards } = useSheet();
  const pageRef = useRef<HTMLDivElement>(null);
  const deckRef = useRef<HTMLDivElement>(null);
  // Track the page width so cards placed on a wider screen stay visible on narrow ones.
  const [pageWidth, setPageWidth] = useState<number | null>(null);
  useEffect(() => {
    const el = pageRef.current;
    if (!el) return;
    const ro = new ResizeObserver(() => setPageWidth(el.clientWidth));
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  function handleDraw() {
    if (deck.length === 0) return;
    let x = 120;
    let y = 80;
    if (deckRef.current && pageRef.current) {
      const deckRect = deckRef.current.getBoundingClientRect();
      const pageRect = pageRef.current.getBoundingClientRect();
      const n = drawnCards.length;
      if (pageRect.width < 700) {
        // Narrow (stacked) layout: fan the cards out below the deck.
        x = 20 + (n % 8) * 28;
        y = deckRect.bottom - pageRect.top + 40 + Math.floor(n / 8) * 30;
      } else {
        x = deckRect.left - pageRect.left + 90 + (n % 8) * 28;
        y = deckRect.top - pageRect.top - 10 + Math.floor(n / 8) * 30;
      }
    }
    drawCard({ x, y });
  }

  return (
    <div
      className={`page ${styles.cardPage} ${
        orientation === 'landscape' ? `landscape ${styles.landscape}` : ''
      }`}
      ref={pageRef}
    >
      <div className={styles.playSurface}>
        <div className={styles.pileZone}>
          <h2>Pila de recursos</h2>
          <span className={styles.zoneHint}>Arrossega cartes aquí</span>
        </div>

        <div className={styles.deckZone}>
          <h2>
            Pila{' '}
            <br />
            d'aventura
          </h2>
          <div
            className={`${styles.deckStack} ${deck.length === 0 ? styles.empty : ''}`}
            ref={deckRef}
            onClick={handleDraw}
          >
            <div className={styles.stackShadow} />
            <div className={styles.stackShadow} />
            <div className={styles.cardBackFace} />
            <span className={styles.deckCount}>
              {deck.length} {deck.length === 1 ? 'carta' : 'cartes'}
            </span>
          </div>
          <div className={styles.deckButtons}>
            <button className={styles.primary} onClick={handleDraw}>
              Treure carta
            </button>
            <button onClick={shuffleDeck}>Barrejar</button>
            <button onClick={returnAllCards}>Tornar totes</button>
          </div>
        </div>

        <div className={styles.pileZone}>
          <h2>Pila del destí</h2>
          <span className={styles.zoneHint}>Arrossega cartes aquí</span>
        </div>
      </div>

      <div className={styles.overlay}>
        {drawnCards.map((card) => (
          <PlayingCard
            key={card.id}
            card={card}
            pageRef={pageRef}
            maxX={pageWidth === null ? undefined : pageWidth - 84}
          />
        ))}
      </div>
    </div>
  );
}
