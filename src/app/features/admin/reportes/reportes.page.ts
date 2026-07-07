import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import {
  IonHeader,
  IonToolbar,
  IonButtons,
  IonMenuButton,
  IonTitle,
  IonButton,
  IonIcon,
  IonContent,
  IonSkeletonText
} from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import {
  downloadOutline,
  statsChartOutline,
  folderOutline,
  checkmarkDoneOutline,
  trophyOutline,
  documentOutline,
  timeOutline,
  funnelOutline,
  arrowUpOutline,
  arrowDownOutline,
  peopleOutline,
  eyeOutline
} from 'ionicons/icons';
import { ReporteService } from '../../../core/services/reporte.service';

interface StatCard {
  icon: string;
  label: string;
  value: number | string;
  color: string;
  change?: number;
}

@Component({
  selector: 'app-reportes',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    IonHeader,
    IonToolbar,
    IonButtons,
    IonMenuButton,
    IonTitle,
    IonButton,
    IonIcon,
    IonContent,
    IonSkeletonText
  ],
  templateUrl: './reportes.page.html',
  styleUrls: ['./reportes.page.scss']
})
export class ReportesPage implements OnInit {

  reportes = {
    proyectos: 0,
    evaluaciones: 0,
    completadas: 0,
    promedio: 0
  };

  proyectos: any[] = [];
  proyectosFiltrados: any[] = [];
  cargando: boolean = false;
  fechaActualizacion: Date = new Date();
  statsCards: StatCard[] = [];

  constructor(private reporteService: ReporteService) {
    addIcons({
      downloadOutline,
      statsChartOutline,
      folderOutline,
      checkmarkDoneOutline,
      trophyOutline,
      documentOutline,
      timeOutline,
      funnelOutline,
      arrowUpOutline,
      arrowDownOutline,
      peopleOutline,
      eyeOutline
    });
  }

  ngOnInit(): void {
    this.cargarDatos();
  }

  cargarDatos(): void {
    this.cargando = true;

    this.reporteService.getStats().subscribe({
      next: (res: any) => {
        console.log('STATS:', res);
        this.reportes = res?.data ?? res ?? this.reportes;
        this.actualizarStatsCards();
        this.fechaActualizacion = new Date();
      },
      error: (err) => {
        console.error('Error stats:', err);
        this.actualizarStatsCards();
      }
    });

    this.reporteService.getReporteProyectos().subscribe({
      next: (res: any) => {
        console.log('PROYECTOS:', res);
        this.proyectos = res?.data ?? res ?? [];
        this.proyectosFiltrados = [...this.proyectos];
        this.cargando = false;
      },
      error: (err) => {
        console.error('Error proyectos:', err);
        this.proyectos = [];
        this.proyectosFiltrados = [];
        this.cargando = false;
      }
    });
  }

  actualizarStatsCards(): void {
    this.statsCards = [
      {
        icon: 'folder-outline',
        label: 'Proyectos',
        value: this.reportes.proyectos || 0,
        color: 'blue'
      },
      {
        icon: 'checkmark-done-outline',
        label: 'Evaluaciones',
        value: this.reportes.evaluaciones || 0,
        color: 'green'
      },
      {
        icon: 'stats-chart-outline',
        label: 'Completadas',
        value: this.reportes.completadas || 0,
        color: 'orange'
      },
      {
        icon: 'trophy-outline',
        label: 'Promedio general',
        value: this.reportes.promedio ? this.reportes.promedio.toFixed(1) : '0.0',
        color: 'purple'
      }
    ];
  }

  exportar(): void {
    this.reporteService.exportar().subscribe({
      next: (archivo: Blob) => {
        const url = window.URL.createObjectURL(archivo);
        const enlace = document.createElement('a');
        enlace.href = url;
        enlace.download = `reporte-evaluaciones-${new Date().toISOString().split('T')[0]}.xlsx`;
        enlace.click();
        window.URL.revokeObjectURL(url);
      },
      error: (err) => {
        console.error('Error exportando:', err);
        alert('Error al exportar el reporte');
      }
    });
  }

  exportarProyecto(proyecto: any): void {
    this.reporteService.exportarProyecto(proyecto.id).subscribe({
      next: (archivo: Blob) => {
        const url = window.URL.createObjectURL(archivo);
        const enlace = document.createElement('a');
        enlace.href = url;
        enlace.download = `reporte-${proyecto.proyecto}-${new Date().toISOString().split('T')[0]}.xlsx`;
        enlace.click();
        window.URL.revokeObjectURL(url);
      },
      error: (err) => {
        console.error('Error exportando proyecto:', err);
        this.exportar();
      }
    });
  }

  toggleFilter(): void {
    alert('Función de filtro en desarrollo');
  }

  getRandomColor(proyecto: string): string {
    const colors = ['color-blue', 'color-green', 'color-orange', 'color-purple', 'color-pink', 'color-cyan', 'color-indigo'];
    const index = proyecto?.length ? proyecto.length % colors.length : 0;
    return colors[index];
  }

  getStatusClass(promedio: number): string {
    if (!promedio) return 'status-low';
    if (promedio >= 8) return 'status-excellent';
    if (promedio >= 6) return 'status-good';
    if (promedio >= 4) return 'status-regular';
    return 'status-low';
  }

  getStatusText(promedio: number): string {
    if (!promedio) return 'Sin datos';
    if (promedio >= 8) return 'Excelente';
    if (promedio >= 6) return 'Bueno';
    if (promedio >= 4) return 'Regular';
    return 'Bajo';
  }

  getPorcentaje(promedio: number, maximo: number = 10): number {
    if (!promedio || !maximo) return 0;
    return Math.min(Math.round((promedio / maximo) * 100), 100);
  }

  trackById(index: number, item: any): number {
    return item?.id ?? index;
  }

  verDetalle(proyecto: any): void {
    console.log('Ver detalle de:', proyecto);
  }
}