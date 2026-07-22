import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import {
  IonHeader,
  IonToolbar,
  IonButtons,
  IonMenuButton,
  IonTitle,
  IonContent,
  IonButton,
  IonIcon,
  IonSkeletonText,
  IonBadge,
  IonChip,
  IonLabel,
  IonRefresher,
  IonRefresherContent,
  IonPopover,
  IonSpinner
} from '@ionic/angular/standalone';
import { DashboardService } from '../../../core/services/dashboard.service';
import { StatsCardComponent } from '../../../shared/components/stats-card/stats-card.component';
import { addIcons } from 'ionicons';
import {
  peopleOutline,
  trophyOutline,
  folderOutline,
  documentTextOutline,
  gridOutline,
  notificationsOutline,
  alertCircleOutline,
  personAddOutline,
  addCircleOutline,
  folderOpenOutline,
  barChartOutline,
  refreshOutline,
  calendarOutline,
  chevronForwardOutline,
  arrowForwardOutline,
  timeOutline,
  checkmarkCircleOutline,
  createOutline,
  chevronDownCircleOutline,
  swapHorizontalOutline,
  checkboxOutline,
  informationCircleOutline
} from 'ionicons/icons';

interface Activity {
  icon: string;
  color: string;
  text: string;
  time: string;
}

interface NotificacionItem {
  icon?: string;
  titulo?: string;
  text?: string;
  time?: string;
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
    IonButton,
    IonIcon,
    IonSkeletonText,
    IonBadge,
    IonChip,
    IonLabel,
    IonRefresher,
    IonRefresherContent,
    IonPopover,
    IonSpinner,
    StatsCardComponent
  ],
  templateUrl: './dashboard.page.html',
  styleUrls: ['./dashboard.page.scss'],
})
export class DashboardPage implements OnInit {

  private dashboardService = inject(DashboardService);
  private router = inject(Router);

  usuarios = 0;
  concursos = 0;
  proyectos = 0;
  reportes = 0;

  cargando = true;
  error = false;

  today: Date = new Date();
  recentActivities: Activity[] = [];
  notificacionesPendientes: number = 0;

  // ============================================
  // PANEL DE NOTIFICACIONES (nuevo)
  // ============================================
  popoverNotifAbierto = false;
  notificacionesList: NotificacionItem[] = [];
  cargandoNotificaciones = false;

  constructor() {
    addIcons({
      peopleOutline,
      trophyOutline,
      folderOutline,
      documentTextOutline,
      gridOutline,
      notificationsOutline,
      alertCircleOutline,
      personAddOutline,
      addCircleOutline,
      folderOpenOutline,
      barChartOutline,
      refreshOutline,
      calendarOutline,
      chevronForwardOutline,
      arrowForwardOutline,
      timeOutline,
      checkmarkCircleOutline,
      createOutline,
      chevronDownCircleOutline,
      swapHorizontalOutline,
      checkboxOutline,
      informationCircleOutline
    });
  }

  ngOnInit(): void {
    this.cargarResumen();
    this.cargarNotificaciones();
  }

  ionViewWillEnter() {
    this.cargarResumen();
  }

  cargarResumen() {
    this.cargando = true;
    this.error = false;

    this.dashboardService.obtenerResumenAdmin().subscribe({
      next: (data) => {
        this.usuarios = data.usuarios ?? 0;
        this.concursos = data.concursos ?? 0;
        this.proyectos = data.proyectos ?? 0;
        this.reportes = data.reportes ?? 0;
        this.cargarActividadesRecientes();
        this.cargando = false;
      },
      error: () => {
        this.error = true;
        this.cargando = false;
      }
    });
  }

  cargarActividadesRecientes() {
    this.dashboardService.obtenerActividadesRecientes().subscribe({
      next: (actividades: Activity[]) => {
        this.recentActivities = actividades || [];
      },
      error: () => {
        this.recentActivities = [];
      }
    });
  }

  cargarNotificaciones(): void {
    this.dashboardService.contarNotificaciones().subscribe({
      next: (count) => {
        this.notificacionesPendientes = count || 0;
      },
      error: () => {
        this.notificacionesPendientes = 0;
      }
    });
  }

  recargar() {
    this.cargarResumen();
    this.cargarNotificaciones();
  }

  onRefresh(event: any) {
    this.dashboardService.obtenerResumenAdmin().subscribe({
      next: (data) => {
        this.usuarios = data.usuarios ?? 0;
        this.concursos = data.concursos ?? 0;
        this.proyectos = data.proyectos ?? 0;
        this.reportes = data.reportes ?? 0;
        this.cargarActividadesRecientes();
        this.cargarNotificaciones();
        event.target.complete();
      },
      error: () => {
        this.error = true;
        event.target.complete();
      }
    });
  }

  // ============================================
  // ANTES: verNotificaciones() marcaba todo como
  // leído apenas hacías clic, sin mostrar nada —
  // perdías el badge sin haber visto el contenido.
  // AHORA: abre un panel con la lista real, y
  // "marcar leídas" es una acción explícita del
  // usuario dentro del panel.
  // ============================================
  toggleNotificaciones(): void {
    this.popoverNotifAbierto = true;
    this.cargarListaNotificaciones();
  }

  cerrarNotificaciones(): void {
    this.popoverNotifAbierto = false;
  }

  private cargarListaNotificaciones(): void {
    this.cargandoNotificaciones = true;

    // ⚠️ Asume que DashboardService tiene un método `obtenerNotificaciones()`
    // que devuelve la lista completa (no solo el conteo). Si en tu servicio
    // se llama distinto, ajusta solo esta línea.
    this.dashboardService.obtenerNotificaciones().subscribe({
      next: (lista: NotificacionItem[]) => {
        this.notificacionesList = lista || [];
        this.cargandoNotificaciones = false;
      },
      error: () => {
        this.notificacionesList = [];
        this.cargandoNotificaciones = false;
      }
    });
  }

  marcarTodasLeidas(): void {
    this.dashboardService.marcarNotificacionesComoLeidas().subscribe({
      next: () => {
        this.notificacionesPendientes = 0;
      },
      error: () => {}
    });
  }

  verTodasActividades(): void {
    this.router.navigate(['/admin/reportes']);
  }

  abrirNuevoConcurso(): void {
    this.router.navigate(['/admin/concursos'], {
      queryParams: {
        openModal: 'true'
      }
    });
  }
}