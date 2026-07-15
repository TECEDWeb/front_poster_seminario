import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { map, Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { Proyecto } from '../models/proyecto.model';

@Injectable({
  providedIn: 'root'
})
export class ProyectoService {

  private apiUrl = `${environment.apiUrl}/proyectos`;

  constructor(private http: HttpClient) {}

  listar(): Observable<Proyecto[]> {
    return this.http
      .get<{ ok: boolean; data: any[] }>(this.apiUrl)
      .pipe(
        map(res => (res.data ?? []).map(p => this.normalizarProyecto(p)))
      );
  }

  obtener(id: number): Observable<Proyecto> {
    return this.http.get<any>(`${this.apiUrl}/${id}`).pipe(
      map(res => this.normalizarProyecto(res?.data ?? res))
    );
  }

  crear(data: any): Observable<Proyecto> {
    return this.http.post<any>(this.apiUrl, data).pipe(
      map(res => this.normalizarProyecto(res?.data ?? res))
    );
  }

  actualizar(id: number, data: any): Observable<Proyecto> {
    return this.http.put<any>(`${this.apiUrl}/${id}`, data).pipe(
      map(res => this.normalizarProyecto(res?.data ?? res))
    );
  }

  eliminar(id: number): Observable<any> {
    return this.http.delete(`${this.apiUrl}/${id}`);
  }

  /**
   * El backend devuelve snake_case (concurso_id, estudiante_nombre, etc.)
   * Este mapeo lo traduce a camelCase para que el resto de la app
   * (páginas, formularios) trabaje siempre con nombres consistentes.
   */
  private normalizarProyecto(data: any): Proyecto {
    if (!data) return data;
    return {
      id: data.id,
      nombre: data.nombre || '',
      descripcion: data.descripcion || '',
      concursoId: data.concursoId ?? data.concurso_id ?? null,
      concursoNombre: data.concursoNombre ?? data.concurso_nombre ?? '',
      estudianteNombre: data.estudianteNombre ?? data.estudiante_nombre ?? '',
      nivel: data.nivel || '',
      area: data.area || '',
      activo: data.activo === 1 || data.activo === true,
      participantes: data.participantes || [],
      createdAt: data.createdAt ?? data.created_at ?? null
    } as Proyecto;
  }
}