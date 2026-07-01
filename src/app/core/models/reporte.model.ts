export interface Reporte {
  id: number;
  titulo: string;
  descripcion: string;
  tipo?: string;
  fecha?: string;
}

export interface ReporteStats {
  proyectos: number;
  evaluaciones: number;
  completadas?: number;
  promedio?: number;
}

export interface Ranking {
  nombre: string;
  promedio: number;
  evaluadorNombre?: string;
}