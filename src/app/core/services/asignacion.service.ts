import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class AsignacionService {

  private apiUrl = `${environment.apiUrl}/asignaciones`;

  constructor(private http: HttpClient) {}

  /**
   * Listar todas las asignaciones
   */
  listar(): Observable<any> {
    return this.http.get(this.apiUrl);
  }

  /**
   * Listar asignaciones con filtros opcionales
   */
  listarConFiltros(filtros?: {
    proyecto_id?: number;
    evaluador_id?: number;
    status?: string;
    fecha_desde?: string;
    fecha_hasta?: string;
  }): Observable<any> {
    let params = new HttpParams();
    
    if (filtros) {
      Object.entries(filtros).forEach(([key, value]) => {
        if (value !== undefined && value !== null && value !== '') {
          params = params.set(key, value.toString());
        }
      });
    }

    return this.http.get(this.apiUrl, { params });
  }

  /**
   * Listar asignaciones recientes (últimas 10 o según límite)
   */
  listarRecientes(limite: number = 10): Observable<any> {
    const params = new HttpParams()
      .set('recientes', 'true')
      .set('limite', limite.toString());

    return this.http.get(`${this.apiUrl}/recientes`, { params });
  }

  /**
   * Obtener una asignación por ID
   */
  obtenerPorId(id: number): Observable<any> {
    return this.http.get(`${this.apiUrl}/${id}`);
  }

  /**
   * Crear una nueva asignación
   */
  asignar(data: any): Observable<any> {
    return this.http.post(this.apiUrl, data);
  }

  /**
   * Actualizar una asignación existente
   */
  actualizar(id: number, data: any): Observable<any> {
    return this.http.put(`${this.apiUrl}/${id}`, data);
  }

  /**
   * Eliminar una asignación
   */
  eliminar(id: number): Observable<any> {
    return this.http.delete(`${this.apiUrl}/${id}`);
  }

  /**
   * Cambiar el estado de una asignación
   */
  cambiarEstado(id: number, status: string): Observable<any> {
    return this.http.patch(`${this.apiUrl}/${id}/estado`, { status });
  }

  /**
   * Obtener asignaciones por proyecto
   */
  listarPorProyecto(proyectoId: number): Observable<any> {
    return this.http.get(`${this.apiUrl}/proyecto/${proyectoId}`);
  }

  /**
   * Obtener asignaciones por evaluador
   */
  listarPorEvaluador(evaluadorId: number): Observable<any> {
    return this.http.get(`${this.apiUrl}/evaluador/${evaluadorId}`);
  }

  /**
   * Obtener estadísticas de asignaciones
   */
  obtenerEstadisticas(): Observable<any> {
    return this.http.get(`${this.apiUrl}/estadisticas`);
  }

  /**
   * Asignación masiva (múltiples proyectos a un evaluador)
   */
  asignarMasiva(data: {
    evaluador_id: number;
    proyecto_ids: number[];
  }): Observable<any> {
    return this.http.post(`${this.apiUrl}/masiva`, data);
  }

  /**
   * Verificar disponibilidad de evaluador
   */
  verificarDisponibilidad(evaluadorId: number, fechaInicio: string, fechaFin: string): Observable<any> {
    const params = new HttpParams()
      .set('evaluador_id', evaluadorId.toString())
      .set('fecha_inicio', fechaInicio)
      .set('fecha_fin', fechaFin);

    return this.http.get(`${this.apiUrl}/disponibilidad`, { params });
  }

  /**
   * Obtener historial de asignaciones de un evaluador
   */
  historialEvaluador(evaluadorId: number): Observable<any> {
    return this.http.get(`${this.apiUrl}/historial/evaluador/${evaluadorId}`);
  }

  /**
   * Obtener historial de asignaciones de un proyecto
   */
  historialProyecto(proyectoId: number): Observable<any> {
    return this.http.get(`${this.apiUrl}/historial/proyecto/${proyectoId}`);
  }

  /**
   * Reasignar proyecto a otro evaluador
   */
  reasignar(asignacionId: number, nuevoEvaluadorId: number): Observable<any> {
    return this.http.patch(`${this.apiUrl}/${asignacionId}/reasignar`, {
      evaluador_id: nuevoEvaluadorId
    });
  }
}