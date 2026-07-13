import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { environment } from '../../../environments/environment';
import { Criterio } from '../models/rubrica.model';

@Injectable({ providedIn: 'root' })
export class CriterioService {

  private apiUrl = `${environment.apiUrl}/criterios`;

  constructor(private http: HttpClient) {}

  listarPorSeccion(seccionId: number): Observable<Criterio[]> {
    return this.http.get<any>(this.apiUrl, { params: { seccionId: seccionId.toString() } }).pipe(
      map(res => (res?.data ?? []).map((c: any) => this.mapear(c)))
    );
  }

  crear(data: { seccionId: number; texto: string; rubricaId?: number | null }): Observable<Criterio> {
    return this.http.post<any>(this.apiUrl, data).pipe(
      map(res => this.mapear(res?.data ?? res))
    );
  }

  actualizar(id: number, data: { texto: string }): Observable<any> {
    return this.http.put(`${this.apiUrl}/${id}`, data);
  }

  eliminar(id: number): Observable<any> {
    return this.http.delete(`${this.apiUrl}/${id}`);
  }

  private mapear(c: any): Criterio {
    return {
      id: c.id,
      seccionId: c.seccionId ?? c.seccion_id,
      texto: c.texto,
      orden: c.orden
    };
  }
}