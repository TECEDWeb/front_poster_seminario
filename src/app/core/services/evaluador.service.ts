import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class EvaluadorService {

  private apiUrl = `${environment.apiUrl}/evaluador`;

  constructor(private http: HttpClient) {}

  /**
   * Obtener estadísticas del dashboard
   */
  getDashboardStats(): Observable<any> {
    return this.http.get(`${this.apiUrl}/dashboard-stats`).pipe(
      map((res: any) => res?.data ?? res ?? {})
    );
  }

  /**
   * Obtener actividades recientes del evaluador
   */
  getActividadesRecientes(): Observable<any> {
    return this.http.get(`${this.apiUrl}/actividades-recientes`).pipe(
      map((res: any) => res?.data ?? res ?? [])
    );
  }

  /**
   * Obtener proyectos asignados al evaluador
   */
  getProyectosAsignados(): Observable<any> {
    return this.http.get(`${this.apiUrl}/proyectos-asignados`).pipe(
      map((res: any) => res?.data ?? res ?? [])
    );
  }

  /**
   * Obtener detalles de un proyecto asignado específico
   */
  getProyectoAsignado(id: number): Observable<any> {
    return this.http.get(`${this.apiUrl}/proyecto/${id}`).pipe(
      map((res: any) => res?.data ?? res ?? {})
    );
  }

  /**
   * Guardar evaluación de un proyecto
   */
  guardarEvaluacion(data: any): Observable<any> {
    return this.http.post(`${this.apiUrl}/evaluacion`, data);
  }

  /**
   * Obtener resultados del evaluador (mis evaluaciones)
   */
  getMisResultados(): Observable<any> {
    return this.http.get(`${this.apiUrl}/mis-resultados`).pipe(
      map((res: any) => res?.data ?? res ?? [])
    );
  }

  /**
   * Obtener detalle de un resultado específico
   */
  getResultadoDetalle(id: number): Observable<any> {
    return this.http.get(`${this.apiUrl}/resultado/${id}`).pipe(
      map((res: any) => res?.data ?? res ?? {})
    );
  }

  /**
   * Listar evaluadores (para asignaciones - admin)
   */
  listar(): Observable<any> {
    return this.http.get(`${this.apiUrl}/listar`).pipe(
      map((res: any) => res?.data ?? res ?? [])
    );
  }

  /**
   * Contar notificaciones no leídas
   */
  contarNotificaciones(): Observable<number> {
    return this.http.get(`${this.apiUrl}/notificaciones/contar`).pipe(
      map((res: any) => res?.data?.count ?? 0)
    );
  }

  /**
   * Marcar notificaciones como leídas
   */
  marcarNotificacionesLeidas(): Observable<any> {
    return this.http.post(`${this.apiUrl}/notificaciones/leer`, {});
  }

  /**
   * Obtener perfil del evaluador
   */
  getPerfil(): Observable<any> {
    return this.http.get(`${this.apiUrl}/perfil`).pipe(
      map((res: any) => res?.data ?? res ?? {})
    );
  }

  /**
   * Actualizar perfil del evaluador
   */
  actualizarPerfil(data: any): Observable<any> {
    return this.http.put(`${this.apiUrl}/perfil`, data);
  }
}