export interface Participante {
  id: number;
  cedula: string;
  nombre: string;
  email?: string | null;
  telefono?: string | null;
  institucion?: string | null;
}

export interface Proyecto {
  id?: number;
  concursoId: number;
  nombre: string;
  nivel: string;
  area: string; 
  descripcion?: string | null;
  activo: boolean;
  participantes: Participante[];
  createdAt?: string;
  yaEvaluado?: boolean;
}

/**
 * Forma reducida que usa el evaluador en su lista de "proyectos asignados".
 * Incluye el estado de SU PROPIA evaluación sobre ese proyecto (no la de otros).
 */
export interface ProyectoAsignado {
  proyecto: Proyecto;
  yaEvaluado: boolean;
  evaluacionId?: number | null;
  puedeEditar: boolean; // false si el concurso ya cerró (fechaFin pasada)
}
