import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { FormsModule } from '@angular/forms';  // ✅ IMPORTANTE: AGREGAR ESTE
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
  IonSpinner,
  IonModal,
  IonSearchbar,
  IonSelect,
  IonSelectOption,
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
  informationCircleOutline,
  closeOutline,
  eyeOutline,
  personOutline,
  schoolOutline,
  documentOutline,
  trashOutline,
  pencilOutline
} from 'ionicons/icons';

interface Activity {
  id: string;
  icon: string;
  color: string;
  text: string;
  time: string;
  tipo: string;
  usuario: string;
  fecha: string;
  detalle: string;
  metadata?: any;
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
    FormsModule,           // ✅ IMPORTANTE: AGREGAR ESTE
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
    IonModal,
    IonSearchbar,
    IonSelect,
    IonSelectOption,
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
  allActivities: Activity[] = [];
  notificacionesPendientes: number = 0;

  // Panel de notificaciones
  popoverNotifAbierto = false;
  notificacionesList: NotificacionItem[] = [];
  cargandoNotificaciones = false;

  // Modal de actividad
  modalActividadAbierto = false;
  actividadSeleccionada: Activity | null = null;
  cargandoDetalleActividad = false;

  // Modal de todas las actividades
  modalTodasActividadesAbierto = false;
  actividadesFiltradas: Activity[] = [];
  busquedaActividades: string = '';
  filtroTipoActividad: string = 'todos';

  // Generador de ID
  private activityIdCounter = 0;

