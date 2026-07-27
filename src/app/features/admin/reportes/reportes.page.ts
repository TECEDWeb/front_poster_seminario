import { Component, OnInit, OnDestroy } from '@angular/core';
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
  trophy,
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
  medalOutline,
  medal,
  schoolOutline,
  starOutline,
  star
} from 'ionicons/icons';
import { ReporteService } from '../../../core/services/reporte.service';
import { EvaluacionService } from '../../../core/services/evaluacion.service';
import { AuthService } from '../../../core/services/auth.service';
import { ConcursoService } from '../../../core/services/concurso.service';

interface StatCard {
  icon: string;
  label: string;
  value: number | string;
  color: string;
}

interface PersonaProyecto {
  nombre: string;
  encargado?: boolean;
  cedula?: string;
  email?: string;
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
  puntajeMaximo: number;
  evaluaciones: number;
  evaluadores?: any[];
  posicion: number;
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
export class ReportesPage implements OnInit, OnDestroy {

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
  exportando: boolean = false;
  error: string | null = null;
  fechaActualizacion: Date = new Date();
  statsCards: StatCard[] = [];

  vistaActual: 'proyectos' | 'evaluadores' = 'proyectos';

  filtroBusqueda: string = '';
  filtroStatus: string = 'todos';
  filtroEvaluador: string = 'todos';

  filtroConcurso: string = '';

  concursosDisponibles: any[] = [];
  cargandoConcursos: boolean = false;

  ganadores: Ganador[] = [];

  modalRespuestasAbierto = false;
  cargandoRespuestas = false;
  errorRespuestas: string | null = null;
  respuestasDetalle: any = null;

  esAdmin: boolean = false;

  constructor(
    private reporteService: ReporteService,
    private evaluacionService: EvaluacionService,
    private authService: AuthService,
    private concursoService: ConcursoService,
    private router: Router
  ) {
    addIcons({
      downloadOutline,
      statsChartOutline,
      folderOutline,
      checkmarkDoneOutline,
      trophyOutline,
      trophy,
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
      medalOutline,
      medal,
      schoolOutline,
      starOutline,
      star
    });

    this.esAdmin = this.authService.esAdmin();
  }

  private autoRefreshHandle: any;
  private readonly AUTO_REFRESH_MS = 60000;

  ngOnInit(): void {
    this.cargarDatos();
    this.cargarConcursos();
    this.iniciarAutoRefresh();
  }

  ngOnDestroy(): void {
    if (this.autoRefreshHandle) {
      clearInterval(this.autoRefreshHandle);
    }
  }

  private iniciarAutoRefresh(): void {
    this.autoRefreshHandle = setInterval(() => {
      this.cargarDatos(true);
    }, this.AUTO_REFRESH_MS);
  }

  cargarConcursos(): void {
    this.cargandoConcursos = true;
    this.concursoService.listar().subscribe({
      next: (res: any) => {
        this.concursosDisponibles = res?.data ?? res ?? [];
        this.cargandoConcursos = false;
      },
      error: (err) => {
        console.error('Error cargando concursos:', err);
        this.concursosDisponibles = [];
        this.cargandoConcursos = false;
      }
    });
  }

  get haySeleccionConcurso(): boolean {
    return !!this.filtroConcurso;
  }

