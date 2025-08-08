// src/main.jsx
import React from 'react';
import ReactDOM from 'react-dom/client';
import { createBrowserRouter, RouterProvider, Navigate, Outlet } from 'react-router-dom';
import './index.css';

import { AuthProvider, useAuth } from './context/AuthContext';
import Layout from './components/Layout';

import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import DashboardPage from './pages/DashboardPage';
import NewAssessmentPage from './pages/NewAssessmentPage';
import EditAssessmentPage from './pages/EditAssessmentPage';
import GroupsPage from './pages/GroupsPage';
import GroupDashboardPage from './pages/GroupDashboardPage';
import RiskDetailPage from './pages/RiskDetailPage';

const PrivateLayout = () => {
  const { user, loading } = useAuth();
  if (loading) {
    return <div>Loading application...</div>;
  }
  return user ? <Layout /> : <Navigate to="/login" replace />;
};

const PublicRoutes = () => {
    const { user, loading } = useAuth();
    if (loading) {
        return <div>Loading application...</div>;
    }
    return user ? <Navigate to="/dashboard" replace /> : <Outlet />;
}

const router = createBrowserRouter([
  {
    element: <PublicRoutes />,
    children: [
        { path: '/login', element: <LoginPage /> },
        { path: '/register', element: <RegisterPage /> },
    ]
  },
  {
    path: '/',
    element: <PrivateLayout />,
    children: [
      { index: true, element: <Navigate to="/dashboard" replace /> },
      { path: 'dashboard', element: <DashboardPage /> },
      { path: 'new-assessment', element: <NewAssessmentPage /> },
      { path: 'edit-assessment/:riskId', element: <EditAssessmentPage /> },
      { path: 'groups', element: <GroupsPage /> },
      { path: 'groups/:groupId', element: <GroupDashboardPage /> },
      { path: 'risks/:riskId', element: <RiskDetailPage /> },
    ]
  },
]);

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <AuthProvider>
      <RouterProvider router={router} />
    </AuthProvider>
  </React.StrictMode>
);
