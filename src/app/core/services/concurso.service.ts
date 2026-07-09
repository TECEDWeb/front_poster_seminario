import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

import { environment } from '../../../environments/environment';
import { Concurso } from '../models/concurso.model';

@Injectable({
  providedIn: 'root'
})
export class ConcursoService {

  private apiUrl = `${environment.apiUrl}/concursos`;

  constructor(private http: HttpClient) {}

  /**
   * Listar todos los concursos
   */
  listar(): Observable<Concurso[]> {
    return this.http.get<any>(this.apiUrl).pipe(
      map((res: any) => {
        // Normalizar respuesta: soportar { data: [...] } o array directo
        const data = res?.data ?? res?.concursos ?? res ?? [];
        return Array.isArray(data) ? data.map((item: any) => this.mapearConcurso(item)) : [];
      })
    );
  }

  /**
   * Obtener concurso por ID
   */
  obtenerPorId(id: number): Observable<Concurso> {
    return this.http.get<any>(`${this.apiUrl}/${id}`).pipe(
      map((res: any) => {
        const data = res?.data ?? res ?? {};
        return this.mapearConcurso(data);
      })
    );
  }

  /**
   * Crear un nuevo concurso
   */
  crear(data: any): Observable<Concurso> {
    // Convertir nombres de campos para el backend (camelCase a snake_case)
    const payload = this.mapearParaBackend(data);
    
    return this.http.post<any>(this.apiUrl, payload).pipe(
      map((res: any) => {
        const result = res?.data ?? res ?? {};
        return this.mapearConcurso(result);
      })
    );
  }

  /**
   * Actualizar un concurso existente
   */
  actualizar(id: number, data: any): Observable<Concurso> {
    const payload = this.mapearParaBackend(data);
    
    return this.http.put<any>(`${this.apiUrl}/${id}`, payload).pipe(
      map((res: any) => {
        const result = res?.data ?? res ?? {};
        return this.mapearConcurso(result);
      })
    );
  }

  /**
   * Eliminar un concurso
   */
  eliminar(id: number): Observable<any> {
    return this.http.delete(`${this.apiUrl}/${id}`);
  }

  /**
   * Cambiar estado de un concurso (activo/inactivo)
   */
  cambiarEstado(id: number): Observable<any> {
    return this.http.patch(`${this.apiUrl}/${id}/estado`, {});
  }

  /**
   * Obtener concursos activos
   */
  listarActivos(): Observable<Concurso[]> {
    return this.listar().pipe(
      map((concursos: Concurso[]) => concursos.filter(c => c.activo))
    );
  }

  /**
   * Obtener concursos finalizados
   */
  listarFinalizados(): Observable<Concurso[]> {
    return this.listar().pipe(
      map((concursos: Concurso[]) => {
        const hoy = new Date();
        hoy.setHours(0, 0, 0, 0);
        return concursos.filter(c => {
          if (!c.fechaFin) return false;
          const fin = new Date(c.fechaFin);
          fin.setHours(0, 0, 0, 0);
          return fin < hoy;
        });
      })
    );
  }

  /**
   * Mapear datos del backend al modelo Concurso (camelCase)
   */
  private mapearConcurso(data: any): Concurso {
    return {
      id: data.id || 0,
      nombre: data.nombre || '',
      descripcion: data.descripcion || '',
      tipo: data.tipo || '',
      categoria: data.categoria || '',
      activo: data.activo ?? true,
      fechaInicio: data.fecha_inicio || data.fechaInicio || '',
      fechaFin: data.fecha_fin || data.fechaFin || '',
      puntajeMaximo: data.puntaje_maximo || data.puntajeMaximo || null,
      participantes: data.participantes || 0
    };
  }

  /**
   * Mapear del modelo al backend (snake_case)
   */
  private mapearParaBackend(data: any): any {
    return {
      nombre: data.nombre,
      descripcion: data.descripcion || null,
      tipo: data.tipo || null,
      fecha_inicio: data.fechaInicio || null,
      fecha_fin: data.fechaFin || null,
      puntaje_maximo: data.puntajeMaximo || null,
      activo: data.activo ?? true
    };
  }
}