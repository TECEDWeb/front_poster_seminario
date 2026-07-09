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
        map(res => res.data ?? [])
      );
  }

  obtener(id: number): Observable<Proyecto> {
    return this.http.get<Proyecto>(`${this.apiUrl}/${id}`);
  }

  crear(data: any): Observable<Proyecto> {
    console.log('📤 crear proyecto - Datos:', data);
    return this.http.post<Proyecto>(this.apiUrl, data);
  }

  actualizar(id: number, data: any): Observable<Proyecto> {
    console.log('📤 actualizar proyecto - ID:', id, 'Datos:', data);
    return this.http.put<Proyecto>(`${this.apiUrl}/${id}`, data);
  }

  eliminar(id: number): Observable<any> {
    console.log('🗑️ eliminar proyecto - ID:', id);
    return this.http.delete(`${this.apiUrl}/${id}`);
  }
}