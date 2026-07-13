import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import {
  IonHeader,
  IonToolbar,
  IonButtons,
  IonMenuButton,
  IonTitle,
  IonContent,
  IonIcon,
  IonButton,
  IonSkeletonText
} from '@ionic/angular/standalone';

import { StatsCardComponent } from '../../../shared/components/stats-card/stats-card.component';

import { addIcons } from 'ionicons';
import {
  personOutline,
  clipboardOutline,
  statsChartOutline,
  chevronForwardOutline,
  folderOutline,
  timeOutline,
  checkmarkDoneOutline,
  logOutOutline,
  refreshOutline,
  checkmarkCircleOutline,
  alertCircleOutline,
  peopleOutline,
  documentTextOutline
} from 'ionicons/icons';

import { EvaluadorService } from '../../../core/services/evaluador.service';
import { AuthService } from '../../../core/services/auth.service';

interface Activity {
  icon: string;
  color: string;
  texto: string;
  tiempo: string;
}

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    IonHeader,
    IonToolbar,
    IonButtons,
    IonMenuButton,
    IonTitle,
    IonContent,
    IonIcon,
    IonButton,
    IonSkeletonText,
    StatsCardComponent
  ],
  templateUrl: './dashboard.page.html',
  styleUrls: ['./dashboard.page.scss']
})
export class DashboardPage implements OnInit {

  asignados = 0;
  pendientes = 0;
  completados = 0;
  nombreUsuario: string = 'Evaluador';
  isLoading: boolean = true;
  error: string | null = null;

  actividadesRecientes: Activity[] = [];

  constructor(
    private evaluadorService: EvaluadorService,
    private authService: AuthService
  ) {
    addIcons({
      personOutline,
      clipboardOutline,
      statsChartOutline,
      chevronForwardOutline,
      folderOutline,
      timeOutline,
      checkmarkDoneOutline,
      logOutOutline,
      refreshOutline,
      checkmarkCircleOutline,
      alertCircleOutline,
      peopleOutline,
      documentTextOutline
    });
  }

  ngOnInit(): void {
    this.cargarDatos();
    this.obtenerNombreUsuario();
  }

  cargarDatos(): void {
    this.isLoading = true;
    this.error = null;

    this.evaluadorService.getDashboardStats().subscribe({
      next: (res: any) => {
        console.log('Dashboard stats:', res);
        const data = res?.data ?? res ?? {};
        this.asignados = data.asignados ?? 0;
        this.pendientes = data.pendientes ?? 0;
        this.completados = data.completados ?? 0;
        this.isLoading = false;
        this.cargarActividadesRecientes();
      },
      error: (err) => {
        console.error('Error cargando estadísticas:', err);
        this.error = err.error?.mensaje || 'Error al cargar los datos';
        this.isLoading = false;
        this.actividadesRecientes = [];
      }
    });
  }

  cargarActividadesRecientes(): void {
    this.actividadesRecientes = [];

    this.evaluadorService.getActividadesRecientes().subscribe({
      next: (res: any) => {
        console.log('Actividades recientes:', res);
        const data = res?.data ?? res ?? [];
        this.actividadesRecientes = Array.isArray(data) ? data.map((item: any) => ({
          icon: this.getIconForActivity(item.tipo),
          color: this.getColorForActivity(item.tipo),
          texto: item.descripcion || item.texto,
          tiempo: this.formatTimeAgo(item.fecha)
        })) : [];
      },
      error: (err) => {
        console.error('Error cargando actividades:', err);
        this.actividadesRecientes = [];
      }
    });
  }

  obtenerNombreUsuario(): void {
    try {
      const user = this.authService.obtenerUsuario();
      if (user?.nombre) {
        this.nombreUsuario = user.nombre;
      }
    } catch (e) {
      this.nombreUsuario = 'Evaluador';
    }
  }

  recargar(): void {
    this.cargarDatos();
  }

  cerrarSesion(): void {
    if (confirm('¿Estás seguro de que deseas cerrar sesión?')) {
      this.authService.logout();
    }
  }

  get porcentaje(): number {
    if (this.asignados === 0) return 0;
    return Math.round((this.completados / this.asignados) * 100);
  }

  get tieneProyectosPendientes(): boolean {
    return this.pendientes > 0;
  }

  get mensajeBienvenida(): string {
    if (this.pendientes === 0 && this.asignados > 0) {
      return 'Todos los proyectos han sido evaluados';
    }
    if (this.pendientes > 0) {
      return `Tienes ${this.pendientes} proyecto${this.pendientes > 1 ? 's' : ''} pendiente${this.pendientes > 1 ? 's' : ''} de evaluar`;
    }
    return 'No tienes proyectos asignados actualmente';
  }

  private getIconForActivity(tipo: string): string {
    const icons: Record<string, string> = {
      'evaluacion': 'checkmark-circle-outline',
      'asignacion': 'folder-outline',
      'completado': 'checkmark-done-outline',
      'pendiente': 'time-outline',
      'default': 'document-text-outline'
    };
    return icons[tipo] || icons['default'];
  }

  private getColorForActivity(tipo: string): string {
    const colors: Record<string, string> = {
      'evaluacion': 'emerald',
      'asignacion': 'indigo',
      'completado': 'violet',
      'pendiente': 'amber',
      'default': 'slate'
    };
    return colors[tipo] || colors['default'];
  }

  private formatTimeAgo(fecha: string): string {
    if (!fecha) return 'Recientemente';

    try {
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
    } catch {
      return 'Recientemente';
    }
  }
}