import { Navigate, Route, Routes } from 'react-router-dom';
import Home from './pages/Home/Home';
import NaufragiPage from './pages/Naufragi/NaufragiPage';
import PortadoresPage from './pages/Portadores/PortadoresPage';

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/naufragi" element={<NaufragiPage />} />
      <Route path="/portadores" element={<PortadoresPage variant="tot" />} />
      <Route path="/portadores/pj" element={<PortadoresPage variant="pj" />} />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
