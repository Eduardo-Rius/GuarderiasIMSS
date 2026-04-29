import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  FileText, 
  Users, 
  Target, 
  ShieldAlert, 
  Sparkles, 
  Save, 
  ArrowRight,
  AlertCircle,
  Loader2
} from 'lucide-react';
import { useUser } from '../context/UserContext';
import { getGuarderiaInfo, guardarPlaneacion } from '../services/planeacionService';

const PlaneacionNueva = () => {
  const navigate = useNavigate();
  const { profile } = useUser();
  const [loading, setLoading] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [errors, setErrors] = useState({});

  const [formData, setFormData] = useState({
    guarderiaNo: '',
    tipoGuarderia: 'Directa',
    salaGrupo: '',
    fechaInicio: '',
    fechaFin: '',
    turno: 'Matutino',
    responsableDocente: '',
    numNinas: '',
    numNinos: '',
    rangoEdad: '',
    hayDiscapacidad: 'No',
    descripcionNecesidades: '',
    observacionesGrupo: '',
    enfoques: [],
    restriccionesMateriales: '',
    consideracionesSalud: '',
    consideracionesAlimentacion: '',
    notasSeguridad: ''
  });

  React.useEffect(() => {
    const fetchNurseryData = async () => {
      if (profile) {
        let officialType = profile.tipoGuarderia || 'Directa';
        const gCodigo = profile.guarderiaCodigo || profile.guarderiaId;
        
        if (gCodigo) {
          const info = await getGuarderiaInfo(gCodigo);
          if (info && info.tipoGuarderia) {
            officialType = info.tipoGuarderia;
          }
        }

        setFormData(prev => ({
          ...prev,
          guarderiaCodigo: gCodigo || '',
          guarderiaNo: gCodigo || '',
          responsableDocente: profile.nombre || '',
          tipoGuarderia: officialType
        }));
      }
    };
    
    fetchNurseryData();
  }, [profile]);

  const salas = [
    'Lactantes A', 'Lactantes B', 'Lactantes C',
    'Maternal A', 'Maternal B', 'Maternal C',
    'Preescolar 1'
  ];

  const enfoquesLista = [
    'Motricidad gruesa', 'Motricidad fina', 'Lenguaje y comunicación',
    'Vínculo afectivo', 'Autonomía', 'Exploración sensorial',
    'Pensamiento matemático', 'Convivencia y juego'
  ];

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
    if (errors[name]) {
      setErrors({ ...errors, [name]: null });
    }
  };

  const handleCheckboxChange = (enfoque) => {
    const nuevosEnfoques = formData.enfoques.includes(enfoque)
      ? formData.enfoques.filter(i => i !== enfoque)
      : [...formData.enfoques, enfoque];
    setFormData({ ...formData, enfoques: nuevosEnfoques });
  };

  const validate = () => {
    const newErrors = {};
    if (!formData.guarderiaNo) newErrors.guarderiaNo = 'Campo obligatorio';
    if (!formData.salaGrupo) newErrors.salaGrupo = 'Campo obligatorio';
    if (!formData.fechaInicio || !formData.fechaFin) newErrors.periodo = 'Fechas obligatorias';
    if (!formData.responsableDocente) newErrors.responsableDocente = 'Campo obligatorio';
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleGenerateSuggestions = () => {
    if (!validate()) {
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }
    
    setLoading(true);
    // Simulación de "pensamiento" de IA
    setTimeout(() => {
      setLoading(false);
      setShowSuggestions(true);
      window.scrollTo({ top: document.body.scrollHeight, behavior: 'smooth' });
    }, 1500);
  };

  const handleContinue = () => {
    navigate('/preview', { state: { ...formData, suggestions: suggestionsMock } });
  };

  const handleSaveDraft = async () => {
    if (!validate()) {
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }
    setLoading(true);
    try {
      await guardarPlaneacion(formData, 'borrador', profile);
      alert('¡Borrador guardado exitosamente en Firestore!');
      navigate('/planeaciones');
    } catch (error) {
      alert(`ERROR AL GUARDAR: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  const suggestionsMock = {
    actividades: [
      'Circuito de obstáculos suaves para fomentar la motricidad gruesa.',
      'Lectura de cuentos con títeres para estimular el lenguaje.',
      'Juego de texturas con materiales naturales (arena, hojas secas).'
    ],
    materiales: [
      'Colchonetas de fomi',
      'Títeres de calcetín',
      'Charolas con arena esterilizada'
    ],
    evaluacion: 'Observación directa del interés y participación de los niños en las actividades de exploración.',
    complementarias: 'Canto de canciones rítmicas durante los momentos de transición.'
  };

  return (
    <div className="p-8 max-w-5xl mx-auto space-y-8 pb-20">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-imss-green-dark">Nueva Planeación Pedagógica</h1>
        <p className="text-gray-600 mt-2">Captura la información del grupo para generar una planeación sugerida.</p>
      </div>

      {/* Form Sections */}
      <div className="space-y-6">
        
        {/* 1. Datos Generales */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
          <div className="flex items-center gap-2 mb-6 text-imss-green-dark font-bold border-b pb-2">
            <FileText size={20} />
            <h2>Datos Generales</h2>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-xs font-bold text-gray-400 uppercase mb-1">Código de Guardería</label>
              <input 
                type="text" 
                name="guarderiaCodigo"
                value={formData.guarderiaCodigo || formData.guarderiaNo}
                disabled={true}
                className="w-full p-2 border border-gray-200 bg-gray-50 text-gray-500 rounded-md outline-none cursor-not-allowed font-bold"
              />
              <div className="flex flex-col gap-0.5 mt-1">
                <p className="text-[10px] text-imss-green-dark font-bold uppercase italic">Nombre: {profile?.guarderiaNombre || 'No asignado'}</p>
                <p className="text-[10px] text-imss-gold font-bold uppercase italic">Tipo: {formData.tipoGuarderia}</p>
              </div>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Sala o Grupo *</label>
              <select 
                name="salaGrupo"
                value={formData.salaGrupo}
                onChange={handleInputChange}
                className={`w-full p-2 border rounded-md focus:ring-2 focus:ring-imss-green-dark outline-none ${errors.salaGrupo ? 'border-red-500' : 'border-gray-300'}`}
              >
                <option value="">Seleccione una sala</option>
                {salas.map(sala => <option key={sala} value={sala}>{sala}</option>)}
              </select>
              {errors.salaGrupo && <span className="text-red-500 text-xs mt-1 flex items-center gap-1"><AlertCircle size={12}/> {errors.salaGrupo}</span>}
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Inicio *</label>
                <input 
                  type="date" 
                  name="fechaInicio"
                  value={formData.fechaInicio}
                  onChange={handleInputChange}
                  className="w-full p-2 border border-gray-300 rounded-md text-sm"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Fin *</label>
                <input 
                  type="date" 
                  name="fechaFin"
                  value={formData.fechaFin}
                  onChange={handleInputChange}
                  className="w-full p-2 border border-gray-300 rounded-md text-sm"
                />
              </div>
              {errors.periodo && <span className="col-span-2 text-red-500 text-xs mt-1 flex items-center gap-1"><AlertCircle size={12}/> {errors.periodo}</span>}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Turno</label>
              <div className="flex gap-4 mt-2">
                <label className="flex items-center gap-2">
                  <input type="radio" name="turno" value="Matutino" checked={formData.turno === 'Matutino'} onChange={handleInputChange} className="text-imss-green-dark" /> Matutino
                </label>
                <label className="flex items-center gap-2">
                  <input type="radio" name="turno" value="Vespertino" checked={formData.turno === 'Vespertino'} onChange={handleInputChange} className="text-imss-green-dark" /> Vespertino
                </label>
              </div>
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">Responsable *</label>
              <input 
                type="text" 
                name="responsableDocente"
                value={formData.responsableDocente}
                disabled={true}
                className="w-full p-2 border border-gray-200 bg-gray-50 text-gray-500 rounded-md outline-none cursor-not-allowed font-bold"
              />
              <p className="text-[10px] text-gray-400 mt-1 italic">Vínculado automáticamente a su perfil</p>
            </div>
          </div>
        </div>

        {/* 2. Contexto del Grupo */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
          <div className="flex items-center gap-2 mb-6 text-imss-green-dark font-bold border-b pb-2">
            <Users size={20} />
            <h2>Contexto del Grupo</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Número de niñas</label>
              <input type="number" name="numNinas" value={formData.numNinas} onChange={handleInputChange} className="w-full p-2 border border-gray-300 rounded-md" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Número de niños</label>
              <input type="number" name="numNinos" value={formData.numNinos} onChange={handleInputChange} className="w-full p-2 border border-gray-300 rounded-md" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Rango de edad</label>
              <input type="text" name="rangoEdad" value={formData.rangoEdad} onChange={handleInputChange} className="w-full p-2 border border-gray-300 rounded-md" placeholder="Ej. 12-18 meses" />
            </div>
          </div>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">¿Hay niños con discapacidad?</label>
              <div className="flex gap-4">
                <label className="flex items-center gap-2">
                  <input type="radio" name="hayDiscapacidad" value="Sí" checked={formData.hayDiscapacidad === 'Sí'} onChange={handleInputChange} /> Sí
                </label>
                <label className="flex items-center gap-2">
                  <input type="radio" name="hayDiscapacidad" value="No" checked={formData.hayDiscapacidad === 'No'} onChange={handleInputChange} /> No
                </label>
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Descripción de necesidades específicas</label>
              <textarea name="descripcionNecesidades" value={formData.descripcionNecesidades} onChange={handleInputChange} rows="2" className="w-full p-2 border border-gray-300 rounded-md"></textarea>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Observaciones generales del grupo</label>
              <textarea name="observacionesGrupo" value={formData.observacionesGrupo} onChange={handleInputChange} rows="2" className="w-full p-2 border border-gray-300 rounded-md"></textarea>
            </div>
          </div>
        </div>

        {/* 3. Enfoque Pedagógico */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
          <div className="flex items-center gap-2 mb-6 text-imss-green-dark font-bold border-b pb-2">
            <Target size={20} />
            <h2>Enfoque Pedagógico</h2>
          </div>
          <p className="text-sm text-gray-500 mb-4">Selecciona uno o varios enfoques para esta planeación.</p>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {enfoquesLista.map(enfoque => (
              <label key={enfoque} className="flex items-start gap-2 p-3 border border-gray-100 rounded-lg hover:bg-green-50 transition cursor-pointer">
                <input 
                  type="checkbox" 
                  checked={formData.enfoques.includes(enfoque)}
                  onChange={() => handleCheckboxChange(enfoque)}
                  className="mt-1 text-imss-green-dark rounded focus:ring-imss-green-dark"
                />
                <span className="text-sm text-gray-700">{enfoque}</span>
              </label>
            ))}
          </div>
        </div>

        {/* 4. Seguridad y Materiales */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
          <div className="flex items-center gap-2 mb-6 text-imss-green-dark font-bold border-b pb-2">
            <ShieldAlert size={20} />
            <h2>Seguridad y Materiales</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Restricciones de materiales</label>
              <textarea name="restriccionesMateriales" value={formData.restriccionesMateriales} onChange={handleInputChange} rows="2" className="w-full p-2 border border-gray-300 rounded-md" placeholder="Ej. No usar objetos pequeños, pinturas no tóxicas solamente."></textarea>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Consideraciones de salud</label>
              <textarea name="consideracionesSalud" value={formData.consideracionesSalud} onChange={handleInputChange} rows="2" className="w-full p-2 border border-gray-300 rounded-md" placeholder="Alergias o condiciones médicas relevantes."></textarea>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Consideraciones de alimentación</label>
              <textarea name="consideracionesAlimentacion" value={formData.consideracionesAlimentacion} onChange={handleInputChange} rows="2" className="w-full p-2 border border-gray-300 rounded-md"></textarea>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Notas de seguridad</label>
              <textarea name="notasSeguridad" value={formData.notasSeguridad} onChange={handleInputChange} rows="2" className="w-full p-2 border border-gray-300 rounded-md"></textarea>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col md:flex-row gap-4 justify-end pt-4">
          <button 
            onClick={handleSaveDraft}
            disabled={loading}
            className="flex items-center justify-center gap-2 px-6 py-2 border border-imss-green-dark text-imss-green-dark rounded-lg hover:bg-green-50 transition disabled:opacity-50"
          >
            {loading ? <Loader2 size={18} className="animate-spin" /> : <Save size={18} />}
            Guardar borrador
          </button>
          <button 
            onClick={handleGenerateSuggestions}
            disabled={loading}
            className={`flex items-center justify-center gap-2 px-8 py-2 bg-imss-green-dark text-white rounded-lg hover:bg-imss-green-medium transition shadow-md ${loading ? 'opacity-70 cursor-not-allowed' : ''}`}
          >
            {loading ? (
              <span className="flex items-center gap-2">
                <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Procesando sugerencias...
              </span>
            ) : (
              <>
                <Sparkles size={18} />
                Generar sugerencias
              </>
            )}
          </button>
        </div>

        {/* Suggestions Results (Simulated) */}
        {showSuggestions && (
          <div className="mt-8 p-8 bg-green-50 border-2 border-imss-green-medium rounded-2xl animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="flex items-center gap-3 mb-6">
              <div className="bg-imss-green-dark p-2 rounded-lg text-white">
                <Sparkles size={24} />
              </div>
              <h2 className="text-2xl font-bold text-imss-green-dark">Sugerencias Generadas por IA</h2>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div>
                <h3 className="font-bold text-gray-800 mb-3 flex items-center gap-2 border-b border-imss-green-medium/30 pb-1">
                  <Target size={18} className="text-imss-green-medium" />
                  Actividades Sugeridas
                </h3>
                <ul className="space-y-3">
                  {suggestionsMock.actividades.map((act, i) => (
                    <li key={i} className="text-gray-700 flex gap-2">
                      <span className="text-imss-green-medium font-bold">•</span> {act}
                    </li>
                  ))}
                </ul>
              </div>

              <div>
                <h3 className="font-bold text-gray-800 mb-3 flex items-center gap-2 border-b border-imss-green-medium/30 pb-1">
                  <FileText size={18} className="text-imss-green-medium" />
                  Materiales Recomendados
                </h3>
                <ul className="space-y-2">
                  {suggestionsMock.materiales.map((mat, i) => (
                    <li key={i} className="bg-white px-3 py-1 rounded-full text-sm text-imss-green-dark border border-imss-green-medium/20 inline-block mr-2 mb-2">
                      {mat}
                    </li>
                  ))}
                </ul>
              </div>

              <div>
                <h3 className="font-bold text-gray-800 mb-3 flex items-center gap-2 border-b border-imss-green-medium/30 pb-1">
                  <AlertCircle size={18} className="text-imss-green-medium" />
                  Evaluación Sugerida
                </h3>
                <p className="text-gray-700 leading-relaxed italic">
                  "{suggestionsMock.evaluacion}"
                </p>
              </div>

              <div>
                <h3 className="font-bold text-gray-800 mb-3 flex items-center gap-2 border-b border-imss-green-medium/30 pb-1">
                  <Sparkles size={18} className="text-imss-green-medium" />
                  Actividades Complementarias
                </h3>
                <p className="text-gray-700">
                  {suggestionsMock.complementarias}
                </p>
              </div>
            </div>

            <div className="mt-10 flex justify-center">
              <button 
                onClick={handleContinue}
                className="flex items-center gap-2 px-10 py-4 bg-[#bd965c] text-white font-black text-lg rounded-xl hover:bg-[#a68450] transition-all shadow-[0_10px_20px_rgba(189,150,92,0.3)] hover:shadow-[0_15px_30px_rgba(189,150,92,0.4)] transform hover:-translate-y-1"
              >
                Continuar a Vista Previa
                <ArrowRight size={22} strokeWidth={3} />
              </button>
            </div>
          </div>
        )}

      </div>
    </div>
  );
};

export default PlaneacionNueva;
