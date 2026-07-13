export interface Nivel {
  id: number;
  concursoId: number;
  nombre: string;
  puntaje: number;
  descripcion?: string | null;
  criterioId?: number | null; // si viene, es un override específico de ese criterio
}

export interface Criterio {
  id: number;
  seccionId: number;
  texto: string;
  orden: number;
}

export interface Seccion {
  id: number;
  concursoId: number;
  nombre: string;
  orden: number;
  descripcion?: string | null;
  criterios: Criterio[];
}

export interface RubricaConcurso {
  concursoId: number;
  secciones: Seccion[];
  niveles: Nivel[];
}