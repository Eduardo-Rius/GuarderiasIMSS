import React from 'react';

const Login = () => {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <div className="bg-white p-8 rounded-lg shadow-md w-96">
        <h1 className="text-2xl font-bold text-[#005C46] mb-6 text-center">IMSS - Acceso</h1>
        <form className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">Usuario</label>
            <input type="text" className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Contraseña</label>
            <input type="password" className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2" />
          </div>
          <button type="submit" className="w-full bg-[#005C46] text-white py-2 rounded-md hover:bg-[#004a38] transition">
            Ingresar
          </button>
        </form>
      </div>
    </div>
  );
};

export default Login;
