import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { 
  FileText, 
  Users, 
  Target, 
  ShieldAlert, 
  Sparkles, 
  Save, 
  ArrowRight,
  AlertCircle,
  Loader2,
  RefreshCcw,
  CheckCircle
} from 'lucide-react';
import { useUser } from '../context/UserContext';
import { getGuarderiaInfo, guardarPlaneacion } from '../services/planeacionService';

const PlaneacionNueva = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { profile } = useUser();
  const [loading, setLoading] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [errors, setErrors] = useState({});

  const [formData, setFormData] = useState({
    id: null,
    estado: 'borrador',
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
    notasSeguridad: '',
    // Campos de actividades para edición/regeneración
    actividadesDetalladas: [],
    referentes: [],
    materiales: [],
    evaluacionCriterios: [],
    complementarias: [],
    // Metadatos de generación
    lastGeneratedAt: null,
    generatedVersion: 0
  });

  useEffect(() => {
    const fetchInitialData = async () => {
      // Si venimos de edición, cargar datos del state
      if (location.state && (location.state.isEditing || location.state.id)) {
        const data = location.state;
        setFormData({
          id: data.id || null,
          estado: data.estado || 'borrador',
          guarderiaNo: data.guarderiaCodigo || data.guarderiaNo || '',
          guarderiaCodigo: data.guarderiaCodigo || data.guarderiaNo || '',
          tipoGuarderia: data.tipoGuarderia || 'Directa',
          salaGrupo: data.salaGrupo || data.sala || '',
          fechaInicio: data.fechaInicio || data.periodoInicio || '',
          fechaFin: data.fechaFin || data.periodoFin || '',
          turno: data.turno || 'Matutino',
          responsableDocente: data.responsableDocente || data.responsable || '',
          numNinas: data.numNinas || '',
          numNinos: data.numNinos || '',
          rangoEdad: data.rangoEdad || '',
          hayDiscapacidad: data.hayDiscapacidad || 'No',
          descripcionNecesidades: data.descripcionNecesidades || '',
          observacionesGrupo: data.observacionesGrupo || data.observaciones || '',
          enfoques: data.enfoques || [],
          restriccionesMateriales: data.restriccionesMateriales || '',
          consideracionesSalud: data.consideracionesSalud || '',
          consideracionesAlimentacion: data.consideracionesAlimentacion || '',
          notasSeguridad: data.notasSeguridad || '',
          actividadesDetalladas: data.actividadesDetalladas || [],
          referentes: data.referentes || [],
          materiales: data.materiales || [],
          evaluacionCriterios: data.evaluacionCriterios || [],
          complementarias: data.complementarias || [],
          lastGeneratedAt: data.lastGeneratedAt || null,
          generatedVersion: data.generatedVersion || 0
        });
        
        if (data.actividadesDetalladas?.length > 0) {
          setShowSuggestions(true);
        }
      } else if (profile) {
        // Carga normal para nueva planeación
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
    
    fetchInitialData();
  }, [profile, location.state]);

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
    const gCode = formData.guarderiaCodigo || formData.guarderiaNo;
    if (!gCode) newErrors.guarderiaNo = 'Campo obligatorio';
    if (!formData.salaGrupo) newErrors.salaGrupo = 'Campo obligatorio';
    if (!formData.fechaInicio || !formData.fechaFin) newErrors.periodo = 'Fechas obligatorias';
    if (!formData.responsableDocente) newErrors.responsableDocente = 'Campo obligatorio';
    
    setErrors(newErrors);
    if (Object.keys(newErrors).length > 0) {
      alert("Por favor complete los campos obligatorios: " + Object.keys(newErrors).join(", "));
    }
    return Object.keys(newErrors).length === 0;
  };

  const handleGenerateSuggestions = () => {
    const hasActivities = formData.actividadesDetalladas?.length > 0;
    
    if (hasActivities) {
      const confirmRegenerate = window.confirm("Esto reemplazará las actividades actuales. ¿Deseas continuar?");
      if (!confirmRegenerate) return;
    }

    console.log("Iniciando generación de sugerencias...");
    if (!validate()) {
      console.warn("Validación fallida para sugerencias:", errors);
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }
    
    setLoading(true);
    // Simulación de "pensamiento" de IA
    setTimeout(() => {
      // Mapear el mock a la estructura real del documento
      const nuevasSugerencias = {
        actividadesDetalladas: [
          {
            nombre: 'Circuito de obstáculos suaves',
            proposito: 'Fomentar la motricidad gruesa y el equilibrio.',
            desarrollo: 'Se colocarán colchonetas y túneles en el área central. Los niños deberán gatear o caminar sorteando los obstáculos.',
            duracion: '20 min',
            materiales: 'Colchonetas, túneles de tela',
            seguridad: 'Asegurar área libre de objetos rígidos',
            dimension: 'Motriz'
          },
          {
            nombre: 'Taller de títeres emocional',
            proposito: 'Estimular el lenguaje y reconocimiento de emociones.',
            desarrollo: 'Uso de títeres para representar situaciones de alegría y calma. Interacción directa con los niños.',
            duracion: '15 min',
            materiales: 'Títeres de calcetín, teatrino',
            seguridad: 'Sin piezas pequeñas desprendibles',
            dimension: 'Lenguaje'
          }
        ],
        referentes: [
          'Establecer vínculos afectivos y apegos seguros',
          'Construir una base de seguridad y confianza',
          'Desarrollar autonomía y autorregulación',
          'Desarrollar curiosidad y exploración'
        ],
        materiales: ['Colchonetas', 'Títeres', 'Túneles', 'Música suave'],
        evaluacionCriterios: [
          'Participación activa en el circuito',
          'Interés en la interacción con títeres',
          'Seguimiento de instrucciones sencillas'
        ],
        complementarias: [
          { nombre: 'Lectura rítmica', descripcion: 'Lectura de cuentos con énfasis en sonidos.' },
          { nombre: 'Juego libre', descripcion: 'Exploración de bloques de construcción.' }
        ]
      };

      setFormData(prev => ({
        ...prev,
        ...nuevasSugerencias,
        lastGeneratedAt: new Date().toISOString(),
        generatedVersion: (prev.generatedVersion || 0) + 1
      }));
      
      setLoading(false);
      setShowSuggestions(true);
      setTimeout(() => {
        const element = document.getElementById('suggestions-section');
        if (element) element.scrollIntoView({ behavior: 'smooth' });
      }, 100);
    }, 1500);
  };

  const handleContinue = () => {
    navigate('/preview', { state: { ...formData } });
  };

  const handleSaveDraft = async () => {
    console.log("Iniciando guardado de borrador con data:", formData);
    if (!validate()) {
      console.warn("Validación fallida:", errors);
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }
    setLoading(true);
    try {
      const savedId = await guardarPlaneacion(formData, 'borrador', profile);
      console.log("Borrador guardado exitosamente. ID:", savedId);
      setFormData(prev => ({ ...prev, id: savedId }));
      alert(`¡Borrador ${formData.id ? 'actualizado' : 'guardado'} exitosamente!`);
      navigate('/planeaciones');
    } catch (error) {
      console.error("Error al guardar borrador:", error);
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
                <Loader2 className="animate-spin h-5 w-5" />
                Procesando...
              </span>
            ) : (
              <>
                {formData.actividadesDetalladas?.length > 0 ? <RefreshCcw size={18} /> : <Sparkles size={18} />}
                {formData.actividadesDetalladas?.length > 0 ? 'Regenerar sugerencias' : 'Generar sugerencias'}
              </>
            )}
          </button>
        </div>

        {/* Suggestions Results (Simulated) */}
        {showSuggestions && (
          <div id="suggestions-section" className="mt-8 p-8 bg-green-50 border-2 border-imss-green-medium rounded-2xl animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="flex items-center gap-3 mb-6">
              <div className="bg-imss-green-dark p-2 rounded-lg text-white">
                <Sparkles size={24} />
              </div>
              <h2 className="text-2xl font-bold text-imss-green-dark">Sugerencias {formData.actividadesDetalladas?.length > 2 ? 'Regeneradas' : 'Generadas'} por IA</h2>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div>
                <h3 className="font-bold text-gray-800 mb-3 flex items-center gap-2 border-b border-imss-green-medium/30 pb-1">
                  <Target size={18} className="text-imss-green-medium" />
                  Actividades Sugeridas
                </h3>
                <ul className="space-y-3">
                  {formData.actividadesDetalladas.map((act, i) => (
                    <li key={i} className="text-gray-700 flex gap-2">
                      <span className="text-imss-green-medium font-bold">•</span> {act.nombre}: {act.proposito}
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
                  {formData.materiales.map((mat, i) => (
                    <li key={i} className="bg-white px-3 py-1 rounded-full text-sm text-imss-green-dark border border-imss-green-medium/20 inline-block mr-2 mb-2">
                      {mat}
                    </li>
                  ))}
                </ul>
              </div>

              <div>
                <h3 className="font-bold text-gray-800 mb-3 flex items-center gap-2 border-b border-imss-green-medium/30 pb-1">
                  <AlertCircle size={18} className="text-imss-green-medium" />
                  Criterios de Evaluación
                </h3>
                <ul className="space-y-1">
                  {formData.evaluacionCriterios.map((crit, i) => (
                    <li key={i} className="text-gray-700 flex gap-2 text-sm">
                      <CheckCircle size={14} className="text-imss-green-medium mt-0.5" /> {crit}
                    </li>
                  ))}
                </ul>
              </div>

              <div>
                <h3 className="font-bold text-gray-800 mb-3 flex items-center gap-2 border-b border-imss-green-medium/30 pb-1">
                  <Sparkles size={18} className="text-imss-green-medium" />
                  Actividades Complementarias
                </h3>
                <ul className="space-y-2">
                  {formData.complementarias.map((comp, i) => (
                    <li key={i} className="text-gray-700 text-sm">
                      <span className="font-bold">{comp.nombre}:</span> {comp.descripcion}
                    </li>
                  ))}
                </ul>
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
