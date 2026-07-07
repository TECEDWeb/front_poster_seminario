export interface Participante {
  id: number;
  cedula: string;
  nombre: string;
  email?: string | null;
  telefono?: string | null;
  institucion?: string | null;

}

export interface Proyecto {
  id: number;
  concursoId?: number | null;
  nombre: string;
  nivel?: string | null;
  area?: string | null;
  descripcion?: string | null;
  activo?: boolean;
  participantes: Participante[];

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
