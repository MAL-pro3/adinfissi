import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import Landing from './components/website/Landing';
import NostriLavori from './components/website/NostriLavori';
import AppLayout from './components/layout/AppLayout';
import ProtectedRoute from './components/auth/ProtectedRoute';
import Login from './components/Login';
import Dashboard from './components/Dashboard';
import Clients from './components/Clients';
import Surveys from './components/Surveys';
import TeamAppointments from './components/TeamAppointments';
import Orders from './components/Orders';
import Statistics from './components/Statistics';
import Invoices from './components/Invoices';

function App() {

  return (
    <AuthProvider>
      <Router>
        <Routes>
          {/* Public website routes */}
          <Route path="/" element={<Landing />} />
          <Route path="/lavori" element={<NostriLavori />} />
          
          {/* Application routes */}
          <Route path="/app/login" element={<Login />} />
          <Route path="/app" element={<Navigate to="/app/dashboard" replace />} />
          
          {/* Protected application routes */}
          <Route path="/app/*" element={
            <ProtectedRoute>
              <AppLayout />
            </ProtectedRoute>
          }>
            <Route path="dashboard" element={<Dashboard />} />
            <Route path="clients" element={<Clients />} />
            <Route path="surveys" element={<Surveys />} />
            <Route path="team-appointments" element={<TeamAppointments />} />
            <Route path="orders" element={<Orders />} />
            <Route path="invoices" element={<Invoices />} />
            <Route path="statistics" element={<Statistics />} />
          </Route>
          
          {/* Catch all route */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;
