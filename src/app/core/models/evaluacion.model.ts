// ============================================
// DETALLE DE EVALUACIÓN
// ============================================
export interface DetalleEvaluacion {
  criterio_id: number;  // Cambiar a snake_case para consistencia con backend
  nivel_id: number;     // Cambiar a snake_case para consistencia con backend
}

// O si prefieres mantener camelCase y transformar en el servicio
export interface DetalleEvaluacionCamel {
  criterioId: number;
  nivelId: number;
}

// ============================================
// EVALUACIÓN COMPLETA
// ============================================
export interface Evaluacion {
  id: number;
  proyectoId: number;
  evaluadorId: number;
  fechaEvaluacion: string;
  observaciones?: string | null;
  detalles: DetalleEvaluacion[];
  // Campos adicionales que puede devolver el backend
  proyecto?: {
    id: number;
    nombre: string;
    descripcion?: string;
  };
  evaluador?: {
    id: number;
    nombre: string;
    email?: string;
  };
}

// ============================================
// PAYLOAD PARA GUARDAR EVALUACIÓN
// ============================================
export interface GuardarEvaluacionPayload {
  proyectoId: number;
  observaciones?: string;
  detalles: {
    criterio_id: number;
    nivel_id: number;
  }[];
}

// ============================================
// RESUMEN DE EVALUACIÓN (para listados)
// ============================================
export interface ResumenEvaluacion {
  id: number;
  proyectoId: number;
  proyectoNombre: string;
  concursoId: number;
  concursoNombre: string;
  evaluadorNombre: string;
  fecha: string;
  puntajeTotal: number;
  puntajeMaximo: number | null;
  porcentaje: number | null;
  // Valores reales que usa la tabla `evaluaciones.estado` en el backend.
  estado?: 'asignado' | 'evaluado';
}

// ============================================
// FORMULARIO DE EVALUACIÓN
// ============================================
export interface FormularioEvaluacion {
  concursoId: number;
  rubrica: {
    id: number;
    nombre: string;
    puntajeMaximo: number;
  };
  proyecto: {
    id: number;
    nombre: string;
    descripcion?: string;
  };
  secciones: SeccionEvaluacion[];
}

export interface SeccionEvaluacion {
  id: number;
  nombre: string;
  descripcion?: string;
  orden: number;
  criterios: CriterioEvaluacion[];
}

export interface CriterioEvaluacion {
  id: number;
  texto: string;
  orden: number;
  niveles: NivelEvaluacion[];
}

export interface NivelEvaluacion {
  id: number;
  nombre: string;
  descripcion?: string;
  puntaje: number;
}

// ============================================
// ESTADÍSTICAS DEL DASHBOARD
// ============================================
export interface DashboardStats {
  asignados: number;
  pendientes: number;
  completados: number;
  porcentaje: number;
}

// ============================================
// FUNCIONES UTILITY (opcionales)
// ============================================
export function crearDetalleEvaluacion(criterioId: number, nivelId: number): DetalleEvaluacion {
  return {
    criterio_id: criterioId,
    nivel_id: nivelId
  };
}

export function crearPayloadEvaluacion(
  proyectoId: number,
  detalles: DetalleEvaluacion[],
  observaciones?: string
): GuardarEvaluacionPayload {
  return {
    proyectoId,
    observaciones,
    detalles: detalles.map(d => ({
      criterio_id: d.criterio_id,
      nivel_id: d.nivel_id
    }))
  };
}