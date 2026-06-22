import { Routes, Route, Navigate } from 'react-router-dom';
import Layout from './components/Layout.jsx';
import RequireAuth from './components/RequireAuth.jsx';
import Dashboard from './pages/Dashboard.jsx';
import Kunden from './pages/Kunden.jsx';
import Faelle from './pages/Faelle.jsx';
import Sessions from './pages/Sessions.jsx';
import Muster from './pages/Muster.jsx';
import Content from './pages/Content.jsx';
import Umsatz from './pages/Umsatz.jsx';
import Auswertung from './pages/Auswertung.jsx';
import Feedback from './pages/Feedback.jsx';
import Settings from './pages/Settings.jsx';
import Login from './pages/Login.jsx';

export default function App() {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route element={<RequireAuth />}>
        <Route element={<Layout />}>
          <Route path="/" element={<Navigate to="/dashboard" replace />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/kunden" element={<Kunden />} />
          <Route path="/faelle" element={<Faelle />} />
          <Route path="/sessions" element={<Sessions />} />
          <Route path="/muster" element={<Muster />} />
          <Route path="/content" element={<Content />} />
          <Route path="/umsatz" element={<Umsatz />} />
          <Route path="/auswertung" element={<Auswertung />} />
          <Route path="/feedback" element={<Feedback />} />
          <Route path="/einstellungen" element={<Settings />} />
        </Route>
      </Route>
      <Route path="*" element={<Navigate to="/dashboard" replace />} />
    </Routes>
  );
}
