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
  IonSkeletonText,
  IonChip,
  IonLabel,
  IonBadge,
  IonSpinner
} from '@ionic/angular/standalone';

import { Router } from '@angular/router';

import { addIcons } from 'ionicons';

import {
  documentTextOutline,
  peopleOutline,
  clipboardOutline,
  checkmarkCircleOutline,
  timeOutline,
  alertCircleOutline,
  refreshOutline,
  folderOpenOutline,
  trophyOutline,
  starOutline,
  calendarOutline
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
    IonBadge,
    IonSpinner
  ],
  templateUrl: './proyectos-asignados.page.html',
  styleUrls: ['./proyectos-asignados.page.scss']
})
export class ProyectosAsignadosPage implements OnInit {

  proyectos: ProyectoAsignado[] = [];
  proyectosFiltrados: ProyectoAsignado[] = [];
  loading: boolean = true;
  error: string | null = null;

  // Estadísticas
  totalAsignados: number = 0;
  pendientes: number = 0;
  evaluados: number = 0;

  // Filtros
  filtroEstado: string = 'todos';

  constructor(
    private evaluacionService: EvaluacionService,
    private router: Router
  ) {
    addIcons({
      documentTextOutline,
      peopleOutline,
      clipboardOutline,
      checkmarkCircleOutline,
      timeOutline,
      alertCircleOutline,
      refreshOutline,
      folderOpenOutline,
      trophyOutline,
      starOutline,
      calendarOutline
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

        // Normalizar respuesta
        let data = res?.data ?? res ?? [];

        // Asegurar que sea un array
        this.proyectos = Array.isArray(data) ? data : data ? [data] : [];

        // Calcular estadísticas
        this.calcularEstadisticas();

        // Aplicar filtros
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

  aplicarFiltros(): void {
    let filtered = [...this.proyectos];

    if (this.filtroEstado === 'pendientes') {
      filtered = filtered.filter(p => !p.yaEvaluado);
    } else if (this.filtroEstado === 'evaluados') {
      filtered = filtered.filter(p => p.yaEvaluado);
    }

    // Ordenar: pendientes primero, luego evaluados
    filtered.sort((a, b) => {
      if (a.yaEvaluado && !b.yaEvaluado) return 1;
      if (!a.yaEvaluado && b.yaEvaluado) return -1;
      return 0;
    });

    this.proyectosFiltrados = filtered;
  }

  cambiarFiltro(estado: string): void {
    this.filtroEstado = estado;
    this.aplicarFiltros();
  }

  evaluar(evaluacionId: number): void {
    console.log('➡️ ENTRANDO A FORMULARIO ID:', evaluacionId);

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
}