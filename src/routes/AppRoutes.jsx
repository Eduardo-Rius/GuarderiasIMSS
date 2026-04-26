import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import MainLayout from '../components/layout/MainLayout';
import Login from '../pages/Login';
import Dashboard from '../pages/Dashboard';
import PlaneacionNueva from '../pages/PlaneacionNueva';
import VistaPrevia from '../pages/VistaPrevia';
import ChatNormativo from '../pages/ChatNormativo';
import Admin from '../pages/Admin';

const AppRoutes = () => {
  return (
    <Routes>
      <Route path="/" element={<Login />} />
      
      <Route element={<MainLayout />}>
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/planeacion" element={<PlaneacionNueva />} />
        <Route path="/preview" element={<VistaPrevia />} />
        <Route path="/chat" element={<ChatNormativo />} />
        <Route path="/admin" element={<Admin />} />
      </Route>

      <Route path="*" element={<Navigate to="/" />} />
    </Routes>
  );
};

export default AppRoutes;
