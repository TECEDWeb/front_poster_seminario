import { Usuario } from './usuario.model';

// auth-reponse.model.ts
// auth-reponse.model.ts
export interface LoginPayload {
  cedula: string;
  password: string;
}

export interface LoginResponse {
  ok: boolean;
  mensaje?: string;
  data: {
    usuario: Usuario;
    token: string;
  };
}

export interface ApiErrorResponse {
  ok: false;
  mensaje: string;
}