import { Routes, Route, Navigate } from 'react-router-dom';
import Layout from './components/Layout.jsx';
import Dashboard from './pages/Dashboard.jsx';
import Kunden from './pages/Kunden.jsx';
import Faelle from './pages/Faelle.jsx';
import Sessions from './pages/Sessions.jsx';
import Muster from './pages/Muster.jsx';
import Umsatz from './pages/Umsatz.jsx';
import Settings from './pages/Settings.jsx';

export default function App() {
  return (
    <Routes>
      <Route element={<Layout />}>
        <Route path="/" element={<Navigate to="/dashboard" replace />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/kunden" element={<Kunden />} />
        <Route path="/faelle" element={<Faelle />} />
        <Route path="/sessions" element={<Sessions />} />
        <Route path="/muster" element={<Muster />} />
        <Route path="/umsatz" element={<Umsatz />} />
        <Route path="/einstellungen" element={<Settings />} />
      </Route>
    </Routes>
  );
}
