import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { environment } from '../../../environments/environment';
import { RubricaConcurso } from '../models/rubrica.model';

@Injectable({
  providedIn: 'root'
})
export class RubricaService {

  private apiUrl = `${environment.apiUrl}/rubricas`;

  constructor(private http: HttpClient) {}

  listar(): Observable<RubricaConcurso[]> {
    return this.http.get<RubricaConcurso[]>(this.apiUrl).pipe(
      map((res: any) => res?.data ?? res ?? [])
    );
  }

  obtener(id: number): Observable<RubricaConcurso> {
    return this.http.get<RubricaConcurso>(`${this.apiUrl}/${id}`);
  }

  crear(data: RubricaConcurso): Observable<RubricaConcurso> {
    return this.http.post<RubricaConcurso>(this.apiUrl, data);
  }

  actualizar(id: number, data: RubricaConcurso): Observable<RubricaConcurso> {
    return this.http.put<RubricaConcurso>(`${this.apiUrl}/${id}`, data);
  }

  eliminar(id: number): Observable<any> {
    return this.http.delete(`${this.apiUrl}/${id}`);
  }

  exportar(id: number): Observable<Blob> {
    return this.http.get(`${this.apiUrl}/${id}/exportar`, {
      responseType: 'blob'
    });
  }
}