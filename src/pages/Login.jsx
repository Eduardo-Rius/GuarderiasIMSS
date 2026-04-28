import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { auth } from '../services/firebase';
import { 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword 
} from 'firebase/auth';
import imssLogo from '../assets/imss_logo.svg';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await signInWithEmailAndPassword(auth, email, password);
      navigate('/dashboard');
    } catch (err) {
      setError('Error al iniciar sesión. Verifica tus credenciales.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleSignUp = async (e) => {
    e.preventDefault();
    if (!email || !password) {
      setError('Por favor llena todos los campos.');
      return;
    }
    setError('');
    setLoading(true);
    try {
      await createUserWithEmailAndPassword(auth, email, password);
      navigate('/dashboard');
    } catch (err) {
      setError('Error al crear cuenta. ' + err.message);
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-imss-bg px-4">
      <div className="bg-white p-8 rounded-xl shadow-2xl w-full max-w-md border-t-8 border-imss-gold">
        <div className="flex justify-center mb-8">
          <img src={imssLogo} alt="IMSS Logo" className="w-40" />
        </div>
        
        <h1 className="text-2xl font-bold text-imss-green-dark mb-2 text-center">Plataforma Pedagógica</h1>
        <p className="text-gray-500 text-center mb-8 text-sm uppercase tracking-widest font-medium">Acceso Institucional</p>
        
        <form className="space-y-6">
          <div>
            <label className="block text-xs font-bold text-gray-500 uppercase mb-1 ml-1">Correo Electrónico</label>
            <input 
              type="email" 
              className="w-full p-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-imss-green-dark outline-none transition-all text-gray-900"
              placeholder="ejemplo@imss.gob.mx"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>
          <div>
            <label className="block text-xs font-bold text-gray-500 uppercase mb-1 ml-1">Contraseña</label>
            <input 
              type="password" 
              className="w-full p-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-imss-green-dark outline-none transition-all text-gray-900"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>

          {error && (
            <div className="bg-red-50 text-red-600 p-3 rounded-lg text-sm text-center border border-red-100 animate-pulse">
              {error}
            </div>
          )}

          <div className="flex flex-col gap-3 pt-2">
            <button 
              onClick={handleLogin}
              disabled={loading}
              className={`w-full py-3 bg-imss-green-dark text-white font-bold rounded-lg hover:bg-imss-green-medium transition-colors shadow-lg ${loading ? 'opacity-70 cursor-not-allowed' : ''}`}
            >
              {loading ? 'Procesando...' : 'Iniciar Sesión'}
            </button>
            <button 
              onClick={handleSignUp}
              disabled={loading}
              className="w-full py-3 bg-white border-2 border-imss-green-dark text-imss-green-dark font-bold rounded-lg hover:bg-green-50 transition-colors"
            >
              Crear Cuenta Nueva
            </button>
          </div>
        </form>

        <div className="mt-8 text-center">
          <p className="text-[10px] text-gray-400 uppercase tracking-tighter">
            Uso exclusivo para personal de Guarderías IMSS. <br/>
            Este sistema monitorea el acceso no autorizado.
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;
