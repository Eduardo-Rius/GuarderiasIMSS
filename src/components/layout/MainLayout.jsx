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

const MainLayout = () => {
  const navigate = useNavigate();

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
      <aside className="w-64 bg-imss-green-dark text-white flex flex-col">
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
        <header className="h-16 bg-white border-b-2 border-imss-gold flex items-center px-8 shadow-sm">
          <h2 className="text-lg font-bold text-imss-green-dark">
            Plataforma de Planeación Pedagógica - Guarderías IMSS
          </h2>
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
