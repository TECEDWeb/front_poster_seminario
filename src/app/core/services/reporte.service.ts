import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class ReporteService {

  private apiUrl = `${environment.apiUrl}/reportes`;

  constructor(private http: HttpClient) {}

  // ============ MÉTODOS EXISTENTES ============

  getStats(): Observable<any> {
    return this.http.get(`${this.apiUrl}/stats`);
  }

  getRanking(): Observable<any> {
    return this.http.get(`${this.apiUrl}/ranking`);
  }

  getReporteProyectos(): Observable<any> {
    return this.http.get(`${this.apiUrl}/proyectos`);
  }

  getDetalleProyecto(proyectoId: number): Observable<any> {
    return this.http.get(`${this.apiUrl}/proyecto/${proyectoId}`);
  }

  getDetalleEvaluacion(evaluacionId: number): Observable<any> {
    return this.http.get(`${this.apiUrl}/evaluacion/${evaluacionId}/detalle`);
  }

  exportar(): Observable<Blob> {
    return this.http.get(`${this.apiUrl}/exportar`, { responseType: 'blob' });
  }

  exportarPDF(): Observable<Blob> {
    return this.http.get(`${this.apiUrl}/exportar-pdf`, { responseType: 'blob' });
  }

  exportarProyecto(proyectoId: number): Observable<Blob> {
    return this.http.get(`${this.apiUrl}/exportar/proyecto/${proyectoId}`, { responseType: 'blob' });
  }

  exportarPDFProyecto(proyectoId: number): Observable<Blob> {
    return this.http.get(`${this.apiUrl}/exportar-pdf/proyecto/${proyectoId}`, { responseType: 'blob' });
  }

  // ============ NUEVOS MÉTODOS AGREGADOS ============

  /**
   * Obtener estadísticas por concurso (para dashboard y reportes)
   */
  getStatsByConcurso(concursoId: number): Observable<any> {
    return this.http.get(`${this.apiUrl}/stats/concurso/${concursoId}`).pipe(
      map(res => res)
    );
  }

  /**
   * Exportar reporte a PDF por concurso
   */
  exportarPDFConcurso(concursoId: number): Observable<Blob> {
    return this.http.get(`${this.apiUrl}/exportar-pdf/concurso/${concursoId}`, { 
      responseType: 'blob' 
    });
  }

  /**
   * Exportar reporte a Excel por concurso
   */
  exportarExcelConcurso(concursoId: number): Observable<Blob> {
    return this.http.get(`${this.apiUrl}/exportar-excel/concurso/${concursoId}`, { 
      responseType: 'blob' 
    });
  }

  /**
   * Obtener estadísticas de evaluaciones por concurso
   */
  getStatsEvaluaciones(concursoId?: number): Observable<any> {
    const url = concursoId 
      ? `${this.apiUrl}/stats/evaluaciones/${concursoId}`
      : `${this.apiUrl}/stats/evaluaciones`;
    return this.http.get(url).pipe(
      map(res => res)
    );
  }

  /**
   * Obtener estadísticas de proyectos por concurso
   */
  getStatsProyectos(concursoId?: number): Observable<any> {
    const url = concursoId 
      ? `${this.apiUrl}/stats/proyectos/${concursoId}`
      : `${this.apiUrl}/stats/proyectos`;
    return this.http.get(url).pipe(
      map(res => res)
    );
  }

  /**
   * Obtener estadísticas de certificados por concurso
   */
  getStatsCertificados(concursoId?: number): Observable<any> {
    const url = concursoId 
      ? `${this.apiUrl}/stats/certificados/${concursoId}`
      : `${this.apiUrl}/stats/certificados`;
    return this.http.get(url).pipe(
      map(res => res)
    );
  }

  /**
   * Obtener reporte general por concurso
   */
  getReporteConcurso(concursoId: number): Observable<any> {
    return this.http.get(`${this.apiUrl}/concurso/${concursoId}`).pipe(
      map(res => res)
    );
  }

  /**
   * Exportar reporte a CSV
   */
  exportarCSV(concursoId: number): Observable<Blob> {
    return this.http.get(`${this.apiUrl}/exportar-csv/concurso/${concursoId}`, { 
      responseType: 'blob' 
    });
  }

  /**
   * Exportar reporte de evaluadores a PDF
   */
  exportarEvaluadoresPDF(concursoId: number): Observable<Blob> {
    return this.http.get(`${this.apiUrl}/exportar-pdf/evaluadores/${concursoId}`, { 
      responseType: 'blob' 
    });
  }

  /**
   * Exportar reporte de proyectos a Excel
   */
  exportarProyectosExcel(concursoId: number): Observable<Blob> {
    return this.http.get(`${this.apiUrl}/exportar-excel/proyectos/${concursoId}`, { 
      responseType: 'blob' 
    });
  }

  /**
   * Obtener dashboard completo de concurso
   */
  getDashboardConcurso(concursoId: number): Observable<any> {
    return this.http.get(`${this.apiUrl}/dashboard/${concursoId}`).pipe(
      map(res => res)
    );
  }

  /**
   * Obtener reporte personalizado con filtros
   */
  getReportePersonalizado(params: {
    concursoId?: number;
    fechaInicio?: string;
    fechaFin?: string;
    tipo?: string;
    categoria?: string;
  }): Observable<any> {
    return this.http.post(`${this.apiUrl}/personalizado`, params).pipe(
      map(res => res)
    );
  }

  /**
   * Obtener datos para gráficos
   */
  getGraficos(concursoId: number, tipo: 'barras' | 'pastel' | 'lineas'): Observable<any> {
    return this.http.get(`${this.apiUrl}/graficos/${concursoId}?tipo=${tipo}`).pipe(
      map(res => res)
    );
  }

  /**
   * Obtener distribución de evaluaciones
   */
  getDistribucionEvaluaciones(concursoId: number): Observable<any> {
    return this.http.get(`${this.apiUrl}/distribucion/${concursoId}`).pipe(
      map(res => res)
    );
  }

  /**
   * Obtener ranking de proyectos por concurso
   */
  getRankingProyectos(concursoId: number, limite?: number): Observable<any> {
    const url = limite 
      ? `${this.apiUrl}/ranking/${concursoId}?limite=${limite}`
      : `${this.apiUrl}/ranking/${concursoId}`;
    return this.http.get(url).pipe(
      map(res => res)
    );
  }

  /**
   * Obtener reporte de certificados emitidos
   */
  getReporteCertificados(concursoId?: number): Observable<any> {
    const url = concursoId 
      ? `${this.apiUrl}/certificados/${concursoId}`
      : `${this.apiUrl}/certificados`;
    return this.http.get(url).pipe(
      map(res => res)
    );
  }

  /**
   * Exportar reporte de certificados a PDF
   */
  exportarCertificadosPDF(concursoId: number): Observable<Blob> {
    return this.http.get(`${this.apiUrl}/exportar-pdf/certificados/${concursoId}`, { 
      responseType: 'blob' 
    });
  }

  /**
   * Obtener resumen ejecutivo del concurso
   */
  getResumenEjecutivo(concursoId: number): Observable<any> {
    return this.http.get(`${this.apiUrl}/resumen/${concursoId}`).pipe(
      map(res => res)
    );
  }

  /**
   * Exportar resumen ejecutivo a PDF
   */
  exportarResumenEjecutivo(concursoId: number): Observable<Blob> {
    return this.http.get(`${this.apiUrl}/exportar-pdf/resumen/${concursoId}`, { 
      responseType: 'blob' 
    });
  }

  /**
   * Obtener reporte de participantes
   */
  getReporteParticipantes(concursoId: number): Observable<any> {
    return this.http.get(`${this.apiUrl}/participantes/${concursoId}`).pipe(
      map(res => res)
    );
  }

  /**
   * Exportar reporte de participantes a Excel
   */
  exportarParticipantesExcel(concursoId: number): Observable<Blob> {
    return this.http.get(`${this.apiUrl}/exportar-excel/participantes/${concursoId}`, { 
      responseType: 'blob' 
    });
  }

  /**
   * Obtener estadísticas generales del sistema
   */
  getEstadisticasGenerales(): Observable<any> {
    return this.http.get(`${this.apiUrl}/estadisticas-generales`).pipe(
      map(res => res)
    );
  }

  /**
   * Obtener reporte de evaluación por evaluador
   */
  getReporteEvaluador(evaluadorId: number, concursoId?: number): Observable<any> {
    const url = concursoId 
      ? `${this.apiUrl}/evaluador/${evaluadorId}?concursoId=${concursoId}`
      : `${this.apiUrl}/evaluador/${evaluadorId}`;
    return this.http.get(url).pipe(
      map(res => res)
    );
  }

  /**
   * Exportar reporte de evaluador a PDF
   */
  exportarEvaluadorPDF(evaluadorId: number, concursoId?: number): Observable<Blob> {
    const url = concursoId 
      ? `${this.apiUrl}/exportar-pdf/evaluador/${evaluadorId}?concursoId=${concursoId}`
      : `${this.apiUrl}/exportar-pdf/evaluador/${evaluadorId}`;
    return this.http.get(url, { responseType: 'blob' });
  }
}