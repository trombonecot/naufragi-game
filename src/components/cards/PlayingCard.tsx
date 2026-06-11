import { useEffect, useRef, useState, type RefObject } from 'react';
import { parseCardId, type DrawnCard } from '../../lib/cards';
import { useSheet } from '../../context/SheetContext';
import styles from './CardTable.module.css';

export default function PlayingCard({
  card,
  pageRef,
}: {
  card: DrawnCard;
  pageRef: RefObject<HTMLDivElement>;
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

  if (!suit) return null;

  function onPointerDown(e: React.PointerEvent<HTMLDivElement>) {
    e.preventDefault();
    active.current = true;
    setDragging(true);
    setZ(raiseCard(card.id));
    e.currentTarget.setPointerCapture(e.pointerId);
    const rect = e.currentTarget.getBoundingClientRect();
    offset.current = { x: e.clientX - rect.left, y: e.clientY - rect.top };
  }

  function onPointerMove(e: React.PointerEvent<HTMLDivElement>) {
    if (!active.current || !pageRef.current) return;
    e.preventDefault();
    const pageRect = pageRef.current.getBoundingClientRect();
    const next = {
      x: e.clientX - offset.current.x - pageRect.left,
      y: e.clientY - offset.current.y - pageRect.top,
    };
    posRef.current = next;
    setPos(next);
  }

  function endDrag() {
    if (!active.current) return;
    active.current = false;
    setDragging(false);
    updateDrawnCard(card.id, { x: posRef.current.x, y: posRef.current.y, zIndex: z });
  }

  return (
    <div
      className={`${styles.card} ${styles[suit.color]} ${dragging ? styles.dragging : ''}`}
      style={{ left: pos.x, top: pos.y, zIndex: z }}
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
      <div className={styles.cardSimple}>
        <span className={styles.rank}>{rank}</span>
        <span className={styles.suitSym}>{suit.sym}</span>
      </div>
    </div>
  );
}