  cargarDatos(silencioso: boolean = false): void {
    if (!silencioso) {
      this.cargando = true;
    }
    this.error = null;

    this.reporteService.getStats().subscribe({
      next: (res: any) => {
        this.reportes = res?.data ?? res ?? this.reportes;
        this.actualizarStatsCards();
        this.fechaActualizacion = new Date();
      },
      error: (err) => {
        console.error('Error stats:', err);
        if (!silencioso) {
          this.error = err.error?.mensaje || 'Error al cargar estadísticas';
        }
        this.actualizarStatsCards();
      }
    });

    this.reporteService.getReporteProyectos().subscribe({
      next: (res: any) => {
        let data = res?.data ?? res ?? [];

        const expandidosPrevios = new Set(
          this.proyectos.filter(p => p._expandido).map(p => p.id)
        );

        this.proyectos = data.map((item: any, index: number) => {
          const id = item.id || item.proyecto_id || index + 1;
          return {
            ...item,
            id,
            nombre: item.proyecto || item.nombre || 'Proyecto sin nombre',
            _expandido: expandidosPrevios.has(id),
            evaluacionId: item.evaluacion_id || item.evaluacionId || null,
            estadoEvaluacion: item.estado_evaluacion || item.estado || 'asignado',
            participantes: item.participantes || [],
            tutores: item.tutores || [],
            puntajeMaximo: item.puntajeMaximo || item.puntaje_maximo || 100,
            concursoId: item.concursoId ?? item.concurso_id ?? null,
            concursoNombre: item.concursoNombre ?? item.concurso_nombre ?? null
          };
        });

        this.calcularGanadores();
        this.construirResumenEvaluadores();
        this.aplicarFiltros();
        this.cargando = false;
      },
      error: (err) => {
        console.error('Error proyectos:', err);
        if (!silencioso) {
          this.error = err.error?.mensaje || 'Error al cargar proyectos';
          this.proyectos = [];
          this.proyectosFiltrados = [];
          this.ganadores = [];
        }
        this.cargando = false;
      }
    });
  }

