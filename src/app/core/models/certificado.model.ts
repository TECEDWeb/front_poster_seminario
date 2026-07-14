export interface Certificado {
  id: number;
  codigo: string;
  entidadCertifica: string;
  tipoCertificado: string;
  nombre: string;
  cedula: string;
  contenido: string;
  fechaEmision: string;
  createdAt?: string;
}