import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { environment } from '../../../environments/environment';
import { Nivel } from '../models/rubrica.model';

@Injectable({ providedIn: 'root' })
export class NivelService {

  private apiUrl = `${environment.apiUrl}/niveles`;

  constructor(private http: HttpClient) {}

  listarGlobales(concursoId: number): Observable<Nivel[]> {
    return this.http.get<any>(this.apiUrl, { params: { concursoId: concursoId.toString() } }).pipe(
      map(res => (res?.data ?? []).map((n: any) => this.mapear(n)))
    );
  }

  listarPorCriterio(criterioId: number): Observable<Nivel[]> {
    return this.http.get<any>(this.apiUrl, { params: { criterioId: criterioId.toString() } }).pipe(
      map(res => (res?.data ?? []).map((n: any) => this.mapear(n)))
    );
  }

  crear(data: { concursoId: number; nombre: string; puntaje: number; descripcion?: string | null; criterioId?: number | null }): Observable<Nivel> {
    return this.http.post<any>(this.apiUrl, data).pipe(
      map(res => this.mapear(res?.data ?? res))
    );
  }

  actualizar(id: number, data: { nombre: string; puntaje: number; descripcion?: string | null }): Observable<any> {
    return this.http.put(`${this.apiUrl}/${id}`, data);
  }

  eliminar(id: number): Observable<any> {
    return this.http.delete(`${this.apiUrl}/${id}`);
  }

  private mapear(n: any): Nivel {
    return {
      id: n.id,
      concursoId: n.concursoId ?? n.concurso_id,
      nombre: n.nombre,
      puntaje: n.puntaje,
      descripcion: n.descripcion ?? null,
      criterioId: n.criterioId ?? n.criterio_id ?? null
    };
  }
}