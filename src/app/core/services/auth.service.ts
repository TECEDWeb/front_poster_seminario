import { Injectable, signal, computed } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment';
import { StorageService } from './storage.service';
import { LoginPayload, LoginResponse } from '../models/auth-reponse.model'; 
import { Usuario } from '../models/usuario.model';

const TOKEN_KEY = 'auth_token';
const USUARIO_KEY = 'auth_usuario';

@Injectable({
  providedIn: 'root'
})
export class AuthService {

  // =========================
  // STATE
  // =========================
  private _usuario = signal<Usuario | null>(null);
  private _token = signal<string | null>(null);

  readonly usuario = computed(() => this._usuario());
  readonly token = computed(() => this._token());
  readonly autenticado = computed(() => !!this._token());

  readonly esAdministrador = computed(() =>
    this._usuario()?.rol === 'administrador'
  );

  readonly esEvaluador = computed(() =>
    this._usuario()?.rol === 'evaluador'
  );

  constructor(
    private http: HttpClient,
    private storage: StorageService
  ) {
    // ⚠️ IMPORTANTE: se ejecuta pero NO bloquea UI
    this.init();
  }

  // =========================
  // INIT SEGURO
  // =========================
  private async init() {
    try {
      const token = await this.storage.getToken();
      const usuario = await this.storage.getUsuario<Usuario>();

      if (token && usuario) {
        this._token.set(token);
        this._usuario.set(usuario);
      }
    } catch (error) {
      console.error('Error init auth:', error);
    }
  }

  // =========================
  // LOGIN
  // =========================
  login(payload: LoginPayload) {
    return this.http.post<LoginResponse>(
      `${environment.apiUrl}/auth/login`,
      payload
    );
  }

  // =========================
  // GUARDAR SESIÓN
  // =========================
  async setSession(usuario: Usuario, token: string) {
    this._usuario.set(usuario);
    this._token.set(token);

    await this.storage.setToken(token);
    await this.storage.setUsuario(usuario);
  }

  // =========================
  // LOGOUT
  // =========================
  async logout() {
    this._usuario.set(null);
    this._token.set(null);

    await this.storage.remove(TOKEN_KEY);
    await this.storage.remove(USUARIO_KEY);
  }

  // =========================
  // HELPERS
  // =========================
  obtenerUsuario(): Usuario | null {
    return this._usuario();
  }

  obtenerToken(): string | null {
    return this._token();
  }

  // =========================
  // RUTA POR ROL
  // =========================
  rutaInicioSegunRol(): string {

    const usuario = this._usuario();

    if (!usuario) return '/login';

    switch (usuario.rol) {

      case 'administrador':
        return '/admin/dashboard';

      case 'evaluador':
        return '/evaluador/dashboard';

      default:
        return '/login';
    }
  }
}