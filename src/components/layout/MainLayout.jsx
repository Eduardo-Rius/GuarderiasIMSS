import React from 'react';
import { Link, Outlet, useNavigate } from 'react-router-dom';
import { auth } from '../../services/firebase';
import { signOut } from 'firebase/auth';
import { 
  LayoutDashboard, 
  FilePlus, 
  MessageSquare, 
  Files, 
  Settings, 
  LogOut 
} from 'lucide-react';
import imssLogo from '../../assets/imss_logo.svg';

import { useUser } from '../../context/UserContext';

const MainLayout = () => {
  const navigate = useNavigate();
  const { profile } = useUser();

  const handleLogout = async () => {
    try {
      await signOut(auth);
      navigate('/');
    } catch (error) {
      console.error('Error al cerrar sesión:', error);
    }
  };

  const menuItems = [
    { name: 'Dashboard', path: '/dashboard', icon: <LayoutDashboard size={20} /> },
    { name: 'Nueva Planeación', path: '/planeacion', icon: <FilePlus size={20} /> },
    { name: 'Ver Planeaciones', path: '/planeaciones', icon: <Files size={20} /> },
    { name: 'Chat Normativo', path: '/chat', icon: <MessageSquare size={20} /> },
    { name: 'Administración', path: '/admin', icon: <Settings size={20} /> },
  ];

  return (
    <div className="flex h-screen bg-imss-bg text-imss-gray">
      {/* Sidebar */}
      <aside className="w-64 bg-imss-green-dark text-white flex flex-col shadow-2xl z-20">
        <div className="p-6 flex flex-col items-center border-b border-white/10">
          <img src={imssLogo} alt="IMSS Logo" className="w-24 mb-2 brightness-0 invert" />
          <span className="text-sm font-bold tracking-wider">GUARDERÍAS</span>
          <div className="h-1 w-12 bg-imss-gold mt-2"></div>
        </div>
        
        <nav className="flex-1 mt-6 px-4 space-y-2">
          {menuItems.map((item) => (
            <Link
              key={item.path}
              to={item.path}
              className="flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-imss-green-medium transition"
            >
              {item.icon}
              <span>{item.name}</span>
            </Link>
          ))}
        </nav>

        <div className="p-4 border-t border-white/10">
          <div className="mb-4 px-4 py-3 bg-white/5 rounded-lg border border-white/10">
            <p className="text-[10px] font-black text-imss-gold uppercase tracking-widest mb-1">{profile?.rol || 'Usuario'}</p>
            <p className="text-xs font-bold truncate">{profile?.nombre || 'Cargando...'}</p>
          </div>
          <button 
            onClick={handleLogout}
            className="flex items-center gap-3 w-full px-4 py-3 rounded-lg hover:bg-imss-burgundy transition text-left"
          >
            <LogOut size={20} />
            <span>Cerrar Sesión</span>
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Header */}
        <header className="h-16 bg-white border-b-2 border-imss-gold flex items-center justify-between px-8 shadow-sm z-10">
          <h2 className="text-lg font-bold text-imss-green-dark">
            Plataforma de Planeación Pedagógica
          </h2>
          <div className="flex items-center gap-4">
            <div className="text-right hidden md:block">
              <p className="text-xs font-bold text-imss-green-dark uppercase">{profile?.rol}</p>
              <p className="text-[10px] text-gray-500">{profile?.guarderiaId}</p>
            </div>
            <div className="w-10 h-10 rounded-full bg-imss-green-dark flex items-center justify-center text-white font-bold">
              {profile?.nombre?.[0]?.toUpperCase() || 'U'}
            </div>
          </div>
        </header>

        {/* Content Area */}
        <main className="flex-1 overflow-y-auto bg-imss-bg">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default MainLayout;
