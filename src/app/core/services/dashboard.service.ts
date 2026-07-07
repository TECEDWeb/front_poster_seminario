import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class DashboardService {

  private apiUrl = `${environment.apiUrl}/dashboard`;

  constructor(private http: HttpClient) {}

  /**
   * Obtener resumen del dashboard para administrador
   */
  obtenerResumenAdmin(): Observable<any> {
    return this.http.get(`${this.apiUrl}/admin/resumen`).pipe(
      map((res: any) => res?.data ?? res ?? {})
    );
  }

  /**
   * Obtener actividades recientes
   */
  obtenerActividadesRecientes(): Observable<any[]> {
    return this.http.get(`${this.apiUrl}/actividades-recientes`).pipe(
      map((res: any) => {
        const data = res?.data ?? res ?? [];
        return data.map((item: any) => ({
          icon: this.getIconForActivity(item.tipo),
          color: this.getColorForActivity(item.tipo),
          text: item.descripcion || item.texto,
          time: this.formatTimeAgo(item.fecha)
        }));
      })
    );
  }

  /**
   * Obtener notificaciones pendientes
   */
  obtenerNotificaciones(): Observable<any[]> {
    return this.http.get(`${this.apiUrl}/notificaciones`).pipe(
      map((res: any) => res?.data ?? res ?? [])
    );
  }

  /**
   * Mapear icono según tipo de actividad
   */
  private getIconForActivity(tipo: string): string {
    const icons: Record<string, string> = {
      'usuario': 'person-add-outline',
      'concurso': 'trophy-outline',
      'proyecto': 'folder-open-outline',
      'evaluacion': 'document-text-outline',
      'asignacion': 'people-outline',
      'default': 'time-outline'
    };
    return icons[tipo] || icons['default'];
  }

  /**
   * Mapear color según tipo de actividad
   */
  private getColorForActivity(tipo: string): string {
    const colors: Record<string, string> = {
      'usuario': 'indigo',
      'concurso': 'amber',
      'proyecto': 'emerald',
      'evaluacion': 'violet',
      'asignacion': 'rose',
      'default': 'slate'
    };
    return colors[tipo] || colors['default'];
  }

  /**
   * Formatear tiempo relativo
   */
  private formatTimeAgo(fecha: string): string {
    if (!fecha) return 'Recientemente';
    
    const now = new Date();
    const date = new Date(fecha);
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return 'Hace unos segundos';
    if (diffMins < 60) return `Hace ${diffMins} minuto${diffMins > 1 ? 's' : ''}`;
    if (diffHours < 24) return `Hace ${diffHours} hora${diffHours > 1 ? 's' : ''}`;
    if (diffDays < 7) return `Hace ${diffDays} día${diffDays > 1 ? 's' : ''}`;
    return date.toLocaleDateString('es-ES');
  }

  contarNotificacionesNoLeidas(): Observable<number> {
    return this.http.get(`${this.apiUrl}/notificaciones/contar`).pipe(
      map((res: any) => res?.data?.count ?? 0)
    );
  }

  /**
   * Marcar notificaciones como leídas
   */
  marcarNotificacionesComoLeidas(): Observable<any> {
    return this.http.post(`${this.apiUrl}/notificaciones/leer`, {});
  }

  contarNotificaciones(): Observable<number> {
    return this.http.get(`${this.apiUrl}/notificaciones/contar`).pipe(
      map((res: any) => res?.data?.count ?? res?.count ?? 0)
    );
  }

}