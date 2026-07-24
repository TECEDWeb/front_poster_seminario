import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

import { environment } from '../../../environments/environment';
import { Certificado, Firmante } from '../models/certificado.model';

@Injectable({ providedIn: 'root' })
export class CertificadoService {

  private apiUrl = `${environment.apiUrl}/certificados`;

  constructor(private http: HttpClient) {}

  listar(): Observable<Certificado[]> {
    return this.http.get<any>(this.apiUrl).pipe(
      map(res => (res?.data ?? []).map((c: any) => this.mapear(c)))
    );
  }

  obtener(id: number): Observable<Certificado> {
    return this.http.get<any>(`${this.apiUrl}/${id}`).pipe(
      map(res => this.mapear(res?.data ?? res))
    );
  }

  generar(data: {
    proyectoId: number;
    participanteNombre: string;
    participanteCedula: string;
    tipoCertificado: string;
    rol: 'participante' | 'tutor';
    nombreEvento: string;
    categoriaActividad: string;
    fechaEvento: string;
    lugar?: string;
    firmantes?: Firmante[];
  }): Observable<Certificado> {
    return this.http.post<any>(`${this.apiUrl}/generar`, data).pipe(
      map(res => this.mapear(res?.data ?? res))
    );
  }

  /** Público — verifica un código, sin necesidad de sesión */
  validar(codigo: string): Observable<{ valido: boolean; data?: any }> {
    return this.http.get<any>(`${this.apiUrl}/validar/${codigo.trim()}`).pipe(
      map(res => ({
        valido: !!res?.valido,
        data: res?.data ? this.mapear(res.data) : undefined
      }))
    );
  }

  descargarPdf(id: number): Observable<Blob> {
    return this.http.get(`${this.apiUrl}/${id}/pdf`, { responseType: 'blob' });
  }

  misCertificados(): Observable<Certificado[]> {
    return this.http.get<any>(`${this.apiUrl}/mios`).pipe(
      map(res => (res?.data ?? []).map((c: any) => this.mapear(c)))
    );
  }

  eliminar(id: number): Observable<any> {
    return this.http.delete(`${this.apiUrl}/${id}`);
  }

  private mapear(c: any): Certificado {
    return {
      id: c.id,
      proyectoId: c.proyectoId ?? c.proyecto_id,
      concursoId: c.concursoId ?? c.concurso_id,
      rol: c.rol,
      codigo: c.codigo,
      entidadCertifica: c.entidadCertifica ?? c.entidad_certifica,
      tipoCertificado: c.tipoCertificado ?? c.tipo_certificado,
      nombre: c.nombre,
      cedula: c.cedula,
      nombreEvento: c.nombreEvento ?? c.nombre_evento,
      categoriaActividad: c.categoriaActividad ?? c.categoria_actividad,
      temaProyecto: c.temaProyecto ?? c.tema_proyecto,
      contenido: c.contenido,
      fechaEmision: c.fechaEmision ?? c.fecha_emision,
      lugar: c.lugar,
      fechaEvento: c.fechaEvento ?? c.fecha_evento,
      firmantes: typeof c.firmantes === 'string'
        ? JSON.parse(c.firmantes)
        : (c.firmantes ?? undefined),
      createdAt: c.createdAt ?? c.created_at
    };
  }
}