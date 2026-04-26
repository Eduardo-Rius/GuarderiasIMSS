import React from 'react';
import { Link, Outlet } from 'react-router-dom';
import { 
  LayoutDashboard, 
  FilePlus, 
  MessageSquare, 
  Files, 
  Settings, 
  LogOut 
} from 'lucide-react';

const MainLayout = () => {
  const menuItems = [
    { name: 'Dashboard', path: '/dashboard', icon: <LayoutDashboard size={20} /> },
    { name: 'Nueva Planeación', path: '/planeacion', icon: <FilePlus size={20} /> },
    { name: 'Chat Normativo', path: '/chat', icon: <MessageSquare size={20} /> },
    { name: 'Documentos', path: '/preview', icon: <Files size={20} /> },
    { name: 'Administración', path: '/admin', icon: <Settings size={20} /> },
  ];

  return (
    <div className="flex h-screen bg-gray-50">
      {/* Sidebar */}
      <aside className="w-64 bg-[#005C46] text-white flex flex-col">
        <div className="p-6 text-center font-bold border-b border-[#004a38]">
          <span className="text-xl">Guarderías IMSS</span>
        </div>
        
        <nav className="flex-1 mt-6 px-4 space-y-2">
          {menuItems.map((item) => (
            <Link
              key={item.path}
              to={item.path}
              className="flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-[#004a38] transition"
            >
              {item.icon}
              <span>{item.name}</span>
            </Link>
          ))}
        </nav>

        <div className="p-4 border-t border-[#004a38]">
          <Link to="/" className="flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-red-700 transition">
            <LogOut size={20} />
            <span>Cerrar Sesión</span>
          </Link>
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Header */}
        <header className="h-16 bg-white border-b border-gray-200 flex items-center px-8 shadow-sm">
          <h2 className="text-lg font-medium text-gray-700">
            Plataforma de Planeación Pedagógica - Guarderías IMSS
          </h2>
        </header>

        {/* Content Area */}
        <main className="flex-1 overflow-y-auto bg-gray-50">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default MainLayout;
