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
      .get<{ ok: boolean; data: Proyecto[] }>(this.apiUrl)
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
    console.log('📤 crear proyecto - Datos recibidos:', data);
    if (!data.estudiante_nombre) {
      console.error('❌ Error: estudiante_nombre es obligatorio');
    }
    return this.http.post<any>(this.apiUrl, data).pipe(
      map(res => this.normalizarProyecto(res?.data ?? res))
    );
  }

  actualizar(id: number, data: any): Observable<Proyecto> {
    console.log('📤 actualizar proyecto - ID:', id, 'Datos:', data);
    return this.http.put<any>(`${this.apiUrl}/${id}`, data).pipe(
      map(res => this.normalizarProyecto(res?.data ?? res))
    );
  }

  eliminar(id: number): Observable<any> {
    console.log('🗑️ eliminar proyecto - ID:', id);
    return this.http.delete(`${this.apiUrl}/${id}`);
  }

  /**
   * Garantiza que los arrays que el backend a veces omite
   * (participantes, etc.) siempre lleguen como array, nunca undefined/null.
   * Esto evita errores en tiempo de ejecución en templates que usan
   * .length directo sin optional chaining.
   */
  private normalizarProyecto(data: any): Proyecto {
    if (!data) return data;
    return {
      ...data,
      participantes: data.participantes || [],
    };
  }
}