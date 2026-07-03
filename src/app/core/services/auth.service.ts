import { Injectable, signal, computed } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment';
import { StorageService } from './storage.service';
import { LoginPayload, LoginResponse } from '../models/auth-reponse.model';
import { Usuario } from '../models/usuario.model';

@Injectable({
  providedIn: 'root'
})
export class AuthService {

  // =========================
  // ESTADO
  // =========================
  private _usuario = signal<Usuario | null>(null);
  private _token = signal<string | null>(null);
  private _cargado = signal(false);
  private tokenCache: string | null = null;
  readonly usuario = computed(() => this._usuario());
  readonly token = computed(() => this._token());
  readonly autenticado = computed(() => !!this._token());
  readonly cargado = computed(() => this._cargado());

  readonly esAdministrador = computed(() =>
    this._usuario()?.rol === 'admin'
  );

  readonly esEvaluador = computed(() =>
    this._usuario()?.rol === 'evaluador'
  );

  constructor(
    private http: HttpClient,
    private storage: StorageService
  ) {
    this.init();
  }

  // =========================
  // INIT SESIÓN
  // =========================
  private async init() {
    try {
      const token = await this.storage.getToken();
      const usuario = await this.storage.getUsuario<Usuario>();

      if (token) {
        this._token.set(token);
        this.tokenCache = token;
      }

      if (usuario) {
        this._usuario.set(usuario);
      }

    } catch (error) {
      console.error('Error init auth:', error);
    } finally {
      this._cargado.set(true);
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
  // SET SESSION
  // =========================
  async setSession(usuario: Usuario, token: string) {

    this._usuario.set(usuario);
    this._token.set(token);
    this.tokenCache = token;

    await this.storage.setToken(token);
    await this.storage.setUsuario(usuario);
  }

  // =========================
  // LOGOUT
  // =========================
  async logout() {

    this._usuario.set(null);
    this._token.set(null);

    await this.storage.removeToken();
    await this.storage.removeUsuario();
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

  obtenerTokenSync(): string | null {
  return this._token() || this.tokenCache;
}

  // =========================
  // RUTAS
  // =========================
  rutaInicioSegunRol(): string {

    const usuario = this._usuario();

    if (!usuario) return '/login';

    switch (usuario.rol) {

      case 'admin':
        return '/admin/dashboard';

      case 'evaluador':
        return '/evaluador/dashboard';

      default:
        return '/login';
    }
  }
}