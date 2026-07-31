import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class AsignacionService {

  private apiUrl = `${environment.apiUrl}/asignaciones`;

  constructor(private http: HttpClient) {}

  // ============================================================
  // MÉTODOS EXISTENTES (NO MODIFICADOS)
  // ============================================================

  /**
   * Listar todas las asignaciones
   */
  listar(): Observable<any> {
    return this.http.get(this.apiUrl);
  }

  /**
   * Listar asignaciones con filtros
   */
  listarConFiltros(filtros?: {
    proyecto_id?: number;
    evaluador_id?: number;
    status?: string;
  }): Observable<any> {
    let params = new HttpParams();
    
    if (filtros) {
      Object.entries(filtros).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          params = params.set(key, value.toString());
        }
      });
    }

    return this.http.get(this.apiUrl, { params });
  }

  obtenerEvaluadores(): Observable<any> {
    console.log('📤 AsignacionService: Solicitando evaluadores desde /usuarios/evaluadores...');
    
    return this.http.get(`${environment.apiUrl}/usuarios/evaluadores`).pipe(
      map((res: any) => {
        console.log('📥 AsignacionService: Respuesta de evaluadores:', res);
        
        if (res && res.ok && res.data) {
          console.log(`✅ AsignacionService: ${res.data.length} evaluadores encontrados en 'data'`);
          return res.data;
        }
        
        if (Array.isArray(res)) {
          console.log(`✅ AsignacionService: ${res.length} evaluadores encontrados (array)`);
          return res;
        }
        
        if (res && res.usuarios) {
          console.log(`✅ AsignacionService: ${res.usuarios.length} evaluadores encontrados en 'usuarios'`);
          return res.usuarios;
        }
        
        console.warn('⚠️ AsignacionService: Formato de respuesta inesperado:', res);
        return [];
      })
    );
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
    console.log('📤 AsignacionService: Enviando asignación:', data);
    return this.http.post(this.apiUrl, data);
  }

  /**
   * Actualizar una asignación
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
   * Cambiar estado de una asignación
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
   * Obtener proyectos disponibles
   */
  getProyectos(): Observable<any> {
    return this.http.get(`${this.apiUrl}/proyectos`);
  }

  /**
   * Asignar múltiples proyectos y evaluadores
   */
  asignarMasivo(payload: { proyectosIds: number[], evaluadoresIds: number[], fechaLimite?: string | null }): Observable<any> {
    return this.http.post(`${this.apiUrl}/asignaciones/masivo`, payload);
  }

  // ============================================================
  // NUEVOS MÉTODOS AGREGADOS (NO AFECTAN LOS EXISTENTES)
  // ============================================================

  /**
   * Listar asignaciones por concurso
   * Este es el método que estaba faltando y causaba el error
   */
  listarPorConcurso(concursoId: number): Observable<any> {
    return this.http.get(`${this.apiUrl}/concurso/${concursoId}`).pipe(
      map(res => res)
    );
  }

  /**
   * Obtener asignaciones del evaluador autenticado
   */
  misAsignaciones(): Observable<any> {
    return this.http.get(`${this.apiUrl}/mis-asignaciones`).pipe(
      map(res => res)
    );
  }

  /**
   * Obtener asignaciones con detalles completos
   */
  listarConDetalles(concursoId: number): Observable<any> {
    return this.http.get(`${this.apiUrl}/detalles/${concursoId}`).pipe(
      map(res => res)
    );
  }

  /**
   * Asignar proyecto a evaluador (versión con objeto)
   */
  asignarProyecto(data: {
    proyectoId: number;
    evaluadorId: number;
    concursoId: number;
  }): Observable<any> {
    return this.http.post(`${this.apiUrl}/asignar`, data).pipe(
      map(res => res)
    );
  }

  /**
   * Asignar múltiples proyectos a un evaluador
   */
  asignarProyectosAEvaluador(data: {
    proyectoIds: number[];
    evaluadorId: number;
    concursoId: number;
  }): Observable<any> {
    return this.http.post(`${this.apiUrl}/asignar-proyectos`, data).pipe(
      map(res => res)
    );
  }

  /**
   * Asignar múltiples evaluadores a un proyecto
   */
  asignarEvaluadoresAProyecto(data: {
    proyectoId: number;
    evaluadorIds: number[];
    concursoId: number;
  }): Observable<any> {
    return this.http.post(`${this.apiUrl}/asignar-evaluadores`, data).pipe(
      map(res => res)
    );
  }

  /**
   * Desasignar proyecto
   */
  desasignarProyecto(asignacionId: number): Observable<any> {
    return this.http.delete(`${this.apiUrl}/${asignacionId}/desasignar`).pipe(
      map(res => res)
    );
  }

  /**
   * Reasignar proyecto a otro evaluador
   */
  reasignar(asignacionId: number, nuevoEvaluadorId: number): Observable<any> {
    return this.http.put(`${this.apiUrl}/${asignacionId}/reasignar`, {
      evaluadorId: nuevoEvaluadorId
    }).pipe(
      map(res => res)
    );
  }

  /**
   * Verificar si un proyecto está asignado a un evaluador
   */
  verificarAsignacion(proyectoId: number, evaluadorId: number): Observable<any> {
    return this.http.get(
      `${this.apiUrl}/verificar?proyectoId=${proyectoId}&evaluadorId=${evaluadorId}`
    ).pipe(
      map(res => res)
    );
  }

  /**
   * Verificar si un proyecto ya tiene asignaciones
   */
  verificarProyectoAsignado(proyectoId: number): Observable<any> {
    return this.http.get(`${this.apiUrl}/verificar-proyecto/${proyectoId}`).pipe(
      map(res => res)
    );
  }

  /**
   * Obtener estado de asignación de un evaluador
   */
  getEstadoEvaluador(evaluadorId: number, concursoId: number): Observable<any> {
    return this.http.get(
      `${this.apiUrl}/estado-evaluador/${evaluadorId}?concursoId=${concursoId}`
    ).pipe(
      map(res => res)
    );
  }

  /**
   * Obtener estadísticas de asignaciones
   */
  getEstadisticas(concursoId?: number): Observable<any> {
    const url = concursoId 
      ? `${this.apiUrl}/estadisticas/${concursoId}`
      : `${this.apiUrl}/estadisticas`;
    return this.http.get(url).pipe(
      map(res => res)
    );
  }

  /**
   * Obtener conteo de asignaciones por evaluador
   */
  getConteoPorEvaluador(concursoId: number): Observable<any> {
    return this.http.get(`${this.apiUrl}/conteo/${concursoId}`).pipe(
      map(res => res)
    );
  }

  /**
   * Obtener distribución de asignaciones
   */
  getDistribucion(concursoId: number): Observable<any> {
    return this.http.get(`${this.apiUrl}/distribucion/${concursoId}`).pipe(
      map(res => res)
    );
  }

  /**
   * Obtener proyectos disponibles para asignar
   */
  getProyectosDisponibles(concursoId: number): Observable<any> {
    return this.http.get(`${this.apiUrl}/proyectos-disponibles/${concursoId}`).pipe(
      map(res => res)
    );
  }

  /**
   * Obtener evaluadores disponibles
   */
  getEvaluadoresDisponibles(concursoId: number): Observable<any> {
    return this.http.get(`${this.apiUrl}/evaluadores-disponibles/${concursoId}`).pipe(
      map(res => res)
    );
  }

  /**
   * Obtener proyectos no asignados
   */
  getProyectosNoAsignados(concursoId: number): Observable<any> {
    return this.http.get(`${this.apiUrl}/proyectos-no-asignados/${concursoId}`).pipe(
      map(res => res)
    );
  }

  /**
   * Obtener proyectos asignados al evaluador con detalles
   */
  getProyectosAsignadosConDetalles(): Observable<any> {
    return this.http.get(`${this.apiUrl}/proyectos-asignados-detalles`).pipe(
      map(res => res)
    );
  }

  /**
   * Obtener detalles completos de asignación
   */
  getDetallesCompletos(asignacionId: number): Observable<any> {
    return this.http.get(`${this.apiUrl}/${asignacionId}/detalles-completos`).pipe(
      map(res => res)
    );
  }

  /**
   * Obtener asignaciones con proyectos y evaluadores
   */
  getAsignacionesCompletas(concursoId: number): Observable<any> {
    return this.http.get(`${this.apiUrl}/completas/${concursoId}`).pipe(
      map(res => res)
    );
  }

  /**
   * Actualizar estado de múltiples asignaciones
   */
  actualizarEstadosMasivo(ids: number[], estado: string): Observable<any> {
    return this.http.patch(`${this.apiUrl}/estados-masivo`, { ids, estado }).pipe(
      map(res => res)
    );
  }

  /**
   * Marcar asignación como completada
   */
  marcarCompletada(id: number): Observable<any> {
    return this.http.patch(`${this.apiUrl}/${id}/completada`, {}).pipe(
      map(res => res)
    );
  }

  /**
   * Exportar asignaciones a PDF
   */
  exportarPDF(concursoId: number): Observable<Blob> {
    return this.http.get(`${this.apiUrl}/exportar-pdf/${concursoId}`, {
      responseType: 'blob'
    });
  }

  /**
   * Exportar asignaciones a Excel
   */
  exportarExcel(concursoId: number): Observable<Blob> {
    return this.http.get(`${this.apiUrl}/exportar-excel/${concursoId}`, {
      responseType: 'blob'
    });
  }

  /**
   * Obtener asignaciones por concurso con filtros adicionales
   */
  listarPorConcursoConFiltros(concursoId: number, filtros?: {
    evaluadorId?: number;
    proyectoId?: number;
    estado?: string;
  }): Observable<any> {
    let params = new HttpParams();
    params = params.set('concursoId', concursoId.toString());
    
    if (filtros) {
      Object.entries(filtros).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          params = params.set(key, value.toString());
        }
      });
    }

    return this.http.get(`${this.apiUrl}/concurso-filtros`, { params }).pipe(
      map(res => res)
    );
  }

  /**
   * Contar asignaciones por concurso
   */
  contarPorConcurso(concursoId: number): Observable<any> {
    return this.http.get(`${this.apiUrl}/contar/${concursoId}`).pipe(
      map(res => res)
    );
  }

  /**
   * Obtener resumen de asignaciones por concurso
   */
  getResumen(concursoId: number): Observable<any> {
    return this.http.get(`${this.apiUrl}/resumen/${concursoId}`).pipe(
      map(res => res)
    );
  }
}