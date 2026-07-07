import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

import { environment } from '../../../environments/environment';
import { Reporte, ReporteStats, Ranking } from '../models/reporte.model';

@Injectable({
  providedIn: 'root'
})
export class ReporteService {

  private apiUrl = `${environment.apiUrl}/reportes`;

  constructor(private http: HttpClient) {}

  /**
   * Estadísticas generales
   */
  getStats(): Observable<ReporteStats> {
    return this.http.get<ReporteStats>(`${this.apiUrl}/stats`);
  }

  /**
   * Ranking general
   */
  getRanking(): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/ranking`);
  }

  /**
   * Reportes agrupados por proyecto
   */
  getReporteProyectos(): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/proyectos`);
  }

  /**
   * Reporte completo
   */
  getReportes(): Observable<Reporte[]> {
    return this.http.get<Reporte[]>(`${this.apiUrl}`);
  }

  /**
   * Exportar Excel general
   */
  exportar(): Observable<Blob> {
    return this.http.get(`${this.apiUrl}/exportar`, {
      responseType: 'blob'
    });
  }

  /**
   * Exportar Excel de un proyecto específico
   */
  exportarProyecto(proyectoId: number): Observable<Blob> {
    return this.http.get(`${this.apiUrl}/exportar/proyecto/${proyectoId}`, {
      responseType: 'blob'
    });
  }
}