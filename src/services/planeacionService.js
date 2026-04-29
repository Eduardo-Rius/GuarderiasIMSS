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
  updateDoc,
  arrayUnion,
  getDoc
} from 'firebase/firestore';

/**
 * Obtiene la información oficial de una guardería.
 */
export const getGuarderiaInfo = async (guarderiaId) => {
  try {
    const docRef = doc(db, 'guarderias', guarderiaId);
    const docSnap = await getDoc(docRef);
    if (docSnap.exists()) {
      return docSnap.data();
    }
    return null;
  } catch (error) {
    console.error("Error al obtener info de guardería:", error);
    return null;
  }
};

/**
 * Guarda o actualiza una planeación en Firestore.
 */
export const guardarPlaneacion = async (data, estado = 'borrador', userProfile = null) => {
  const user = auth.currentUser;
  if (!user) throw new Error("No hay usuario autenticado");

  try {
    const docData = {
      guarderiaCodigo: userProfile?.guarderiaCodigo || userProfile?.guarderiaId || data.guarderiaCodigo || data.guarderiaNo || "",
      guarderiaNombre: userProfile?.guarderiaNombre || data.guarderiaNombre || "",
      tipoGuarderia: data.tipoGuarderia || userProfile?.tipoGuarderia || "Directa",
      tipoGuarderiaSnapshotFecha: new Date().toISOString(),
      
      salaGrupo: data.salaGrupo || data.sala || "",
      fechaInicio: data.fechaInicio || data.periodoInicio || "",
      fechaFin: data.fechaFin || data.periodoFin || "",
      turno: data.turno || "",
      responsableDocente: userProfile?.nombre || data.responsableDocente || "",
      titulo: data.titulo || "Planeación Pedagógica",
      clave: data.clave || "DPES/CSG/P-01",
      
      // Contexto
      numNinas: data.numNinas || 0,
      numNinos: data.numNinos || 0,
      rangoEdad: data.rangoEdad || "",
      hayDiscapacidad: data.hayDiscapacidad || "No",
      descripcionNecesidades: data.descripcionNecesidades || "",
      observaciones: data.observacionesGrupo || data.observaciones || "",
      
      // Enfoque y Seguridad
      enfoques: data.enfoques || [],
      restriccionesMateriales: data.restriccionesMateriales || "",
      consideracionesSalud: data.consideracionesSalud || "",
      consideracionesAlimentacion: data.consideracionesAlimentacion || "",
      notasSeguridad: data.notasSeguridad || "",
      
      // Metadatos de IA
      lastGeneratedAt: data.lastGeneratedAt || null,
      generatedVersion: data.generatedVersion || 0,
      
      // Pedagogía
      referentes: data.referentes || [],
      actividadesDetalladas: data.actividadesDetalladas || [],
      evaluacionCriterios: data.evaluacionCriterios || [],
      complementarias: data.complementarias || [],
      
      // Metadatos de Autoría
      userId: user.uid,
      userEmail: user.email,
      creadoPorUid: user.uid,
      creadoPorNombre: userProfile?.nombre || user.displayName || user.email,
      creadoPorEmail: user.email,
      estado: estado,
      updatedAt: serverTimestamp()
    };

    if (data.id) {
      // Si el estado cambia, agregamos al historial
      if (data.estado && data.estado !== estado) {
        docData.historialEstados = arrayUnion({
          estadoAnterior: data.estado,
          estadoNuevo: estado,
          fecha: new Date().toISOString(),
          usuarioUid: user.uid,
          usuarioNombre: userProfile?.nombre || user.email,
          usuarioEmail: user.email,
          rol: userProfile?.rol || 'docente',
          comentario: "Actualización de documento"
        });
      }
      await updateDoc(doc(db, "planeaciones", data.id), docData);
      return data.id;
    } else {
      // Crear nuevo
      docData.createdAt = serverTimestamp();
      docData.historialEstados = [{
        estadoAnterior: 'N/A',
        estadoNuevo: 'borrador',
        fecha: new Date().toISOString(),
        usuarioUid: user.uid,
        usuarioNombre: userProfile?.nombre || user.email,
        usuarioEmail: user.email,
        rol: userProfile?.rol || 'docente',
        comentario: "Creación de planeación"
      }];
      const docRef = await addDoc(collection(db, "planeaciones"), docData);
      return docRef.id;
    }
  } catch (error) {
    console.error("Error al guardar planeación:", error);
    throw error;
  }
};

/**
 * Actualiza el estado con auditoría y historial.
 */
export const actualizarEstadoConAuditoria = async (id, nuevoEstado, userProfile, comentario = "", motivoRechazo = "") => {
  try {
    const docRef = doc(db, "planeaciones", id);
    const updateData = {
      estado: nuevoEstado,
      updatedAt: serverTimestamp(),
      historialEstados: arrayUnion({
        estadoAnterior: "desconocido", 
        estadoNuevo: nuevoEstado,
        fecha: new Date().toISOString(),
        usuarioUid: userProfile.uid,
        usuarioNombre: userProfile.nombre,
        usuarioEmail: userProfile.email,
        rol: userProfile.rol,
        comentario: comentario || (nuevoEstado === 'rechazado' ? `Rechazado: ${motivoRechazo}` : `Cambio a ${nuevoEstado}`)
      })
    };

    if (nuevoEstado === 'aprobado') {
      updateData.aprobadoPorUid = userProfile.uid;
      updateData.aprobadoPorNombre = userProfile.nombre;
      updateData.aprobadoPorEmail = userProfile.email;
      updateData.fechaAprobacion = serverTimestamp();
    }

    if (nuevoEstado === 'rechazado') {
      updateData.rechazadoPorUid = userProfile.uid;
      updateData.rechazadoPorNombre = userProfile.nombre;
      updateData.rechazadoPorEmail = userProfile.email;
      updateData.fechaRechazo = serverTimestamp();
      updateData.motivoRechazo = motivoRechazo;
    }

    await updateDoc(docRef, updateData);
  } catch (error) {
    console.error("Error al actualizar estado con auditoría:", error);
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
        where("guarderiaCodigo", "==", userProfile.guarderiaCodigo || userProfile.guarderiaId)
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
