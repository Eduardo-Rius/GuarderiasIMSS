import { db, auth } from './firebase';
import { 
  collection, 
  addDoc, 
  serverTimestamp, 
  query, 
  where, 
  orderBy, 
  getDocs,
  deleteDoc,
  doc,
  updateDoc
} from 'firebase/firestore';

/**
 * Guarda o actualiza una planeación en Firestore.
 * @param {Object} data - Los datos de la planeación.
 * @param {string} estado - 'borrador', 'en_revision', 'aprobado', 'rechazado'.
 * @param {Object} userProfile - El perfil del usuario (rol, guarderiaId, etc).
 */
export const guardarPlaneacion = async (data, estado = 'borrador', userProfile = null) => {
  const user = auth.currentUser;
  if (!user) throw new Error("No hay usuario autenticado");

  try {
    const docData = {
      // Datos Generales
      guarderiaNo: data.guarderiaNo || data.guarderia || "",
      tipoGuarderia: data.tipoGuarderia || "",
      salaGrupo: data.salaGrupo || data.sala || "",
      fechaInicio: data.fechaInicio || data.periodoInicio || "",
      fechaFin: data.fechaFin || data.periodoFin || "",
      turno: data.turno || "",
      responsableDocente: data.responsableDocente || data.responsable || "",
      titulo: data.titulo || "Planeación Pedagógica",
      clave: data.clave || "DPES/CSG/P-01",
      
      // Contexto
      numNinas: data.numNinas || data.numeroNinas || 0,
      numNinos: data.numNinos || data.numeroNinos || 0,
      rangoEdad: data.rangoEdad || data.edad || "",
      hayDiscapacidad: data.hayDiscapacidad || data.discapacidad || "No",
      descripcionNecesidades: data.descripcionNecesidades || data.necesidades || "",
      observaciones: data.observaciones || data.observacionesGrupo || "",
      
      // Pedagogía
      referentes: data.referentes || [],
      actividadesDetalladas: data.actividadesDetalladas || data.suggestions?.actividades || data.actividades || [],
      evaluacionCriterios: data.evaluacionCriterios || data.suggestions?.evaluacionCriterios || [],
      complementarias: data.complementarias || data.actividadesComplementarias || [],
      suggestions: data.suggestions || {},
      
      // Metadatos
      userId: user.uid,
      userEmail: user.email,
      creadoPor: userProfile?.nombre || user.displayName || user.email,
      creadoPorId: user.uid,
      guarderiaId: userProfile?.guarderiaId || data.guarderiaId || "GDR-001",
      estado: estado,
      updatedAt: serverTimestamp()
    };

    if (data.id) {
      // Actualizar existente
      await updateDoc(doc(db, "planeaciones", data.id), docData);
      return data.id;
    } else {
      // Crear nuevo
      docData.createdAt = serverTimestamp();
      const docRef = await addDoc(collection(db, "planeaciones"), docData);
      return docRef.id;
    }
  } catch (error) {
    console.error("Error al guardar planeación:", error);
    throw error;
  }
};

/**
 * Actualiza solo el estado de una planeación.
 */
export const actualizarEstadoPlaneacion = async (id, nuevoEstado) => {
  try {
    const docRef = doc(db, "planeaciones", id);
    await updateDoc(docRef, { 
      estado: nuevoEstado,
      updatedAt: serverTimestamp()
    });
  } catch (error) {
    console.error("Error al actualizar estado:", error);
    throw error;
  }
};

/**
 * Obtiene las planeaciones filtradas según el rol del usuario.
 */
export const getPlaneaciones = async (userProfile) => {
  if (!userProfile) return [];
  
  try {
    let q;
    const planeacionesRef = collection(db, "planeaciones");

    if (userProfile.rol === 'docente') {
      // Docente solo ve lo suyo
      q = query(
        planeacionesRef,
        where("userId", "==", userProfile.uid)
      );
    } else if (userProfile.rol === 'directora') {
      // Directora ve todo lo de su guardería
      q = query(
        planeacionesRef,
        where("guarderiaId", "==", userProfile.guarderiaId)
      );
    } else if (userProfile.rol === 'supervisor') {
      // Supervisor ve todo
      q = query(planeacionesRef);
    }

    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
      createdAt: doc.data().createdAt?.toDate() || new Date(),
      updatedAt: doc.data().updatedAt?.toDate() || null
    })).sort((a, b) => b.createdAt - a.createdAt); // Ordenar en memoria por ahora
  } catch (error) {
    console.error("Error al obtener planeaciones:", error);
    throw error;
  }
};

/**
 * Elimina una planeación por ID.
 */
export const eliminarPlaneacion = async (planeacionId) => {
  try {
    await deleteDoc(doc(db, "planeaciones", planeacionId));
  } catch (error) {
    console.error("Error al eliminar planeación:", error);
    throw error;
  }
};
