import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { Usuario, CrearUsuarioPayload } from '../models/usuario.model';

@Injectable({ providedIn: 'root' })
export class UsuarioService {

  private base = `${environment.apiUrl}/usuarios`;

  constructor(private http: HttpClient) {}

  listar(): Observable<{ ok: boolean; usuarios: Usuario[] }> {
    return this.http.get<{ ok: boolean; usuarios: Usuario[] }>(this.base);
  }

  /**
   * ✅ Obtener solo evaluadores
   */
  getEvaluadores(): Observable<{ ok: boolean; data: Usuario[] }> {
    console.log('📤 UsuarioService: Solicitando evaluadores...');
    return this.http.get<{ ok: boolean; data: Usuario[] }>(`${this.base}/evaluadores`);
  }

  crear(payload: CrearUsuarioPayload): Observable<Usuario> {
    return this.http.post<Usuario>(this.base, payload);
  }

  actualizar(id: number, payload: any): Observable<Usuario> {
    return this.http.put<Usuario>(`${this.base}/${id}`, payload);
  }

  cambiarEstado(id: number): Observable<any> {
    return this.http.patch(`${this.base}/${id}/estado`, {});
  }

  resetPassword(id: number, nuevaPassword?: string): Observable<{ ok: boolean; mensaje: string; data: { nuevaPassword: string } }> {
    return this.http.post<{ ok: boolean; mensaje: string; data: { nuevaPassword: string } }>(
      `${this.base}/${id}/reset-password`,
      nuevaPassword ? { nuevaPassword } : {}
    );
  }

  eliminar(id: number): Observable<any> {
    return this.http.delete(`${this.base}/${id}`);
  }
}