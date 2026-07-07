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
  IonButton
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
  refreshOutline
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

  // Actividades recientes
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
      refreshOutline
    });
  }

  ngOnInit(): void {
    this.cargarDatos();
    this.obtenerNombreUsuario();
  }

  cargarDatos(): void {
    this.isLoading = true;

    this.evaluadorService.getDashboardStats().subscribe({
      next: (res: any) => {
        const data = res?.data ?? res ?? {};
        this.asignados = data.asignados ?? 0;
        this.pendientes = data.pendientes ?? 0;
        this.completados = data.completados ?? 0;
        this.isLoading = false;
        this.cargarActividadesRecientes();
      },
      error: (err) => {
        console.error('Error cargando estadísticas:', err);
        // Datos de ejemplo para demostración
        this.asignados = 5;
        this.pendientes = 3;
        this.completados = 2;
        this.isLoading = false;
        this.cargarActividadesRecientes();
      }
    });
  }

  cargarActividadesRecientes(): void {
    // Datos de ejemplo
    this.actividadesRecientes = [
      {
        icon: 'checkmark-circle-outline',
        color: 'emerald',
        texto: 'Evaluaste el proyecto "Sistema IoT"',
        tiempo: 'Hace 2 horas'
      },
      {
        icon: 'time-outline',
        color: 'amber',
        texto: 'Pendiente evaluación de "App Educativa"',
        tiempo: 'Hace 1 día'
      },
      {
        icon: 'folder-outline',
        color: 'indigo',
        texto: 'Nuevo proyecto asignado: "Plataforma Web"',
        tiempo: 'Hace 2 días'
      }
    ];
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
      return '¡Todos los proyectos han sido evaluados! 🎉';
    }
    if (this.pendientes > 0) {
      return `Tienes ${this.pendientes} proyecto${this.pendientes > 1 ? 's' : ''} pendiente${this.pendientes > 1 ? 's' : ''} de evaluar`;
    }
    return 'No tienes proyectos asignados actualmente';
  }
}