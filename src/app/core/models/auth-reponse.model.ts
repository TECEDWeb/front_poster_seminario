import { Usuario } from './usuario.model';

export interface LoginPayload {
  cedula: string;
  password: string;
}

export interface LoginResponse {
  token(arg0: string, token: any): unknown;
  ok: boolean;
  data: {
    token: string;
    usuario: Usuario;
  };
  mensaje?: string;
}

export interface ApiErrorResponse {
  ok: false;
  mensaje: string;
}