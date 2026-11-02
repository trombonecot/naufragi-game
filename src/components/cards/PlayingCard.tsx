import { useEffect, useRef, useState, type RefObject } from 'react';
import { parseCardId, type DrawnCard } from '../../lib/cards';
import { useSheet } from '../../context/SheetContext';
import SuitIcon from './SuitIcon';
import styles from './CardTable.module.css';

export default function PlayingCard({
  card,
  pageRef,
  maxX,
}: {
  card: DrawnCard;
  pageRef: RefObject<HTMLDivElement>;
  /** Rightmost left-offset that keeps the card on the page (display only). */
  maxX?: number;
}) {
  const { suit, rank } = parseCardId(card.id);
  const { returnCard, updateDrawnCard, raiseCard } = useSheet();

  const [pos, setPos] = useState({ x: card.x, y: card.y });
  const [z, setZ] = useState(card.zIndex);
  const [dragging, setDragging] = useState(false);
  const posRef = useRef(pos);
  const offset = useRef({ x: 0, y: 0 });
  const active = useRef(false);

  // Keep local position in sync when state changes externally (load / import).
  useEffect(() => {
    setPos({ x: card.x, y: card.y });
    posRef.current = { x: card.x, y: card.y };
    setZ(card.zIndex);
  }, [card.x, card.y, card.zIndex]);

  const isCourt = rank === 'J' || rank === 'Q' || rank === 'K';

  function onPointerDown(e: React.PointerEvent<HTMLDivElement>) {
    e.preventDefault();
    active.current = true;
    setDragging(true);
    setZ(raiseCard(card.id));
    e.currentTarget.setPointerCapture(e.pointerId);
    const rect = e.currentTarget.getBoundingClientRect();
    offset.current = { x: e.clientX - rect.left, y: e.clientY - rect.top };
  }

  // While dragging near the top/bottom edge, keep scrolling the page so the
  // card can reach piles that are off-screen (stacked layout on phones).
  const scrollTimer = useRef<number | null>(null);
  const lastPointer = useRef({ x: 0, y: 0 });

  function moveTo(clientX: number, clientY: number) {
    if (!pageRef.current) return;
    const pageRect = pageRef.current.getBoundingClientRect();
    const next = {
      x: clientX - offset.current.x - pageRect.left,
      y: clientY - offset.current.y - pageRect.top,
    };
    posRef.current = next;
    setPos(next);
  }

  function stopAutoScroll() {
    if (scrollTimer.current !== null) {
      window.clearInterval(scrollTimer.current);
      scrollTimer.current = null;
    }
  }

  function updateAutoScroll(clientY: number) {
    const EDGE = 60;
    const top = 70; // below the fixed controls bar
    const dir = clientY < top + EDGE ? -1 : clientY > window.innerHeight - EDGE ? 1 : 0;
    if (dir === 0) {
      stopAutoScroll();
      return;
    }
    if (scrollTimer.current !== null) return;
    scrollTimer.current = window.setInterval(() => {
      const y = lastPointer.current.y;
      const d = y < top + EDGE ? -1 : y > window.innerHeight - EDGE ? 1 : 0;
      if (d === 0 || !active.current) {
        stopAutoScroll();
        return;
      }
      window.scrollBy(0, d * 12);
      moveTo(lastPointer.current.x, lastPointer.current.y);
    }, 16);
  }

  useEffect(() => stopAutoScroll, []);

  function onPointerMove(e: React.PointerEvent<HTMLDivElement>) {
    if (!active.current || !pageRef.current) return;
    e.preventDefault();
    lastPointer.current = { x: e.clientX, y: e.clientY };
    moveTo(e.clientX, e.clientY);
    updateAutoScroll(e.clientY);
  }

  function endDrag() {
    if (!active.current) return;
    active.current = false;
    stopAutoScroll();
    setDragging(false);
    updateDrawnCard(card.id, { x: posRef.current.x, y: posRef.current.y, zIndex: z });
  }

  if (!suit) return null;

  return (
    <div
      className={`${styles.card} ${styles[suit.color]} ${dragging ? styles.dragging : ''}`}
      style={{ left: maxX === undefined ? pos.x : Math.max(0, Math.min(pos.x, maxX)), top: pos.y, zIndex: z }}
      onPointerDown={onPointerDown}
      onPointerMove={onPointerMove}
      onPointerUp={endDrag}
      onPointerCancel={endDrag}
      onDoubleClick={() => returnCard(card.id)}
    >
      <button
        className={styles.returnBtn}
        title="Tornar a la pila"
        onPointerDown={(e) => e.stopPropagation()}
        onClick={(e) => {
          e.stopPropagation();
          returnCard(card.id);
        }}
      >
        ×
      </button>
      <span className={styles.corner}>
        <span className={styles.cornerRank}>{rank}</span>
        <SuitIcon suit={suit.id} className={styles.cornerSuit} />
      </span>
      <div className={styles.cardCenter}>
        {isCourt ? (
          <span className={styles.courtFrame}>
            <span className={styles.courtLetter}>{rank}</span>
            <SuitIcon suit={suit.id} className={styles.courtSuit} />
          </span>
        ) : (
          <SuitIcon suit={suit.id} className={rank === 'A' ? styles.aceSuit : styles.pip} />
        )}
      </div>
      <span className={`${styles.corner} ${styles.cornerFlip}`}>
        <span className={styles.cornerRank}>{rank}</span>
        <SuitIcon suit={suit.id} className={styles.cornerSuit} />
      </span>
    </div>
  );
}
