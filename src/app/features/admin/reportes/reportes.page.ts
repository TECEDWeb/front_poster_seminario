import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
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
  peopleOutline,
  eyeOutline,
  refreshOutline,
  closeOutline,
  filterOutline,
  documentTextOutline,
  personOutline,
  barChartOutline,
  calendarOutline,
  closeCircleOutline,
  checkmarkCircleOutline,
  alertCircleOutline,
  gridOutline,
  listOutline,
  chevronForwardOutline,
  chatbubbleOutline,
  chevronUpOutline,
  chevronDownOutline,
  settingsOutline,
  trashOutline,
  createOutline,
  ribbonOutline,
  medalOutline
} from 'ionicons/icons';
import { ReporteService } from '../../../core/services/reporte.service';
import { EvaluacionService } from '../../../core/services/evaluacion.service';
import { AuthService } from '../../../core/services/auth.service';

interface StatCard {
  icon: string;
  label: string;
  value: number | string;
  color: string;
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

interface EvaluadorResumen {
  nombre: string;
  rol: string;
  proyectosEvaluados: number;
  promedioOtorgado: number;
  puntajes: number[];
}

interface Ganador {
  id: number;
  nombre: string;
  area?: string;
  nivel?: string;
  promedio: number;
  evaluaciones: number;
  evaluadores?: any[];
  posicion: number;
  medalla: string;
  clase: string;
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
  evaluadoresResumen: EvaluadorResumen[] = [];
  nombresEvaluadores: string[] = [];

  cargando: boolean = false;
  error: string | null = null;
  fechaActualizacion: Date = new Date();
  statsCards: StatCard[] = [];

  vistaActual: 'proyectos' | 'evaluadores' = 'proyectos';

  filtroBusqueda: string = '';
  filtroStatus: string = 'todos';
  filtroEvaluador: string = 'todos';

  ganadores: Ganador[] = [];

  modalAbierto = false;
  proyectoSeleccionado: DetalleProyecto | null = null;
  cargandoDetalle: boolean = false;

  modalRespuestasAbierto = false;
  cargandoRespuestas = false;
  errorRespuestas: string | null = null;
  respuestasDetalle: any = null;

  esAdmin: boolean = false;

  constructor(
    private reporteService: ReporteService,
    private evaluacionService: EvaluacionService,
    private authService: AuthService,
    private router: Router
  ) {
    addIcons({
      downloadOutline,
      statsChartOutline,
      folderOutline,
      checkmarkDoneOutline,
      trophyOutline,
      documentOutline,
      timeOutline,
      funnelOutline,
      peopleOutline,
      eyeOutline,
      refreshOutline,
      closeOutline,
      filterOutline,
      documentTextOutline,
      personOutline,
      barChartOutline,
      calendarOutline,
      closeCircleOutline,
      checkmarkCircleOutline,
      alertCircleOutline,
      gridOutline,
      listOutline,
      chevronForwardOutline,
      chatbubbleOutline,
      chevronUpOutline,
      chevronDownOutline,
      settingsOutline,
      trashOutline,
      createOutline,
      ribbonOutline,
      medalOutline
    });

    this.esAdmin = this.authService.esAdmin();
  }

  ngOnInit(): void {
    this.cargarDatos();
  }

  cargarDatos(): void {
    this.cargando = true;
    this.error = null;

    this.reporteService.getStats().subscribe({
      next: (res: any) => {
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
        let data = res?.data ?? res ?? [];

        this.proyectos = data.map((item: any, index: number) => ({
          ...item,
          id: item.id || item.proyecto_id || index + 1,
          nombre: item.proyecto || item.nombre || 'Proyecto sin nombre',
          _expandido: false,
          evaluacionId: item.evaluacion_id || item.evaluacionId || null,
          estadoEvaluacion: item.estado_evaluacion || item.estado || 'asignado'
        }));

        this.calcularGanadores();
        this.construirResumenEvaluadores();
        this.aplicarFiltros();
        this.cargando = false;
      },
      error: (err) => {
        console.error('Error proyectos:', err);
        this.error = err.error?.mensaje || 'Error al cargar proyectos';
        this.proyectos = [];
        this.proyectosFiltrados = [];
        this.ganadores = [];
        this.cargando = false;
      }
    });
  }

