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
  participantes?: number;
}

/**
 * Indica si, a la fecha actual, todavía  se pueden registrar/editar evaluaciones.
 */
export function concursoAceptaEvaluaciones(concurso: Concurso): boolean {
  if (!concurso.fechaFin) return true;
  const hoy = new Date();
  const fin = new Date(concurso.fechaFin);
  hoy.setHours(0, 0, 0, 0);
  fin.setHours(0, 0, 0, 0);
  return hoy <= fin;
}

/**
 * Obtener el estado del concurso en texto
 */
export function getEstadoConcurso(concurso: Concurso): string {
  if (!concurso.activo) return 'Inactivo';
  if (!concurso.fechaFin) return 'Activo';
  
  const hoy = new Date();
  const fin = new Date(concurso.fechaFin);
  hoy.setHours(0, 0, 0, 0);
  fin.setHours(0, 0, 0, 0);
  
  if (fin < hoy) return 'Finalizado';
  return 'Activo';
}

/**
 * Obtener color del estado para badges
 */
export function getEstadoColor(concurso: Concurso): string {
  const estado = getEstadoConcurso(concurso);
  switch (estado) {
    case 'Activo': return 'success';
    case 'Inactivo': return 'danger';
    case 'Finalizado': return 'warning';
    default: return 'medium';
  }
}