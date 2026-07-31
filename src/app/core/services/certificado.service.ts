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

  // ============ MÉTODOS EXISTENTES ============
  
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

  // ============ NUEVOS MÉTODOS AGREGADOS ============

  /**
   * Crear un nuevo certificado
   */
  crear(payload: any): Observable<Certificado> {
    return this.http.post<any>(`${this.apiUrl}`, payload).pipe(
      map(res => this.mapear(res?.data ?? res))
    );
  }

  /**
   * Listar certificados por concurso
   */
  listarPorConcurso(concursoId: number): Observable<Certificado[]> {
    return this.http.get<any>(`${this.apiUrl}/concurso/${concursoId}`).pipe(
      map(res => (res?.data ?? []).map((c: any) => this.mapear(c)))
    );
  }

  /**
   * Descargar certificado (alias de descargarPdf)
   */
  descargar(id: number): Observable<Blob> {
    return this.descargarPdf(id);
  }

  /**
   * Actualizar certificado
   */
  actualizar(id: number, data: Partial<Certificado>): Observable<Certificado> {
    return this.http.put<any>(`${this.apiUrl}/${id}`, data).pipe(
      map(res => this.mapear(res?.data ?? res))
    );
  }

  /**
   * Obtener estadísticas de certificados por concurso
   */
  getEstadisticas(concursoId: number): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/estadisticas/${concursoId}`).pipe(
      map(res => res?.data ?? res)
    );
  }

  /**
   * Generar certificados masivos
   */
  generarMasivo(data: {
    concursoId: number;
    proyectoIds: number[];
    tipoCertificado: string;
    firmantes?: Firmante[];
  }): Observable<Certificado[]> {
    return this.http.post<any>(`${this.apiUrl}/generar-masivo`, data).pipe(
      map(res => (res?.data ?? []).map((c: any) => this.mapear(c)))
    );
  }

  /**
   * Reenviar certificado por email
   */
  reenviarEmail(id: number): Observable<any> {
    return this.http.post(`${this.apiUrl}/${id}/reenviar`, {});
  }

  /**
   * Verificar estado de certificado
   */
  verificarEstado(codigo: string): Observable<{ 
    valido: boolean; 
    estado: string; 
    mensaje: string;
    data?: Certificado;
  }> {
    return this.http.get<any>(`${this.apiUrl}/verificar/${codigo}`).pipe(
      map(res => ({
        valido: res?.valido ?? false,
        estado: res?.estado ?? 'no_encontrado',
        mensaje: res?.mensaje ?? 'Certificado no encontrado',
        data: res?.data ? this.mapear(res.data) : undefined
      }))
    );
  }

  /**
   * Obtener certificados por proyecto
   */
  listarPorProyecto(proyectoId: number): Observable<Certificado[]> {
    return this.http.get<any>(`${this.apiUrl}/proyecto/${proyectoId}`).pipe(
      map(res => (res?.data ?? []).map((c: any) => this.mapear(c)))
    );
  }

  /**
   * Obtener certificados por tipo
   */
  listarPorTipo(tipo: string): Observable<Certificado[]> {
    return this.http.get<any>(`${this.apiUrl}/tipo/${tipo}`).pipe(
      map(res => (res?.data ?? []).map((c: any) => this.mapear(c)))
    );
  }

  /**
   * Descargar certificado en diferentes formatos
   */
  descargarFormato(id: number, formato: 'pdf' | 'png' | 'jpg'): Observable<Blob> {
    return this.http.get(`${this.apiUrl}/${id}/descargar/${formato}`, { 
      responseType: 'blob' 
    });
  }

  // ============ MÉTODO PRIVADO ============

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