  calcularGanadores(): void {
    if (!this.proyectos || this.proyectos.length === 0) {
      this.ganadores = [];
      return;
    }

    const proyectosConEvaluaciones = this.proyectos.filter(p => 
      p.evaluaciones && p.evaluaciones.length > 0 && p.promedio > 0
    );

    if (proyectosConEvaluaciones.length === 0) {
      this.ganadores = [];
      return;
    }

    const sorted = [...proyectosConEvaluaciones].sort((a, b) => 
      (b.promedio || 0) - (a.promedio || 0)
    );

    this.ganadores = sorted.slice(0, 3).map((proyecto, index) => ({
      id: proyecto.id,
      nombre: proyecto.nombre || proyecto.proyecto || 'Proyecto',
      area: proyecto.area || 'Sin área',
      nivel: proyecto.nivel || 'Sin nivel',
      promedio: proyecto.promedio || 0,
      evaluaciones: proyecto.evaluaciones?.length || 0,
      evaluadores: proyecto.evaluadores || [],
      posicion: index + 1,
      medalla: index === 0 ? '🥇' : index === 1 ? '🥈' : '🥉',
      clase: index === 0 ? 'gold' : index === 1 ? 'silver' : 'bronze'
    }));

    console.log('🏆 Ganadores del concurso:', this.ganadores);
  }

  verGanadores(): void {
    if (!this.ganadores || this.ganadores.length === 0) {
      this.mostrarMensaje('No hay ganadores aún', 'error');
      return;
    }

    let mensaje = '🏆 PODIO DEL CONCURSO 🏆\n\n';
    mensaje += '━━━━━━━━━━━━━━━━━━━━━━━━━━\n\n';
    
    this.ganadores.forEach((g, index) => {
      const medalla = g.medalla || (index === 0 ? '🥇' : index === 1 ? '🥈' : '🥉');
      const posicion = index === 0 ? '🥇 1er Lugar' : index === 1 ? '🥈 2do Lugar' : '🥉 3er Lugar';
      
      mensaje += `${medalla} ${posicion}\n`;
      mensaje += `📌 ${g.nombre}\n`;
      mensaje += `📊 Promedio: ${g.promedio.toFixed(2)} pts\n`;
      mensaje += `📝 Evaluaciones: ${g.evaluaciones || 0}\n`;
      mensaje += `🏷️ Área: ${g.area || 'Sin área'}\n`;
      mensaje += '\n━━━━━━━━━━━━━━━━━━━━━━━━━━\n\n';
    });

    mensaje += `📈 Total de proyectos evaluados: ${this.proyectos?.length || 0}\n`;
    mensaje += `🏅 Promedio general: ${this.reportes?.promedio?.toFixed(2) || '0.00'}`;

    alert(mensaje);
  }

  toggleProyecto(proyecto: any): void {
    proyecto._expandido = !proyecto._expandido;
  }

  actualizarStatsCards(): void {
    this.statsCards = [
      { icon: 'folder-outline', label: 'Proyectos', value: this.reportes.proyectos || 0, color: 'blue' },
      { icon: 'checkmark-done-outline', label: 'Evaluaciones', value: this.reportes.evaluaciones || 0, color: 'green' },
      { icon: 'stats-chart-outline', label: 'Completadas', value: this.reportes.completadas || 0, color: 'orange' },
      {
        icon: 'trophy-outline',
        label: 'Promedio general',
        value: this.reportes.promedio ? this.reportes.promedio.toFixed(1) : '0.0',
        color: 'purple'
      }
    ];
  }

  construirResumenEvaluadores(): void {
    const mapa = new Map<string, EvaluadorResumen>();

    this.proyectos.forEach(p => {
      (p.evaluadores || []).forEach((e: any) => {
        const nombre = e.nombre || 'Evaluador sin nombre';
        if (!mapa.has(nombre)) {
          mapa.set(nombre, {
            nombre,
            rol: e.rol || 'Evaluador',
            proyectosEvaluados: 0,
            promedioOtorgado: 0,
            puntajes: []
          });
        }
        const entry = mapa.get(nombre)!;
        entry.proyectosEvaluados++;
        if (e.puntaje != null) {
          entry.puntajes.push(Number(e.puntaje));
        }
      });
    });

    this.evaluadoresResumen = Array.from(mapa.values()).map(e => ({
      ...e,
      promedioOtorgado: e.puntajes.length
        ? e.puntajes.reduce((a, b) => a + b, 0) / e.puntajes.length
        : 0
    })).sort((a, b) => b.proyectosEvaluados - a.proyectosEvaluados);

    this.nombresEvaluadores = this.evaluadoresResumen.map(e => e.nombre);
  }

