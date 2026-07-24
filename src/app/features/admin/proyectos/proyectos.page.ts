import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import {
  IonHeader,
  IonToolbar,
  IonButtons,
  IonMenuButton,
  IonTitle,
  IonButton,
  IonIcon,
  IonContent,
  IonSearchbar,
  IonSelect,
  IonSelectOption,
  IonFab,
  IonFabButton,
  IonChip,
  IonLabel,
  IonSkeletonText,
  IonModal,
  IonItem,
  IonInput,
  IonTextarea,
  IonToggle,
  IonSpinner
} from '@ionic/angular/standalone';
import { ProyectoService } from '../../../core/services/proyecto.service';
import { Proyecto } from '../../../core/models/proyecto.model';
import { ConcursoService } from '../../../core/services/concurso.service';
import { ReporteService } from '../../../core/services/reporte.service';
import { addIcons } from 'ionicons';
import {
  addOutline,
  documentTextOutline,
  createOutline,
  trashOutline,
  folderOpenOutline,
  eyeOutline,
  peopleOutline,
  businessOutline,
  barChartOutline,
  searchOutline,
  trophyOutline,
  closeOutline,
  checkmarkOutline,
  refreshOutline,
  pricetagOutline,
  toggleOutline,
  schoolOutline,
  star,
  checkmarkDoneOutline,
  alertCircleOutline,
  downloadOutline,
  documentOutline,
  barcodeOutline  
} from 'ionicons/icons';

@Component({
  selector: 'app-proyectos',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    RouterModule,
    IonHeader,
    IonToolbar,
    IonButtons,
    IonMenuButton,
    IonTitle,
    IonButton,
    IonIcon,
    IonContent,
    IonSearchbar,
    IonSelect,
    IonSelectOption,
    IonFab,
    IonFabButton,
    IonChip,
    IonLabel,
    IonSkeletonText,
    IonModal,
    IonItem,
    IonInput,
    IonTextarea,
    IonToggle,
    IonSpinner
  ],
  templateUrl: './proyectos.page.html',
  styleUrls: ['./proyectos.page.scss']
})
export class ProyectosPage implements OnInit {

  // ESTADO PRINCIPAL
  proyectos: Proyecto[] = [];
  proyectosFiltrados: Proyecto[] = [];
  proyectosActivos: number = 0;
  totalParticipantes: number = 0;
  cargando: boolean = false;
  cargandoConcursos: boolean = false;
  exportando: boolean = false;

  // FILTROS
  busqueda: string = '';
  filtroNivel: string = 'todos';
  filtroEstado: string = 'todos';
  filtroConcurso: string = 'todos';

  // MODAL CREAR/EDITAR
  modalAbierto = false;
  editando = false;
  guardando = false;
  concursosDisponibles: any[] = [];

  // FORMULARIO ACTUALIZADO con codigoProyecto
  form: any = {
    id: null,
    nombre: '',
    descripcion: '',
    concursoId: null,
    codigoProyecto: '',  
    participantesTexto: '',
    tutorEncargado: '',
    tutor2: '',
    tutor3: '',
    tutor4: '',
    nivel: '',
    area: '',
    activo: true
  };

  // MODAL DETALLE
  modalDetalleAbierto = false;
  cargandoDetalle = false;
  errorDetalle: string | null = null;
  proyectoSeleccionado: Proyecto | null = null;
  detalleEvaluaciones: any = null;

  // NOTIFICACIÓN (toast propio)
  notificacion: { mensaje: string; tipo: 'success' | 'danger' | 'warning' } | null = null;
  private notiTimeout: any;

  constructor(
    private proyectoService: ProyectoService,
    private concursoService: ConcursoService,
    private reporteService: ReporteService
  ) {
    addIcons({
      refreshOutline, addOutline, searchOutline, documentTextOutline,
      businessOutline, barChartOutline, peopleOutline, trophyOutline,
      eyeOutline, createOutline, trashOutline, folderOpenOutline,
      closeOutline, pricetagOutline, toggleOutline, checkmarkOutline,
      schoolOutline, star, checkmarkDoneOutline, alertCircleOutline,
      downloadOutline, documentOutline, barcodeOutline  
    });
  }

  ngOnInit(): void {
    this.cargar();
    this.cargarConcursos();
  }

