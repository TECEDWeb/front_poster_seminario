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

interface DetalleProyecto {
  id: number;
  nombre: string;
  descripcion: string;
  evaluaciones: any[];
  promedio: number;
  evaluadores: any[];
  participantes: PersonaProyecto[];
  tutores: PersonaProyecto[];
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
  puntajeMaximo: number;
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
  filtroConcurso: string = 'todos';

  concursosDisponibles: any[] = [];
  cargandoConcursos: boolean = false;

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
    private concursoService: ConcursoService,
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
      medalOutline,
      schoolOutline,
      starOutline,
      star
    });

    this.esAdmin = this.authService.esAdmin();
  }

  // Auto-refresh: recarga los datos cada cierto tiempo sin bloquear
  // la pantalla (sin skeleton, sin cerrar acordeones abiertos). No es
  // un WebSocket en vivo, pero acerca bastante el reporte a "tiempo real".
  private autoRefreshHandle: any;
  private readonly AUTO_REFRESH_MS = 60000; // 60 segundos

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

  // `silencioso = true` se usa desde el auto-refresh: no muestra el
  // skeleton de carga y conserva qué proyectos tenías expandidos.
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

        // Conserva el estado "expandido" de los proyectos que ya
        // estaban abiertos antes de este refresh
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

  // ============================================
  // GANADORES — AHORA RESPETAN EL FILTRO DE CONCURSO
  // ============================================
  // ANTES: siempre calculaba sobre `this.proyectos` completo, sin
  // importar qué concurso tuvieras seleccionado en el filtro. Por eso
  // el podio nunca cambiaba al cambiar de concurso — mezclaba todos
  // los proyectos de todos los concursos en un solo ranking.
  //
  // AHORA: si hay un concurso filtrado, el podio se calcula SOLO con
  // los proyectos de ESE concurso. Si el filtro está en "todos", se
  // muestra el podio combinado (con la advertencia de que mezclar
  // concursos con rúbricas distintas puede no ser justo — ver nota
  // más abajo).
  calcularGanadores(): void {
    if (!this.proyectos || this.proyectos.length === 0) {
      this.ganadores = [];
      return;
    }

    const baseParaPodio = this.filtroConcurso !== 'todos'
      ? this.proyectos.filter(p => Number(p.concursoId) === Number(this.filtroConcurso))
      : this.proyectos;

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
      medalla: index === 0 ? '🥇' : index === 1 ? '🥈' : '🥉',
      clase: index === 0 ? 'gold' : index === 1 ? 'silver' : 'bronze'
    }));
  }

  verGanadores(): void {
    if (!this.ganadores || this.ganadores.length === 0) {
      this.mostrarMensaje('No hay ganadores aún', 'error');
      return;
    }

    let mensaje = 'PODIO DEL CONCURSO\n\n';
    mensaje += '━━━━━━━━━━━━━━━━━━━━━━━━━━\n\n';

    this.ganadores.forEach((g, index) => {
      const posicion = index === 0 ? '1er Lugar' : index === 1 ? '2do Lugar' : '3er Lugar';
      const pct = this.getPorcentaje(g.promedio, g.puntajeMaximo);

      mensaje += `${posicion}\n`;
      mensaje += `Proyecto: ${g.nombre}\n`;
      mensaje += `Puntaje: ${g.promedio.toFixed(2)} / ${g.puntajeMaximo} (${pct}%)\n`;
      mensaje += `Evaluaciones: ${g.evaluaciones || 0}\n`;
      mensaje += `Área: ${g.area || 'Sin área'}\n`;
      mensaje += '\n━━━━━━━━━━━━━━━━━━━━━━━━━━\n\n';
    });

    mensaje += `Total de proyectos evaluados: ${this.proyectos?.length || 0}\n`;
    mensaje += `Promedio general: ${this.reportes?.promedio?.toFixed(2) || '0.00'}`;

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

  aplicarFiltros(): void {
    // El podio depende del concurso filtrado, así que se recalcula
    // aquí también — así cambiar el ion-select de concurso actualiza
    // el podio al instante, sin esperar a un recargar().
    this.calcularGanadores();

    let filtered = [...this.proyectos];

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

    if (this.filtroConcurso !== 'todos') {
      const concursoIdNum = Number(this.filtroConcurso);
      filtered = filtered.filter(p => Number(p.concursoId) === concursoIdNum);
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
    this.filtroConcurso = 'todos';
    this.aplicarFiltros();
  }

  getNombreConcurso(id: string): string {
    if (id === 'todos') return 'Todos los concursos';
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

    const nombreConcurso = this.filtroConcurso !== 'todos'
      ? this.getNombreConcurso(this.filtroConcurso).replace(/\s+/g, '_')
      : 'todos';
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
      const titulo = this.filtroConcurso !== 'todos'
        ? `Reporte - ${this.getNombreConcurso(this.filtroConcurso)}`
        : 'Reporte General de Evaluaciones';
      doc.text(titulo, 14, 15);

      doc.setFontSize(9);
      doc.setTextColor(100);
      const fechaLegible = new Date().toLocaleString('es-EC');
      doc.text(`Generado: ${fechaLegible}  •  Total: ${datos.length} proyecto(s)`, 14, 21);

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

      const nombreConcurso = this.filtroConcurso !== 'todos'
        ? this.getNombreConcurso(this.filtroConcurso).replace(/\s+/g, '_')
        : 'todos';
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

  verDetalleEvaluacion(proyecto: any): void {
    this.verDetalle(proyecto);
  }

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
          participantes: data.participantes || proyecto.participantes || [],
          tutores: data.tutores || proyecto.tutores || [],
          puntajeMaximo: data.puntajeMaximo || proyecto.puntajeMaximo || 100
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
          participantes: proyecto.participantes || [],
          tutores: proyecto.tutores || [],
          puntajeMaximo: proyecto.puntajeMaximo || 100
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

  private mostrarMensaje(mensaje: string, tipo: 'success' | 'error'): void {
    const icono = tipo === 'success' ? '✅' : '❌';
    alert(`${icono} ${mensaje}`);
  }

  tutorPrincipal(proyecto: any): string | null {
    const tutores = proyecto?.tutores || [];
    if (tutores.length === 0) return null;
    return tutores.find((t: PersonaProyecto) => t.encargado)?.nombre || tutores[0]?.nombre || null;
  }

  nombresParticipantes(proyecto: any): string {
    const participantes = proyecto?.participantes || [];
    return participantes.map((p: PersonaProyecto) => p.nombre).join(', ');
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