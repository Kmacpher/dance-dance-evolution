import { Navigate } from 'react-router-dom';
import { useAuthContext } from '../context/AuthContext';
import { ReactNode } from 'react';

export function ProtectedRoute({ children }: { children: ReactNode }) {
  const { user, loading } = useAuthContext();
  if (loading) return <div className="h-screen flex items-center justify-center text-dde-cyan font-game text-sm">Loading...</div>;
  if (!user) return <Navigate to="/login" replace />;
  return <>{children}</>;
}
