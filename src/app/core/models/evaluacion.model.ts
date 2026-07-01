export interface DetalleEvaluacion {
  criterioId: number;
  nivelId: number;
}

export interface Evaluacion {
  id: number;
  proyectoId: number;
  evaluadorId: number;
  fechaEvaluacion: string;
  observaciones?: string | null;
  detalles: DetalleEvaluacion[];
}

/**
 * Payload que envía el frontend al guardar una evaluación.
 * NOTA IMPORTANTE: nunca se envía evaluadorId desde el cliente.
 * El backend lo determina a partir del token (req.usuario.id),
 * exactamente para evitar que alguien evalúe "como si fuera" otro usuario.
 */
export interface GuardarEvaluacionPayload {
  proyectoId: number;
  observaciones?: string;
  detalles: DetalleEvaluacion[];
}

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
}
