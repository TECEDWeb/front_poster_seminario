export interface Firmante {
  nombre: string;
  titulo: string;
}

export interface Certificado {
  id: number;
  proyectoId?: number;
  concursoId?: number;
  rol?: 'participante' | 'tutor';
  codigo: string;
  entidadCertifica: string;
  tipoCertificado: string;
  nombre: string;
  cedula: string;
  nombreEvento?: string;
  categoriaActividad?: string;
  temaProyecto?: string;
  contenido: string;
  fechaEmision: string;
  lugar?: string;
  fechaEvento?: string;
  firmantes?: Firmante[];
  createdAt?: string;
}