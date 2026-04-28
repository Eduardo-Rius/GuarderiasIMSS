import React, { useState, useEffect, useRef } from 'react';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import { useLocation, useNavigate } from 'react-router-dom';
import { 
  ArrowLeft, 
  Printer, 
  CheckCircle,
  FileText,
  Users,
  Target,
  ShieldAlert,
  Sparkles,
  FileDown,
  Loader2,
  Send,
  History,
  AlertCircle,
  Clock,
  Save,
  Download,
  Edit3
} from 'lucide-react';
import imssLogo from '../assets/imss_logo.svg';
import LogoIMSS from '../components/LogoIMSS';
import { guardarPlaneacion, actualizarEstadoConAuditoria } from '../services/planeacionService';
import { useUser } from '../context/UserContext';


const RejectionModal = ({ onClose, onConfirm }) => {
  const [motivo, setMotivo] = useState('');

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[100] flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full overflow-hidden border border-red-100 animate-in zoom-in-95 duration-200">
        <div className="p-6 bg-red-50 border-b border-red-100 flex items-center gap-3">
          <div className="p-2 bg-red-100 rounded-lg text-red-600">
            <ShieldAlert size={24} />
          </div>
          <div>
            <h3 className="text-xl font-bold text-red-800">Rechazar Planeación</h3>
            <p className="text-xs text-red-600">Esta acción notificará al docente para su corrección.</p>
          </div>
        </div>
        <div className="p-6">
          <label className="block text-sm font-bold text-gray-700 mb-2">Motivo del rechazo *</label>
          <textarea 
            value={motivo}
            onChange={(e) => setMotivo(e.target.value)}
            placeholder="Describa brevemente por qué se rechaza la planeación y qué debe corregirse..."
            className="w-full h-32 p-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-red-500 outline-none text-sm resize-none"
          />
        </div>
        <div className="p-6 bg-gray-50 flex gap-3">
          <button 
            onClick={onClose}
            className="flex-1 py-3 px-4 bg-white border border-gray-300 text-gray-700 rounded-xl font-bold hover:bg-gray-100 transition"
          >
            Cancelar
          </button>
          <button 
            onClick={() => onConfirm(motivo)}
            disabled={!motivo.trim()}
            className="flex-1 py-3 px-4 bg-red-600 text-white rounded-xl font-bold hover:bg-red-700 transition shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Confirmar Rechazo
          </button>
        </div>
      </div>
    </div>
  );
};

