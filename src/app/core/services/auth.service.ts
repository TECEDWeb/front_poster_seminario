import { Injectable, signal, computed } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';
import { environment } from '../../../environments/environment';
import { StorageService } from './storage.service';
import { LoginPayload, LoginResponse } from '../models/auth-reponse.model';
import { Usuario, Rol } from '../models/usuario.model';

@Injectable({
  providedIn: 'root'
})
export class AuthService {

  // =========================
  // ESTADO - SIGNALS
  // =========================
  private _usuario = signal<Usuario | null>(null);
  private _token = signal<string | null>(null);
  private _cargado = signal(false);
  private _inicializando = signal(true);

  // Signals públicas
  readonly usuario = computed(() => this._usuario());
  readonly token = computed(() => this._token());
  readonly autenticado = computed(() => !!this._token() && !!this._usuario());
  readonly cargado = computed(() => this._cargado());
  readonly inicializando = computed(() => this._inicializando());

  // Roles
  readonly esAdministrador = computed(() => this._usuario()?.rol === 'admin');
  readonly esEvaluador = computed(() => this._usuario()?.rol === 'evaluador');
  readonly esCoordinador = computed(() => this._usuario()?.rol === 'coordinador');
  readonly nombreUsuario = computed(() => this._usuario()?.nombre || 'Usuario');
  readonly emailUsuario = computed(() => this._usuario()?.email || '');
  readonly inicialesUsuario = computed(() => {
    const nombre = this._usuario()?.nombre || '';
    if (!nombre) return '?';
    return nombre.split(' ').map(p => p[0]).join('').toUpperCase().slice(0, 2);
  });

  readonly rolLegible = computed(() => {
    const roles: Record<Rol, string> = {
      'admin': 'Administrador',
      'evaluador': 'Evaluador',
      'coordinador': 'Coordinador'
    };
    const rol = this._usuario()?.rol;
    return rol ? roles[rol] : '';
  });

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
    this._inicializando.set(true);
    this._cargado.set(false);

