import React, { useState } from 'react';
import { useUser } from '../context/UserContext';
import { db } from '../services/firebase';
import { doc, updateDoc } from 'firebase/firestore';
import { Shield, User, Star, CheckCircle, RefreshCcw } from 'lucide-react';

const Admin = () => {
  const { profile, setProfile } = useUser();
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

  const changeRole = async (newRole) => {
    if (!profile?.uid) return;
    setLoading(true);
    try {
      const userRef = doc(db, 'usuarios', profile.uid);
      await updateDoc(userRef, { rol: newRole });
      
      // Actualizar estado local
      const updatedProfile = { ...profile, rol: newRole };
      setProfile(updatedProfile);
      
      setMessage(`¡Rol cambiado a ${newRole.toUpperCase()} con éxito!`);
      setTimeout(() => setMessage(''), 3000);
    } catch (error) {
      console.error("Error al cambiar rol:", error);
      setMessage('Error al cambiar el rol.');
    } finally {
      setLoading(false);
    }
  };

  const roles = [
    { id: 'docente', label: 'Docente', icon: <User size={20} />, color: 'bg-blue-600', desc: 'Crea y edita sus propias planeaciones.' },
    { id: 'directora', label: 'Directora', icon: <Star size={20} />, color: 'bg-imss-green-dark', desc: 'Gestiona su guardería, aprueba y rechaza.' },
    { id: 'supervisor', label: 'Supervisor', icon: <Shield size={20} />, color: 'bg-imss-gold', desc: 'Solo lectura de todas las guarderías.' }
  ];

  return (
    <div className="p-8 max-w-4xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-imss-green-dark mb-2 flex items-center gap-3">
          <Settings className="text-imss-gold" /> Panel de Control Administrativo
        </h1>
        <p className="text-gray-600">Configuración temporal de roles para pruebas de flujo institucional.</p>
      </div>

      {message && (
        <div className="mb-6 p-4 bg-green-100 text-green-800 rounded-lg flex items-center gap-2 border border-green-200 animate-pulse">
          <CheckCircle size={20} /> {message}
        </div>
      )}

      <div className="bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden">
        <div className="p-6 bg-gray-50 border-b border-gray-100">
          <h2 className="text-lg font-bold flex items-center gap-2">
            <RefreshCcw size={18} className="text-imss-green-dark" /> Selector de Rol Actual
          </h2>
        </div>
        
        <div className="p-6 grid gap-6 md:grid-cols-3">
          {roles.map((role) => (
            <button
              key={role.id}
              onClick={() => changeRole(role.id)}
              disabled={loading || profile?.rol === role.id}
              className={`p-6 rounded-xl border-2 transition-all flex flex-col items-center text-center gap-4 ${
                profile?.rol === role.id 
                  ? 'border-imss-gold bg-imss-gold/5 shadow-inner' 
                  : 'border-gray-100 hover:border-imss-green-medium hover:shadow-lg'
              }`}
            >
              <div className={`p-4 rounded-full text-white ${role.color} ${profile?.rol === role.id ? 'ring-4 ring-imss-gold/20' : ''}`}>
                {role.icon}
              </div>
              <div>
                <p className="font-black text-imss-green-dark uppercase tracking-wide">{role.label}</p>
                <p className="text-xs text-gray-500 mt-2">{role.desc}</p>
              </div>
              {profile?.rol === role.id && (
                <span className="text-[10px] font-bold text-imss-gold uppercase">Activo Ahora</span>
              )}
            </button>
          ))}
        </div>
        
        <div className="p-6 bg-gray-50 border-t border-gray-100">
          <div className="flex items-center gap-4 text-sm">
            <div className="p-2 bg-white rounded-lg border border-gray-200">
              <span className="font-bold text-gray-400">Usuario:</span> <span className="text-imss-green-dark font-bold">{profile?.email}</span>
            </div>
            <div className="p-2 bg-white rounded-lg border border-gray-200">
              <span className="font-bold text-gray-400">Guardería:</span> <span className="text-imss-green-dark font-bold">{profile?.guarderiaId}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// Necesitamos importar Settings de lucide-react si lo vamos a usar
import { Settings } from 'lucide-react';

export default Admin;
