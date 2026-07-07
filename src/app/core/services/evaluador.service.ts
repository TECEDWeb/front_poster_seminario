// evaluador.service.ts
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
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
    return this.http.get(`${this.apiUrl}/dashboard-stats`);
  }

  /**
   * Obtener proyectos asignados
   */
  getProyectosAsignados(): Observable<any> {
    return this.http.get(`${this.apiUrl}/proyectos-asignados`);
  }

  /**
   * Obtener detalles de un proyecto asignado
   */
  getProyectoAsignado(id: number): Observable<any> {
    return this.http.get(`${this.apiUrl}/proyecto/${id}`);
  }

  /**
   * Guardar evaluación de un proyecto
   */
  guardarEvaluacion(data: any): Observable<any> {
    return this.http.post(`${this.apiUrl}/evaluacion`, data);
  }

  /**
   * Obtener resultados del evaluador
   */
  getMisResultados(): Observable<any> {
    return this.http.get(`${this.apiUrl}/mis-resultados`);
  }

  /**
   * Obtener detalle de un resultado
   */
  getResultadoDetalle(id: number): Observable<any> {
    return this.http.get(`${this.apiUrl}/resultado/${id}`);
  }

  /**
   * Listar evaluadores (para asignaciones)
   */
  listar(): Observable<any> {
    return this.http.get(`${this.apiUrl}/listar`);
  }
}