  // CARGA DE DATOS
  cargar(): void {
    this.cargando = true;

    this.proyectoService.listar().subscribe({
      next: (proyectos) => {
        this.proyectos = proyectos;
        this.calcularEstadisticas();
        this.filtrarProyectos();
        this.cargando = false;
      },
      error: (err) => {
        console.error('Error cargando proyectos:', err);
        this.proyectos = [];
        this.proyectosFiltrados = [];
        this.cargando = false;
      }
    });
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

  recargar(): void {
    this.cargar();
  }

  // ESTADÍSTICAS Y FILTROS
  calcularEstadisticas(): void {
    this.proyectosActivos = this.proyectos.filter(p => p.activo).length;
    this.totalParticipantes = this.proyectos.reduce(
      (total, p) => total + (p.participantes?.length || 0), 0
    );
  }

  filtrarProyectos(): void {
    let filtered = [...this.proyectos];

    if (this.busqueda.trim()) {
      const texto = this.busqueda.toLowerCase().trim();
      filtered = filtered.filter(p =>
        p.nombre?.toLowerCase().includes(texto) ||
        p.area?.toLowerCase().includes(texto) ||
        p.nivel?.toLowerCase().includes(texto) ||
        p.descripcion?.toLowerCase().includes(texto) ||
        (p.codigoProyecto?.toLowerCase().includes(texto)) ||  // ✅ BUSCAR POR CÓDIGO
        (p.participantes || []).some(part => part.nombre?.toLowerCase().includes(texto)) ||
        (p.tutores || []).some(t => t.nombre?.toLowerCase().includes(texto))
      );
    }

    if (this.filtroNivel !== 'todos') {
      filtered = filtered.filter(p => p.nivel === this.filtroNivel);
    }

    if (this.filtroEstado === 'activo') {
      filtered = filtered.filter(p => p.activo);
    } else if (this.filtroEstado === 'inactivo') {
      filtered = filtered.filter(p => !p.activo);
    }

    // Filtro por concurso
    if (this.filtroConcurso !== 'todos') {
      const concursoIdNum = Number(this.filtroConcurso);
      filtered = filtered.filter(p => Number(p.concursoId) === concursoIdNum);
    }

    this.proyectosFiltrados = filtered;
  }

  limpiarFiltros(): void {
    this.busqueda = '';
    this.filtroNivel = 'todos';
    this.filtroEstado = 'todos';
    this.filtroConcurso = 'todos';
    this.filtrarProyectos();
  }

  // PARTICIPANTES (texto <-> arreglo)
  contarParticipantes(texto: string): number {
    if (!texto || texto.trim() === '') return 0;
    return texto.split(',').filter(p => p.trim() !== '').length;
  }

  procesarParticipantes(texto: string): string[] {
    if (!texto || texto.trim() === '') return [];
    return texto.split(',').map(p => p.trim()).filter(p => p !== '');
  }

  obtenerParticipantesTexto(participantes: any[]): string {
    if (!participantes || participantes.length === 0) return '';
    return participantes.map(p => p.nombre).join(', ');
  }

  // FORMATEAR CÓDIGO (mayúsculas, sin espacios)
  formatearCodigo(): void {
    if (this.form.codigoProyecto) {
      this.form.codigoProyecto = this.form.codigoProyecto
        .toUpperCase()
        .replace(/\s/g, '')
        .replace(/[^A-Z0-9\-]/g, '');  // Solo letras, números y guiones
    }
  }

  // MODAL CREAR / EDITAR
  abrirCrear(): void {
    this.editando = false;
    this.form = {
      id: null,
      nombre: '',
      descripcion: '',
      concursoId: null,
      codigoProyecto: '',  
      participantesTexto: '',
      tutorEncargado: '',
      tutor2: '',
      tutor3: '',
      tutor4: '',
      nivel: '',
      area: '',
      activo: true
    };
    this.modalAbierto = true;
  }

  editar(proyecto: Proyecto): void {
    this.editando = true;

    const participantesTexto = this.obtenerParticipantesTexto(proyecto.participantes || []);
    const tutores = proyecto.tutores || [];

    this.form = {
      id: proyecto.id,
      nombre: proyecto.nombre || '',
      descripcion: proyecto.descripcion || '',
      concursoId: proyecto.concursoId != null ? Number(proyecto.concursoId) : null,
      codigoProyecto: proyecto.codigoProyecto || '',  // NUEVO
      participantesTexto,
      tutorEncargado: tutores[0]?.nombre || '',
      tutor2: tutores[1]?.nombre || '',
      tutor3: tutores[2]?.nombre || '',
      tutor4: tutores[3]?.nombre || '',
      nivel: proyecto.nivel || '',
      area: proyecto.area || '',
      activo: proyecto.activo ?? true
    };

    this.modalAbierto = true;
  }

  cerrarModal(): void {
    this.modalAbierto = false;
  }

  // GUARDAR - ACTUALIZADO (participantes opcionales)
  guardar(): void {
    if (!this.form.nombre || this.form.nombre.trim() === '') {
      this.mostrarNotificacion('Ingresa el nombre del proyecto', 'warning');
      return;
    }

    if (!this.form.tutorEncargado || this.form.tutorEncargado.trim() === '') {
      this.mostrarNotificacion('El tutor encargado es obligatorio', 'warning');
      return;
    }

    if (!this.form.nivel) {
      this.mostrarNotificacion('Selecciona un nivel', 'warning');
      return;
    }

    if (!this.form.area) {
      this.mostrarNotificacion('Selecciona un área', 'warning');
      return;
    }

    // Si no hay participantes, se envía un arreglo vacío
    const participantes = this.procesarParticipantes(this.form.participantesTexto);

    const tutores = [this.form.tutorEncargado, this.form.tutor2, this.form.tutor3, this.form.tutor4]
      .filter(t => t && t.trim() !== '');

    this.guardando = true;

    const payload = {
      nombre: this.form.nombre.trim(),
      descripcion: this.form.descripcion || null,
      concursoId: this.form.concursoId || null,
      codigoProyecto: this.form.codigoProyecto || null,  // ✅ NUEVO
      participantes,
      tutores,
      nivel: this.form.nivel,
      area: this.form.area,
      activo: this.form.activo ?? true
    };

    const req = this.editando
      ? this.proyectoService.actualizar(this.form.id, payload)
      : this.proyectoService.crear(payload);

    req.subscribe({
      next: () => {
        this.guardando = false;
        this.modalAbierto = false;
        this.cargar();
        this.mostrarNotificacion(
          this.editando ? 'Proyecto actualizado correctamente' : 'Proyecto creado correctamente',
          'success'
        );
      },
      error: (err) => {
        this.guardando = false;
        console.error('Error guardando proyecto:', err);
        this.mostrarNotificacion(err.error?.mensaje || 'Error al guardar el proyecto', 'danger');
      }
    });
  }

  // ELIMINAR
  confirmarEliminar(proyecto: Proyecto): void {
    if (confirm(`¿Estás seguro de eliminar el proyecto "${proyecto.nombre}"? Esta acción no se puede deshacer.`)) {
      this.eliminarProyecto(proyecto.id);
    }
  }

  eliminarProyecto(id: number): void {
    this.proyectoService.eliminar(id).subscribe({
      next: () => {
        this.cargar();
        this.mostrarNotificacion('Proyecto eliminado correctamente', 'success');
      },
      error: (err) => {
        console.error('Error eliminando proyecto:', err);
        this.mostrarNotificacion(err.error?.mensaje || 'Error al eliminar el proyecto', 'danger');
      }
    });
  }

  // DETALLE (solo lectura)
  verDetalle(proyecto: Proyecto): void {
    this.proyectoSeleccionado = proyecto;
    this.modalDetalleAbierto = true;
    this.cargandoDetalle = true;
    this.errorDetalle = null;
    this.detalleEvaluaciones = null;

    this.reporteService.getDetalleProyecto(proyecto.id).subscribe({
      next: (res: any) => {
        const data = res?.data ?? res;
        this.detalleEvaluaciones = {
          evaluaciones: data.evaluaciones || [],
          evaluadores: data.evaluadores || [],
          promedio: data.promedio || 0,
          totalEvaluaciones: data.totalEvaluaciones || 0
        };
        this.cargandoDetalle = false;
      },
      error: (err) => {
        console.error('Error cargando detalle de evaluaciones:', err);
        this.errorDetalle = 'No se pudieron cargar las evaluaciones de este proyecto';
        this.detalleEvaluaciones = { evaluaciones: [], evaluadores: [], promedio: 0, totalEvaluaciones: 0 };
        this.cargandoDetalle = false;
      }
    });
  }

  cerrarModalDetalle(): void {
    this.modalDetalleAbierto = false;
    this.proyectoSeleccionado = null;
    this.detalleEvaluaciones = null;
    this.errorDetalle = null;
  }

  editarDesdeDetalle(): void {
    if (!this.proyectoSeleccionado) return;
    const proyecto = this.proyectoSeleccionado;
    this.cerrarModalDetalle();
    this.editar(proyecto);
  }

  // EXPORTACIÓN CSV (con código de proyecto)
  exportarCSV(): void {
    const datos = this.proyectosFiltrados || [];

    if (datos.length === 0) {
      this.mostrarNotificacion('No hay proyectos para exportar con los filtros actuales', 'warning');
      return;
    }

    //  CABECERA CON CÓDIGO
    const headers = ['Código', 'Proyecto', 'Área', 'Nivel', 'Tutor encargado', 'N° Participantes', 'Participantes', 'Concurso', 'Estado'];

    const filas = datos.map(p => [
      p.codigoProyecto || '',
      p.nombre || '',
      p.area || '',
      p.nivel || '',
      this.tutorEncargado(p) || '',
      String((p.participantes || []).length),
      (p.participantes || []).map(part => part.nombre).join(' | '),
      this.nombreConcurso(p),
      p.activo ? 'Activo' : 'Inactivo'
    ]);

    const escapar = (valor: string): string => {
      const texto = String(valor ?? '');
      if (texto.includes(',') || texto.includes('"') || texto.includes('\n')) {
        return `"${texto.replace(/"/g, '""')}"`;
      }
      return texto;
    };

    const filasCSV = [headers, ...filas].map(fila => fila.map(escapar).join(','));
    const csvContent = '\uFEFF' + filasCSV.join('\r\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `proyectos_${this.obtenerFechaArchivo()}.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(url);

    this.mostrarNotificacion(`CSV exportado: ${datos.length} proyecto(s)`, 'success');
  }

  // EXPORTACIÓN PDF (con código de proyecto)
  async exportarPDF(): Promise<void> {
    const datos = this.proyectosFiltrados || [];

    if (datos.length === 0) {
      this.mostrarNotificacion('No hay proyectos para exportar con los filtros actuales', 'warning');
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
      doc.text('Informe de Proyectos - Sistema UPSE', 14, 15);

      doc.setFontSize(9);
      doc.setTextColor(100);
      const fechaLegible = new Date().toLocaleString('es-EC');
      doc.text(`Generado: ${fechaLegible}  •  Total: ${datos.length} proyecto(s)`, 14, 21);

      const columnas = ['Código', 'Proyecto', 'Área', 'Nivel', 'Tutor encargado', 'Participantes', 'Concurso', 'Estado'];

      const filas = datos.map(p => [
        p.codigoProyecto || '—',
        p.nombre || '—',
        p.area || '—',
        p.nivel || '—',
        this.tutorEncargado(p) || '—',
        String((p.participantes || []).length),
        this.nombreConcurso(p),
        p.activo ? 'Activo' : 'Inactivo'
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

      doc.save(`proyectos_${this.obtenerFechaArchivo()}.pdf`);
      this.mostrarNotificacion(`PDF exportado: ${datos.length} proyecto(s)`, 'success');
    } catch (err) {
      console.error('Error generando el PDF:', err);
      this.mostrarNotificacion('Error al generar el PDF', 'danger');
    } finally {
      this.exportando = false;
    }
  }

  private obtenerFechaArchivo(): string {
    const ahora = new Date();
    const pad = (n: number) => String(n).padStart(2, '0');
    return `${ahora.getFullYear()}${pad(ahora.getMonth() + 1)}${pad(ahora.getDate())}_${pad(ahora.getHours())}${pad(ahora.getMinutes())}`;
  }

  // ============================================
  // UTILIDADES
  // ============================================
  compararConcurso = (c1: any, c2: any): boolean => {
    return c1 != null && c2 != null ? Number(c1) === Number(c2) : c1 === c2;
  };

  getEstadoEvaluacion(estado: string): string {
    return estado === 'evaluado' ? 'status-excellent' : 'status-regular';
  }

  nombreConcurso(proyecto: Proyecto): string {
    return proyecto.concursoNombre || (proyecto.concursoId ? `Concurso #${proyecto.concursoId}` : 'Sin concurso');
  }

  tutorEncargado(proyecto: Proyecto): string | null {
    return proyecto.tutores?.find(t => t.encargado)?.nombre || proyecto.tutores?.[0]?.nombre || null;
  }

  trackById(index: number, item: any): number {
    return item?.id ?? index;
  }

  // NOTIFICACIÓN INLINE
  mostrarNotificacion(mensaje: string, tipo: 'success' | 'danger' | 'warning' = 'success'): void {
    clearTimeout(this.notiTimeout);
    this.notificacion = { mensaje, tipo };
    this.notiTimeout = setTimeout(() => this.notificacion = null, 3500);
  }
}