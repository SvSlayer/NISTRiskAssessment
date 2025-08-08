// src/components/ProtectedRoute.jsx
import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const ProtectedRoute = () => {
  const { user, loading } = useAuth();

  // Jika masih loading, jangan render apa-apa untuk mencegah redirect prematur
  if (loading) {
    return <div>Loading application...</div>;
  }

  // Setelah loading selesai, baru putuskan untuk render halaman atau redirect
  return user ? <Outlet /> : <Navigate to="/login" replace />;
};

export default ProtectedRoute;
