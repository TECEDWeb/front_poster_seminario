import { Usuario } from './usuario.model';

export interface LoginPayload {
  cedula: string;
  password: string;
}

export interface LoginResponse {
  ok: boolean;
  token: string;
  usuario: Usuario;
  mensaje?: string;
}

export interface ApiErrorResponse {
  ok: false;
  mensaje: string;
}
