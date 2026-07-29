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
import html2canvas from 'html2canvas';

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
  participantes?: any[];  
  tutores?: any[]; 
  posicion: number;
  clase: string;
}

interface ProyectoRanking {
  id: number;
  nombre: string;
  proyecto?: string;
  area?: string;
  nivel?: string;
  promedio: number;
  puntajeMaximo: number;
  evaluaciones: number;
  evaluadores: any[];
  participantes: any[];
  tutores: any[];
  evaluacionId?: number;
  estadoEvaluacion?: string;
  estado?: string;
  concursoId?: number;
  concursoNombre?: string;
  _expandido?: boolean;
  posicion: number;
  esTop5: boolean;
  esTop3: boolean;
  esPrimero: boolean;
  esSegundo: boolean;
  esTercero: boolean;
  nombreParticipantes: string;
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
  proyectosFiltrados: ProyectoRanking[] = [];
  evaluadoresResumen: EvaluadorResumen[] = [];
  nombresEvaluadores: string[] = [];

  cargando: boolean = false;
  exportando: boolean = false;
  descargandoImagen: boolean = false;
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
            concursoNombre: item.concursoNombre ?? item.concurso_nombre ?? null,
            evaluaciones: item.evaluaciones || 0,
            promedio: item.promedio || 0,
            evaluadores: item.evaluadores || []
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
      participantes: proyecto.participantes || [],
      tutores: proyecto.tutores || [],
      posicion: index + 1,
      clase: index === 0 ? 'gold' : index === 1 ? 'silver' : 'bronze'
    }));
  }

  verGanadores(): void {
    if (!this.ganadores || this.ganadores.length === 0) {
      this.mostrarMensaje('No hay ganadores aún', 'error');
      return;
    }

    const nombreConcurso = this.getNombreConcurso(this.filtroConcurso);
    let mensaje = '================================================\n';
    mensaje += `           PODIO DEL CONCURSO\n`;
    mensaje += `           ${nombreConcurso.toUpperCase()}\n`;
    mensaje += '================================================\n\n';

    const titulos = ['1er LUGAR - GANADOR', '2do LUGAR', '3er LUGAR'];

    this.ganadores.forEach((g, index) => {
      const pct = this.getPorcentaje(g.promedio, g.puntajeMaximo);
      const participantes = g.participantes || [];
      const nombresParticipantes = participantes
        .map((p: any) => p.nombre || '')
        .filter((nombre: string) => nombre.trim() !== '')
        .join(', ');

      mensaje += `\n${titulos[index]}\n`;
      mensaje += '------------------------------------------------\n';
      mensaje += `  Proyecto: ${g.nombre}\n`;
      mensaje += `  Area: ${g.area || 'Sin area'}\n`;
      mensaje += `  Puntaje: ${g.promedio.toFixed(2)} / ${g.puntajeMaximo} (${pct}%)\n`;
      mensaje += `  Evaluaciones: ${g.evaluaciones || 0}\n`;
      
      if (nombresParticipantes) {
        mensaje += `  Participantes: ${nombresParticipantes}\n`;
      } else {
        mensaje += `  Participantes: No registrados\n`;
      }
      
      mensaje += '------------------------------------------------\n';
    });

    const totalProyectos = this.proyectosFiltrados?.length || 0;
    mensaje += `\n  Total de proyectos evaluados: ${totalProyectos}\n`;
    mensaje += `  Ganadores mostrados: ${this.ganadores.length}\n`;
    mensaje += '\n================================================\n';
    mensaje += '        FELICIDADES A LOS GANADORES!\n';
    mensaje += '================================================';

    alert(mensaje);
  }

 
  descargarPodioImagen(): void {
    if (!this.ganadores || this.ganadores.length === 0) {
      this.mostrarMensaje('No hay ganadores para generar la imagen del podio', 'error');
      return;
    }

    this.descargandoImagen = true;

    const podioElement = document.getElementById('podioContainer');
    if (!podioElement) {
      this.descargandoImagen = false;
      this.mostrarMensaje('No se encontró el elemento del podio', 'error');
      return;
    }

    const config = {
      scale: 2.5,
      useCORS: true,
      allowTaint: true,
      backgroundColor: '#001b4c',
      logging: false,
      onclone: (clonedDoc: Document) => {
        const clone = clonedDoc.getElementById('podioContainer') as HTMLElement | null;
        if (clone) {
          clone.style.margin = '0';
        }
      }
    };

    // Mostrar loading
    const loadingOverlay = document.createElement('div');
    loadingOverlay.style.cssText = `
      position: fixed;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      background: rgba(0,0,0,0.7);
      display: flex;
      align-items: center;
      justify-content: center;
      z-index: 99999;
      color: white;
      font-size: 18px;
    `;
    loadingOverlay.innerHTML = `
      <div style="text-align: center;">
        <ion-spinner name="crescent" style="color: white; width: 48px; height: 48px;"></ion-spinner>
        <p style="margin-top: 16px;">Generando imagen del podio...</p>
      </div>
    `;
    document.body.appendChild(loadingOverlay);

    setTimeout(() => {
      html2canvas(podioElement, config)
        .then((canvas: HTMLCanvasElement) => {
          document.body.removeChild(loadingOverlay);

          const link = document.createElement('a');
          const nombreConcurso = this.getNombreConcurso(this.filtroConcurso).replace(/\s+/g, '_');
          const fecha = new Date().toISOString().split('T')[0];
          link.download = `podio-${nombreConcurso}-${fecha}.png`;
          link.href = canvas.toDataURL('image/png', 1.0);
          link.click();

          this.descargandoImagen = false;
          this.mostrarMensaje('Imagen del podio descargada correctamente', 'success');
        })
        .catch((error) => {
          document.body.removeChild(loadingOverlay);
          console.error('Error generando imagen:', error);
          this.descargandoImagen = false;
          this.mostrarMensaje('Error al generar la imagen del podio', 'error');
        });
    }, 300);
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

  // ==========================================================
  // 🔥 APLICAR FILTROS CON RANGOS CORREGIDOS
  // ==========================================================
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

    // 🔥 FILTRO POR ESTADO CORREGIDO
    if (this.filtroStatus !== 'todos') {
      filtered = filtered.filter(p => {
        const pct = this.getPorcentaje(p.promedio, p.puntajeMaximo);
        switch (this.filtroStatus) {
          case 'excelente-superior': return pct >= 95;
          case 'excelente': return pct >= 90 && pct < 95;
          case 'muy-bueno': return pct >= 80 && pct < 90;
          case 'bueno': return pct >= 70 && pct < 80;
          case 'regular': return pct >= 60 && pct < 70;
          case 'aceptable': return pct >= 50 && pct < 60;
          case 'deficiente': return pct < 50;
          default: return true;
        }
      });
    }

    if (this.filtroEvaluador !== 'todos') {
      filtered = filtered.filter(p =>
        (p.evaluadores || []).some((e: any) => e.nombre === this.filtroEvaluador)
      );
    }

    filtered = filtered.sort((a, b) => {
      const promedioA = a.promedio || 0;
      const promedioB = b.promedio || 0;
      return promedioB - promedioA;
    });

    this.proyectosFiltrados = filtered.map((p, index) => {
      const posicion = index + 1;
      
      const participantes = p.participantes || [];
      const nombresParticipantes = participantes
        .map((part: any) => part.nombre || '')
        .filter((nombre: string) => nombre.trim() !== '')
        .join(', ');

      return {
        id: p.id || index,
        nombre: p.nombre || p.proyecto || 'Proyecto sin nombre',
        proyecto: p.proyecto || p.nombre,
        area: p.area || '',
        nivel: p.nivel || '',
        promedio: p.promedio || 0,
        puntajeMaximo: p.puntajeMaximo || 100,
        evaluaciones: p.evaluaciones || 0,
        evaluadores: p.evaluadores || [],
        participantes: p.participantes || [],
        tutores: p.tutores || [],
        evaluacionId: p.evaluacionId || null,
        estadoEvaluacion: p.estadoEvaluacion || p.estado || 'asignado',
        estado: p.estado || 'asignado',
        concursoId: p.concursoId || null,
        concursoNombre: p.concursoNombre || '',
        _expandido: p._expandido || false,
        posicion: posicion,
        esTop5: posicion <= 5,
        esTop3: posicion <= 3,
        esPrimero: posicion === 1,
        esSegundo: posicion === 2,
        esTercero: posicion === 3,
        nombreParticipantes: nombresParticipantes || 'Sin participantes'
      };
    });
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

  private getNombreConcursoFiltro(proyecto: ProyectoRanking): string {
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

  exportarProyectoExcel(proyecto: ProyectoRanking): void {
    const id = proyecto.id;
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

  exportarProyectoPDF(proyecto: ProyectoRanking): void {
    const id = proyecto.id;
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
      
      doc.setFillColor(0, 27, 76);
      doc.rect(0, 0, 297, 8, 'F');

      doc.setFontSize(10);
      doc.setTextColor(0, 27, 76);
      doc.setFont('helvetica', 'bold');
      doc.text('UNIVERSIDAD ESTATAL PENÍNSULA DE SANTA ELENA', 14, 16);
      
      doc.setFontSize(8);
      doc.setTextColor(100);
      doc.setFont('helvetica', 'normal');
      doc.text('Facultad de Ciencias de la Ingeniería', 14, 21);
      
      doc.setFontSize(18);
      doc.setTextColor(0, 27, 76);
      doc.setFont('helvetica', 'bold');
      doc.text('REPORTE DE EVALUACIONES', 14, 30);

      doc.setFontSize(12);
      doc.setTextColor(100);
      doc.setFont('helvetica', 'normal');
      doc.text(this.getNombreConcurso(this.filtroConcurso), 14, 38);

      const fechaGeneracion = new Date();
      const fechaStr = fechaGeneracion.toLocaleDateString('es-EC', {
        day: '2-digit',
        month: 'long',
        year: 'numeric'
      });
      const horaStr = fechaGeneracion.toLocaleTimeString('es-EC', {
        hour: '2-digit',
        minute: '2-digit'
      });

      const perfilY = 46;
      doc.setFontSize(9);
      doc.setTextColor(80);
      doc.setFont('helvetica', 'normal');
      
      doc.text('Generado por: Ing. Marcia Bayas Sampedro, Ph.D.', 14, perfilY);
      doc.text('Directora del Grupo de Investigación "Tecnología, Ciencia y Educación"', 14, perfilY + 5);
      doc.text(`Fecha: ${fechaStr} - Hora: ${horaStr}`, 14, perfilY + 10);
      doc.text(`Total de proyectos: ${datos.length}`, 14, perfilY + 15);
      
      doc.setDrawColor(201, 168, 76);
      doc.setLineWidth(0.5);
      doc.line(14, perfilY + 19, 283, perfilY + 19);

      const columnas = [
        '#', 'Proyecto', 'Área', 'Nivel', 'Tutor', 'Participantes',
        'Eval.', 'Puntaje', '%', 'Estado', 'Concurso'
      ];

      const filas = datos.map(p => [
        String(p.posicion || '-'),
        p.proyecto || p.nombre || '—',
        p.area || '—',
        p.nivel || '—',
        this.tutorPrincipal(p) || '—',
        p.nombreParticipantes || '—',
        String(p.evaluaciones || 0),
        `${p.promedio ? p.promedio.toFixed(2) : '0.00'} / ${p.puntajeMaximo || 100}`,
        `${this.getPorcentaje(p.promedio, p.puntajeMaximo)}%`,
        this.getStatusText(p.promedio, p.puntajeMaximo), // ✅ Usa rangos corregidos
        this.getNombreConcursoFiltro(p)
      ]);

      autoTable(doc, {
        head: [columnas],
        body: filas,
        startY: perfilY + 24,
        theme: 'striped',
        headStyles: {
          fillColor: [0, 27, 76],
          textColor: 255,
          fontStyle: 'bold',
          fontSize: 8,
          halign: 'center'
        },
        styles: {
          fontSize: 7,
          cellPadding: 2,
          valign: 'middle'
        },
        alternateRowStyles: {
          fillColor: [232, 240, 254]
        },
        columnStyles: {
          0: { cellWidth: 10, halign: 'center' },
          1: { cellWidth: 50 },
          2: { cellWidth: 25 },
          3: { cellWidth: 20 },
          4: { cellWidth: 30 },
          5: { cellWidth: 35 },
          6: { cellWidth: 12, halign: 'center' },
          7: { cellWidth: 25, halign: 'center' },
          8: { cellWidth: 15, halign: 'center' },
          9: { cellWidth: 20, halign: 'center' },
          10: { cellWidth: 30 }
        },
        didDrawPage: (data: any) => {
          const pageCount = doc.getNumberOfPages();
          const currentPage = doc.getCurrentPageInfo()?.pageNumber || 1;
          
          doc.setFontSize(7);
          doc.setTextColor(150);
          doc.setFont('helvetica', 'italic');
          doc.text(
            `Página ${currentPage} de ${pageCount}`,
            14,
            doc.internal.pageSize.height - 5
          );
          
          doc.setDrawColor(201, 168, 76);
          doc.setLineWidth(0.3);
          doc.line(14, doc.internal.pageSize.height - 8, 283, doc.internal.pageSize.height - 8);
        }
      });
      
      const finalY = (doc as any).lastAutoTable?.finalY || 200;
      
      if (finalY < 220) {
        const totalProyectos = datos.length;
        const totalEvaluaciones = datos.reduce((sum, p) => sum + (p.evaluaciones || 0), 0);
        const promedioGeneral = datos.reduce((sum, p) => sum + (p.promedio || 0), 0) / (totalProyectos || 1);

        doc.setFontSize(9);
        doc.setTextColor(0, 27, 76);
        doc.setFont('helvetica', 'bold');
        doc.text('RESUMEN ESTADÍSTICO', 14, finalY + 10);

        doc.setFontSize(8);
        doc.setTextColor(60);
        doc.setFont('helvetica', 'normal');
        
        const statsY = finalY + 16;
        doc.text(`Total proyectos: ${totalProyectos}`, 14, statsY);
        doc.text(`Total evaluaciones: ${totalEvaluaciones}`, 60, statsY);
        doc.text(`Promedio general: ${promedioGeneral.toFixed(2)} pts`, 110, statsY);

        const lineaY = statsY + 12;
        doc.setDrawColor(0, 27, 76);
        doc.setLineWidth(0.3);
        doc.line(14, lineaY, 283, lineaY);

        doc.setFontSize(7);
        doc.setTextColor(120);
        doc.setFont('helvetica', 'italic');
        doc.text(
          'Este reporte fue generado automáticamente por el Sistema de Evaluación del grupo de Investigación TECED de la UPSE.',
          14, lineaY + 8
        );
        
        doc.setTextColor(100);
        doc.setFont('helvetica', 'italic');
        doc.text(
          'Desarrollado por: Ing. Jefferson Pozo Catuto',
          14, lineaY + 13
        );
        doc.text(
          'Sistema de Evaluación - TECED',
          14, lineaY + 17
        );

        const firmaY = lineaY + 45;
        
        doc.setDrawColor(0, 27, 76);
        doc.setLineWidth(0.5);
        doc.line(14, firmaY, 85, firmaY);

        doc.setFontSize(9);
        doc.setTextColor(0, 27, 76);
        doc.setFont('helvetica', 'bold');
        doc.text('Ing. Marcia Bayas Sampedro, Ph.D.', 14, firmaY + 6);
        
        doc.setFontSize(7.5);
        doc.setTextColor(100);
        doc.setFont('helvetica', 'normal');
        doc.text('Directora del Grupo de Investigación "Tecnología, Ciencia y Educación"', 14, firmaY + 12);
        doc.text('Facultad de Ciencias de la Ingeniería', 14, firmaY + 17);
        
        doc.setFontSize(7);
        doc.setTextColor(80);
        doc.setFont('helvetica', 'italic');
        doc.text(`Fecha: ${fechaStr}`, 200, firmaY + 6);
        doc.text(`Hora: ${horaStr}`, 200, firmaY + 12);

        const finalLineaY = firmaY + 27;
        doc.setDrawColor(201, 168, 76);
        doc.setLineWidth(0.3);
        doc.line(14, finalLineaY, 283, finalLineaY);
      }

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

  exportarExcelConFiltros(): void {
    const datos = this.proyectosFiltrados || [];

    if (datos.length === 0) {
      this.mostrarMensaje('No hay proyectos para exportar con los filtros actuales', 'error');
      return;
    }

    const fechaGeneracion = new Date();
    const fechaStr = fechaGeneracion.toLocaleDateString('es-EC', {
      day: '2-digit',
      month: 'long',
      year: 'numeric'
    });
    const horaStr = fechaGeneracion.toLocaleTimeString('es-EC', {
      hour: '2-digit',
      minute: '2-digit'
    });

    const headers = [
      'Posicion', 'Proyecto', 'Área', 'Nivel', 'Tutor encargado',
      'Participantes', 'Evaluaciones', 'Puntaje', 'Puntaje máximo',
      'Porcentaje', 'Estado', 'Concurso', 'Evaluadores asignados'
    ];

    const filas = datos.map(p => [
      String(p.posicion || '-'),
      p.proyecto || p.nombre || '—',
      p.area || '—',
      p.nivel || '—',
      this.tutorPrincipal(p) || '—',
      p.nombreParticipantes || '—',
      String(p.evaluaciones || 0),
      String(p.promedio ? p.promedio.toFixed(2) : '0.00'),
      String(p.puntajeMaximo || 100),
      `${this.getPorcentaje(p.promedio, p.puntajeMaximo)}%`,
      this.getStatusText(p.promedio, p.puntajeMaximo), // ✅ Usa rangos corregidos
      this.getNombreConcursoFiltro(p),
      (p.evaluadores || []).map((e: any) => e.nombre).join(' | ')
    ]);

    let csvContent = '';

    csvContent += `"REPORTE DE EVALUACIONES"\n`;
    csvContent += `"${this.getNombreConcurso(this.filtroConcurso)}"\n`;
    csvContent += `\n`;
    csvContent += `"Generado por","Ing. Marcia Bayas Sampedro, Mgt."\n`;
    csvContent += `"Directora del Grupo de Investigación "Tecnología, Ciencia y Educación""\n`;
    csvContent += `"Fecha","${fechaStr}"\n`;
    csvContent += `"Hora","${horaStr}"\n`;
    csvContent += `"Total proyectos","${datos.length}"\n`;
    csvContent += `\n`;

    csvContent += this.generarCSV(headers, filas);
    
    const totalProyectos = datos.length;
    const totalEvaluaciones = datos.reduce((sum, p) => sum + (p.evaluaciones || 0), 0);
    const promedioGeneral = datos.reduce((sum, p) => sum + (p.promedio || 0), 0) / (totalProyectos || 1);

    csvContent += `\n`;
    csvContent += `"RESUMEN ESTADÍSTICO"\n`;
    csvContent += `"Total proyectos","${totalProyectos}"\n`;
    csvContent += `"Total evaluaciones","${totalEvaluaciones}"\n`;
    csvContent += `"Promedio general","${promedioGeneral.toFixed(2)} pts"\n`;
    csvContent += `\n`;
    csvContent += `"Reporte generado automáticamente por el Sistema de Evaluación UPSE"\n`;
    csvContent += `"Desarrollado por: Ing. Jefferson Pozo Catuto"\n`;
    csvContent += `"Sistema de Evaluación - UPSE"\n`;
    csvContent += `"Fecha de generación: ${fechaStr} ${horaStr}"\n`;

    const blob = new Blob(['\uFEFF' + csvContent], { type: 'text/csv;charset=utf-8;' });

    const nombreConcurso = this.getNombreConcurso(this.filtroConcurso).replace(/\s+/g, '_');
    const fecha = new Date().toISOString().split('T')[0];
    this.descargarArchivo(blob, `reporte-${nombreConcurso}-${fecha}.csv`);

    this.mostrarMensaje(`Excel exportado: ${datos.length} proyecto(s)`, 'success');
  }

  editarEvaluacionAdmin(proyecto: ProyectoRanking): void {
    const evaluacionId = proyecto.evaluacionId;
    if (!evaluacionId) {
      this.mostrarMensaje('No se encontró la evaluación para este proyecto', 'error');
      return;
    }
    this.router.navigate(['/admin/evaluaciones/formulario', evaluacionId]);
  }

  async reabrirEvaluacion(proyecto: ProyectoRanking): Promise<void> {
    const evaluacionId = proyecto.evaluacionId;
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

  async eliminarEvaluacion(proyecto: ProyectoRanking): Promise<void> {
    const evaluacionId = proyecto.evaluacionId;
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

  verRespuestas(evaluador: any, proyecto: ProyectoRanking): void {
    let evaluacionId = evaluador?.evaluacionId || evaluador?.evaluacion_id;
    
    if (!evaluacionId) {
      evaluacionId = proyecto?.evaluacionId;
    }

    if (!evaluacionId) {
      const proyectoId = proyecto?.id;
      if (!proyectoId) {
        this.mostrarMensaje('No se puede obtener el detalle: ID del proyecto no encontrado', 'error');
        return;
      }

      this.cargandoRespuestas = true;
      this.modalRespuestasAbierto = true;

      this.reporteService.getDetalleProyecto(proyectoId).subscribe({
        next: (res: any) => {
          const data = res?.data ?? res;
          const evaluaciones = data.evaluaciones || [];
          
          const evaluacionEncontrada = evaluaciones.find((ev: any) => 
            ev.evaluador === evaluador?.nombre
          );
          
          if (evaluacionEncontrada?.id) {
            this.abrirModalRespuestas(evaluacionEncontrada.id);
          } else {
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

    this.abrirModalRespuestas(evaluacionId);
  }

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

  private mostrarMensaje(mensaje: string, tipo: 'success' | 'error' | 'info'): void {
    const prefijo = tipo === 'success' ? '[OK]' : tipo === 'error' ? '[Error]' : '[Info]';
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

  // ==========================================================
  // 🔥 MÉTODOS DE CALIFICACIÓN CORREGIDOS
  // ==========================================================

  getStatusText(promedio: number, maximo: number = 100): string {
    if (!promedio) return 'Sin datos';
    const pct = this.getPorcentaje(promedio, maximo);
    
    // Rangos correctos y detallados
    if (pct >= 95) return 'Excelente';
    if (pct >= 90) return 'Excelente';
    if (pct >= 80) return 'Muy Bueno';
    if (pct >= 70) return 'Bueno';
    if (pct >= 60) return 'Regular';
    if (pct >= 50) return 'Aceptable';
    return 'Deficiente';
  }

  getStatusClass(promedio: number, maximo: number = 100): string {
    if (!promedio) return 'status-low';
    const pct = this.getPorcentaje(promedio, maximo);
    
    if (pct >= 95) return 'status-excellent-superior';
    if (pct >= 90) return 'status-excellent';
    if (pct >= 80) return 'status-very-good';
    if (pct >= 70) return 'status-good';
    if (pct >= 60) return 'status-regular';
    if (pct >= 50) return 'status-acceptable';
    return 'status-low';
  }

  getStatusIcon(promedio: number, maximo: number = 100): string {
    if (!promedio) return 'alert-circle-outline';
    const pct = this.getPorcentaje(promedio, maximo);
    
    if (pct >= 95) return 'star-outline';
    if (pct >= 90) return 'checkmark-circle-outline';
    if (pct >= 80) return 'trophy-outline';
    if (pct >= 70) return 'time-outline';
    if (pct >= 60) return 'alert-circle-outline';
    if (pct >= 50) return 'information-circle-outline';
    return 'close-circle-outline';
  }

  getColorClass(promedio: number, maximo: number = 100): string {
    if (!promedio) return 'color-gray';
    const pct = this.getPorcentaje(promedio, maximo);
    
    if (pct >= 95) return 'color-gold-dark';
    if (pct >= 90) return 'color-gold';
    if (pct >= 80) return 'color-green';
    if (pct >= 70) return 'color-blue';
    if (pct >= 60) return 'color-orange';
    if (pct >= 50) return 'color-yellow';
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