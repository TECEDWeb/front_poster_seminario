import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

import { environment } from '../../../environments/environment';
import { Concurso } from '../models/concurso.model';

@Injectable({
  providedIn: 'root'
})
export class ConcursoService {

  private apiUrl = `${environment.apiUrl}/concursos`;

  constructor(private http: HttpClient) {}

  listar(): Observable<Concurso[]> {
    return this.http.get<Concurso[]>(this.apiUrl);
  }

  obtenerPorId(id: number): Observable<Concurso> {
    return this.http.get<Concurso>(`${this.apiUrl}/${id}`);
  }

  crear(data: Concurso): Observable<Concurso> {
    return this.http.post<Concurso>(this.apiUrl, data);
  }

  actualizar(id: number, data: Concurso): Observable<Concurso> {
    return this.http.put<Concurso>(`${this.apiUrl}/${id}`, data);
  }

  eliminar(id: number): Observable<any> {
    return this.http.delete(`${this.apiUrl}/${id}`);
  }

}