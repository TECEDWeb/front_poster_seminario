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
  // ESTADO REACTIVO
  // =========================
  private _usuario = signal<Usuario | null>(null);
  private _token = signal<string | null>(null);
  private _cargado = signal(false);

  // 🔥 CACHE CRÍTICO (FIX 401)
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
  // INICIALIZAR SESIÓN
  // =========================
  private async init() {
    try {
      const token = await this.storage.getToken();
      const usuario = await this.storage.getUsuario<Usuario>();

      if (token) {
        this._token.set(token);
        this.tokenCache = token; // 🔥 IMPORTANTE
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
  // GUARDAR SESIÓN
  // =========================
  async setSession(usuario: Usuario, token: string) {

    this._usuario.set(usuario);
    this._token.set(token);

    // 🔥 CACHE INMEDIATO (CRÍTICO)
    this.tokenCache = token;

    // persistencia
    await this.storage.setToken(token);
    await this.storage.setUsuario(usuario);

    // fallback extra (opcional pero útil)
    localStorage.setItem('auth_token', token);
  }

  // =========================
  // LOGOUT
  // =========================
  async logout() {

    this._usuario.set(null);
    this._token.set(null);

    this.tokenCache = null;

    await this.storage.removeToken();
    await this.storage.removeUsuario();

    localStorage.removeItem('auth_token');
  }

  // =========================
  // HELPERS
  // =========================
  obtenerUsuario(): Usuario | null {
    return this._usuario();
  }

  obtenerToken(): string | null {
    return this.tokenCache ?? this._token();
  }

  // =========================
  // REDIRECCIÓN POR ROL
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