import { Link } from 'react-router-dom';
import styles from './Home.module.css';

/** Publishers shown in the top-right corner, in display order. */
const EDITORIALS = [
  { name: 'Mel Negra', href: 'https://melnegra-ed.itch.io', logo: '/img/mel-negra.png' },
  { name: 'Hipogeu', href: 'https://hipogeu.org', logo: '/img/hipogeu.png' },
];

export default function Home() {
  return (
    <main className={styles.home}>
      <header className={styles.header}>
        <h1>Naufragi</h1>
        <p className={styles.tagline}>Un joc de rol en solitari</p>
      </header>

      <nav className={styles.menu}>
        <Link to="/naufragi" className={styles.entry}>
          <span className={styles.entryTitle}>Naufragi</span>
          <span className={styles.entryDesc}>Fitxa de personatge, diari i mapa de l’illa</span>
        </Link>

        <div className={`${styles.entry} ${styles.disabled}`} aria-disabled="true">
          <span className={styles.badge}>En desenvolupament</span>
          <span className={styles.entryTitle}>Portadores de llum</span>
          <span className={styles.entryDesc}>S’acosta una nova aventura de fantasia fosca</span>
        </div>
      </nav>

      <a
        className={styles.shop}
        href="https://ko-fi.com/s/c855e657f1"
        target="_blank"
        rel="noopener noreferrer"
      >
        <img className={styles.cover} src="/img/portada.jpg" alt="Portada de Naufragi" />
        <span className={styles.shopText}>
          <span className={styles.shopKicker}>El joc de rol</span>
          <span className={styles.shopTitle}>Aconsegueix Naufragi</span>
          <span className={styles.shopDesc}>
            En versió física o digital.
          </span>
          <span className={styles.shopCta}>Compra’l a Ko-fi →</span>
        </span>
      </a>

      <aside className={styles.publishedBy}>
        <div className={styles.publishers}>
          {EDITORIALS.map((e) => (
            <a
              key={e.name}
              className={styles.publisher}
              href={e.href}
              target="_blank"
              rel="noopener noreferrer"
              title={e.name}
            >
              <img src={e.logo} alt={e.name} width={36} height={36} />
            </a>
          ))}
        </div>
      </aside>
    </main>
  );
}
