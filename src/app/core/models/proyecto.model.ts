export interface Participante {
  id?: number;
  proyectoId?: number;
  nombre: string;
  cedula?: string | null;
  email?: string | null;
  rol?: string | null;
}

export interface Tutor {
  id?: number;
  proyectoId?: number;
  nombre: string;
  encargado?: boolean;
  cedula?: string | null;
  email?: string | null;
}

export interface Proyecto {
  id: number;
  nombre: string;
  descripcion?: string | null;
  concursoId: number | null;
  concursoNombre?: string | null;
  nivel?: string | null;
  area?: string | null;
  activo: boolean;
  participantes: Participante[];
  tutores: Tutor[];
  createdAt?: string;
}

// ============================================
// MODELO USADO EN EL LADO DEL EVALUADOR
// (proyectos-asignados.page.ts) — no tocar su forma,
// solo se actualiza el sub-objeto `proyecto` para incluir tutores.
// ============================================
export interface ProyectoAsignado {
  evaluacionId: number;
  yaEvaluado: boolean;
  puedeEditar: boolean;
  fechaAsignacion?: string;
  proyecto: {
    id: number;
    nombre: string;
    descripcion?: string | null;
    participantes: Participante[];
    tutores?: Tutor[];
    tipo?: string | null;
    puntajeMaximo?: number | null;
    concursoNombre?: string | null;
    concursoId?: number | null;
  };
}