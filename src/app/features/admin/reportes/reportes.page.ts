import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import {
  IonHeader,
  IonToolbar,
  IonButtons,
  IonMenuButton,
  IonTitle,
  IonButton,
  IonIcon,
  IonContent,
  IonSkeletonText,
  IonChip,
  IonLabel,
  IonSpinner,
  IonSearchbar,
  IonSelect,
  IonSelectOption,
  IonModal,
  IonItem,
  IonBadge
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
  eyeOutline,
  refreshOutline,
  closeOutline,
  filterOutline,
  searchOutline,
  printOutline,
  documentTextOutline,
  personOutline,
  barChartOutline,
  calendarOutline,
  closeCircleOutline,
  checkmarkCircleOutline,
  alertCircleOutline
} from 'ionicons/icons';
import { ReporteService } from '../../../core/services/reporte.service';

interface StatCard {
  icon: string;
  label: string;
  value: number | string;
  color: string;
  change?: number;
}

interface DetalleProyecto {
  id: number;
  nombre: string;
  descripcion: string;
  evaluaciones: any[];
  promedio: number;
  evaluadores: any[];
  puntajeMaximo: number;
}

@Component({
  selector: 'app-reportes',
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
    IonButton,
    IonIcon,
    IonContent,
    IonSkeletonText,
    IonChip,
    IonLabel,
    IonSpinner,
    IonSearchbar,
    IonSelect,
    IonSelectOption,
    IonModal,
    IonItem,
    IonBadge
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
  error: string | null = null;
  fechaActualizacion: Date = new Date();
  statsCards: StatCard[] = [];

  // Filtros
  filtroBusqueda: string = '';
  filtroStatus: string = 'todos';

  // Modal de detalle
  modalAbierto = false;
  proyectoSeleccionado: DetalleProyecto | null = null;
  cargandoDetalle: boolean = false;

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
      eyeOutline,
      refreshOutline,
      closeOutline,
      filterOutline,
      searchOutline,
      printOutline,
      documentTextOutline,
      personOutline,
      barChartOutline,
      calendarOutline,
      closeCircleOutline,
      checkmarkCircleOutline,
      alertCircleOutline
    });
  }

  ngOnInit(): void {
    this.cargarDatos();
  }

  cargarDatos(): void {
    this.cargando = true;
    this.error = null;

    this.reporteService.getStats().subscribe({
      next: (res: any) => {
        console.log('STATS:', res);
        this.reportes = res?.data ?? res ?? this.reportes;
        this.actualizarStatsCards();
        this.fechaActualizacion = new Date();
      },
      error: (err) => {
        console.error('Error stats:', err);
        this.error = err.error?.mensaje || 'Error al cargar estadísticas';
        this.actualizarStatsCards();
      }
    });

    this.reporteService.getReporteProyectos().subscribe({
      next: (res: any) => {
        console.log('PROYECTOS:', res);
        this.proyectos = res?.data ?? res ?? [];
        this.aplicarFiltros();
        this.cargando = false;
      },
      error: (err) => {
        console.error('Error proyectos:', err);
        this.error = err.error?.mensaje || 'Error al cargar proyectos';
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

  aplicarFiltros(): void {
    let filtered = [...this.proyectos];

    if (this.filtroBusqueda && this.filtroBusqueda.trim()) {
      const texto = this.filtroBusqueda.toLowerCase().trim();
      filtered = filtered.filter(p =>
        p.proyecto?.toLowerCase().includes(texto) ||
        p.nombre?.toLowerCase().includes(texto)
      );
    }

    if (this.filtroStatus === 'excelente') {
      filtered = filtered.filter(p => (p.promedio || 0) >= 8);
    } else if (this.filtroStatus === 'bueno') {
      filtered = filtered.filter(p => (p.promedio || 0) >= 6 && (p.promedio || 0) < 8);
    } else if (this.filtroStatus === 'regular') {
      filtered = filtered.filter(p => (p.promedio || 0) >= 4 && (p.promedio || 0) < 6);
    } else if (this.filtroStatus === 'bajo') {
      filtered = filtered.filter(p => (p.promedio || 0) < 4);
    }

    this.proyectosFiltrados = filtered;
  }

  recargar(): void {
    this.cargarDatos();
  }

  // =========================
  // EXPORTAR FUNCIONES
  // =========================

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
        alert('Error al exportar el reporte general');
      }
    });
  }

  exportarProyecto(proyecto: any, formato: 'excel' | 'pdf' = 'excel'): void {
    const id = proyecto.id || proyecto.proyecto_id;
    if (!id) {
      alert('No se puede exportar: ID del proyecto no encontrado');
      return;
    }

    const extension = formato === 'excel' ? 'xlsx' : 'pdf';
    const nombreArchivo = `reporte-${proyecto.proyecto || 'proyecto'}-${new Date().toISOString().split('T')[0]}.${extension}`;

    if (formato === 'excel') {
      this.reporteService.exportarProyecto(id).subscribe({
        next: (archivo: Blob) => {
          const url = window.URL.createObjectURL(archivo);
          const enlace = document.createElement('a');
          enlace.href = url;
          enlace.download = nombreArchivo;
          enlace.click();
          window.URL.revokeObjectURL(url);
        },
        error: (err) => {
          console.error('Error exportando proyecto:', err);
          alert('Error al exportar el reporte del proyecto');
        }
      });
    } else {
      // Exportar a PDF
      this.exportarProyectoPDF(id, nombreArchivo);
    }
  }

  exportarProyectoPDF(proyectoId: number, nombreArchivo: string): void {
    // Usar el detalle para generar PDF
    this.reporteService.getDetalleProyecto(proyectoId).subscribe({
      next: (data: any) => {
        const detalle = data?.data ?? data;
        this.generarPDF(detalle, nombreArchivo);
      },
      error: (err) => {
        console.error('Error generando PDF:', err);
        alert('Error al generar el PDF del proyecto');
      }
    });
  }

  generarPDF(detalle: any, nombreArchivo: string): void {
    // Aquí iría la lógica para generar PDF
    // Por ahora, mostramos un mensaje
    alert('📄 Funcionalidad de PDF en desarrollo. Se generará un PDF con el detalle completo del proyecto.');
    console.log('Generando PDF para:', detalle);
  }

  // =========================
  // VER DETALLE
  // =========================

  async verDetalle(proyecto: any): Promise<void> {
    const id = proyecto.id || proyecto.proyecto_id;
    if (!id) {
      alert('No se puede ver detalle: ID del proyecto no encontrado');
      return;
    }

    this.cargandoDetalle = true;
    this.modalAbierto = true;
    this.proyectoSeleccionado = null;

    this.reporteService.getDetalleProyecto(id).subscribe({
      next: (res: any) => {
        const data = res?.data ?? res;
        this.proyectoSeleccionado = {
          id: data.id || id,
          nombre: data.nombre || data.proyecto || 'Proyecto',
          descripcion: data.descripcion || '',
          evaluaciones: data.evaluaciones || [],
          promedio: data.promedio || 0,
          evaluadores: data.evaluadores || [],
          puntajeMaximo: data.puntajeMaximo || 100
        };
        this.cargandoDetalle = false;
      },
      error: (err) => {
        console.error('Error cargando detalle:', err);
        this.cargandoDetalle = false;
        alert('Error al cargar el detalle del proyecto');
      }
    });
  }

  cerrarModal(): void {
    this.modalAbierto = false;
    this.proyectoSeleccionado = null;
  }

  // =========================
  // UTILITIES
  // =========================

  toggleFilter(): void {
    this.aplicarFiltros();
  }

  limpiarFiltros(): void {
    this.filtroBusqueda = '';
    this.filtroStatus = 'todos';
    this.aplicarFiltros();
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

  getStatusIcon(promedio: number): string {
    if (!promedio) return 'alert-circle-outline';
    if (promedio >= 8) return 'checkmark-circle-outline';
    if (promedio >= 6) return 'time-outline';
    if (promedio >= 4) return 'alert-circle-outline';
    return 'close-circle-outline';
  }

  getColorClass(promedio: number): string {
    if (!promedio) return 'color-gray';
    if (promedio >= 8) return 'color-green';
    if (promedio >= 6) return 'color-blue';
    if (promedio >= 4) return 'color-orange';
    return 'color-red';
  }

  trackById(index: number, item: any): number {
    return item?.id ?? item?.proyecto_id ?? index;
  }
}