  // Actividades de ejemplo
  private actividadesGeneradas: Activity[] = [];

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
      informationCircleOutline,
      closeOutline,
      eyeOutline,
      personOutline,
      schoolOutline,
      documentOutline,
      trashOutline,
      pencilOutline
    });
  }

  ngOnInit(): void {
    this.cargarResumen();
    this.cargarNotificaciones();
    this.generarActividadesIniciales();
  }

  ionViewWillEnter() {
    this.cargarResumen();
  }

  // ============================================
  // GENERAR ACTIVIDADES INICIALES
  // ============================================
  private generarActividadesIniciales(): void {
    const ahora = new Date();
    
    const actividadesBase: Omit<Activity, 'id'>[] = [
      {
        icon: 'person-add-outline',
        color: 'indigo',
        text: 'Nuevo usuario registrado: María González',
        time: this.calcularTiempoRelativo(ahora, 5),
        tipo: 'Usuario',
        usuario: 'admin@upse.edu.ec',
        fecha: this.obtenerFecha(ahora, 5),
        detalle: 'Registro de nuevo usuario en el sistema con rol de evaluador'
      },
      {
        icon: 'trophy-outline',
        color: 'gold-upse',
        text: 'Concurso "Semillas 2026" creado',
        time: this.calcularTiempoRelativo(ahora, 60),
        tipo: 'Concurso',
        usuario: 'admin@upse.edu.ec',
        fecha: this.obtenerFecha(ahora, 60),
        detalle: 'Nueva convocatoria creada para el concurso Semillas 2026'
      },
      {
        icon: 'folder-open-outline',
        color: 'cyan-upse',
        text: 'Proyecto "AI en educación" asignado a Juan Pérez',
        time: this.calcularTiempoRelativo(ahora, 120),
        tipo: 'Asignación',
        usuario: 'coord@upse.edu.ec',
        fecha: this.obtenerFecha(ahora, 120),
        detalle: 'Asignación del proyecto al evaluador Juan Pérez para revisión'
      },
      {
        icon: 'checkmark-circle-outline',
        color: 'emerald',
        text: 'Evaluación completada para "Sistema de Riego"',
        time: this.calcularTiempoRelativo(ahora, 180),
        tipo: 'Evaluación',
        usuario: 'evaluador@upse.edu.ec',
        fecha: this.obtenerFecha(ahora, 180),
        detalle: 'Evaluación finalizada con puntaje 85/100'
      },
      {
        icon: 'create-outline',
        color: 'blue-upse',
        text: 'Proyecto actualizado: "Energía Solar"',
        time: this.calcularTiempoRelativo(ahora, 240),
        tipo: 'Proyecto',
        usuario: 'admin@upse.edu.ec',
        fecha: this.obtenerFecha(ahora, 240),
        detalle: 'Actualización de la información del proyecto Energía Solar'
      },
      {
        icon: 'trash-outline',
        color: 'rose',
        text: 'Asignación eliminada para proyecto "Redes Neuronales"',
        time: this.calcularTiempoRelativo(ahora, 300),
        tipo: 'Asignación',
        usuario: 'admin@upse.edu.ec',
        fecha: this.obtenerFecha(ahora, 300),
        detalle: 'Eliminación de asignación del evaluador Carlos Ruiz'
      },
      {
        icon: 'school-outline',
        color: 'teal-upse',
        text: 'Nuevo tutor asignado: Dr. Roberto Gómez',
        time: this.calcularTiempoRelativo(ahora, 360),
        tipo: 'Tutor',
        usuario: 'coord@upse.edu.ec',
        fecha: this.obtenerFecha(ahora, 360),
        detalle: 'Asignación de tutor al proyecto "Biotecnología Marina"'
      },
      {
        icon: 'document-text-outline',
        color: 'orange-upse',
        text: 'Rúbrica creada para concurso "Innovación 2026"',
        time: this.calcularTiempoRelativo(ahora, 420),
        tipo: 'Rúbrica',
        usuario: 'admin@upse.edu.ec',
        fecha: this.obtenerFecha(ahora, 420),
        detalle: 'Creación de nueva rúbrica de evaluación para el concurso'
      }
    ];

    this.actividadesGeneradas = actividadesBase.map((act, index) => ({
      ...act,
      id: `act-${++this.activityIdCounter}-${Date.now()}`
    }));

    this.recentActivities = this.actividadesGeneradas.slice(0, 5);
    this.allActivities = [...this.actividadesGeneradas];
  }

  // ============================================
  // UTILIDADES DE FECHA
  // ============================================
  private calcularTiempoRelativo(fechaBase: Date, minutosAtras: number): string {
    const fecha = new Date(fechaBase.getTime() - minutosAtras * 60 * 1000);
    const ahora = new Date();
    const diffMs = ahora.getTime() - fecha.getTime();
    const diffMin = Math.floor(diffMs / 60000);
    const diffHrs = Math.floor(diffMin / 60);
    const diffDias = Math.floor(diffHrs / 24);

    if (diffMin < 1) return 'Justo ahora';
    if (diffMin < 60) return `Hace ${diffMin} min`;
    if (diffHrs < 24) return `Hace ${diffHrs}h`;
    if (diffDias < 7) return `Hace ${diffDias}d`;
    return fecha.toLocaleDateString('es-EC', { day: '2-digit', month: 'short' });
  }

  private obtenerFecha(fechaBase: Date, minutosAtras: number): string {
    const fecha = new Date(fechaBase.getTime() - minutosAtras * 60 * 1000);
    return fecha.toISOString();
  }

  // ============================================
  // AÑADIR NUEVA ACTIVIDAD
  // ============================================
  public agregarActividad(actividad: Omit<Activity, 'id'>): void {
    const nuevaActividad: Activity = {
      ...actividad,
      id: `act-${++this.activityIdCounter}-${Date.now()}`
    };
    
    this.actividadesGeneradas.unshift(nuevaActividad);
    this.allActivities = [...this.actividadesGeneradas];
    this.recentActivities = this.actividadesGeneradas.slice(0, 5);
    
    this.notificacionesPendientes++;
  }

  // ============================================
  // CARGA DE DATOS
  // ============================================
  cargarResumen() {
    this.cargando = true;
    this.error = false;

    this.dashboardService.obtenerResumenAdmin().subscribe({
      next: (data) => {
        this.usuarios = data.usuarios ?? 0;
        this.concursos = data.concursos ?? 0;
        this.proyectos = data.proyectos ?? 0;
        this.reportes = data.reportes ?? 0;
        this.cargando = false;
      },
      error: () => {
        this.error = true;
        this.cargando = false;
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
        event.target.complete();
      },
      error: () => {
        this.error = true;
        event.target.complete();
      }
    });
  }

  // ============================================
  // NOTIFICACIONES
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

    const notificaciones = this.actividadesGeneradas.slice(0, 10).map(act => ({
      icon: act.icon,
      titulo: act.text,
      time: act.time
    }));

    this.notificacionesList = notificaciones;
    this.cargandoNotificaciones = false;
  }

  marcarTodasLeidas(): void {
    this.notificacionesPendientes = 0;
  }

  // ============================================
  // ACTIVIDAD - DETALLE
  // ============================================
  verDetalleActividad(activity: Activity): void {
    this.actividadSeleccionada = activity;
    this.cargandoDetalleActividad = true;
    this.modalActividadAbierto = true;

    setTimeout(() => {
      this.cargandoDetalleActividad = false;
    }, 300);
  }

  cerrarModalActividad(): void {
    this.modalActividadAbierto = false;
    this.actividadSeleccionada = null;
    this.cargandoDetalleActividad = false;
  }

  // ============================================
  // MODAL - TODAS LAS ACTIVIDADES
  // ============================================
  abrirTodasActividades(): void {
    this.actividadesFiltradas = [...this.allActivities];
    this.busquedaActividades = '';
    this.filtroTipoActividad = 'todos';
    this.modalTodasActividadesAbierto = true;
  }

  cerrarTodasActividades(): void {
    this.modalTodasActividadesAbierto = false;
  }

  filtrarActividades(): void {
    let filtradas = [...this.allActivities];

    if (this.busquedaActividades.trim()) {
      const term = this.busquedaActividades.toLowerCase().trim();
      filtradas = filtradas.filter(a =>
        a.text.toLowerCase().includes(term) ||
        a.usuario.toLowerCase().includes(term) ||
        a.tipo.toLowerCase().includes(term)
      );
    }

    if (this.filtroTipoActividad !== 'todos') {
      filtradas = filtradas.filter(a => a.tipo === this.filtroTipoActividad);
    }

    this.actividadesFiltradas = filtradas;
  }

  getTiposActividad(): string[] {
    const tipos = new Set(this.allActivities.map(a => a.tipo));
    return ['todos', ...Array.from(tipos)];
  }

  verTodasActividades(): void {
    this.abrirTodasActividades();
  }

  abrirNuevoConcurso(): void {
    this.router.navigate(['/admin/concursos'], {
      queryParams: {
        openModal: 'true'
      }
    });
  }
}