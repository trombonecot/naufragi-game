import { useNavigate } from 'react-router-dom';
import styles from './Home.module.css';

export default function Home() {
  const navigate = useNavigate();
  return (
    <div className={styles.home}>
      <h1>Naufragi</h1>
      <nav className={styles.menu}>
        <button onClick={() => navigate('/naufragi')}>Naufragi</button>
        <button onClick={() => navigate('/portadores')}>Portadores de llum - TOT</button>
        <button onClick={() => navigate('/portadores/pj')}>Portadores de llum - PJ</button>
        <button onClick={() => window.alert('Not implemented')}>Buidor estel·lar</button>
      </nav>
    </div>
  );
}