  calcularGanadores(): void {
    if (!this.filtroConcurso) {
      this.ganadores = [];
      return;
    }

    if (!this.proyectos || this.proyectos.length === 0) {
      this.ganadores = [];
      return;
    }

    const concursoIdNum = Number(this.filtroConcurso);
    const baseParaPodio = this.proyectos.filter(p => Number(p.concursoId) === concursoIdNum);

    const proyectosConEvaluaciones = baseParaPodio.filter(p =>
      (p.evaluaciones || 0) > 0 && (p.promedio || 0) > 0
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
      puntajeMaximo: proyecto.puntajeMaximo || 100,
      evaluaciones: proyecto.evaluaciones || 0,
      evaluadores: proyecto.evaluadores || [],
      posicion: index + 1,
      clase: index === 0 ? 'gold' : index === 1 ? 'silver' : 'bronze'
    }));
  }

  verGanadores(): void {
    if (!this.ganadores || this.ganadores.length === 0) {
      this.mostrarMensaje('No hay ganadores aún', 'error');
      return;
    }

    let mensaje = `PODIO DEL CONCURSO: ${this.getNombreConcurso(this.filtroConcurso)}\n\n`;
    mensaje += '------------------------------\n\n';

    this.ganadores.forEach((g, index) => {
      const posicion = index === 0 ? '1er Lugar' : index === 1 ? '2do Lugar' : '3er Lugar';
      const pct = this.getPorcentaje(g.promedio, g.puntajeMaximo);

      mensaje += `${posicion}\n`;
      mensaje += `Proyecto: ${g.nombre}\n`;
      mensaje += `Puntaje: ${g.promedio.toFixed(2)} / ${g.puntajeMaximo} (${pct}%)\n`;
      mensaje += `Evaluaciones: ${g.evaluaciones || 0}\n`;
      mensaje += `Área: ${g.area || 'Sin área'}\n`;
      mensaje += '\n------------------------------\n\n';
    });

    const totalDelConcurso = this.proyectosFiltrados?.length || 0;
    mensaje += `Total de proyectos evaluados en este concurso: ${totalDelConcurso}`;

    alert(mensaje);
  }

  toggleProyecto(proyecto: any): void {
    proyecto._expandido = !proyecto._expandido;
  }

  actualizarStatsCards(): void {
    this.statsCards = [
      { icon: 'folder-outline', label: 'Proyectos', value: this.reportes.proyectos || 0, color: 'blue' },
      { icon: 'checkmark-done-outline', label: 'Evaluaciones', value: this.reportes.evaluaciones || 0, color: 'gold' },
      { icon: 'stats-chart-outline', label: 'Completadas', value: this.reportes.completadas || 0, color: 'green' },
      {
        icon: 'trophy-outline',
        label: 'Promedio general',
        value: this.reportes.promedio ? this.reportes.promedio.toFixed(1) : '0.0',
        color: 'navy'
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

  onCambioConcursoSelector(): void {
    this.filtroBusqueda = '';
    this.filtroStatus = 'todos';
    this.filtroEvaluador = 'todos';
    this.aplicarFiltros();
  }

  aplicarFiltros(): void {
    this.calcularGanadores();

    if (!this.filtroConcurso) {
      this.proyectosFiltrados = [];
      return;
    }

    let filtered = [...this.proyectos];

    const concursoIdNum = Number(this.filtroConcurso);
    filtered = filtered.filter(p => Number(p.concursoId) === concursoIdNum);

    if (this.filtroBusqueda && this.filtroBusqueda.trim()) {
      const texto = this.filtroBusqueda.toLowerCase().trim();
      filtered = filtered.filter(p => {
        const nombre = (p.proyecto || p.nombre || '').toLowerCase();
        const area = (p.area || '').toLowerCase();
        const nivel = (p.nivel || '').toLowerCase();
        const tutores = (p.tutores || []).some((t: PersonaProyecto) =>
          t.nombre?.toLowerCase().includes(texto)
        );
        const participantes = (p.participantes || []).some((part: PersonaProyecto) =>
          part.nombre?.toLowerCase().includes(texto)
        );
        const evaluadores = (p.evaluadores || []).some((e: any) =>
          e.nombre?.toLowerCase().includes(texto)
        );

        return nombre.includes(texto) || area.includes(texto) || nivel.includes(texto)
          || tutores || participantes || evaluadores;
      });
    }

    if (this.filtroStatus !== 'todos') {
      filtered = filtered.filter(p => {
        const pct = this.getPorcentaje(p.promedio, p.puntajeMaximo);
        if (this.filtroStatus === 'excelente') return pct >= 80;
        if (this.filtroStatus === 'bueno') return pct >= 60 && pct < 80;
        if (this.filtroStatus === 'regular') return pct >= 40 && pct < 60;
        if (this.filtroStatus === 'bajo') return pct < 40;
        return true;
      });
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

  limpiarFiltros(): void {
    this.filtroBusqueda = '';
    this.filtroStatus = 'todos';
    this.filtroEvaluador = 'todos';
    this.aplicarFiltros();
  }

  cambiarConcurso(): void {
    this.filtroConcurso = '';
    this.filtroBusqueda = '';
    this.filtroStatus = 'todos';
    this.filtroEvaluador = 'todos';
    this.aplicarFiltros();
  }

  getNombreConcurso(id: string): string {
    if (!id) return 'Sin concurso seleccionado';
    const concurso = this.concursosDisponibles.find(c => String(c.id) === String(id));
    return concurso?.nombre || 'Concurso';
  }

  private getNombreConcursoFiltro(proyecto: any): string {
    if (proyecto.concursoNombre) return proyecto.concursoNombre;
    if (proyecto.concursoId) {
      const concurso = this.concursosDisponibles.find(c => Number(c.id) === Number(proyecto.concursoId));
      return concurso?.nombre || `Concurso #${proyecto.concursoId}`;
    }
    return 'Sin concurso';
  }

  private generarCSV(headers: string[], filas: any[][]): string {
    const escapar = (valor: any): string => {
      const texto = String(valor ?? '');
      if (texto.includes(',') || texto.includes('"') || texto.includes('\n')) {
        return `"${texto.replace(/"/g, '""')}"`;
      }
      return texto;
    };

    const filasCSV = [
      headers.map(escapar).join(','),
      ...filas.map(fila => fila.map(escapar).join(','))
    ];

    return filasCSV.join('\r\n');
  }

  private descargarArchivo(blob: Blob, nombreArchivo: string): void {
    const url = window.URL.createObjectURL(blob);
    const enlace = document.createElement('a');
    enlace.href = url;
    enlace.download = nombreArchivo;
    document.body.appendChild(enlace);
    enlace.click();
    document.body.removeChild(enlace);
    window.URL.revokeObjectURL(url);
  }

  exportarExcelConFiltros(): void {
    const datos = this.proyectosFiltrados || [];

    if (datos.length === 0) {
      this.mostrarMensaje('No hay proyectos para exportar con los filtros actuales', 'error');
      return;
    }

    const headers = [
      'Proyecto',
      'Área',
      'Nivel',
      'Tutor encargado',
      'Participantes',
      'Evaluaciones',
      'Puntaje',
      'Puntaje máximo',
      'Porcentaje',
      'Estado',
      'Concurso'
    ];

    const filas = datos.map(p => [
      p.proyecto || p.nombre || '—',
      p.area || '—',
      p.nivel || '—',
      this.tutorPrincipal(p) || '—',
      (p.participantes || []).map((part: any) => part.nombre).join(' | '),
      String(p.evaluaciones || 0),
      String(p.promedio ? p.promedio.toFixed(2) : '0.00'),
      String(p.puntajeMaximo || 100),
      `${this.getPorcentaje(p.promedio, p.puntajeMaximo)}%`,
      this.getStatusText(p.promedio, p.puntajeMaximo),
      this.getNombreConcursoFiltro(p)
    ]);

    const csvContent = this.generarCSV(headers, filas);
    const blob = new Blob(['\uFEFF' + csvContent], { type: 'text/csv;charset=utf-8;' });

    const nombreConcurso = this.getNombreConcurso(this.filtroConcurso).replace(/\s+/g, '_');
    const fecha = new Date().toISOString().split('T')[0];
    this.descargarArchivo(blob, `reporte-${nombreConcurso}-${fecha}.csv`);

    this.mostrarMensaje(`Excel exportado: ${datos.length} proyecto(s)`, 'success');
  }

  async exportarPDFConFiltros(): Promise<void> {
    const datos = this.proyectosFiltrados || [];

    if (datos.length === 0) {
      this.mostrarMensaje('No hay proyectos para exportar con los filtros actuales', 'error');
      return;
    }

    this.exportando = true;

    try {
      const { default: jsPDF } = await import('jspdf');
      const autoTableModule = await import('jspdf-autotable');
      const autoTable = autoTableModule.default;

      const doc = new jsPDF({ orientation: 'landscape', unit: 'mm', format: 'a4' });

      doc.setFontSize(16);
      doc.setTextColor(0, 27, 76);
      const titulo = `Reporte - ${this.getNombreConcurso(this.filtroConcurso)}`;
      doc.text(titulo, 14, 15);

      doc.setFontSize(9);
      doc.setTextColor(100);
      const fechaLegible = new Date().toLocaleString('es-EC');
      doc.text(`Generado: ${fechaLegible}  -  Total: ${datos.length} proyecto(s)`, 14, 21);

      const columnas = [
        'Proyecto',
        'Área',
        'Nivel',
        'Tutor',
        'Eval.',
        'Puntaje',
        '%',
        'Estado',
        'Concurso'
      ];

      const filas = datos.map(p => [
        p.proyecto || p.nombre || '—',
        p.area || '—',
        p.nivel || '—',
        this.tutorPrincipal(p) || '—',
        String(p.evaluaciones || 0),
        `${p.promedio ? p.promedio.toFixed(2) : '0.00'} / ${p.puntajeMaximo || 100}`,
        `${this.getPorcentaje(p.promedio, p.puntajeMaximo)}%`,
        this.getStatusText(p.promedio, p.puntajeMaximo),
        this.getNombreConcursoFiltro(p)
      ]);

      autoTable(doc, {
        head: [columnas],
        body: filas,
        startY: 26,
        theme: 'grid',
        headStyles: { fillColor: [0, 27, 76], textColor: 255, fontStyle: 'bold' },
        styles: { fontSize: 8, cellPadding: 3 },
        alternateRowStyles: { fillColor: [232, 240, 254] }
      });

      const nombreConcurso = this.getNombreConcurso(this.filtroConcurso).replace(/\s+/g, '_');
      const fecha = new Date().toISOString().split('T')[0];
      doc.save(`reporte-${nombreConcurso}-${fecha}.pdf`);

      this.mostrarMensaje(`PDF exportado: ${datos.length} proyecto(s)`, 'success');
    } catch (err) {
      console.error('Error generando PDF:', err);
      this.mostrarMensaje('Error al generar el PDF', 'error');
    } finally {
      this.exportando = false;
    }
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
      await this.evaluacionService.reabrirEvaluacion(evaluacionId).toPromise();
      this.mostrarMensaje(`Evaluación de "${proyecto.nombre || proyecto.proyecto}" reabierta correctamente`, 'success');
      this.recargar();
    } catch (err: any) {
      console.error('Error reabriendo:', err);
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
      await this.evaluacionService.eliminarEvaluacion(evaluacionId).toPromise();
      this.mostrarMensaje(`Evaluación de "${proyecto.nombre || proyecto.proyecto}" eliminada correctamente`, 'success');
      this.recargar();
    } catch (err: any) {
      console.error('Error eliminando:', err);
      this.mostrarMensaje(err.error?.mensaje || 'Error al eliminar la evaluación', 'error');
    }
  }

  /**
   * Abre el modal con las respuestas de la evaluación
   * @param evaluador - El objeto del evaluador (contiene posiblemente evaluacionId)
   * @param proyecto - El objeto del proyecto (para obtener el ID si es necesario)
   */
  verRespuestas(evaluador: any, proyecto: any): void {
    // 1. Intentar obtener el evaluacionId del evaluador
    let evaluacionId = evaluador?.evaluacionId || evaluador?.evaluacion_id;
    
    // 2. Si no tiene, intentar obtenerlo del proyecto
    if (!evaluacionId) {
      evaluacionId = proyecto?.evaluacionId || proyecto?.evaluacion_id;
    }

    // 3. Si aún no tenemos ID, obtenerlo del detalle del proyecto
    if (!evaluacionId) {
      const proyectoId = proyecto?.id || proyecto?.proyecto_id || proyecto?._id;
      if (!proyectoId) {
        this.mostrarMensaje('No se puede obtener el detalle: ID del proyecto no encontrado', 'error');
        return;
      }

      this.cargandoRespuestas = true;
      this.modalRespuestasAbierto = true;

      this.reporteService.getDetalleProyecto(proyectoId).subscribe({
        next: (res: any) => {
          const data = res?.data ?? res;
          // Buscar la evaluación del evaluador específico
          const evaluaciones = data.evaluaciones || [];
          
          // Buscar por nombre del evaluador
          const evaluacionEncontrada = evaluaciones.find((ev: any) => 
            ev.evaluador === evaluador?.nombre
          );
          
          if (evaluacionEncontrada?.id) {
            this.abrirModalRespuestas(evaluacionEncontrada.id);
          } else {
            // Si no encuentra por nombre, tomar la primera evaluada
            const evaluada = evaluaciones.find((ev: any) => ev.estado === 'evaluado');
            if (evaluada?.id) {
              this.abrirModalRespuestas(evaluada.id);
            } else {
              this.cargandoRespuestas = false;
              this.mostrarMensaje('No hay evaluaciones completadas para este proyecto', 'error');
            }
          }
        },
        error: (err) => {
          console.error('Error cargando detalle del proyecto:', err);
          this.cargandoRespuestas = false;
          this.mostrarMensaje('Error al obtener el detalle del proyecto', 'error');
        }
      });
      return;
    }

    // 4. Si tenemos el ID, abrir el modal directamente
    this.abrirModalRespuestas(evaluacionId);
  }

  /**
   * Abre el modal con las respuestas de la evaluación
   */
  private abrirModalRespuestas(evaluacionId: number): void {
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

        // Verificar si la respuesta tiene la estructura esperada
        if (!data.detalles || !Array.isArray(data.detalles)) {
          this.errorRespuestas = 'La respuesta no contiene detalles de la evaluación';
          this.cargandoRespuestas = false;
          return;
        }

        const seccionesMap: { [nombre: string]: any[] } = {};
        (data.detalles || []).forEach((d: any) => {
          const seccionNombre = d.seccion || 'Sin sección';
          if (!seccionesMap[seccionNombre]) {
            seccionesMap[seccionNombre] = [];
          }
          seccionesMap[seccionNombre].push(d);
        });

        this.respuestasDetalle = {
          evaluadorNombre: data.evaluadorNombre || 'Evaluador',
          evaluadorRol: data.evaluadorRol || 'Evaluador',
          proyectoNombre: data.proyectoNombre || 'Proyecto',
          concursoNombre: data.concursoNombre || '',
          rubricaNombre: data.rubricaNombre || 'Rúbrica',
          observaciones: data.observaciones || '',
          fecha: data.fecha || null,
          puntajeMaximo: data.puntajeMaximo || 100,
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

  private mostrarMensaje(mensaje: string, tipo: 'success' | 'error'): void {
    const prefijo = tipo === 'success' ? '[OK]' : '[Error]';
    alert(`${prefijo} ${mensaje}`);
  }

  tutorPrincipal(proyecto: any): string | null {
    const tutores = proyecto?.tutores || [];
    if (tutores.length === 0) return null;
    return tutores.find((t: PersonaProyecto) => t.encargado)?.nombre || tutores[0]?.nombre || null;
  }

  getRandomColor(proyecto: string): string {
    const colors = ['color-blue', 'color-gold', 'color-navy', 'color-teal', 'color-green', 'color-slate'];
    const index = proyecto?.length ? proyecto.length % colors.length : 0;
    return colors[index];
  }

  getPorcentaje(promedio: number, maximo: number = 100): number {
    if (!promedio || !maximo) return 0;
    return Math.min(Math.round((promedio / maximo) * 100), 100);
  }

  getStatusClass(promedio: number, maximo: number = 100): string {
    if (!promedio) return 'status-low';
    const pct = this.getPorcentaje(promedio, maximo);
    if (pct >= 80) return 'status-excellent';
    if (pct >= 60) return 'status-good';
    if (pct >= 40) return 'status-regular';
    return 'status-low';
  }

  getStatusText(promedio: number, maximo: number = 100): string {
    if (!promedio) return 'Sin datos';
    const pct = this.getPorcentaje(promedio, maximo);
    if (pct >= 80) return 'Excelente';
    if (pct >= 60) return 'Bueno';
    if (pct >= 40) return 'Regular';
    return 'Bajo';
  }

  getStatusIcon(promedio: number, maximo: number = 100): string {
    if (!promedio) return 'alert-circle-outline';
    const pct = this.getPorcentaje(promedio, maximo);
    if (pct >= 80) return 'checkmark-circle-outline';
    if (pct >= 60) return 'time-outline';
    if (pct >= 40) return 'alert-circle-outline';
    return 'close-circle-outline';
  }

  getColorClass(promedio: number, maximo: number = 100): string {
    if (!promedio) return 'color-gray';
    const pct = this.getPorcentaje(promedio, maximo);
    if (pct >= 80) return 'color-green';
    if (pct >= 60) return 'color-blue';
    if (pct >= 40) return 'color-orange';
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