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
  IonSpinner,
  IonSearchbar,
  IonSelect,
  IonSelectOption,
  IonModal
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
  alertCircleOutline,
  addOutline
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
    IonSpinner,
    IonSearchbar,
    IonSelect,
    IonSelectOption,
    IonModal
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

  filtroBusqueda: string = '';
  filtroStatus: string = 'todos';

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
      alertCircleOutline,
      addOutline
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

        let data = res?.data ?? res ?? [];

        this.proyectos = data.map((item: any, index: number) => ({
          ...item,
          id: item.id || item.proyecto_id || index + 1,
          nombre: item.proyecto || item.nombre || 'Proyecto sin nombre'
        }));

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
        (p.proyecto || p.nombre || '').toLowerCase().includes(texto)
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

  exportar(): void {
    this.reporteService.exportar().subscribe({
      next: (archivo: Blob) => {
        this.descargarArchivo(archivo, `reporte-evaluaciones-${new Date().toISOString().split('T')[0]}.xlsx`);
      },
      error: (err) => {
        console.error('Error exportando:', err);
        alert('Error al exportar el reporte general');
      }
    });
  }

  exportarPDF(): void {
    this.reporteService.exportarPDF().subscribe({
      next: (archivo: Blob) => {
        this.descargarArchivo(archivo, `reporte-evaluaciones-${new Date().toISOString().split('T')[0]}.pdf`);
      },
      error: (err) => {
        console.error('Error exportando PDF:', err);
        alert('Error al exportar el PDF general');
      }
    });
  }

  exportarProyectoExcel(proyecto: any): void {
    const id = proyecto.id || proyecto.proyecto_id || proyecto._id;
    if (!id) {
      alert('No se puede exportar: ID del proyecto no encontrado');
      return;
    }

    const nombre = proyecto.proyecto || proyecto.nombre || 'proyecto';
    this.reporteService.exportarProyecto(id).subscribe({
      next: (archivo: Blob) => {
        this.descargarArchivo(archivo, `reporte-${nombre}-${new Date().toISOString().split('T')[0]}.xlsx`);
      },
      error: (err) => {
        console.error('Error exportando proyecto:', err);
        alert('Error al exportar el reporte del proyecto');
      }
    });
  }

  exportarProyectoPDF(proyecto: any): void {
    const id = proyecto.id || proyecto.proyecto_id || proyecto._id;
    if (!id) {
      alert('No se puede exportar: ID del proyecto no encontrado');
      return;
    }

    const nombre = proyecto.proyecto || proyecto.nombre || 'proyecto';
    this.reporteService.exportarPDFProyecto(id).subscribe({
      next: (archivo: Blob) => {
        this.descargarArchivo(archivo, `reporte-${nombre}-${new Date().toISOString().split('T')[0]}.pdf`);
      },
      error: (err) => {
        console.error('Error exportando PDF proyecto:', err);
        alert('Error al exportar el PDF del proyecto');
      }
    });
  }

  private descargarArchivo(archivo: Blob, nombreArchivo: string): void {
    const url = window.URL.createObjectURL(archivo);
    const enlace = document.createElement('a');
    enlace.href = url;
    enlace.download = nombreArchivo;
    document.body.appendChild(enlace);
    enlace.click();
    document.body.removeChild(enlace);
    window.URL.revokeObjectURL(url);
  }

  async verDetalle(proyecto: any): Promise<void> {
    const id = proyecto.id || proyecto.proyecto_id || proyecto._id;

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
          nombre: data.nombre || data.proyecto || proyecto.proyecto || proyecto.nombre || 'Proyecto',
          descripcion: data.descripcion || '',
          evaluaciones: data.evaluaciones || [],
          promedio: data.promedio || proyecto.promedio || 0,
          evaluadores: data.evaluadores || proyecto.evaluadores || [],
          puntajeMaximo: data.puntajeMaximo || 100
        };
        this.cargandoDetalle = false;
      },
      error: (err) => {
        console.error('Error cargando detalle:', err);
        this.cargandoDetalle = false;

        this.proyectoSeleccionado = {
          id: id,
          nombre: proyecto.proyecto || proyecto.nombre || 'Proyecto',
          descripcion: '',
          evaluaciones: [],
          promedio: proyecto.promedio || 0,
          evaluadores: proyecto.evaluadores || [],
          puntajeMaximo: 100
        };
      }
    });
  }

  cerrarModal(): void {
    this.modalAbierto = false;
    this.proyectoSeleccionado = null;
  }

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