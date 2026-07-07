import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
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
  IonLabel
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
  arrowForwardOutline
} from 'ionicons/icons';

interface Activity {
  icon: string;
  color: string;
  text: string;
  time: string;
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

    // Componentes propios
    StatsCardComponent
  ],
  templateUrl: './dashboard.page.html',
  styleUrls: ['./dashboard.page.scss'],
})
export class DashboardPage {

  private dashboardService = inject(DashboardService);

  usuarios = 0;
  concursos = 0;
  proyectos = 0;
  reportes = 0;

  cargando = true;
  error = false;

  // Propiedad para la fecha actual
  today: Date = new Date();

  // Actividades recientes (mock data)
  recentActivities: Activity[] = [
    {
      icon: 'person-add-outline',
      color: 'indigo',
      text: 'Nuevo usuario registrado: María González',
      time: 'Hace 5 minutos'
    },
    {
      icon: 'trophy-outline',
      color: 'amber',
      text: 'Concurso "Innovación 2026" publicado',
      time: 'Hace 1 hora'
    },
    {
      icon: 'folder-open-outline',
      color: 'emerald',
      text: 'Proyecto "Sistema IoT" actualizado',
      time: 'Hace 3 horas'
    },
    {
      icon: 'document-text-outline',
      color: 'violet',
      text: 'Nueva evaluación completada',
      time: 'Hace 5 horas'
    },
    {
      icon: 'people-outline',
      color: 'rose',
      text: 'Equipo de desarrollo asignado al proyecto',
      time: 'Hace 1 día'
    }
  ];

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
      arrowForwardOutline
    });
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
        this.cargando = false;
      },
      error: () => {
        this.error = true;
        this.cargando = false;
      }
    });
  }
}