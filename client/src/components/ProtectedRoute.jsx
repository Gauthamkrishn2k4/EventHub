import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';
import LoadingSpinner from './LoadingSpinner.jsx';

/** <ProtectedRoute roles={['Admin']} /> wraps child routes. Guests -> login; wrong role -> their home. */
export default function ProtectedRoute({ roles }) {
  const { user, initializing } = useAuth();
  const location = useLocation();
  if (initializing) return <LoadingSpinner />;
  if (!user) return <Navigate to="/login" replace state={{ from: location.pathname }} />;
  if (roles && !roles.includes(user.role)) return <Navigate to={user.role === 'Admin' ? '/admin' : '/'} replace />;
  return <Outlet />;
}
