import React from 'react';
import { Routes, Route } from 'react-router-dom';
import Layout from './components/Layout';
import ProtectedRoute from './components/ProtectedRoute';

// Import all your page components
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import DashboardPage from './pages/DashboardPage';
import GroupsPage from './pages/GroupsPage';
import GroupDashboardPage from './pages/GroupDashboardPage';
import NewAssessmentPage from './pages/NewAssessmentPage';
import EditAssessmentPage from './pages/EditAssessmentPage';
import RiskDetailPage from './pages/RiskDetailPage';

function App() {
  return (
    <Routes>
      {/* Public routes that do not require login */}
      <Route path="/login" element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />

      {/* Protected routes that require a user to be logged in */}
      <Route 
        path="/" 
        element={
          <ProtectedRoute>
            <Layout />
          </ProtectedRoute>
        }
      >
        {/* The Outlet in Layout.jsx will render these nested routes */}
        <Route index element={<DashboardPage />} />
        <Route path="dashboard" element={<DashboardPage />} />
        <Route path="groups" element={<GroupsPage />} />
        <Route path="group-dashboard/:groupId" element={<GroupDashboardPage />} />
        <Route path="new-assessment" element={<NewAssessmentPage />} />
        <Route path="edit-assessment/:assessmentId" element={<EditAssessmentPage />} />
        <Route path="risk-detail/:riskId" element={<RiskDetailPage />} />
      </Route>

      {/* You can add a 404 Not Found page here if you like */}
      <Route path="*" element={<h1>404: Page Not Found</h1>} />
    </Routes>
  );
}

export default App;
