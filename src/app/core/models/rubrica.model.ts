export interface Nivel {
  id: number;
  concursoId: number;
  nombre: string;
  puntaje: number;
  descripcion?: string | null;
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

/** Forma que entrega el backend al pedir la "configuración" completa de un concurso. */
export interface RubricaConcurso {
  concursoId: number;
  secciones: Seccion[];
  niveles: Nivel[];
}
