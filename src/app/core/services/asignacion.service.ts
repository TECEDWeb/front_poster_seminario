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

  /**
   * Obtener evaluadores disponibles
   * Usa el endpoint de usuarios con filtro de rol
   */
  obtenerEvaluadores(): Observable<any> {
    // Intentar con el endpoint correcto
    return this.http.get(`${environment.apiUrl}/usuarios?rol=evaluador`).pipe(
      map((res: any) => {
        // Normalizar respuesta
        return res?.data ?? res?.usuarios ?? res ?? [];
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
}