import styles from './Credits.module.css';

/** Barely-visible image credit at the very bottom of every page. */
export default function Credits() {
  return (
    <footer className={`${styles.credits} no-print`}>
      Fons:{' '}
      <a
        href="https://commons.wikimedia.org/wiki/File:Claude-Joseph_Vernet,_The_Shipwreck,_1772,_NGA_111194.jpg"
        target="_blank"
        rel="noopener noreferrer"
      >
        Claude-Joseph Vernet, <i>The Shipwreck</i> (1772)
      </a>
      , National Gallery of Art, Washington. Domini públic.
    </footer>
  );
}
