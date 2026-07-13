import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { environment } from '../../../environments/environment';
import { Seccion } from '../models/rubrica.model';

@Injectable({ providedIn: 'root' })
export class SeccionService {

  private apiUrl = `${environment.apiUrl}/secciones`;

  constructor(private http: HttpClient) {}

  listarPorConcurso(concursoId: number): Observable<Seccion[]> {
    return this.http.get<any>(this.apiUrl, { params: { concursoId: concursoId.toString() } }).pipe(
      map(res => (res?.data ?? []).map((s: any) => this.mapear(s)))
    );
  }

  crear(data: { concursoId: number; nombre: string; descripcion?: string | null }): Observable<Seccion> {
    return this.http.post<any>(this.apiUrl, data).pipe(
      map(res => this.mapear(res?.data ?? res))
    );
  }

  actualizar(id: number, data: { nombre: string; descripcion?: string | null }): Observable<any> {
    return this.http.put(`${this.apiUrl}/${id}`, data);
  }

  eliminar(id: number): Observable<any> {
    return this.http.delete(`${this.apiUrl}/${id}`);
  }

  private mapear(s: any): Seccion {
    return {
      id: s.id,
      concursoId: s.concursoId ?? s.concurso_id,
      nombre: s.nombre,
      orden: s.orden,
      descripcion: s.descripcion ?? null,
      criterios: []
    };
  }
}