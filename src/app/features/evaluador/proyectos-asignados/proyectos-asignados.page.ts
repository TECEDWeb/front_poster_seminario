import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';

import {
  IonHeader,
  IonToolbar,
  IonButtons,
  IonMenuButton,
  IonTitle,
  IonContent,
  IonIcon,
  IonButton,
  IonSkeletonText,
  IonChip,
  IonLabel,
  IonBadge
} from '@ionic/angular/standalone';

import { addIcons } from 'ionicons';

import {
  documentTextOutline,
  peopleOutline,
  clipboardOutline,
  checkmarkCircleOutline,
  checkmarkCircle,
  timeOutline,
  alertCircleOutline,
  refreshOutline,
  folderOpenOutline,
  folderOutline,
  trophyOutline,
  starOutline,
  calendarOutline,
  closeOutline,
  filterOutline,
  refresh
} from 'ionicons/icons';

import { EvaluacionService } from '../../../core/services/evaluacion.service';
import { ProyectoAsignado } from '../../../core/models/proyecto.model';

@Component({
  selector: 'app-proyectos-asignados',
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
    IonChip,
    IonLabel,
    IonBadge
  ],
  templateUrl: './proyectos-asignados.page.html',
  styleUrls: ['./proyectos-asignados.page.scss']
})
export class ProyectosAsignadosPage implements OnInit {

  proyectos: ProyectoAsignado[] = [];
  proyectosFiltrados: ProyectoAsignado[] = [];
  loading: boolean = true;
  error: string | null = null;

  totalAsignados: number = 0;
  pendientes: number = 0;
  evaluados: number = 0;

  filtroEstado: string = 'todos';
  filtroBusqueda: string = '';

  constructor(
    private evaluacionService: EvaluacionService,
    private router: Router
  ) {
    addIcons({
      documentTextOutline,
      peopleOutline,
      clipboardOutline,
      checkmarkCircleOutline,
      checkmarkCircle,
      timeOutline,
      alertCircleOutline,
      refreshOutline,
      folderOpenOutline,
      folderOutline,
      trophyOutline,
      starOutline,
      calendarOutline,
      closeOutline,
      filterOutline,
      refresh
    });
  }

  ngOnInit(): void {
    this.cargar();
  }

  cargar(): void {
    this.loading = true;
    this.error = null;

    this.evaluacionService.getAsignados().subscribe({
      next: (res: any) => {
        console.log('🟢 RESPUESTA ASIGNADOS:', res);

        let data = res?.data ?? res ?? [];

        // Mapear los datos para incluir la propiedad 'reabierto'
        this.proyectos = (Array.isArray(data) ? data : data ? [data] : []).map((item: any) => ({
          ...item,
          // Detectar si la evaluación fue reabierta (estado 'asignado' pero ya fue evaluado antes)
          // o si tiene algún indicador de reapertura
          reabierto: item.reabierto || item.estado === 'reabierto' || false
        }));

        this.calcularEstadisticas();
        this.aplicarFiltros();

        this.loading = false;
      },
      error: (err) => {
        console.error('❌ ERROR CARGANDO ASIGNADOS:', err);
        this.error = err.error?.mensaje || 'Error al cargar los proyectos asignados';
        this.proyectos = [];
        this.proyectosFiltrados = [];
        this.loading = false;
      }
    });
  }

  calcularEstadisticas(): void {
    this.totalAsignados = this.proyectos.length;
    this.pendientes = this.proyectos.filter(p => !p.yaEvaluado).length;
    this.evaluados = this.proyectos.filter(p => p.yaEvaluado).length;
  }

  buscarProyectos(event: any): void {
    this.filtroBusqueda = event?.target?.value || '';
    this.aplicarFiltros();
  }

  aplicarFiltros(): void {
    let filtered = [...this.proyectos];

    if (this.filtroBusqueda.trim()) {
      const texto = this.filtroBusqueda.toLowerCase().trim();
      filtered = filtered.filter(p =>
        p.proyecto?.nombre?.toLowerCase().includes(texto) ||
        p.proyecto?.tipo?.toLowerCase().includes(texto)
      );
    }

    if (this.filtroEstado === 'pendientes') {
      filtered = filtered.filter(p => !p.yaEvaluado);
    } else if (this.filtroEstado === 'evaluados') {
      filtered = filtered.filter(p => p.yaEvaluado);
    }

    // Ordenar: primero los que están pendientes o reabiertos
    filtered.sort((a, b) => {
      // Si uno está reabierto, va primero
      if (a.reabierto && !b.reabierto) return -1;
      if (!a.reabierto && b.reabierto) return 1;
      // Si uno está pendiente y el otro no
      if (!a.yaEvaluado && b.yaEvaluado) return -1;
      if (a.yaEvaluado && !b.yaEvaluado) return 1;
      return 0;
    });

    this.proyectosFiltrados = filtered;
  }

  cambiarFiltro(estado: string): void {
    this.filtroEstado = estado;
    this.aplicarFiltros();
  }

  /**
   * EVALUAR O RE-EVALUAR PROYECTO
   * Redirige al formulario de evaluación
   */
  evaluar(evaluacionId: number): void {
    console.log('➡️ ENTRANDO A FORMULARIO ID:', evaluacionId);

    if (!evaluacionId) {
      console.error('❌ ID de evaluación no válido');
      return;
    }

    this.router.navigate([
      '/evaluador/formulario-evaluacion',
      evaluacionId
    ]);
  }

  recargar(): void {
    this.cargar();
  }

  getPorcentajeProgreso(): number {
    if (this.totalAsignados === 0) return 0;
    return Math.round((this.evaluados / this.totalAsignados) * 100);
  }

  tieneProyectosPendientes(): boolean {
    return this.pendientes > 0;
  }

  getStatusIcon(yaEvaluado: boolean): string {
    return yaEvaluado ? 'checkmark-circle-outline' : 'time-outline';
  }

  getStatusText(yaEvaluado: boolean): string {
    return yaEvaluado ? 'Evaluado' : 'Pendiente';
  }

  getStatusClass(yaEvaluado: boolean): string {
    return yaEvaluado ? 'status-completed' : 'status-pending';
  }

  trackByEvaluacionId(index: number, item: ProyectoAsignado): number {
    return item?.evaluacionId ?? index;
  }
}