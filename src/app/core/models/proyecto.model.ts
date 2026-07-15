export interface Proyecto {
  id: number;
  nombre: string;
  descripcion?: string;
  concursoId: number | null;
  concursoNombre?: string;
  estudianteNombre: string;
  nivel?: string;
  area?: string;
  activo: boolean;
  participantes: Participante[];
  createdAt?: string;
}

export interface Participante {
  id?: number;
  nombre: string;
  cedula?: string;
  email?: string;
}



// proyecto.model.ts
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
    tipo?: string | null;
    puntajeMaximo?: number | null;
    concursoNombre?: string | null;
    concursoId?: number | null;
  };
}
