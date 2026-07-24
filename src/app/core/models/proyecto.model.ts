export interface Participante {
  id: number;
  nombre: string;
  cedula?: string | null;
  email?: string | null;
}

export interface Tutor {
  id: number;
  nombre: string;
  encargado: boolean;
  cedula?: string | null;
  email?: string | null;
}

export interface Proyecto {
  id: number;
  nombre: string;
  descripcion: string | null;
  concursoId: number | null;
  concursoNombre: string | null;
  nivel: string | null;
  area: string | null;
  activo: boolean;
  codigoProyecto: string | null;  // ✅ NUEVO
  participantes: Participante[];
  tutores: Tutor[];
  createdAt: string;
}

// ============================================
// MODELO USADO EN EL LADO DEL EVALUADOR
// (proyectos-asignados.page.ts) — no tocar su forma,
// solo se actualiza el sub-objeto `proyecto` para incluir tutores.
// ============================================
export interface ProyectoAsignado {
  evaluacionId: number;
  yaEvaluado: boolean;
  fechaAsignacion?: string;
  fechaEvaluacion?: string;
  estado?: string; // 'asignado' | 'evaluado' | 'reabierto'
  reabierto?: boolean; // 🔥 NUEVA PROPIEDAD
  proyecto: {
    id: number;
    nombre: string;
    descripcion?: string;
    tipo?: string;
    concursoNombre?: string;
    puntajeMaximo?: number;
    participantes: Array<{
      id: number;
      nombre: string;
      cedula?: string;
      email?: string;
    }>;
  };
}
