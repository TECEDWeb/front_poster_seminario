import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { environment } from '../../../environments/environment';
import { RubricaConcurso, Seccion, Criterio, Nivel } from '../models/rubrica.model';

@Injectable({
  providedIn: 'root'
})
export class RubricaService {

  private apiUrl = `${environment.apiUrl}/rubricas`;
  private concursoApiUrl = `${environment.apiUrl}/concursos`;

  constructor(private http: HttpClient) {}

  /**
   * Listar todas las rúbricas
   */
  listar(): Observable<RubricaConcurso[]> {
    return this.http.get<any>(this.apiUrl).pipe(
      map((res: any) => {
        const data = res?.data ?? res ?? [];
        return Array.isArray(data) ? data.map((item: any) => this.mapearRubrica(item)) : [];
      })
    );
  }

  /**
   * Obtener rúbrica por ID de concurso
   */
  obtener(id: number): Observable<RubricaConcurso> {
    return this.http.get<any>(`${this.apiUrl}/${id}`).pipe(
      map((res: any) => {
        const data = res?.data ?? res ?? {};
        return this.mapearRubrica(data);
      })
    );
  }

  /**
   * Obtener rúbrica por concurso ID
   */
  obtenerPorConcurso(concursoId: number): Observable<RubricaConcurso> {
    return this.http.get<any>(`${this.apiUrl}/${concursoId}`).pipe(
      map((res: any) => {
        const data = res?.data ?? res ?? {};
        return this.mapearRubrica(data);
      })
    );
  }

  /**
   * Obtener concursos disponibles para rúbricas
   */
  obtenerConcursos(): Observable<any[]> {
    return this.http.get<any>(this.concursoApiUrl).pipe(
      map((res: any) => {
        const data = res?.data ?? res?.concursos ?? res ?? [];
        return Array.isArray(data) ? data : [];
      })
    );
  }

  /**
   * Crear una nueva rúbrica
   */
  crear(data: any): Observable<RubricaConcurso> {
    console.log('📤 rubricaService.crear() - Datos recibidos:', JSON.stringify(data, null, 2));
    
    // Asegurar que el payload tenga todos los campos necesarios
    const payload = {
      concurso_id: data.concurso_id || data.concursoId,
      nombre: data.nombre || '',
      descripcion: data.descripcion || null,
      puntaje_maximo: data.puntaje_maximo || data.puntajeMaximo || 100,
      secciones: data.secciones || [],
      niveles: data.niveles || []
    };

    console.log('📤 rubricaService.crear() - Payload final:', JSON.stringify(payload, null, 2));
    
    return this.http.post<any>(this.apiUrl, payload).pipe(
      map((res: any) => {
        console.log('📥 rubricaService.crear() - Respuesta:', res);
        const result = res?.data ?? res ?? {};
        return this.mapearRubrica(result);
      })
    );
  }

  /**
   * Actualizar una rúbrica existente - CORREGIDO
   */
  actualizar(id: number, data: any): Observable<RubricaConcurso> {
    console.log('📤 rubricaService.actualizar() - Datos recibidos:', JSON.stringify(data, null, 2));
    
    // Construir payload directamente sin usar mapearParaBackend
    const payload = {
      concurso_id: data.concurso_id || data.concursoId,
      nombre: data.nombre || '',
      descripcion: data.descripcion || null,
      puntaje_maximo: data.puntaje_maximo || data.puntajeMaximo || 100,
      secciones: data.secciones || [],
      niveles: data.niveles || []
    };

    console.log('📤 rubricaService.actualizar() - Payload final:', JSON.stringify(payload, null, 2));
    
    return this.http.put<any>(`${this.apiUrl}/${id}`, payload).pipe(
      map((res: any) => {
        console.log('📥 rubricaService.actualizar() - Respuesta:', res);
        const result = res?.data ?? res ?? {};
        return this.mapearRubrica(result);
      })
    );
  }

  /**
   * Eliminar una rúbrica
   */
  eliminar(id: number): Observable<any> {
    return this.http.delete(`${this.apiUrl}/${id}`);
  }

  /**
   * Exportar rúbrica a Excel
   */
  exportar(id: number): Observable<Blob> {
    return this.http.get(`${this.apiUrl}/${id}/exportar`, {
      responseType: 'blob'
    });
  }

  /**
   * Mapear datos del backend al modelo RubricaConcurso
   */
  private mapearRubrica(data: any): RubricaConcurso {
    return {
      concursoId: data.concursoId || data.concurso_id || 0,
      secciones: data.secciones?.map((s: any) => ({
        id: s.id || 0,
        concursoId: s.concursoId || s.concurso_id || data.concursoId || data.concurso_id || 0,
        nombre: s.nombre || '',
        orden: s.orden || 0,
        descripcion: s.descripcion || null,
        criterios: s.criterios?.map((c: any) => ({
          id: c.id || 0,
          seccionId: c.seccionId || c.seccion_id || s.id || 0,
          texto: c.texto || '',
          orden: c.orden || 0
        })) || []
      })) || [],
      niveles: data.niveles?.map((n: any) => ({
        id: n.id || 0,
        concursoId: n.concursoId || n.concurso_id || data.concursoId || data.concurso_id || 0,
        nombre: n.nombre || '',
        puntaje: n.puntaje || 0,
        descripcion: n.descripcion || null
      })) || []
    };
  }

  /**
   * Mapear del modelo al backend - OBSOLETO, no usar
   */
  private mapearParaBackend(data: any): any {
    // Este método estaba removiendo nombre y descripcion
    // Ya no se usa, se reemplazó por la construcción directa en actualizar()
    return {
      concurso_id: data.concursoId || data.concurso_id,
      nombre: data.nombre || '',
      descripcion: data.descripcion || null,
      puntaje_maximo: data.puntaje_maximo || data.puntajeMaximo || 100,
      secciones: data.secciones?.map((s: any) => ({
        nombre: s.nombre,
        orden: s.orden || 0,
        descripcion: s.descripcion || null,
        criterios: s.criterios?.map((c: any) => ({
          texto: c.texto,
          orden: c.orden || 0
        })) || []
      })) || [],
      niveles: data.niveles?.map((n: any) => ({
        nombre: n.nombre,
        puntaje: n.puntaje || 0,
        descripcion: n.descripcion || null
      })) || []
    };
  }
}