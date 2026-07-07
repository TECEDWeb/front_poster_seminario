// concurso.model.ts
export interface Concurso {
  id: number;
  nombre: string;
  descripcion?: string;
  tipo?: string;
  categoria?: string;
  activo?: boolean;
  fechaInicio?: string;
  fechaFin?: string;
  puntajeMaximo?: number;
  participantes?: number; // Añadir esta propiedad
  // ... otras propiedades
}

/** Indica si, a la fecha actual, todavía se pueden registrar/editar evaluaciones. */
export function concursoAceptaEvaluaciones(concurso: Concurso): boolean {
  if (!concurso.fechaFin) return true;
  const hoy = new Date();
  const fin = new Date(concurso.fechaFin);
  // Comparamos solo la fecha (sin horas) para evitar problemas de huso horario.
  hoy.setHours(0, 0, 0, 0);
  fin.setHours(0, 0, 0, 0);
  return hoy <= fin;
}
