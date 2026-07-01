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

  // ==============================
  // STATE
  // ==============================

  private _usuario = signal<Usuario | null>(null);
  private _token = signal<string | null>(null);

  // Signals principales
  readonly usuario = computed(() => this._usuario());
  readonly token = computed(() => this._token());
  readonly autenticado = computed(() => !!this._token());

  // Alias para compatibilidad con código anterior
  readonly usuarioActual = computed(() => this._usuario());
  readonly estaAutenticado = computed(() => !!this._token());

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
    this.init();
  }

  // ==============================
  // INICIALIZAR SESIÓN
  // ==============================

  private async init() {
    try {
      const token = await this.storage.getToken();
      const usuario = await this.storage.getUsuario<Usuario>();

      if (token && usuario) {
        this._token.set(token);
        this._usuario.set(usuario);
      }
    } catch (error) {
      console.error('Error inicializando sesión:', error);
    }
  }

  // ==============================
  // LOGIN
  // ==============================

  login(payload: LoginPayload) {
    return this.http.post<LoginResponse>(
      `${environment.apiUrl}/auth/login`,
      payload
    );
  }

  // ==============================
  // GUARDAR SESIÓN
  // ==============================

  async setSession(usuario: Usuario, token: string) {
    this._usuario.set(usuario);
    this._token.set(token);

    await this.storage.setToken(token);
    await this.storage.setUsuario(usuario);

    localStorage.setItem('auth_token', token);
  }

  // ==============================
  // LOGOUT
  // ==============================

  async logout() {

    this._usuario.set(null);
    this._token.set(null);

    await this.storage.remove(TOKEN_KEY);
    await this.storage.remove(USUARIO_KEY);
  }

  // ==============================
  // GETTERS
  // ==============================

  obtenerUsuario(): Usuario | null {
    return this._usuario();
  }

  obtenerToken(): string | null {
    return this._token();
  }

  estaLogueado(): boolean {
    return !!this._token();
  }

  tieneToken(): boolean {
    return !!this._token();
  }

  // ==============================
  // VALIDACIÓN DE ROLES
  // ==============================

  esAdmin(): boolean {
    return this._usuario()?.rol === 'administrador';
  }

  esEvaluadorRol(): boolean {
    return this._usuario()?.rol === 'evaluador';
  }

  // ==============================
  // RUTA INICIAL
  // ==============================

  rutaInicioSegunRol(): string {

    const usuario = this._usuario();

    if (!usuario) {
      return '/login';
    }

    switch (usuario.rol) {

      case 'administrador':
        return '/admin/dashboard';

      case 'evaluador':
        return '/evaluador/proyectos-asignados';

      default:
        return '/login';
    }
  }
}