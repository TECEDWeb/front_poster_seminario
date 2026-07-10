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

  listar(): Observable<any> {
    return this.http.get(`${this.apiUrl}`);
  }

  obtener(id: number): Observable<any> {
    return this.http.get(`${this.apiUrl}/${id}`);
  }

  crear(data: any): Observable<any> {
    return this.http.post(`${this.apiUrl}`, data);
  }

  actualizar(id: number, data: any): Observable<any> {
    return this.http.put(`${this.apiUrl}/${id}`, data);
  }

  eliminar(id: number): Observable<any> {
    return this.http.delete(`${this.apiUrl}/${id}`);
  }

  listarResumen(): Observable<any> {
    return this.http.get(`${this.apiUrl}/resumen`);
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

  getReporteAdmin(): Observable<any> {
    return this.http.get(`${this.apiUrl}/reporte-admin`);
  }

  getFormulario(id: number): Observable<any> {
    return this.http.get(`${this.apiUrl}/${id}/formulario`);
  }

  guardar(id: number, payload: any): Observable<any> {
    return this.http.post(`${this.apiUrl}/${id}/guardar`, payload);
  }
}