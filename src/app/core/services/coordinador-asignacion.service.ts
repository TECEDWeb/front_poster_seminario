import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from 'src/environments/environment';

@Injectable({ providedIn: 'root' })
export class CoordinadorAsignacionService {
  private baseUrl = `${environment.apiUrl}/coordinador-asignaciones`;

  constructor(private http: HttpClient) {}

  listar(): Observable<any> {
    return this.http.get(this.baseUrl);
  }

  listarCoordinadores(): Observable<any> {
    return this.http.get(`${this.baseUrl}/coordinadores`);
  }

  asignar(payload: { concursoId: number; coordinadorId: number }): Observable<any> {
    return this.http.post(this.baseUrl, payload);
  }

  eliminar(id: number): Observable<any> {
    return this.http.delete(`${this.baseUrl}/${id}`);
  }
}