import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

import { environment } from '../../../environments/environment';
import { Evaluacion, ResumenEvaluacion } from '../models/evaluacion.model';

@Injectable({
  providedIn: 'root'
})
export class EvaluacionService {

  private apiUrl = `${environment.apiUrl}/evaluaciones`;
  private evaluadorApiUrl = `${environment.apiUrl}/evaluador`;

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

  /**
   * Lista de evaluaciones completadas con detalle real
   * (proyecto, porcentaje, puntaje, fecha).
   * IMPORTANTE: usa /api/evaluador/mis-resultados, NO /api/evaluaciones/mis-resultados
   * — este último solo devuelve {nombre, observaciones, estado}, sin id ni porcentaje.
   */
  getMisResultados(): Observable<any> {
    return this.http.get<any>(`${this.evaluadorApiUrl}/mis-resultados`).pipe(
      map((res: any) => {
        const data = res?.data ?? res ?? [];
        const lista = Array.isArray(data) ? data : (data ? [data] : []);
        return {
          ...res,
          data: lista.map((item: any) => this.normalizarResultado(item))
        };
      })
    );
  }

  /**
   * Detalle de una evaluación ya completada, con el desglose
   * sección → criterio → nivel elegido, en forma de lista plana.
   */
  getResultadoDetalle(id: number): Observable<any> {
    return this.http.get<any>(`${this.evaluadorApiUrl}/resultado/${id}`);
  }

  getAsignados(): Observable<any> {
    return this.http.get(`${this.apiUrl}/asignados`).pipe(
      map((res: any) => {
        const data = res?.data ?? res ?? [];
        const lista = Array.isArray(data) ? data : (data ? [data] : []);
        return {
          ...res,
          data: lista.map((item: any) => this.normalizarAsignado(item))
        };
      })
    );
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

  private normalizarAsignado(item: any): any {
    if (!item) return item;
    return {
      ...item,
      proyecto: item.proyecto
        ? {
            ...item.proyecto,
            participantes: item.proyecto.participantes || []
          }
        : item.proyecto
    };
  }

  /**
   * El endpoint correcto ya devuelve los nombres que necesitamos
   * (id, proyectoNombre, concursoNombre, evaluadorNombre, fecha,
   * puntajeTotal, puntajeMaximo, porcentaje). Solo forzamos tipos
   * numéricos porque MySQL puede devolver DECIMAL/SUM como string.
   */
  private normalizarResultado(item: any): ResumenEvaluacion {
    if (!item) return item;
    return {
      id: item.id,
      proyectoNombre: item.proyectoNombre || 'Proyecto sin nombre',
      concursoNombre: item.concursoNombre,
      evaluadorNombre: item.evaluadorNombre,
      fecha: item.fecha,
      porcentaje: item.porcentaje != null ? Number(item.porcentaje) : 0,
      puntajeTotal: item.puntajeTotal != null ? Number(item.puntajeTotal) : 0,
      puntajeMaximo: item.puntajeMaximo != null ? Number(item.puntajeMaximo) : undefined,
    } as ResumenEvaluacion;
  }
}