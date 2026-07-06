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



export interface ProyectoAsignado {
  // ID DE LA EVALUACIÓN
  // ESTE ES EL QUE VA AL FORMULARIO
  evaluacionId: number;
  // Estado de la evaluación
  yaEvaluado: boolean;
  puedeEditar: boolean;
  proyecto: {
    id: number;
    nombre: string;
    descripcion?: string | null;
    participantes: Participante[];
    tipo?: string | null;
    puntajeMaximo?: number | null;

  };
}