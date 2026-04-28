import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { auth } from '../services/firebase';
import { onAuthStateChanged } from 'firebase/auth';
import { getPlaneaciones, eliminarPlaneacion } from '../services/planeacionService';
import { 
  FileText, 
  Search, 
  Plus, 
  Eye, 
  Trash2, 
  Edit, 
  Calendar, 
  CheckCircle, 
  Clock,
  Filter,
  Loader2
} from 'lucide-react';

import { useUser } from '../context/UserContext';

const Planeaciones = () => {
  const [planeaciones, setPlaneaciones] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filterEstado, setFilterEstado] = useState('todos');
  const [searchTerm, setSearchTerm] = useState('');
  const navigate = useNavigate();
  const { profile } = useUser();

  useEffect(() => {
    if (profile) {
      fetchPlaneaciones(profile);
    }
  }, [profile]);

  const fetchPlaneaciones = async (userProfile) => {
    setLoading(true);
    try {
      const data = await getPlaneaciones(userProfile);
      setPlaneaciones(data);
    } catch (error) {
      console.error("Error al cargar planeaciones:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleEliminar = async (id) => {
    if (window.confirm("¿Estás seguro de que deseas eliminar esta planeación?")) {
      try {
        await eliminarPlaneacion(id);
        setPlaneaciones(planeaciones.filter(p => p.id !== id));
      } catch (error) {
        alert("Error al eliminar la planeación.");
      }
    }
  };

  const filteredPlaneaciones = planeaciones.filter(p => {
    const matchesEstado = filterEstado === 'todos' || p.estado === filterEstado;
    const sala = p.salaGrupo || p.sala || "";
    const responsable = p.responsableDocente || p.responsable || "";
    const guarderia = p.guarderiaNo || p.guarderia || "";
    
    const matchesSearch = sala.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          responsable.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          guarderia.toString().includes(searchTerm);
    return matchesEstado && matchesSearch;
  });

  return (
    <div className="p-6 md:p-8 bg-imss-bg min-h-full">
      {/* Encabezado */}
      <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4">
        <div>
          <h1 className="text-2xl font-bold text-imss-green-dark">Mis Planeaciones</h1>
          <p className="text-gray-500">Gestiona y consulta tus formatos oficiales generados.</p>
        </div>
        {profile?.rol !== 'supervisor' && (
          <button 
            onClick={() => navigate('/planeacion')}
            className="flex items-center gap-2 px-6 py-3 bg-imss-green-dark text-white rounded-lg font-bold hover:bg-imss-green-medium transition shadow-lg w-full md:w-auto justify-center"
          >
            <Plus size={20} />
            Nueva Planeación
          </button>
        )}
      </div>

      {/* Filtros y Búsqueda */}
      <div className="bg-white p-4 rounded-xl shadow-sm mb-6 flex flex-col md:flex-row gap-4 items-center">
        <div className="relative flex-1 w-full">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
          <input 
            type="text" 
            placeholder="Buscar por sala, responsable o guardería..."
            className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-imss-green-dark outline-none"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <div className="flex gap-2 w-full md:w-auto">
          <div className="flex items-center gap-2 px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg">
            <Filter size={16} className="text-gray-500" />
            <select 
              className="bg-transparent text-sm font-medium outline-none"
              value={filterEstado}
              onChange={(e) => setFilterEstado(e.target.value)}
            >
              <option value="todos">Todos los estados</option>
              <option value="borrador">Borradores</option>
              <option value="en_revision">En Revisión</option>
              <option value="aprobado">Aprobados</option>
              <option value="rechazado">Rechazados</option>
            </select>
          </div>
        </div>
      </div>

      {/* Lista de Planeaciones */}
      {loading ? (
        <div className="flex flex-col items-center justify-center py-20">
          <Loader2 className="animate-spin text-imss-green-dark mb-4" size={48} />
          <p className="text-gray-500 font-medium">Cargando tus planeaciones...</p>
        </div>
      ) : filteredPlaneaciones.length > 0 ? (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {filteredPlaneaciones.map((p) => (
            <div key={p.id} className="bg-white border border-gray-200 rounded-xl overflow-hidden shadow-sm hover:shadow-md transition">
              <div className="p-5">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-[10px] font-black bg-imss-gold text-white px-2 py-0.5 rounded uppercase">GDR {p.guarderiaNo || p.guarderia}</span>
                      <span className={`text-[10px] font-black px-2 py-0.5 rounded uppercase ${
                        p.estado === 'aprobado' ? 'bg-green-100 text-green-700' : 
                        p.estado === 'en_revision' ? 'bg-yellow-100 text-yellow-700' :
                        p.estado === 'rechazado' ? 'bg-red-100 text-red-700' :
                        'bg-gray-100 text-gray-700'
                      }`}>
                        {p.estado === 'en_revision' ? 'En Revisión' : p.estado || 'borrador'}
                      </span>
                    </div>
                    <h3 className="text-lg font-bold text-imss-green-dark">{p.salaGrupo || p.sala}</h3>
                  </div>
                  <div className="text-right">
                    <p className="text-xs text-gray-400 font-bold uppercase">Folio</p>
                    <p className="text-xs font-mono font-bold text-gray-600">#{p.id.substring(0, 8).toUpperCase()}</p>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-y-3 mb-6">
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <Calendar size={16} className="text-imss-green-medium" />
                    <span>{p.fechaInicio || p.periodoInicio} - {p.fechaFin || p.periodoFin}</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <Clock size={16} className="text-imss-green-medium" />
                    <span>{p.turno}</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-gray-600 col-span-2">
                    <div className="w-8 h-8 rounded-full bg-imss-green-dark flex items-center justify-center text-white text-[10px] font-bold">
                      {(p.responsableDocente || p.responsable || "U").split(' ').filter(Boolean).map(n => n[0]).join('')}
                    </div>
                    <span className="font-medium uppercase truncate">{p.responsableDocente || p.responsable}</span>
                  </div>
                </div>

                <div className="flex items-center justify-between pt-4 border-t border-gray-100">
                  <div className="flex flex-col">
                    <p className="text-[10px] text-gray-400 font-bold uppercase">Creado: {p.createdAt.toLocaleDateString()}</p>
                    {p.updatedAt && (
                      <p className="text-[10px] text-imss-green-medium font-bold uppercase">Actualizado: {p.updatedAt.toDate ? p.updatedAt.toDate().toLocaleDateString() : new Date(p.updatedAt).toLocaleDateString()}</p>
                    )}
                  </div>
                  <div className="flex gap-2">
                    <button 
                      onClick={() => navigate('/preview', { state: { ...p } })}
                      className="p-2 text-imss-green-dark hover:bg-green-50 rounded-lg transition" 
                      title="Ver Detalle"
                    >
                      <Eye size={18} />
                    </button>
                    
                    {profile?.rol === 'docente' && (p.estado === 'borrador' || p.estado === 'rechazado' || !p.estado) && (
                      <button 
                        onClick={() => navigate('/preview', { state: { ...p, isEditingInitial: true } })}
                        className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition" 
                        title="Editar"
                      >
                        <Edit size={18} />
                      </button>
                    )}

                    {profile?.rol === 'docente' && (p.estado === 'borrador') && (
                      <button 
                        onClick={() => handleEliminar(p.id)}
                        className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition" 
                        title="Eliminar"
                      >
                        <Trash2 size={18} />
                      </button>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="bg-white rounded-2xl p-12 text-center border-2 border-dashed border-gray-200">
          <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-6 text-gray-300">
            <FileText size={40} />
          </div>
          <h2 className="text-xl font-bold text-gray-700 mb-2">No se encontraron planeaciones</h2>
          <p className="text-gray-500 mb-8 max-w-sm mx-auto">Aún no has creado formatos de planeación. Comienza capturando tu primera actividad pedagógica.</p>
          <button 
            onClick={() => navigate('/planeacion')}
            className="px-8 py-3 bg-imss-green-dark text-white rounded-lg font-bold hover:bg-imss-green-medium transition shadow-lg"
          >
            Nueva Planeación
          </button>
        </div>
      )}
    </div>
  );
};

export default Planeaciones;
