import { useState } from 'react';
import { Navigate, useLocation, useNavigate } from 'react-router-dom';
import { LogIn, AlertCircle } from 'lucide-react';
import { useAuth } from '../components/AuthProvider.jsx';
import SplashScreen from '../components/SplashScreen.jsx';

export default function Login() {
  const { user, loading, signIn } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  if (loading) return <SplashScreen text="Sitzung prüfen…" />;
  if (user) {
    const to = location.state?.from?.pathname ?? '/dashboard';
    return <Navigate to={to} replace />;
  }

  const submit = async (e) => {
    e.preventDefault();
    if (!email || !password) return;
    setError('');
    setSubmitting(true);
    try {
      await signIn(email.trim(), password);
      navigate(location.state?.from?.pathname ?? '/dashboard', { replace: true });
    } catch (err) {
      setError(err?.message ?? 'Anmeldung fehlgeschlagen.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div
      style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 24,
      }}
    >
      <form
        onSubmit={submit}
        className="card"
        style={{
          width: '100%',
          maxWidth: 380,
          padding: 32,
          display: 'flex',
          flexDirection: 'column',
          gap: 16,
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <div className="sidebar-brand-mark" style={{ width: 36, height: 36 }}>
            K
          </div>
          <div>
            <div
              style={{
                fontFamily: 'var(--font-heading)',
                fontWeight: 700,
                fontSize: 17,
                letterSpacing: '-0.01em',
              }}
            >
              Kadir CRM
            </div>
            <div style={{ fontSize: 12, color: 'var(--muted)' }}>Anmeldung</div>
          </div>
        </div>

        <label style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
          <span
            style={{
              fontFamily: 'var(--font-heading)',
              fontWeight: 600,
              fontSize: 12,
              color: 'var(--text)',
            }}
          >
            E-Mail
          </span>
          <input
            className="input"
            type="email"
            autoComplete="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
        </label>

        <label style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
          <span
            style={{
              fontFamily: 'var(--font-heading)',
              fontWeight: 600,
              fontSize: 12,
              color: 'var(--text)',
            }}
          >
            Passwort
          </span>
          <input
            className="input"
            type="password"
            autoComplete="current-password"
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
        </label>

        {error && (
          <div
            style={{
              display: 'flex',
              gap: 8,
              padding: 10,
              borderRadius: 10,
              background: 'rgba(238,76,39,0.1)',
              border: '1px solid rgba(238,76,39,0.3)',
              color: '#ff8888',
              fontSize: 12.5,
            }}
          >
            <AlertCircle size={14} strokeWidth={2} style={{ flexShrink: 0, marginTop: 1 }} />
            <span>{error}</span>
          </div>
        )}

        <button
          type="submit"
          className="btn-primary"
          disabled={submitting || !email || !password}
          style={{
            justifyContent: 'center',
            opacity: submitting || !email || !password ? 0.6 : 1,
          }}
        >
          <LogIn size={15} strokeWidth={2} />
          {submitting ? 'Anmelden…' : 'Anmelden'}
        </button>

        <div
          style={{
            fontSize: 11.5,
            color: 'var(--muted)',
            textAlign: 'center',
            marginTop: 4,
          }}
        >
          Zugang nur für berechtigte Konten.
        </div>
      </form>
    </div>
  );
}