  cambiarVista(vista: 'proyectos' | 'evaluadores'): void {
    this.vistaActual = vista;
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

    if (this.filtroEvaluador !== 'todos') {
      filtered = filtered.filter(p =>
        (p.evaluadores || []).some((e: any) => e.nombre === this.filtroEvaluador)
      );
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
        this.mostrarMensaje('Error al exportar el reporte general', 'error');
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
        this.mostrarMensaje('Error al exportar el PDF general', 'error');
      }
    });
  }

  exportarProyectoExcel(proyecto: any): void {
    const id = proyecto.id || proyecto.proyecto_id || proyecto._id;
    if (!id) {
      this.mostrarMensaje('No se puede exportar: ID del proyecto no encontrado', 'error');
      return;
    }
    const nombre = proyecto.proyecto || proyecto.nombre || 'proyecto';
    this.reporteService.exportarProyecto(id).subscribe({
      next: (archivo: Blob) => {
        this.descargarArchivo(archivo, `reporte-${nombre}-${new Date().toISOString().split('T')[0]}.xlsx`);
      },
      error: (err) => {
        console.error('Error exportando proyecto:', err);
        this.mostrarMensaje('Error al exportar el reporte del proyecto', 'error');
      }
    });
  }

  exportarProyectoPDF(proyecto: any): void {
    const id = proyecto.id || proyecto.proyecto_id || proyecto._id;
    if (!id) {
      this.mostrarMensaje('No se puede exportar: ID del proyecto no encontrado', 'error');
      return;
    }
    const nombre = proyecto.proyecto || proyecto.nombre || 'proyecto';
    this.reporteService.exportarPDFProyecto(id).subscribe({
      next: (archivo: Blob) => {
        this.descargarArchivo(archivo, `reporte-${nombre}-${new Date().toISOString().split('T')[0]}.pdf`);
      },
      error: (err) => {
        console.error('Error exportando PDF proyecto:', err);
        this.mostrarMensaje('Error al exportar el PDF del proyecto', 'error');
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

  // ============================================
  // ADMIN ACTIONS
  // ============================================

  editarEvaluacionAdmin(proyecto: any): void {
    const evaluacionId = proyecto.evaluacionId || proyecto.evaluacion_id;
    if (!evaluacionId) {
      this.mostrarMensaje('No se encontró la evaluación para este proyecto', 'error');
      return;
    }
    this.router.navigate(['/admin/evaluaciones/formulario', evaluacionId]);
  }

  async reabrirEvaluacion(proyecto: any): Promise<void> {
    const evaluacionId = proyecto.evaluacionId || proyecto.evaluacion_id;
    if (!evaluacionId) {
      this.mostrarMensaje('No se encontró la evaluación para este proyecto', 'error');
      return;
    }

    if (!confirm(`¿Estás seguro de reabrir la evaluación del proyecto "${proyecto.nombre || proyecto.proyecto}"? El evaluador podrá modificarla nuevamente.`)) {
      return;
    }

    try {
      const result = await this.evaluacionService.reabrirEvaluacion(evaluacionId).toPromise();
      this.mostrarMensaje(`Evaluación de "${proyecto.nombre || proyecto.proyecto}" reabierta correctamente`, 'success');
      this.recargar();
    } catch (err: any) {
      console.error('❌ Error reabriendo:', err);
      this.mostrarMensaje(err.error?.mensaje || 'Error al reabrir la evaluación', 'error');
    }
  }

  async eliminarEvaluacion(proyecto: any): Promise<void> {
    const evaluacionId = proyecto.evaluacionId || proyecto.evaluacion_id;
    if (!evaluacionId) {
      this.mostrarMensaje('No se encontró la evaluación para este proyecto', 'error');
      return;
    }

    if (!confirm(`¿Estás seguro de eliminar la evaluación del proyecto "${proyecto.nombre || proyecto.proyecto}"? Esta acción no se puede deshacer.`)) {
      return;
    }

    try {
      const result = await this.evaluacionService.eliminarEvaluacion(evaluacionId).toPromise();
      this.mostrarMensaje(`Evaluación de "${proyecto.nombre || proyecto.proyecto}" eliminada correctamente`, 'success');
      this.recargar();
    } catch (err: any) {
      console.error('❌ Error eliminando:', err);
      this.mostrarMensaje(err.error?.mensaje || 'Error al eliminar la evaluación', 'error');
    }
  }

  verDetalleEvaluacion(proyecto: any): void {
    this.verDetalle(proyecto);
  }

  // ============================================
  // DETALLE DE PROYECTO
  // ============================================

  async verDetalle(proyecto: any): Promise<void> {
    const id = proyecto.id || proyecto.proyecto_id || proyecto._id;
    if (!id) {
      this.mostrarMensaje('No se puede ver detalle: ID del proyecto no encontrado', 'error');
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

  verRespuestas(evaluacionId: number): void {
    if (!evaluacionId) {
      this.mostrarMensaje('No se puede ver el detalle: ID de evaluación no disponible', 'error');
      return;
    }

    this.modalRespuestasAbierto = true;
    this.cargandoRespuestas = true;
    this.errorRespuestas = null;
    this.respuestasDetalle = null;

    this.reporteService.getDetalleEvaluacion(evaluacionId).subscribe({
      next: (res: any) => {
        if (res?.ok === false) {
          this.errorRespuestas = res.mensaje || 'No se pudo cargar el detalle';
          this.cargandoRespuestas = false;
          return;
        }

        const data = res?.data ?? res;

        const seccionesMap: { [nombre: string]: any[] } = {};
        (data.detalles || []).forEach((d: any) => {
          if (!seccionesMap[d.seccion]) {
            seccionesMap[d.seccion] = [];
          }
          seccionesMap[d.seccion].push(d);
        });

        this.respuestasDetalle = {
          evaluadorNombre: data.evaluadorNombre,
          evaluadorRol: data.evaluadorRol,
          proyectoNombre: data.proyectoNombre,
          concursoNombre: data.concursoNombre,
          rubricaNombre: data.rubricaNombre,
          observaciones: data.observaciones || '',
          fecha: data.fecha,
          puntajeMaximo: data.puntajeMaximo,
          secciones: Object.keys(seccionesMap).map(nombre => ({
            nombre,
            items: seccionesMap[nombre]
          }))
        };

        this.cargandoRespuestas = false;
      },
      error: (err) => {
        console.error('Error cargando respuestas:', err);
        this.errorRespuestas = err.error?.mensaje || 'Error al cargar las respuestas';
        this.cargandoRespuestas = false;
      }
    });
  }

  cerrarModalRespuestas(): void {
    this.modalRespuestasAbierto = false;
    this.respuestasDetalle = null;
    this.errorRespuestas = null;
  }

  verProyectosDeEvaluador(nombreEvaluador: string): void {
    this.filtroEvaluador = nombreEvaluador;
    this.vistaActual = 'proyectos';
    this.aplicarFiltros();
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
    this.filtroEvaluador = 'todos';
    this.aplicarFiltros();
  }

  // ============================================
  // UTILIDADES
  // ============================================

  private mostrarMensaje(mensaje: string, tipo: 'success' | 'error'): void {
    const icono = tipo === 'success' ? '✅' : '❌';
    alert(`${icono} ${mensaje}`);
  }

  getRandomColor(proyecto: string): string {
    const colors = ['color-blue', 'color-green', 'color-gold', 'color-purple', 'color-pink', 'color-cyan', 'color-indigo'];
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

  getEstadoEvaluacionClass(estado: string): string {
    return estado === 'evaluado' ? 'status-excellent' : 'status-regular';
  }

  trackById(index: number, item: any): number {
    return item?.id ?? item?.proyecto_id ?? index;
  }

  trackByNombre(index: number, item: EvaluadorResumen): string {
    return item?.nombre ?? index.toString();
  }
}