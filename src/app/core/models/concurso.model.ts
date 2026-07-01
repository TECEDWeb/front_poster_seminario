export interface Concurso {
  id: number;
  nombre: string;
  descripcion?: string | null;
  tipo?: string | null;
  fechaInicio?: string | null;
  fechaFin?: string | null;
  puntajeMaximo?: number | null;
  activo: boolean;
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