const VistaPrevia = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { profile } = useUser();
  const [isEditing, setIsEditing] = useState(location.state?.isEditingInitial || false);
  const [docData, setDocData] = useState(null);
  const [saving, setSaving] = useState(false);
  const [generatingPDF, setGeneratingPDF] = useState(false);
  const [message, setMessage] = useState({ text: '', type: '' });
  const documentRef = useRef(null);
  
  // Estados para Modal de Rechazo
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [motivoRechazo, setMotivoRechazo] = useState('');

  useEffect(() => {
    if (location.state) {
      const data = location.state;
      setDocData({
        ...data,
        // Normalización de campos
        guarderiaNo: data.guarderiaNo || data.guarderia || "",
        salaGrupo: data.salaGrupo || data.sala || "",
        fechaInicio: data.fechaInicio || data.periodoInicio || "",
        fechaFin: data.fechaFin || data.periodoFin || "",
        responsableDocente: data.responsableDocente || data.responsable || "",
        
        clave: data.clave || 'DPES/CG/2020/PDG/04',
        titulo: data.titulo || 'Planeación de Acciones Pedagógicas',
        observaciones: data.observaciones || data.observacionesGrupo || 'Sin observaciones adicionales registradas.',
        referentes: data.referentes || [
          'Establecer vínculos afectivos y apegos seguros',
          'Construir una base de seguridad y confianza',
          'Desarrollar autonomía y autorregulación crecientes',
          'Desarrollar curiosidad, exploración, imaginación y creatividad',
          'Acceder al lenguaje en un sentido pleno',
          'Descubrir libros y lectura',
          'Descubrir el propio cuerpo desde la libertad de movimiento',
          'Convivir con otros y compartir el aprendizaje, juego, arte y cultura'
        ],
        actividadesDetalladas: data.actividadesDetalladas || data.actividades || [
          {
            nombre: 'Circuito de Exploración Motriz',
            proposito: 'Fomentar la coordinación gruesa y el equilibrio dinámico.',
            desarrollo: 'Colocar colchonetas y túneles en forma de U. Invitar a los niños a gatear o caminar sorteando los obstáculos mientras se les anima verbalmente.',
            duracion: '20 min',
            materiales: 'Colchonetas de fomi, túneles de tela, cubos de hule espuma.',
            seguridad: 'Asegurar que las áreas de caída estén libres de objetos rígidos.',
            dimension: 'Motriz'
          },
          {
            nombre: 'Taller de Expresión con Títeres',
            proposito: 'Estimular el lenguaje expresivo y la identificación de emociones.',
            desarrollo: 'Presentar dos títeres que dialogan sobre la alegría. Permitir que los niños interactúen con los títeres y repitan frases sencillas.',
            duracion: '15 min',
            materiales: 'Títeres de calcetín, teatrino portátil.',
            seguridad: 'Verificar que los títeres no tengan piezas pequeñas desprendibles.',
            dimension: 'Lenguaje'
          }
        ],
        complementarias: data.complementarias || data.actividadesComplementarias || [
          { nombre: 'Lectura de cuento corto', descripcion: 'Lectura rítmica de un cuento con imágenes grandes.' },
          { nombre: 'Juego libre supervisado', descripcion: 'Exploración libre con bloques de construcción de tamaño grande.' }
        ],
        evaluacionCriterios: data.evaluacionCriterios || data.evaluacion || [
          'Participación activa en el circuito.',
          'Interés mostrado hacia los títeres.',
          'Interacción positiva con los materiales.',
          'Respuesta motriz ante los obstáculos.',
          'Vínculo con el adulto durante la actividad.',
          'Convivencia armónica con otros niños.'
        ],
        estado: data.estado || 'borrador',
        id: data.id || null,
        createdAt: data.createdAt || null,
        updatedAt: data.updatedAt || null
      });
    }
  }, [location.state]);

  if (!docData) {
    return (
      <div className="p-8 text-center bg-imss-bg min-h-screen flex flex-col items-center justify-center">
        <img src={imssLogo} alt="IMSS" className="w-24 mb-4 opacity-50" />
        <p className="text-gray-500 mb-4">No hay datos de planeación disponibles.</p>
        <button onClick={() => navigate('/planeacion')} className="bg-imss-green-dark text-white px-6 py-2 rounded-lg font-bold">
          Ir a Nueva Planeación
        </button>
      </div>
    );
  }

  const handleDownloadPDF = async () => {
    if (!documentRef.current) return;
    
    setGeneratingPDF(true);
    setMessage({ text: 'Preparando paginación oficial (Carta)...', type: 'success' });

    try {
      const exportContainer = document.createElement('div');
      exportContainer.className = 'pdf-export-container';
      document.body.appendChild(exportContainer);

      // 1. Crear el contenido completo para medir
      const fullContent = document.createElement('div');
      fullContent.style.width = '196mm'; // Área útil (216 - 20)
      fullContent.style.padding = '0';
      
      // Clonar el nodo original para manipularlo
      const originalNode = documentRef.current;
      const clonedNode = originalNode.cloneNode(true);
      
      // Sincronizar valores de inputs/textareas del original al clon
      const originalInputs = originalNode.querySelectorAll('textarea, input');
      const clonedInputs = clonedNode.querySelectorAll('textarea, input');
      
      originalInputs.forEach((originalEl, idx) => {
        const value = originalEl.value;
        const clonedEl = clonedInputs[idx];
        if (clonedEl) {
          const span = document.createElement('span');
          span.textContent = value || '';
          span.className = 'pdf-text-value';
          clonedEl.parentNode.replaceChild(span, clonedEl);
        }
      });

      // Eliminar botones y elementos innecesarios
      const buttons = clonedNode.querySelectorAll('button');
      buttons.forEach(b => b.remove());

      fullContent.innerHTML = clonedNode.innerHTML;
      exportContainer.appendChild(fullContent);

      // 2. Medir bloques y paginar
      const mmToPx = 3.78; 
      const pageHeightMm = 250; // Un poco menos para dar margen
      const pageHeightPx = pageHeightMm * mmToPx;

      const headerBlock = fullContent.children[0];
      const subHeaderBlock = fullContent.children[1];
      const contentContainer = fullContent.children[2];
      const contentBlocks = Array.from(contentContainer.children);

      let pages = [[headerBlock, subHeaderBlock]];
      let currentPageHeight = headerBlock.offsetHeight + subHeaderBlock.offsetHeight;

      contentBlocks.forEach((block, idx) => {
        const height = block.offsetHeight;
        const isLastTwo = idx >= contentBlocks.length - 2;

        if (isLastTwo && idx === contentBlocks.length - 2) {
          const nextBlockHeight = contentBlocks[idx + 1].offsetHeight;
          if (currentPageHeight + height + nextBlockHeight > pageHeightPx) {
            pages.push([block]);
            currentPageHeight = height;
            return;
          }
        }

        if (block.innerHTML.includes('Planeación de las acciones')) {
          const sectionTitle = block.children[0];
          const activitiesContainer = block.children[1];
          const activities = Array.from(activitiesContainer.children);

          if (currentPageHeight + sectionTitle.offsetHeight > pageHeightPx) {
            pages.push([sectionTitle]);
            currentPageHeight = sectionTitle.offsetHeight;
          } else {
            pages[pages.length - 1].push(sectionTitle);
            currentPageHeight += sectionTitle.offsetHeight;
          }

          activities.forEach(act => {
            if (currentPageHeight + act.offsetHeight > pageHeightPx) {
              pages.push([act]);
              currentPageHeight = act.offsetHeight;
            } else {
              pages[pages.length - 1].push(act);
              currentPageHeight += act.offsetHeight;
            }
          });
        } else {
          if (currentPageHeight + height > pageHeightPx) {
            pages.push([block]);
            currentPageHeight = height;
          } else {
            pages[pages.length - 1].push(block);
            currentPageHeight += height;
          }
        }
      });

      // 3. Renderizar páginas virtuales
      exportContainer.innerHTML = '';
      const totalPages = pages.length;

      for (let i = 0; i < totalPages; i++) {
        const pageDiv = document.createElement('div');
        pageDiv.className = 'pdf-page';
        
        const contentDiv = document.createElement('div');
        contentDiv.className = 'flex flex-col space-y-2'; 
        pages[i].forEach(el => contentDiv.appendChild(el.cloneNode(true)));
        
        pageDiv.appendChild(contentDiv);

        if (i === totalPages - 1) {
          const footer = document.createElement('div');
          footer.className = 'pdf-footer-block pdf-text-footer';
          footer.innerHTML = `Este documento es para uso exclusivo del personal de Guarderías IMSS. Prohibida su reproducción total o parcial. | Generado: ${new Date().toLocaleDateString()}`;
          pageDiv.appendChild(footer);
        }

        exportContainer.appendChild(pageDiv);
      }

      // 4. Capturar cada página
      const pdf = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: 'letter'
      });

      const pageElements = exportContainer.querySelectorAll('.pdf-page');
      for (let i = 0; i < pageElements.length; i++) {
        if (i > 0) pdf.addPage();
        
        const canvas = await html2canvas(pageElements[i], {
          scale: 3.5,
          useCORS: true,
          logging: false,
          backgroundColor: '#ffffff',
          width: 216 * mmToPx,
          height: 279 * mmToPx
        });

        const imgData = canvas.toDataURL('image/png', 1.0);
        pdf.addImage(imgData, 'PNG', 0, 0, 216, 279);
      }

      // 5. Finalizar
      const date = new Date().toISOString().split('T')[0];
      pdf.save(`Planeacion_IMSS_Carta_${docData.salaGrupo}_${date}.pdf`);
      
      document.body.removeChild(exportContainer);
      setGeneratingPDF(false);
      setMessage({ text: '¡PDF Carta generado con éxito!', type: 'success' });
    } catch (error) {
      console.error('Error al generar PDF:', error);
      setMessage({ text: 'Error al generar el PDF institucional.', type: 'error' });
      setGeneratingPDF(false);
    } finally {
      setGeneratingPDF(false);
      setTimeout(() => setMessage({ text: '', type: '' }), 3000);
    }
  };

  const handleExportAlert = () => alert('Exportación a Word pendiente de integración.');

  const handleSave = () => {
    setIsEditing(false);
    setMessage({ text: 'Cambios locales guardados en el documento.', type: 'success' });
    setTimeout(() => setMessage({ text: '', type: '' }), 3000);
  };

  const handlePersist = async (estado) => {
    setSaving(true);
    setMessage({ text: '', type: '' });
    try {
      const savedId = await guardarPlaneacion(docData, estado, profile);
      setDocData(prev => ({ ...prev, id: savedId, estado }));
      setMessage({ 
        text: `¡Planeación actualizada correctamente: ${estado.toUpperCase()}!`, 
        type: 'success' 
      });
    } catch (error) {
      console.error("Error al persistir cambios:", error);
      setMessage({ text: `Error de Firebase: ${error.message}`, type: 'error' });
    } finally {
      setSaving(false);
      setTimeout(() => setMessage({ text: '', type: '' }), 10000);
    }
  };

  const handleUpdateStatus = async (nuevoEstado, motivo = "") => {
    setSaving(true);
    try {
      await actualizarEstadoConAuditoria(docData.id, nuevoEstado, profile, "", motivo);
      setDocData(prev => ({ 
        ...prev, 
        estado: nuevoEstado, 
        motivoRechazo: nuevoEstado === 'rechazado' ? motivo : prev.motivoRechazo,
        updatedAt: new Date()
      }));
      setMessage({ 
        text: `Estado actualizado a ${nuevoEstado.toUpperCase()}`, 
        type: 'success' 
      });
      setShowRejectModal(false);
    } catch (error) {
      setMessage({ text: `Error: ${error.message}`, type: 'error' });
    } finally {
      setSaving(false);
      setTimeout(() => setMessage({ text: '', type: '' }), 4000);
    }
  };

  return (
    <div className="p-4 md:p-8 bg-gray-100 min-h-screen pb-20">
      {showRejectModal && (
        <RejectionModal 
          onClose={() => setShowRejectModal(false)} 
          onConfirm={(motivo) => handleUpdateStatus('rechazado', motivo)} 
        />
      )}
      {/* Barra de Herramientas Superior */}
      <div className="max-w-5xl mx-auto mb-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <button 
          onClick={() => navigate('/planeacion')}
          className="flex items-center gap-1 text-imss-green-dark hover:underline font-medium"
        >
          <ArrowLeft size={16} />
          Regresar a Nueva Planeación
        </button>
        
        <div className="flex flex-wrap gap-2">
          {/* Lógica de Edición - Solo Docente en borrador o rechazado */}
          {profile?.rol === 'docente' && (docData.estado === 'borrador' || docData.estado === 'rechazado' || !docData.id) && (
            !isEditing ? (
              <button 
                onClick={() => setIsEditing(true)}
                className="flex items-center gap-2 px-4 py-2 bg-white border border-imss-green-dark text-imss-green-dark rounded-lg hover:bg-green-50 transition"
              >
                <Edit3 size={18} />
                Editar
              </button>
            ) : (
              <button 
                onClick={handleSave}
                className="flex items-center gap-2 px-4 py-2 bg-imss-green-medium text-white rounded-lg hover:bg-imss-green-dark transition shadow-md"
              >
                <CheckCircle size={18} />
                Aplicar Cambios
              </button>
            )
          )}

          {/* Botón de Persistencia (Guardar Borrador) - Solo Docente */}
          {profile?.rol === 'docente' && (docData.estado === 'borrador' || docData.estado === 'rechazado' || !docData.id) && !isEditing && (
            <button 
              onClick={() => handlePersist('borrador')}
              disabled={saving}
              className="flex items-center gap-2 px-4 py-2 bg-imss-green-dark text-white rounded-lg hover:opacity-90 transition shadow-md disabled:opacity-50"
            >
              {saving ? <Loader2 className="animate-spin" size={18} /> : <Save size={18} />}
              Guardar Borrador
            </button>
          )}

          {/* Botones de Flujo de Estado - Solo Docente para Enviar */}
          {profile?.rol === 'docente' && (docData.estado === 'borrador' || docData.estado === 'rechazado' || !docData.id) && !isEditing && (
            <button 
              onClick={() => handlePersist('en_revision')}
              disabled={saving}
              className="flex items-center gap-2 px-4 py-2 bg-[#bd965c] text-white rounded-lg hover:bg-[#a68450] transition shadow-md disabled:opacity-50 font-bold"
            >
              {saving ? <Loader2 className="animate-spin" size={18} /> : <Send size={18} />}
              Enviar a Revisión
            </button>
          )}

          {/* Botón de Aprobación - Solo Directora */}
          {profile?.rol === 'directora' && docData.estado === 'en_revision' && (
            <button 
              onClick={() => handleUpdateStatus('aprobado')}
              disabled={saving}
              className="flex items-center gap-2 px-4 py-2 bg-imss-green-medium text-white rounded-lg hover:bg-imss-green-dark transition shadow-md disabled:opacity-50"
            >
              {saving ? <Loader2 className="animate-spin" size={18} /> : <CheckCircle size={18} />}
              Aprobar Planeación
            </button>
          )}

          {/* Botón de Rechazo - Solo Directora */}
          {profile?.rol === 'directora' && docData.estado === 'en_revision' && (
            <button 
              onClick={() => setShowRejectModal(true)}
              disabled={saving}
              className="flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition shadow-md disabled:opacity-50"
            >
              <AlertCircle size={18} />
              Rechazar
            </button>
          )}

          <button onClick={handleExportAlert} className="flex items-center gap-2 px-4 py-2 bg-white border border-[#bd965c] text-[#bd965c] font-bold rounded-lg hover:bg-yellow-50 transition shadow-sm">
            <FileDown size={18} />
            Word
          </button>
          <button 
            onClick={handleDownloadPDF} 
            disabled={generatingPDF}
            className="flex items-center gap-2 px-4 py-2 bg-imss-green-dark text-white rounded-lg hover:bg-imss-green-medium transition disabled:opacity-50"
          >
            {generatingPDF ? <Loader2 className="animate-spin" size={18} /> : <Download size={18} />}
            {generatingPDF ? 'Generando...' : 'PDF'}
          </button>
        </div>
      </div>

      {/* Mensajes de feedback */}
      {message.text && (
        <div className={`max-w-5xl mx-auto mb-4 p-4 rounded-lg flex items-center gap-2 animate-in fade-in slide-in-from-top-2 ${
          message.type === 'success' ? 'bg-green-100 text-green-800 border border-green-200' : 'bg-red-100 text-red-800 border border-red-200'
        }`}>
          {message.type === 'success' ? <CheckCircle size={20} /> : <ShieldAlert size={20} />}
          <p className="font-bold">{message.text}</p>
        </div>
      )}

      {/* Motivo de Rechazo (Visible para Docente) */}
      {docData.estado === 'rechazado' && docData.motivoRechazo && (
        <div className="max-w-5xl mx-auto mb-6 bg-red-50 border-l-4 border-red-500 p-6 rounded-r-xl shadow-md animate-in slide-in-from-left duration-300">
          <div className="flex items-center gap-3 mb-2 text-red-700">
            <AlertCircle size={24} />
            <h3 className="text-lg font-bold">Observaciones de la Dirección</h3>
          </div>
          <p className="text-gray-800 bg-white/50 p-4 rounded-lg border border-red-100 italic">
            "{docData.motivoRechazo}"
          </p>
          <div className="mt-3 flex items-center justify-between text-xs text-red-600 font-bold uppercase">
            <span>Revisado por: {docData.rechazadoPorNombre || 'Directora'}</span>
            <span>
              Fecha: {(() => {
                const dateSource = docData.fechaRechazo || docData.updatedAt;
                if (!dateSource) return 'Sin registro';
                
                try {
                  const dateObj = dateSource.toDate ? dateSource.toDate() : new Date(dateSource);
                  return isNaN(dateObj.getTime()) ? 'Sin registro' : dateObj.toLocaleString();
                } catch (e) {
                  return 'Sin registro';
                }
              })()}
            </span>
          </div>
        </div>
      )}

      {/* DOCUMENTO OFICIAL */}
      <div 
        ref={documentRef}
        className="max-w-5xl mx-auto bg-white shadow-2xl rounded-sm border border-gray-300 overflow-hidden font-sans text-gray-800"
      >
        
        {/* Encabezado Institucional */}
        <div className="py-4 px-8 border-b-2 border-imss-green-dark flex justify-between items-start">
          <div className="flex items-start">
            <div style={{ marginRight: '16px', width: '80px', flexShrink: 0 }}>
              <LogoIMSS 
                className="w-[80px] h-auto block" 
              />
            </div>
            <div className="flex flex-col pt-1">
              <p className="text-sm font-bold text-imss-green-dark">INSTITUTO MEXICANO DEL SEGURO SOCIAL</p>
              <p className="text-xs font-medium text-gray-600 uppercase leading-tight">Dirección de Prestaciones Económicas y Sociales</p>
              <p className="text-xs font-medium text-gray-600 uppercase leading-tight">Coordinación de Servicio de Guardería</p>
            </div>
          </div>
          <div className="text-right space-y-1 encabezado-derecho pr-4 min-w-[280px]">
            <div className="flex flex-col items-end gap-1">
              <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest leading-none">CLAVE DOCUMENTAL</span>
              <span className="text-xs font-mono font-bold text-gray-700">{docData.clave}</span>
            </div>
            <div className="flex flex-col items-end gap-1">
              <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest leading-none">FOLIO DE CONTROL</span>
              <span className="text-sm font-mono font-bold text-imss-green-dark uppercase tracking-tight">#{docData.id || 'TEMP-' + Date.now().toString().slice(-6)}</span>
            </div>
          </div>
        </div>

        <div className="px-8 py-1.5 border-b border-gray-200 flex justify-between items-center text-[10px] font-bold text-gray-500 uppercase">
          <div className="flex gap-4 items-center">
            <div className="flex items-center gap-1.5 px-2 py-0.5 bg-gray-100 rounded text-gray-600">
              <History size={12} />
              <span>Creado: {docData.createdAt ? (docData.createdAt.toDate ? docData.createdAt.toDate().toLocaleDateString() : new Date(docData.createdAt).toLocaleDateString()) : 'Hoy'}</span>
            </div>
            {docData.updatedAt && (
              <div className="flex items-center gap-1.5 px-2 py-0.5 bg-gray-100 rounded text-gray-600">
                <Clock size={12} />
                <span>Actualizado: {docData.updatedAt ? (docData.updatedAt instanceof Date ? docData.updatedAt.toLocaleDateString() : (docData.updatedAt.toDate ? docData.updatedAt.toDate().toLocaleDateString() : new Date(docData.updatedAt).toLocaleDateString())) : 'Sin actualización'}</span>
              </div>
            )}
          </div>
          <div className="flex items-center gap-2">
            <span>Estado:</span>
            <span className={`px-2 py-0.5 rounded text-white ${
              docData.estado === 'aprobado' ? 'bg-imss-green-medium' : 
              docData.estado === 'en_revision' ? 'bg-imss-gold' : 
              docData.estado === 'rechazado' ? 'bg-red-600' : 
              'bg-gray-400'
            }`}>
              {docData.estado === 'en_revision' ? 'EN REVISIÓN' : (docData.estado || 'BORRADOR').toUpperCase()}
            </span>
          </div>
        </div>

        <div className="p-6 space-y-8">
          {/* Título del Formato */}
          <div className="text-center">
            <h2 className="text-xl font-black text-imss-green-dark uppercase tracking-tight">{docData.titulo}</h2>
          </div>

          {/* Tabla de Datos Generales */}
          <div className="grid grid-cols-1 md:grid-cols-2 border border-gray-300 rounded overflow-hidden">
            <div className="border-b md:border-b-0 md:border-r border-gray-300 p-3 bg-gray-50 flex flex-col gap-1">
              <div>
                <span className="text-[10px] font-bold text-gray-500 uppercase block">Código de Guardería</span>
                <p className="text-sm font-black text-imss-green-dark">{docData.guarderiaCodigo || docData.guarderiaNo}</p>
              </div>
              <div>
                <span className="text-[10px] font-bold text-gray-500 uppercase block">Tipo de Prestación</span>
                <p className="text-xs font-medium text-imss-gold">{docData.tipoGuarderia || 'Directa'}</p>
              </div>
            </div>
            <div className="p-3 bg-gray-50 border-b border-gray-300 md:border-b-0">
              <span className="text-[10px] font-bold text-gray-500 uppercase block">Sala de atención o grupo</span>
              <p className="text-sm font-medium">{docData.salaGrupo}</p>
            </div>
            <div className="border-t border-gray-300 p-3 bg-white">
              <span className="text-[10px] font-bold text-gray-500 uppercase block">Periodo de ejecución</span>
              <p className="text-sm font-medium">{docData.fechaInicio} al {docData.fechaFin}</p>
            </div>
            <div className="border-t border-l-0 md:border-l border-gray-300 p-3 bg-white">
              <span className="text-[10px] font-bold text-gray-500 uppercase block">Responsable Docente</span>
              <p className="text-sm font-medium uppercase">{docData.responsableDocente}</p>
            </div>
            <div className="border-t border-gray-300 p-3 bg-gray-50 col-span-1">
              <span className="text-[10px] font-bold text-gray-500 uppercase block">Turno</span>
              <p className="text-sm font-medium">{docData.turno}</p>
            </div>
            <div className="border-t border-l-0 md:border-l border-gray-300 p-3 bg-gray-50 col-span-1">
              <span className="text-[10px] font-bold text-gray-500 uppercase block">Nombre de la Unidad</span>
              <p className="text-[10px] font-bold uppercase text-imss-green-dark">{docData.guarderiaNombre || 'Nombre no registrado'}</p>
            </div>
          </div>

          {/* 1. Referentes Curriculares */}
          <section className="break-inside-avoid">
            <h3 className="text-sm font-bold bg-imss-green-dark text-white px-3 py-1 mb-3">1. REFERENTES CURRICULARES</h3>
            <ul className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-1 list-disc list-inside text-[13px] text-gray-700">
              {docData.referentes.map((ref, i) => <li key={i} className="leading-tight">{ref}</li>)}
            </ul>
          </section>

          {/* 2. Observaciones de los niños */}
          <section className="break-inside-avoid">
            <h3 className="text-sm font-bold bg-imss-green-dark text-white px-3 py-1 mb-3">2. OBSERVACIONES DE LOS NIÑOS Y LAS NIÑAS</h3>
            {isEditing ? (
              <textarea 
                className="w-full p-3 border border-imss-gold rounded text-sm min-h-[80px] bg-yellow-50/30"
                value={docData.observaciones}
                onChange={(e) => setDocData({...docData, observaciones: e.target.value})}
              />
            ) : (
              <div className="p-3 border border-gray-100 bg-gray-50 rounded text-sm italic text-gray-600">
                {docData.observaciones}
              </div>
            )}
          </section>

          {/* 3. Planeación de Acciones */}
          <section className="section-block">
            <h3 className="text-sm font-bold bg-imss-green-dark text-white px-3 py-1 mb-3 uppercase">3. Planeación de las acciones pedagógicas</h3>
            <div className="space-y-6">
              {docData.actividadesDetalladas.map((act, idx) => (
                <div key={idx} className="actividad-card border border-gray-200 rounded-lg overflow-hidden shadow-sm break-inside-avoid">
                  <div className="bg-gray-100 p-2 flex justify-between items-center border-b border-gray-200">
                    <span className="text-xs font-black text-imss-green-dark uppercase">{act.nombre}</span>
                    <span className="text-[10px] font-bold bg-imss-gold text-white px-2 py-0.5 rounded uppercase">{act.dimension}</span>
                  </div>
                  <div className="p-4 grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="md:col-span-2 space-y-3 text-sm">
                      <div>
                        <p className="text-[10px] font-bold text-gray-400 uppercase">Propósito:</p>
                        {isEditing ? (
                          <input type="text" className="w-full border-b border-imss-gold outline-none p-1" value={act.proposito} />
                        ) : <p className="font-medium">{act.proposito}</p>}
                      </div>
                      <div>
                        <p className="text-[10px] font-bold text-gray-400 uppercase">Desarrollo:</p>
                        {isEditing ? (
                          <textarea className="w-full border border-imss-gold rounded p-2 text-xs" rows="3" value={act.desarrollo} />
                        ) : <p className="text-gray-700 leading-relaxed">{act.desarrollo}</p>}
                      </div>
                    </div>
                    <div className="bg-gray-50 p-3 rounded space-y-3 text-xs border-l-2 border-imss-green-medium/20">
                      <div>
                        <p className="font-bold text-gray-500 uppercase">Duración:</p>
                        <p>{act.duracion}</p>
                      </div>
                      <div>
                        <p className="font-bold text-gray-500 uppercase">Materiales:</p>
                        <p>{act.materiales}</p>
                      </div>
                      <div>
                        <p className="font-bold text-red-600 uppercase flex items-center gap-1">
                          <ShieldAlert size={12} /> Seguridades:
                        </p>
                        <p className="italic">{act.seguridad}</p>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </section>

          {/* 4. Materiales */}
          <section className="break-inside-avoid">
            <h3 className="text-sm font-bold bg-imss-green-dark text-white px-3 py-1 mb-3 uppercase">4. Materiales</h3>
            <div className="p-4 border border-gray-200 rounded text-sm text-gray-700 bg-gray-50 space-y-3">
              <p>{docData.suggestions?.materiales.join(', ') || 'Materiales básicos de la sala'}</p>
              <div className="flex gap-2 p-3 bg-imss-gold/10 border-l-4 border-imss-gold text-[11px] italic text-gray-600 leading-tight">
                <ShieldAlert size={16} className="text-imss-gold flex-shrink-0" />
                <p>Los materiales deberán ser seguros, no tóxicos, adecuados a la edad del grupo y utilizados bajo supervisión del personal responsable.</p>
              </div>
            </div>
          </section>

          {/* 5. Evaluación */}
          <section className="break-inside-avoid">
            <h3 className="text-sm font-bold bg-imss-green-dark text-white px-3 py-1 mb-3 uppercase">5. Evaluación (Criterios observables)</h3>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
              {docData.evaluacionCriterios.map((c, i) => (
                <div key={i} className="flex items-center gap-2 text-xs p-2 bg-gray-50 border border-gray-100 rounded">
                  <CheckCircle size={14} className="text-imss-green-medium" />
                  <span>{c}</span>
                </div>
              ))}
            </div>
          </section>

          {/* 6. Actividades Complementarias */}
          <section className="break-inside-avoid">
            <h3 className="text-sm font-bold bg-imss-green-dark text-white px-3 py-1 mb-3 uppercase">6. Actividades Complementarias</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {docData.complementarias.map((comp, i) => (
                <div key={i} className="p-3 border border-gray-200 rounded text-sm">
                  <p className="font-bold text-imss-green-dark mb-1">{comp.nombre}</p>
                  <p className="text-gray-600 text-xs">{comp.descripcion}</p>
                </div>
              ))}
            </div>
          </section>

          {/* Firmas (Visual Only) */}
          <div className="pt-16 grid grid-cols-2 gap-20 px-10 break-inside-avoid">
            <div className="border-t border-gray-800 text-center pt-2">
              <p className="text-[10px] font-bold uppercase">{docData.responsableDocente}</p>
              <p className="text-[10px] text-gray-500 uppercase">Firma del Responsable Docente</p>
            </div>
            <div className="border-t border-gray-800 text-center pt-2">
              <p className="text-[10px] text-gray-500 uppercase">Sello de la Guardería / Firma de Revisión</p>
            </div>
          </div>
        </div>

        {/* Footer Institucional */}
        <div className="bg-gray-100 p-4 text-center border-t border-gray-200">
          <p className="text-[9px] text-gray-400 uppercase tracking-widest">Este documento es para uso exclusivo del personal de Guarderías IMSS. Prohibida su reproducción total o parcial.</p>
        </div>

      </div>
    </div>
  );
};

export default VistaPrevia;
