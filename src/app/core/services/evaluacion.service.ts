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
   * Lista de evaluaciones individuales ya completadas por el evaluador,
   * con detalle (proyecto, porcentaje, fecha, etc.) — a diferencia de
   * /resumen que solo trae contadores agregados (total/completados/pendientes).
   */
  getMisResultados(): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/mis-resultados`).pipe(
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

  /**
   * Garantiza que el objeto "proyecto" embebido en cada asignación
   * siempre tenga sus arrays (participantes, etc.) definidos.
   */
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
   * Mapea la respuesta cruda del backend (nombres inconsistentes,
   * mezcla de camelCase/snake_case) a la forma que usa ResumenEvaluacion.
   * Prueba varios nombres posibles por campo; si tu backend usa uno
   * distinto al listado aquí, agrégalo al array de fallbacks correspondiente.
   */
  private normalizarResultado(item: any): ResumenEvaluacion {
    if (!item) return item;

    const pick = (obj: any, keys: string[], fallback: any = undefined) => {
      for (const k of keys) {
        if (obj?.[k] !== undefined && obj?.[k] !== null) return obj[k];
      }
      return fallback;
    };

    return {
      id: pick(item, ['id', 'evaluacion_id', 'evaluacionId']),
      proyectoNombre: pick(item, ['proyectoNombre', 'proyecto_nombre', 'proyecto'], 'Proyecto sin nombre'),
      concursoNombre: pick(item, ['concursoNombre', 'concurso_nombre', 'concurso']),
      evaluadorNombre: pick(item, ['evaluadorNombre', 'evaluador_nombre', 'evaluador']),
      fecha: pick(item, ['fecha', 'fecha_evaluacion', 'fechaEvaluacion', 'updated_at', 'created_at']),
      porcentaje: Number(pick(item, ['porcentaje', 'porcentaje_obtenido', 'porcentajeObtenido'], 0)),
      puntajeTotal: Number(pick(item, ['puntajeTotal', 'puntaje_total', 'puntaje'], 0)),
      puntajeMaximo: pick(item, ['puntajeMaximo', 'puntaje_maximo']) != null
        ? Number(pick(item, ['puntajeMaximo', 'puntaje_maximo']))
        : undefined,
    } as ResumenEvaluacion;
  }
}