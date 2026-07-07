export type Rol = 'admin' | 'evaluador' | 'coordinador';

export interface Usuario {
  id: number;
  cedula: string;
  nombre: string;
  email?: string | null;
  rol: Rol;
  activo: boolean;
  telefono?: string | null;
  ultimoAcceso?: string | null;
  createdAt?: string;
  updatedAt?: string;
}

export interface CrearUsuarioPayload {
  cedula: string;
  nombre: string;
  email?: string | null;
  rol: Rol;
  activo: boolean;
  telefono?: string | null;
  password: string;
}

export interface ActualizarUsuarioPayload {
  cedula?: string;
  nombre?: string;
  email?: string | null;
  rol?: Rol;
  activo?: boolean;
  telefono?: string | null;
  password?: string;
}