import React, { useState } from 'react';
import { useUser } from '../context/UserContext';
import { db } from '../services/firebase';
import { doc, updateDoc, setDoc, serverTimestamp } from 'firebase/firestore';
import { Shield, User, Star, CheckCircle, RefreshCcw, Settings, AlertTriangle, Building2 } from 'lucide-react';

const Admin = () => {
  const { profile, setProfile, user } = useUser();
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  
  // Estados para simulación de guardería
  const [testGuarderiaId, setTestGuarderiaId] = useState(profile?.guarderiaId || 'GDR-001');
  const [testGuarderiaNombre, setTestGuarderiaNombre] = useState(profile?.guarderiaNombre || 'Guardería Ordinaria No. 1');

  const updateProfile = async (updates) => {
    if (!user?.uid) return;
    setLoading(true);
    try {
      const userRef = doc(db, 'usuarios', user.uid);
      
      // Si el perfil no existe, lo creamos (setDoc con merge)
      await setDoc(userRef, {
        uid: user.uid,
        email: user.email,
        nombre: user.displayName || user.email.split('@')[0],
        activo: true,
        updatedAt: serverTimestamp(),
        ...profile, // Mantener lo actual
        ...updates    // Aplicar cambios
      }, { merge: true });
      
      // Actualizar estado local
      const updatedProfile = { 
        ...profile, 
        uid: user.uid,
        email: user.email,
        nombre: user.displayName || user.email.split('@')[0],
        ...updates 
      };
      setProfile(updatedProfile);
      
      setMessage(`¡Perfil actualizado con éxito!`);
      setTimeout(() => setMessage(''), 3000);
    } catch (error) {
      console.error("Error al actualizar perfil:", error);
      setMessage('Error al actualizar el perfil.');
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
    <div className="p-8 max-w-5xl mx-auto pb-20">
      {/* ADVERTENCIA INSTITUCIONAL */}
      <div className="mb-8 p-6 bg-amber-50 border-2 border-amber-200 rounded-2xl flex gap-4 items-start shadow-sm">
        <div className="p-3 bg-amber-100 rounded-xl text-amber-600">
          <AlertTriangle size={32} />
        </div>
        <div>
          <h2 className="text-xl font-black text-amber-800 uppercase tracking-tight">Panel de Pruebas Institucionales</h2>
          <p className="text-amber-700 text-sm mt-1">
            <span className="font-bold">ADVERTENCIA:</span> Este panel es de uso temporal para validación de flujos. 
            En entornos de producción, los roles y guarderías se asignan mediante el alta institucional centralizada.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Columna Izquierda: Información de Usuario */}
        <div className="lg:col-span-1 space-y-6">
          <div className="bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden">
            <div className="p-6 bg-imss-green-dark text-white">
              <h3 className="font-bold flex items-center gap-2">
                <User size={18} /> Perfil Autenticado
              </h3>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <label className="text-[10px] font-bold text-gray-400 uppercase">Correo Electrónico</label>
                <p className="font-bold text-gray-800">{user?.email}</p>
              </div>
              <div>
                <label className="text-[10px] font-bold text-gray-400 uppercase">UID de Firebase</label>
                <p className="text-[10px] font-mono text-gray-500 break-all">{user?.uid}</p>
              </div>
              <div className="pt-4 border-t border-gray-50">
                <label className="text-[10px] font-bold text-gray-400 uppercase">Rol Actual</label>
                <div className="mt-1">
                  <span className={`px-3 py-1 rounded-full text-xs font-bold text-white uppercase ${
                    profile?.rol === 'directora' ? 'bg-imss-green-dark' : 
                    profile?.rol === 'supervisor' ? 'bg-imss-gold' : 'bg-blue-600'
                  }`}>
                    {profile?.rol || 'Sin Rol'}
                  </span>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl shadow-xl border border-gray-100 p-6">
            <h3 className="font-bold flex items-center gap-2 text-imss-green-dark mb-4">
              <Building2 size={18} /> Simulación de Guardería
            </h3>
            <div className="space-y-4">
              <div>
                <label className="text-xs font-bold text-gray-500">ID de Guardería (ID único)</label>
                <input 
                  type="text" 
                  value={testGuarderiaId} 
                  onChange={(e) => setTestGuarderiaId(e.target.value)}
                  className="w-full p-2 mt-1 border border-gray-200 rounded-lg text-sm font-bold"
                  placeholder="Ej. GDR-123"
                />
              </div>
              <div>
                <label className="text-xs font-bold text-gray-500">Nombre de la Guardería</label>
                <input 
                  type="text" 
                  value={testGuarderiaNombre} 
                  onChange={(e) => setTestGuarderiaNombre(e.target.value)}
                  className="w-full p-2 mt-1 border border-gray-200 rounded-lg text-sm"
                  placeholder="Ej. Guardería 001 Mérida"
                />
              </div>
              <button 
                onClick={() => updateProfile({ guarderiaId: testGuarderiaId, guarderiaNombre: testGuarderiaNombre })}
                disabled={loading}
                className="w-full py-2 bg-gray-800 text-white rounded-lg font-bold text-sm hover:bg-black transition flex items-center justify-center gap-2"
              >
                {loading ? <RefreshCcw className="animate-spin" size={16} /> : <Save size={16} />}
                Actualizar Guardería
              </button>
            </div>
          </div>
        </div>

        {/* Columna Derecha: Selector de Roles */}
        <div className="lg:col-span-2">
          <div className="bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden h-full">
            <div className="p-6 bg-gray-50 border-b border-gray-100">
              <h2 className="text-lg font-bold flex items-center gap-2 text-imss-green-dark">
                <Shield size={20} /> Cambio de Rol Institucional
              </h2>
              <p className="text-xs text-gray-500 mt-1">Selecciona el perfil que deseas simular para probar permisos.</p>
            </div>
            
            <div className="p-6 grid gap-6">
              {roles.map((role) => (
                <button
                  key={role.id}
                  onClick={() => updateProfile({ rol: role.id })}
                  disabled={loading || profile?.rol === role.id}
                  className={`p-6 rounded-2xl border-2 transition-all flex items-center gap-6 text-left ${
                    profile?.rol === role.id 
                      ? 'border-imss-gold bg-imss-gold/5 shadow-inner' 
                      : 'border-gray-50 hover:border-imss-green-medium hover:bg-gray-50'
                  }`}
                >
                  <div className={`p-4 rounded-xl text-white shadow-lg ${role.color} ${profile?.rol === role.id ? 'ring-4 ring-imss-gold/20' : ''}`}>
                    {role.icon}
                  </div>
                  <div className="flex-1">
                    <p className="font-black text-imss-green-dark uppercase tracking-wide text-lg">{role.label}</p>
                    <p className="text-sm text-gray-500">{role.desc}</p>
                  </div>
                  {profile?.rol === role.id ? (
                    <div className="px-3 py-1 bg-imss-gold text-white text-[10px] font-black rounded-full uppercase">Activo</div>
                  ) : (
                    <div className="w-8 h-8 rounded-full border-2 border-gray-200 flex items-center justify-center text-gray-300">
                      <CheckCircle size={16} />
                    </div>
                  )}
                </button>
              ))}
            </div>

            {message && (
              <div className="mx-6 mb-6 p-4 bg-green-100 text-green-800 rounded-xl flex items-center gap-2 border border-green-200 animate-in fade-in zoom-in duration-300">
                <CheckCircle size={20} /> <span className="font-bold">{message}</span>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

// Importaciones adicionales de lucide-react
import { Save } from 'lucide-react';

export default Admin;
