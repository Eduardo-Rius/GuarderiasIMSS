import React from 'react';
import { FilePlus, Search, History } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const Dashboard = () => {
  const navigate = useNavigate();

  const cards = [
    {
      title: 'Crear Planeación',
      description: 'Inicia un nuevo formato pedagógico siguiendo la normativa vigente.',
      icon: <FilePlus className="text-imss-green-dark" size={32} />,
      path: '/planeacion'
    },
    {
      title: 'Consultar Normativa',
      description: 'Accede rápidamente a los lineamientos y reglamentos de las Guarderías IMSS.',
      icon: <Search className="text-imss-green-dark" size={32} />,
      path: '/chat'
    },
    {
      title: 'Ver Planeaciones',
      description: 'Revisa el historial de planeaciones creadas y sus estados de aprobación.',
      icon: <History className="text-imss-green-dark" size={32} />,
      path: '/preview'
    }
  ];

  return (
    <div className="p-8 max-w-7xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-800">¡Bienvenido, Usuario!</h1>
        <p className="text-gray-600 mt-2">Selecciona una acción para comenzar tu jornada pedagógica.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {cards.map((card, index) => (
          <div 
            key={index}
            onClick={() => navigate(card.path)}
            className="bg-white p-8 rounded-xl shadow-sm border border-gray-100 hover:shadow-lg hover:-translate-y-1 transition-all duration-300 cursor-pointer group"
          >
            <div className="bg-imss-bg w-16 h-16 rounded-lg flex items-center justify-center mb-6 group-hover:bg-imss-green-dark group-hover:text-white transition-colors">
              {card.icon}
            </div>
            <h2 className="text-xl font-bold text-imss-green-dark mb-3">{card.title}</h2>
            <p className="text-gray-600 leading-relaxed">
              {card.description}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Dashboard;
