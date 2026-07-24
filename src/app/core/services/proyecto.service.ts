import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { map, Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { Proyecto, Participante, Tutor } from '../models/proyecto.model';

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

  crear(data: {
    nombre: string;
    descripcion?: string | null;
    concursoId?: number | null;
    nivel?: string | null;
    area?: string | null;
    activo?: boolean;
    codigoProyecto?: string | null;  // NUEVO
    participantes: string[];
    tutores: string[];
  }): Observable<Proyecto> {
    return this.http.post<any>(this.apiUrl, data).pipe(
      map(res => this.normalizarProyecto(res?.data ?? res))
    );
  }

  actualizar(id: number, data: {
    nombre: string;
    descripcion?: string | null;
    concursoId?: number | null;
    nivel?: string | null;
    area?: string | null;
    activo?: boolean;
    codigoProyecto?: string | null;  // NUEVO
    participantes: string[];
    tutores: string[];
  }): Observable<Proyecto> {
    return this.http.put<any>(`${this.apiUrl}/${id}`, data).pipe(
      map(res => this.normalizarProyecto(res?.data ?? res))
    );
  }

  eliminar(id: number): Observable<any> {
    return this.http.delete(`${this.apiUrl}/${id}`);
  }

  private normalizarProyecto(data: any): Proyecto {
    if (!data) return data;

    return {
      id: data.id,
      nombre: data.nombre || '',
      descripcion: data.descripcion ?? null,
      concursoId: data.concursoId ?? data.concurso_id ?? null,
      concursoNombre: data.concursoNombre ?? data.concurso_nombre ?? null,
      nivel: data.nivel ?? null,
      area: data.area ?? null,
      activo: data.activo === 1 || data.activo === true,
      codigoProyecto: data.codigoProyecto ?? data.codigo_proyecto ?? null,  // ✅ NUEVO
      participantes: this.normalizarParticipantes(data.participantes),
      tutores: this.normalizarTutores(data.tutores),
      createdAt: data.createdAt ?? data.created_at
    };
  }

  private normalizarParticipantes(lista: any): Participante[] {
    if (!Array.isArray(lista)) return [];
    return lista.map((p: any) => ({
      id: p.id,
      nombre: p.nombre || '',
      cedula: p.cedula ?? null,
      email: p.email ?? null
    }));
  }

  private normalizarTutores(lista: any): Tutor[] {
    if (!Array.isArray(lista)) return [];
    return lista.map((t: any) => ({
      id: t.id,
      nombre: t.nombre || '',
      encargado: t.encargado === 1 || t.encargado === true,
      cedula: t.cedula ?? null,
      email: t.email ?? null
    }));
  }
}