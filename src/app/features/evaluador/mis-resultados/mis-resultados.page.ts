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
  IonSkeletonText,
  IonIcon,
  IonButton,
  IonChip,
  IonLabel
} from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import {
  checkmarkCircleOutline,
  personOutline,
  calendarOutline,
  barChartOutline,
  statsChartOutline,
  trophyOutline,
  documentTextOutline,
  timeOutline,
  eyeOutline
} from 'ionicons/icons';
import { EvaluacionService } from '../../../core/services/evaluacion.service';
import { ResumenEvaluacion } from '../../../core/models/evaluacion.model';

@Component({
  selector: 'app-mis-resultados',
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
    IonSkeletonText,
    IonIcon,
    IonButton,
    IonChip,
    IonLabel
  ],
  templateUrl: './mis-resultados.page.html',
  styleUrls: ['./mis-resultados.page.scss']
})
export class MisResultadosPage implements OnInit {

  evaluaciones: ResumenEvaluacion[] = [];
  evaluacionesFiltradas: ResumenEvaluacion[] = [];
  loading = true;
  error: string | null = null;

  // Estadísticas
  totalEvaluaciones: number = 0;
  promedioGeneral: number = 0;
  evaluacionesRecientes: number = 0;

  // Filtros
  filtroEstado: string = 'todos';

  constructor(private evaluacionService: EvaluacionService) {
    addIcons({
      checkmarkCircleOutline,
      personOutline,
      calendarOutline,
      barChartOutline,
      statsChartOutline,
      trophyOutline,
      documentTextOutline,
      timeOutline,
      eyeOutline
    });
  }

  ngOnInit(): void {
    this.cargar();
  }

  cargar(): void {
    this.loading = true;
    this.error = null;

    this.evaluacionService.listarResumen().subscribe({
      next: (res: any) => {
        console.log('RESUMEN API:', res);

        // Normalizar respuesta
        let data = res?.data ?? res ?? [];

        // Asegurar que sea un array
        this.evaluaciones = Array.isArray(data) ? data : data ? [data] : [];

        // Calcular estadísticas
        this.calcularEstadisticas();

        // Aplicar filtros
        this.aplicarFiltros();

        this.loading = false;
      },
      error: (err) => {
        console.error('Error al cargar evaluaciones', err);
        this.error = err.error?.mensaje || 'Error al cargar los resultados';
        this.evaluaciones = [];
        this.evaluacionesFiltradas = [];
        this.loading = false;
      }
    });
  }

  calcularEstadisticas(): void {
    this.totalEvaluaciones = this.evaluaciones.length;

    // Calcular promedio general
    if (this.totalEvaluaciones > 0) {
      const sum = this.evaluaciones.reduce((acc, e) => acc + (e.porcentaje || 0), 0);
      this.promedioGeneral = Math.round(sum / this.totalEvaluaciones);
    } else {
      this.promedioGeneral = 0;
    }

    // Evaluaciones de los últimos 7 días
    const hace7Dias = new Date();
    hace7Dias.setDate(hace7Dias.getDate() - 7);
    this.evaluacionesRecientes = this.evaluaciones.filter(e => {
      if (!e.fecha) return false;
      return new Date(e.fecha) >= hace7Dias;
    }).length;
  }

  aplicarFiltros(): void {
    let filtered = [...this.evaluaciones];

    // Filtrar por estado (porcentaje)
    if (this.filtroEstado === 'alto') {
      filtered = filtered.filter(e => (e.porcentaje || 0) >= 70);
    } else if (this.filtroEstado === 'medio') {
      filtered = filtered.filter(e => (e.porcentaje || 0) >= 50 && (e.porcentaje || 0) < 70);
    } else if (this.filtroEstado === 'bajo') {
      filtered = filtered.filter(e => (e.porcentaje || 0) < 50);
    }

    // Ordenar por fecha (más reciente primero)
    filtered.sort((a, b) => {
      if (!a.fecha) return 1;
      if (!b.fecha) return -1;
      return new Date(b.fecha).getTime() - new Date(a.fecha).getTime();
    });

    this.evaluacionesFiltradas = filtered;
  }

  cambiarFiltro(estado: string): void {
    this.filtroEstado = estado;
    this.aplicarFiltros();
  }

  getEstadoClase(porcentaje: number): string {
    if (porcentaje >= 70) return 'status-excellent';
    if (porcentaje >= 50) return 'status-good';
    if (porcentaje >= 30) return 'status-regular';
    return 'status-low';
  }

  getEstadoTexto(porcentaje: number): string {
    if (porcentaje >= 70) return 'Excelente';
    if (porcentaje >= 50) return 'Bueno';
    if (porcentaje >= 30) return 'Regular';
    return 'Bajo';
  }

  getEstadoIcono(porcentaje: number): string {
    if (porcentaje >= 70) return 'checkmark-circle-outline';
    if (porcentaje >= 50) return 'time-outline';
    return 'alert-circle-outline';
  }

  getColorClase(porcentaje: number): string {
    if (porcentaje >= 70) return 'score-high';
    if (porcentaje >= 50) return 'score-mid';
    return 'score-low';
  }

  getProgressColor(porcentaje: number): string {
    if (porcentaje >= 70) return '#10b981';
    if (porcentaje >= 50) return '#f59e0b';
    return '#ef4444';
  }

  verDetalle(id: number): void {
    // Navegar al detalle de la evaluación
    console.log('Ver detalle de evaluación:', id);
  }

  recargar(): void {
    this.cargar();
  }
}