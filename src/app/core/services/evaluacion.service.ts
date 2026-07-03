import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

import { environment } from '../../../environments/environment';
import { Evaluacion, ResumenEvaluacion } from '../models/evaluacion.model';

@Injectable({
  providedIn: 'root'
})
export class EvaluacionService {

  private apiUrl = `${environment.apiUrl}/evaluaciones`;

  constructor(private http: HttpClient) {}

  // =====================================================
  // CRUD BÁSICO
  // =====================================================

  listar(): Observable<Evaluacion[]> {
    return this.http.get<Evaluacion[]>(this.apiUrl);
  }

  obtener(id: number): Observable<Evaluacion> {
    return this.http.get<Evaluacion>(`${this.apiUrl}/${id}`);
  }

  crear(data: Evaluacion): Observable<any> {
    return this.http.post(this.apiUrl, data);
  }

  actualizar(id: number, data: Evaluacion): Observable<any> {
    return this.http.put(`${this.apiUrl}/${id}`, data);
  }

  eliminar(id: number): Observable<any> {
    return this.http.delete(`${this.apiUrl}/${id}`);
  }

  // =====================================================
  // DASHBOARD / RESUMEN
  // =====================================================

  listarResumen(): Observable<ResumenEvaluacion[]> {
    return this.http.get<ResumenEvaluacion[]>(`${this.apiUrl}/resumen`);
  }

  getResumen(): Observable<any> {
    return this.http.get(`${this.apiUrl}/resumen`);
  }

  getMisResultados(): Observable<any> {
    return this.http.get(`${this.apiUrl}/mis-resultados`);
  }

  getAsignados(): Observable<any> {
    return this.http.get(`${this.apiUrl}/asignados`);
  }

  // =====================================================
  // FORMULARIO DE EVALUACIÓN (NUEVO)
  // =====================================================

  /**
   * Trae rúbrica + secciones + criterios + niveles
   */
  getFormulario(id: number): Observable<any> {
    return this.http.get(`${this.apiUrl}/${id}/formulario`);
  }

  /**
   * Guarda evaluación con detalles
   */
  guardar(id: number, payload: any): Observable<any> {
    return this.http.post(`${this.apiUrl}/${id}/guardar`, payload);
  }
}