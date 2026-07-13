import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class ReporteService {

  private apiUrl = `${environment.apiUrl}/reportes`;

  constructor(private http: HttpClient) {}

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

  /**
   * NUEVO: detalle completo de una evaluación individual —
   * respuestas sección → criterio → nivel elegido, con puntajes.
   */
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
}