export type Rol = 'admin' | 'evaluador' | 'coordinador';

export interface Usuario {
  id: number;
  cedula: string;
  nombre: string;
  email?: string;
  rol: Rol;
  activo: boolean;
  telefono?: string;
  ultimoAcceso?: string;
}

export interface CrearUsuarioPayload {
  cedula: string;
  nombre: string;
  email?: string;
  telefono?: string;
  password: string;
  rol: Rol;
  departamento?: string;
}
