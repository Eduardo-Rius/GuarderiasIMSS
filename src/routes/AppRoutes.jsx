import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import MainLayout from '../components/layout/MainLayout';
import ProtectedRoute from '../components/layout/ProtectedRoute';
import Login from '../pages/Login';
import Dashboard from '../pages/Dashboard';
import PlaneacionNueva from '../pages/PlaneacionNueva';
import Planeaciones from '../pages/Planeaciones';
import VistaPrevia from '../pages/VistaPrevia';
import ChatNormativo from '../pages/ChatNormativo';
import Admin from '../pages/Admin';

const AppRoutes = () => {
  return (
    <Routes>
      <Route path="/" element={<Login />} />
      
      <Route element={<ProtectedRoute />}>
        <Route element={<MainLayout />}>
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/planeacion" element={<PlaneacionNueva />} />
          <Route path="/planeaciones" element={<Planeaciones />} />
          <Route path="/preview" element={<VistaPrevia />} />
          <Route path="/chat" element={<ChatNormativo />} />
          <Route path="/admin" element={<Admin />} />
        </Route>
      </Route>

      <Route path="*" element={<Navigate to="/" />} />
    </Routes>
  );
};

export default AppRoutes;
