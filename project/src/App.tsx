import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Layout from './components/layout/Layout';
import HomePage from './pages/HomePage';
import SignUpPage from './pages/SignUpPage';
import InternSignUpPage from './pages/InternSignUpPage';
import OrganizationSignUpPage from './pages/OrganizationSignUpPage';
import ProfilePage from './pages/ProfilePage';
import InternshipsPage from './pages/InternshipsPage';
import ApplicationsPage from './pages/ApplicationsPage';
import OrganizationDashboard from './pages/OrganizationDashboard';
import AdminLogin from './pages/admin/AdminLogin';
import AdminDashboard from './pages/admin/AdminDashboard';
import OrganizationApprovals from './pages/admin/OrganizationApprovals';
import AdminLayout from './components/admin/AdminLayout';
import { AuthProvider } from './context/AuthContext';
import { ThemeProvider } from './context/ThemeContext';

function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <Router>
          <Routes>
            <Route path="/" element={<Layout />}>
              <Route index element={<HomePage />} />
              <Route path="signup" element={<SignUpPage />} />
              <Route path="signup/intern" element={<InternSignUpPage />} />
              <Route path="signup/organization" element={<OrganizationSignUpPage />} />
              <Route path="profile" element={<ProfilePage />} />
              <Route path="internships" element={<InternshipsPage />} />
              <Route path="applications" element={<ApplicationsPage />} />
              <Route path="organization/dashboard" element={<OrganizationDashboard />} />
            </Route>
            <Route path="/admin/login" element={<AdminLogin />} />
            <Route path="/admin" element={<AdminLayout />}>
              <Route path="dashboard" element={<AdminDashboard />} />
              <Route path="approvals" element={<OrganizationApprovals />} />
            </Route>
          </Routes>
        </Router>
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;