    try {
      await this.storage.init();
      
      // Sincronizar token entre localStorage y Capacitor
      await this.storage.sincronizarToken();
      
      const token = await this.storage.getToken();
      const usuario = await this.storage.getUsuario<Usuario>();

      console.log('🔐 Auth init - Token:', token ? '✅ Existe' : '❌ No existe');
      console.log('🔐 Auth init - Usuario:', usuario?.nombre || '❌ No existe');

      if (token) {
        this._token.set(token);
        // Guardar también en localStorage para debug
        localStorage.setItem('token', token);
      }

      if (usuario) {
        this._usuario.set(usuario);
        localStorage.setItem('usuario', JSON.stringify(usuario));
      }

    } catch (error) {
      console.error('❌ Error init auth:', error);
    } finally {
      this._cargado.set(true);
      this._inicializando.set(false);
    }
  }

  // =========================
  // LOGIN
  // =========================
  login(payload: LoginPayload): Observable<LoginResponse> {
    console.log('🔐 Intentando login con:', payload.cedula);
    
    return this.http.post<LoginResponse>(
      `${environment.apiUrl}/auth/login`,
      payload
    ).pipe(
      tap({
        next: async (response: LoginResponse) => {
          console.log('📊 Respuesta login:', response);
          
          if (response?.ok && response?.data?.token && response?.data?.usuario) {
            console.log('✅ Login exitoso, guardando sesión...');
            await this.setSession(response.data.usuario, response.data.token);
            
            // Sincronizar con localStorage para debug
            localStorage.setItem('token', response.data.token);
            localStorage.setItem('usuario', JSON.stringify(response.data.usuario));
            
            console.log('✅ Sesión guardada correctamente');
          } else {
            console.error('❌ Respuesta de login inválida:', response);
          }
        },
        error: (error) => {
          console.error('❌ Error en login:', error);
          console.error('   Status:', error.status);
          console.error('   Mensaje:', error.error?.mensaje || error.message);
        }
      })
    );
  }

  // =========================
  // SET SESSION
  // =========================
  async setSession(usuario: Usuario, token: string) {
    console.log('🔐 setSession - Token:', token.substring(0, 20) + '...');
    console.log('🔐 setSession - Usuario:', usuario.nombre, 'Rol:', usuario.rol);

    this._usuario.set(usuario);
    this._token.set(token);

    await this.storage.setToken(token);
    await this.storage.setUsuario(usuario);
    
    // Guardar también en localStorage para debug
    localStorage.setItem('token', token);
    localStorage.setItem('usuario', JSON.stringify(usuario));

    console.log('✅ Sesión establecida correctamente');
  }

  // =========================
  // LOGOUT
  // =========================
  async logout() {
    console.log('🔐 Cerrando sesión...');

    this._usuario.set(null);
    this._token.set(null);

    await this.storage.removeToken();
    await this.storage.removeUsuario();
    
    localStorage.removeItem('token');
    localStorage.removeItem('usuario');

    console.log('✅ Sesión cerrada correctamente');
  }

  // =========================
  // HELPERS - GETTERS
  // =========================
  obtenerUsuario(): Usuario | null {
    return this._usuario();
  }

  obtenerToken(): string | null {
    return this._token();
  }

  async obtenerTokenAsync(): Promise<string | null> {
    // Primero intentar con el token en memoria
    if (this._token()) {
      return this._token();
    }
    // Si no, obtener del storage
    const token = await this.storage.getToken();
    if (token) {
      this._token.set(token);
    }
    return token;
  }

  async obtenerUsuarioAsync(): Promise<Usuario | null> {
    return await this.storage.getUsuario<Usuario>();
  }

  getCurrentUser(): Usuario | null {
    return this._usuario();
  }

  getToken(): string | null {
    return this._token();
  }

  isAuthenticated(): boolean {
    return this.autenticado();
  }

  tieneRol(rol: Rol | Rol[]): boolean {
    const usuario = this._usuario();
    if (!usuario) return false;
    
    if (Array.isArray(rol)) {
      return rol.includes(usuario.rol);
    }
    return usuario.rol === rol;
  }

  esAdmin(): boolean {
    return this.esAdministrador();
  }

  esEval(): boolean {
    return this.esEvaluador();
  }

  esCoord(): boolean {
    return this.esCoordinador();
  }

  getNombreUsuario(): string {
    return this.nombreUsuario();
  }

  getEmailUsuario(): string {
    return this.emailUsuario();
  }

  getRolLegible(): string {
    return this.rolLegible();
  }

  getIniciales(): string {
    return this.inicialesUsuario();
  }

  // =========================
  // RUTAS
  // =========================
  rutaInicioSegunRol(): string {
    const usuario = this._usuario();
    if (!usuario) return '/login';
    switch (usuario.rol) {
      case 'admin': return '/admin/dashboard';
      case 'evaluador': return '/evaluador/dashboard';
      case 'coordinador': return '/coordinador/dashboard';
      default: return '/login';
    }
  }

  getRutasPermitidas(): string[] {
    const usuario = this._usuario();
    if (!usuario) return ['/login'];
    switch (usuario.rol) {
      case 'admin':
        return ['/admin', '/admin/dashboard', '/admin/usuarios', '/admin/concursos', '/admin/proyectos', '/admin/rubricas', '/admin/reportes', '/admin/asignaciones'];
      case 'evaluador':
        return ['/evaluador', '/evaluador/dashboard', '/evaluador/proyectos-asignados', '/evaluador/mis-resultados'];
      case 'coordinador':
        return ['/coordinador', '/coordinador/dashboard'];
      default:
        return ['/login'];
    }
  }

  // =========================
  // REFRESH / UPDATE
  // =========================
  async actualizarUsuario(usuario: Usuario) {
    this._usuario.set(usuario);
    await this.storage.setUsuario(usuario);
    localStorage.setItem('usuario', JSON.stringify(usuario));
    console.log('👤 Usuario actualizado:', usuario.nombre);
  }

  async actualizarToken(token: string) {
    this._token.set(token);
    await this.storage.setToken(token);
    localStorage.setItem('token', token);
    console.log('🔑 Token actualizado');
  }

  async recargarSesion() {
    const token = await this.storage.getToken();
    const usuario = await this.storage.getUsuario<Usuario>();

    if (token) {
      this._token.set(token);
      localStorage.setItem('token', token);
    }

    if (usuario) {
      this._usuario.set(usuario);
      localStorage.setItem('usuario', JSON.stringify(usuario));
    }

    console.log('🔄 Sesión recargada');
    return {
      token: this._token(),
      usuario: this._usuario()
    };
  }

  // =========================
  // FORZAR RECARGA DE SESIÓN
  // =========================
  async forzarRecargaSesion(): Promise<void> {
    console.log('🔄 Forzando recarga de sesión...');
    
    // Limpiar storage
    await this.storage.clear();
    
    // Recargar storage
    await this.storage.recargar();
    
    // Sincronizar
    await this.storage.sincronizarToken();
    
    // Intentar obtener token nuevamente
    const token = await this.storage.getToken();
    const usuario = await this.storage.getUsuario<Usuario>();
    
    if (token && usuario) {
      this._token.set(token);
      this._usuario.set(usuario);
      localStorage.setItem('token', token);
      localStorage.setItem('usuario', JSON.stringify(usuario));
      console.log('✅ Sesión recargada exitosamente');
    } else {
      this._token.set(null);
      this._usuario.set(null);
      localStorage.removeItem('token');
      localStorage.removeItem('usuario');
      console.log('⚠️ No se encontró sesión para recargar');
    }
  }

  // =========================
  // VERIFICACIÓN DE PERMISOS
  // =========================
  tienePermiso(ruta: string): boolean {
    const usuario = this._usuario();
    if (!usuario) return false;
    if (usuario.rol === 'admin') return true;
    if (usuario.rol === 'evaluador') {
      return ruta.startsWith('/evaluador');
    }
    if (usuario.rol === 'coordinador') {
      return ruta.startsWith('/coordinador') || ruta.startsWith('/evaluador');
    }
    return false;
  }

  puedeAcceder(modulo: string): boolean {
    const usuario = this._usuario();
    if (!usuario) return false;
    if (usuario.rol === 'admin') return true;

    const permisos: Record<Rol, string[]> = {
      'admin': [],
      'evaluador': ['evaluador', 'proyectos-asignados', 'mis-resultados', 'formulario-evaluacion'],
      'coordinador': ['evaluador', 'coordinador', 'proyectos-asignados', 'mis-resultados']
    };

    const modulosPermitidos = permisos[usuario.rol] || [];
    return modulosPermitidos.some(m => modulo.includes(m));
  }

  solicitarRecuperacion(email: string): Observable<any> {
    return this.http.post(`${environment.apiUrl}/auth/olvide-password`, { email });
  }

  resetearPassword(token: string, nuevaPassword: string): Observable<any> {
    return this.http.post(`${environment.apiUrl}/auth/resetear-password`, { token, nuevaPassword });
  }
}