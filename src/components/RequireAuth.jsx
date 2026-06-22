import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAuth } from './AuthProvider.jsx';
import { StoreProvider } from '../store/StoreProvider.jsx';
import SplashScreen from './SplashScreen.jsx';

export default function RequireAuth() {
  const { user, loading } = useAuth();
  const location = useLocation();

  if (loading) return <SplashScreen text="Sitzung prüfen…" />;
  if (!user) return <Navigate to="/login" state={{ from: location }} replace />;

  return (
    <StoreProvider>
      <Outlet />
    </StoreProvider>
  );
}
