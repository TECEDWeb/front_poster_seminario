export type Rol = 'administrador' | 'evaluador';

export interface Usuario {
  id: number;
  cedula: string;
  nombre: string;
  email: string | null;
  telefono?: string | null;
  rol: Rol;
  departamento?: string | null;
  activo?: boolean;
  createdAt?: string;
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
