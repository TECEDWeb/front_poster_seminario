import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { FormsModule } from '@angular/forms';

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
  IonSearchbar
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
  refresh,
  searchOutline,
  mapOutline,
  schoolOutline,
  arrowForwardCircleOutline,
  informationCircleOutline
} from 'ionicons/icons';

import { EvaluacionService } from '../../../core/services/evaluacion.service';

// ==========================================================
// INTERFAZ PROYECTO ASIGNADO - DEFINIDA LOCALMENTE CON TODAS LAS PROPIEDADES
// ==========================================================
interface ProyectoAsignado {
  evaluacionId: number;
  yaEvaluado: boolean;
  reabierto: boolean;
  fechaAsignacion: string;
  proyecto: {
    id: number;
    nombre: string;
    descripcion?: string;
    tipo?: string;
    concursoNombre?: string;
    puntajeMaximo?: number;
    area?: string;
    nivel?: string;
    participantes: Array<{
      id: number;
      nombre: string;
      cedula?: string;
      email?: string;
    }>;
  };
}

@Component({
  selector: 'app-proyectos-asignados',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    FormsModule,
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
    IonSearchbar
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
      refresh,
      searchOutline,
      mapOutline,
      schoolOutline,
      arrowForwardCircleOutline,
      informationCircleOutline
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

        this.proyectos = (Array.isArray(data) ? data : data ? [data] : []).map((item: any) => ({
          ...item,
          reabierto: item.reabierto || item.estado === 'reabierto' || false,
          proyecto: {
            ...item.proyecto,
            // Asegurar que estas propiedades existan aunque vengan undefined
            area: item.proyecto?.area || '',
            nivel: item.proyecto?.nivel || '',
            tipo: item.proyecto?.tipo || 'Proyecto',
            concursoNombre: item.proyecto?.concursoNombre || '',
            participantes: item.proyecto?.participantes || []
          }
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

  // ==========================================================
  // 🔍 FUNCIÓN PARA NORMALIZAR TEXTO (QUITAR TILDES)
  // ==========================================================
  normalizarTexto(texto: string): string {
    if (!texto) return '';
    return texto
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')  // Elimina tildes
      .replace(/[^a-z0-9\s]/g, '');      // Elimina caracteres especiales
  }

  // ==========================================================
  // 🔍 APLICAR FILTROS (BÚSQUEDA SIN TILDES + ESTADO)
  // ==========================================================
  aplicarFiltros(): void {
    let filtered = [...this.proyectos];

    // 🔍 FILTRO DE BÚSQUEDA POR NOMBRE (SIN TILDES)
    if (this.filtroBusqueda && this.filtroBusqueda.trim()) {
      const textoBusqueda = this.normalizarTexto(this.filtroBusqueda.trim());
      
      filtered = filtered.filter(p => {
        // Normalizar todos los campos donde queremos buscar
        const nombre = this.normalizarTexto(p.proyecto?.nombre || '');
        const tipo = this.normalizarTexto(p.proyecto?.tipo || '');
        const concurso = this.normalizarTexto(p.proyecto?.concursoNombre || '');
        const area = this.normalizarTexto(p.proyecto?.area || '');
        const nivel = this.normalizarTexto(p.proyecto?.nivel || '');
        const descripcion = this.normalizarTexto(p.proyecto?.descripcion || '');

        // Buscar en todos los campos
        return nombre.includes(textoBusqueda) ||
               tipo.includes(textoBusqueda) ||
               concurso.includes(textoBusqueda) ||
               area.includes(textoBusqueda) ||
               nivel.includes(textoBusqueda) ||
               descripcion.includes(textoBusqueda);
      });
    }

    // 🏷️ FILTRO POR ESTADO
    if (this.filtroEstado === 'pendientes') {
      filtered = filtered.filter(p => !p.yaEvaluado);
    } else if (this.filtroEstado === 'evaluados') {
      filtered = filtered.filter(p => p.yaEvaluado);
    }

    // 📊 ORDENAR: primero reabiertos, luego pendientes, luego evaluados
    filtered.sort((a, b) => {
      // Reabiertos primero
      if (a.reabierto && !b.reabierto) return -1;
      if (!a.reabierto && b.reabierto) return 1;
      // Pendientes antes que evaluados
      if (!a.yaEvaluado && b.yaEvaluado) return -1;
      if (a.yaEvaluado && !b.yaEvaluado) return 1;
      return 0;
    });

    this.proyectosFiltrados = filtered;
  }

  /**
   * 🧹 LIMPIAR TODOS LOS FILTROS
   */
  limpiarFiltros(): void {
    this.filtroBusqueda = '';
    this.filtroEstado = 'todos';
    this.aplicarFiltros();
  }

  cambiarFiltro(estado: string): void {
    this.filtroEstado = estado;
    this.aplicarFiltros();
  }

  /**
   * EVALUAR O RE-EVALUAR PROYECTO
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