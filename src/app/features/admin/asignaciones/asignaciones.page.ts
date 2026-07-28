import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import {
  IonHeader,
  IonToolbar,
  IonButtons,
  IonMenuButton,
  IonTitle,
  IonContent,
  IonCard,
  IonCardHeader,
  IonCardTitle,
  IonCardSubtitle,
  IonCardContent,
  IonButton,
  IonIcon,
  IonChip,
  IonDatetime,
  IonModal,
  IonLabel,
  IonSkeletonText,
  IonSearchbar,
  IonSelect,
  IonSelectOption,
  IonSpinner
} from '@ionic/angular/standalone';
import { AlertController } from '@ionic/angular';
import { addIcons } from 'ionicons';
import {
  addOutline,
  swapHorizontalOutline,
  checkmarkCircleOutline,
  folderOutline,
  folderOpenOutline,
  peopleOutline,
  personOutline,
  calendarOutline,
  timeOutline,
  checkmarkDoneOutline,
  refreshOutline,
  arrowForwardOutline,
  personAddOutline,
  closeCircleOutline,
  alertCircleOutline,
  eyeOutline,
  informationCircleOutline,
  closeOutline,
  trashOutline,
  createOutline,
  personRemoveOutline,
  warningOutline,
  chevronForwardOutline,
  chevronBackOutline,
  chatbubbleOutline,
  checkmarkOutline,
  squareOutline,
  peopleCircleOutline,
  clipboardOutline,
  checkmarkCircle
} from 'ionicons/icons';

import { ProyectoService } from '../../../core/services/proyecto.service';
import { AsignacionService } from '../../../core/services/asignacion.service';
import { EvaluacionService } from '../../../core/services/evaluacion.service';
import { ReporteService } from '../../../core/services/reporte.service';
import { AuthService } from '../../../core/services/auth.service';
import { UsuarioService } from '../../../core/services/usuario.service';
import { ConcursoService } from '../../../core/services/concurso.service';
import { SeleccionarProyectoModalComponent } from '../../../shared/components/seleccionar-proyecto-modal/seleccionar-proyecto-modal.component';
import { SeleccionarEvaluadorModalComponent } from '../../../shared/components/seleccionar-evaluador-modal/seleccionar-evaluador-modal.component';

@Component({
  selector: 'app-asignaciones',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    IonHeader,
    IonToolbar,
    IonButtons,
    IonMenuButton,
    IonTitle,
    IonContent,
    IonCard,
    IonCardHeader,
    IonCardTitle,
    IonCardSubtitle,
    IonCardContent,
    IonButton,
    IonIcon,
    IonChip,
    IonDatetime,
    IonModal,
    IonLabel,
    IonSkeletonText,
    IonSearchbar,
    IonSelect,
    IonSelectOption,
    IonSpinner,
    SeleccionarProyectoModalComponent,
    SeleccionarEvaluadorModalComponent
  ],
  templateUrl: './asignaciones.page.html',
  styleUrls: ['./asignaciones.page.scss']
})
export class AsignacionesPage implements OnInit {

  // DATOS PRINCIPALES
  proyectos: any[] = [];
  evaluadores: any[] = [];
  concursos: any[] = [];

  asignacionesTodas: any[] = [];
  asignacionesRecientes: any[] = [];
  asignacionesCount: number = 0;

  // SELECCIÓN MÚLTIPLE
  proyectosSeleccionados: number[] = [];
  evaluadoresSeleccionados: number[] = [];

  // Modo de selección: 'individual' o 'masiva'
  modoSeleccion: 'individual' | 'masiva' = 'individual';

  // Proyecto individual (modo individual)
  proyectoId: number | null = null;
  // Evaluador individual (modo individual)
  evaluadorId: number | null = null;

  // Filtros para selección masiva
  filtroConcursoMasivo: number | null = null;
  filtroBusquedaProyectosMasivo: string = '';
  filtroBusquedaEvaluadoresMasivo: string = '';

  // Fecha límite (compartida)
  fechaLimite: string | null = null;

  // ESTADO DE CARGA
  cargando: boolean = false;
  submitting: boolean = false;
  cargandoAsignacionesProyecto: boolean = false;

  // ROL
  esAdmin: boolean = false;

  // CONTROL DE MODALES DE SELECCIÓN
  modalProyectoAbierto = false;
  modalEvaluadorAbierto = false;
  modalSeleccionMasivaAbierto = false;

  // CALENDARIO
  calendarModalOpen = false;
  fechaLimiteTemp: string | null = null;
  today: string = new Date().toISOString();

  // MODAL "VER TODAS"
  modalTodasAbierto = false;
  busquedaTodas = '';
  filtroEstadoTodas: string = 'todos';
  paginaActualTodas = 1;
  itemsPorPaginaTodas = 15;

  // MODAL DE RESPUESTAS
  modalRespuestasAbierto = false;
  cargandoRespuestas = false;
  errorRespuestas: string | null = null;
  respuestasDetalle: any = null;

  // ==========================================================
  // GETTERS
  // ==========================================================
  get proyectoSeleccionado(): any {
    if (!this.proyectoId) return null;
    return this.proyectos.find(p => p.id === this.proyectoId) || null;
  }

  get evaluadorSeleccionado(): any {
    if (!this.evaluadorId) return null;
    return this.evaluadores.find(e => e.id === this.evaluadorId) || null;
  }

  get asignacionesDelProyecto(): any[] {
    if (!this.proyectoId) return [];
    return this.asignacionesTodas.filter(a => this.obtenerProyectoIdDeAsignacion(a) === this.proyectoId);
  }

  get proyectosFiltradosMasivos(): any[] {
    let resultado = [...this.proyectos];

    if (this.filtroConcursoMasivo) {
      resultado = resultado.filter(p => Number(p.concursoId) === Number(this.filtroConcursoMasivo));
    }

    if (this.filtroBusquedaProyectosMasivo.trim()) {
      const term = this.filtroBusquedaProyectosMasivo.toLowerCase().trim();
      resultado = resultado.filter(p =>
        (p.nombre || '').toLowerCase().includes(term) ||
        (p.area || '').toLowerCase().includes(term)
      );
    }

    return resultado;
  }

  get evaluadoresFiltradosMasivos(): any[] {
    let resultado = [...this.evaluadores];

    if (this.filtroBusquedaEvaluadoresMasivo.trim()) {
      const term = this.filtroBusquedaEvaluadoresMasivo.toLowerCase().trim();
      resultado = resultado.filter(e =>
        (e.nombre || '').toLowerCase().includes(term) ||
        (e.especialidad || e.rol || '').toLowerCase().includes(term)
      );
    }

    return resultado;
  }

  get proyectosSeleccionadosCount(): number {
    return this.proyectosSeleccionados.length;
  }

  get evaluadoresSeleccionadosCount(): number {
    return this.evaluadoresSeleccionados.length;
  }

  get puedeAsignarMasivo(): boolean {
    return this.proyectosSeleccionados.length > 0 && this.evaluadoresSeleccionados.length > 0;
  }

  get asignacionesFiltradas(): any[] {
    let resultado = [...this.asignacionesTodas];

    resultado.sort((a, b) => {
      const fechaA = new Date(this.obtenerFechaDeAsignacion(a) || 0).getTime();
      const fechaB = new Date(this.obtenerFechaDeAsignacion(b) || 0).getTime();
      return fechaB - fechaA;
    });

    if (this.filtroEstadoTodas !== 'todos') {
      resultado = resultado.filter(a => this.getStatusClass(a.estado || a.status || 'pending') === this.filtroEstadoTodas);
    }

    if (this.busquedaTodas.trim()) {
      const term = this.busquedaTodas.trim().toLowerCase();
      resultado = resultado.filter(a =>
        this.getNombreProyecto(a).toLowerCase().includes(term) ||
        this.getNombreEvaluador(a).toLowerCase().includes(term)
      );
    }

    return resultado;
  }

  get totalPaginasTodas(): number {
    return Math.max(1, Math.ceil(this.asignacionesFiltradas.length / this.itemsPorPaginaTodas));
  }

  get asignacionesPaginadas(): any[] {
    const inicio = (this.paginaActualTodas - 1) * this.itemsPorPaginaTodas;
    return this.asignacionesFiltradas.slice(inicio, inicio + this.itemsPorPaginaTodas);
  }

  // ==========================================================
  // MÉTODOS PARA EL TEMPLATE (evitan arrow functions)
  // ==========================================================
  isAllProyectosSeleccionados(): boolean {
    if (this.proyectosFiltradosMasivos.length === 0) return false;
    return this.proyectosFiltradosMasivos.every(p => this.proyectosSeleccionados.includes(p.id));
  }

  isAllEvaluadoresSeleccionados(): boolean {
    if (this.evaluadoresFiltradosMasivos.length === 0) return false;
    return this.evaluadoresFiltradosMasivos.every(e => this.evaluadoresSeleccionados.includes(e.id));
  }

  getTodosProyectosText(): string {
    return this.isAllProyectosSeleccionados() ? 'Deseleccionar todos' : 'Seleccionar todos';
  }

  getTodosEvaluadoresText(): string {
    return this.isAllEvaluadoresSeleccionados() ? 'Deseleccionar todos' : 'Seleccionar todos';
  }

  getToggleAllProyectosIcon(): string {
    return this.isAllProyectosSeleccionados() ? 'checkmark-circle' : 'square-outline';
  }

  getToggleAllEvaluadoresIcon(): string {
    return this.isAllEvaluadoresSeleccionados() ? 'checkmark-circle' : 'square-outline';
  }

  // ==========================================================
  // CONSTRUCTOR
  // ==========================================================
  constructor(
    private proyectoService: ProyectoService,
    private asignacionService: AsignacionService,
    private evaluacionService: EvaluacionService,
    private reporteService: ReporteService,
    private authService: AuthService,
    private usuarioService: UsuarioService,
    private concursoService: ConcursoService,
    private router: Router,
    private alertController: AlertController
  ) {
    addIcons({
      addOutline,
      swapHorizontalOutline,
      checkmarkCircleOutline,
      folderOutline,
      folderOpenOutline,
      peopleOutline,
      personOutline,
      calendarOutline,
      timeOutline,
      checkmarkDoneOutline,
      refreshOutline,
      arrowForwardOutline,
      personAddOutline,
      closeCircleOutline,
      alertCircleOutline,
      eyeOutline,
      informationCircleOutline,
      closeOutline,
      trashOutline,
      createOutline,
      personRemoveOutline,
      warningOutline,
      chevronForwardOutline,
      chevronBackOutline,
      chatbubbleOutline,
      checkmarkOutline,
      squareOutline,
      peopleCircleOutline,
      clipboardOutline,
      checkmarkCircle
    });

    this.esAdmin = this.authService.esAdmin();
  }

  // ==========================================================
  // LIFECYCLE
  // ==========================================================
  ngOnInit(): void {
    this.cargarDatos();
  }

  // ==========================================================
  // CARGA DE DATOS
  // ==========================================================
  cargarDatos(): void {
    this.cargando = true;
    this._proyectosListos = false;
    this._evaluadoresListos = false;
    this._asignacionesListas = false;

    this.cargarProyectos();
    this.cargarEvaluadores();
    this.cargarConcursos();
    this.cargarAsignacionesRecientes();

    clearTimeout(this._loadingSafety);
    this._loadingSafety = setTimeout(() => {
      if (this.cargando) {
        this.cargando = false;
        console.warn('Carga forzada por timeout');
      }
    }, 8000);
  }

  cargarConcursos(): void {
    this.concursoService.listar().subscribe({
      next: (res: any) => {
        this.concursos = res?.data ?? res ?? [];
      },
      error: (err: any) => {
        console.error('Error cargando concursos:', err);
        this.concursos = [];
      }
    });
  }

  cargarProyectos(): void {
    this.proyectoService.listar().subscribe({
      next: (res: any) => {
        this.proyectos = res?.data ?? res?.proyectos ?? res ?? [];
        this._proyectosListos = true;
        this.verificarCargaCompleta();
      },
      error: (err: any) => {
        console.error('Error cargando proyectos:', err);
        this.proyectos = [];
        this._proyectosListos = true;
        this.verificarCargaCompleta();
      }
    });
  }

  cargarEvaluadores(): void {
    this.usuarioService.getEvaluadores().subscribe({
      next: (res: any) => {
        if (res && res.ok && res.data) {
          this.evaluadores = res.data;
        } else {
          this.evaluadores = res ?? [];
        }
        this._evaluadoresListos = true;
        this.verificarCargaCompleta();
      },
      error: (err: any) => {
        console.error('Error cargando evaluadores:', err);
        this.evaluadores = [];
        this._evaluadoresListos = true;
        this.verificarCargaCompleta();
      }
    });
  }

  cargarAsignacionesRecientes(): void {
    this.asignacionService.listar().subscribe({
      next: (res: any) => {
        const data = res?.data ?? res ?? [];
        this.asignacionesTodas = Array.isArray(data) ? data : [];

        this.asignacionesTodas = this.asignacionesTodas.map((item: any) => {
          return {
            ...item,
            asignacionId: item.id || item.asignacion_id,
            evaluacion: item.evaluacion || null,
            estado: item.estado || item.status || 'asignado'
          };
        });

        const ordenadas = [...this.asignacionesTodas].sort((a, b) => {
          const fechaA = new Date(this.obtenerFechaDeAsignacion(a) || 0).getTime();
          const fechaB = new Date(this.obtenerFechaDeAsignacion(b) || 0).getTime();
          return fechaB - fechaA;
        });

        this.asignacionesRecientes = ordenadas.slice(0, 5);
        this.asignacionesCount = this.asignacionesTodas.length;
        this._asignacionesListas = true;
        this.verificarCargaCompleta();
      },
      error: (err: any) => {
        console.error('Error cargando asignaciones:', err);
        this.asignacionesTodas = [];
        this.asignacionesRecientes = [];
        this.asignacionesCount = 0;
        this._asignacionesListas = true;
        this.verificarCargaCompleta();
      }
    });
  }

  private _proyectosListos = false;
  private _evaluadoresListos = false;
  private _asignacionesListas = false;
  private _loadingSafety: any;

  verificarCargaCompleta(): void {
    if (this._proyectosListos && this._evaluadoresListos && this._asignacionesListas) {
      clearTimeout(this._loadingSafety);
      this.cargando = false;
    }
  }

  private obtenerProyectoIdDeAsignacion(a: any): number | null {
    const valor = a.proyecto_id ?? a.proyectoId ?? a.proyecto?.id ?? null;
    return valor != null ? Number(valor) : null;
  }

  private obtenerFechaDeAsignacion(a: any): string | null {
    return a.fecha_asignacion || a.created_at || a.fecha || null;
  }

  private obtenerEvaluacionId(a: any): number | null {
    if (a.evaluacion?.id) {
      return Number(a.evaluacion.id);
    }
    if (a.evaluacion_id) {
      return Number(a.evaluacion_id);
    }
    if (a.evaluacionId) {
      return Number(a.evaluacionId);
    }
    if (a.id && a.tipo === 'evaluacion') {
      return Number(a.id);
    }
    return null;
  }

  private obtenerAsignacionId(a: any): number | null {
    if (a.id) {
      return Number(a.id);
    }
    if (a.asignacion_id) {
      return Number(a.asignacion_id);
    }
    if (a.asignacionId) {
      return Number(a.asignacionId);
    }
    return null;
  }

  // ==========================================================
  // HELPERS DE NOMBRE
  // ==========================================================
  getNombreProyecto(a: any): string {
    if (a.evaluacion?.proyecto?.nombre) {
      return a.evaluacion.proyecto.nombre;
    }
    if (a.evaluacion?.proyecto?.titulo) {
      return a.evaluacion.proyecto.titulo;
    }
    return a.proyecto_nombre
      || a.proyectoNombre
      || a.proyecto?.nombre
      || a.proyecto?.titulo
      || a.nombre_proyecto
      || a.proyecto_titulo
      || 'Proyecto sin nombre';
  }

  getNombreEvaluador(a: any): string {
    if (a.evaluacion?.evaluador?.nombre) {
      return a.evaluacion.evaluador.nombre;
    }
    if (a.evaluacion?.evaluador?.nombre_completo) {
      return a.evaluacion.evaluador.nombre_completo;
    }
    return a.evaluador_nombre
      || a.evaluadorNombre
      || a.evaluador?.nombre
      || a.nombre_evaluador
      || a.evaluador?.nombre_completo
      || a.evaluador_nombre_completo
      || 'Evaluador sin nombre';
  }

  // ==========================================================
  // CAMBIAR MODO DE SELECCIÓN
  // ==========================================================
  cambiarModoSeleccion(modo: 'individual' | 'masiva'): void {
    this.modoSeleccion = modo;
    if (modo === 'individual') {
      this.proyectosSeleccionados = [];
      this.evaluadoresSeleccionados = [];
    } else {
      this.proyectoId = null;
      this.evaluadorId = null;
    }
  }

  // ==========================================================
  // SELECCIÓN INDIVIDUAL
  // ==========================================================
  abrirModalProyectos(): void {
    if (this.proyectos.length === 0) {
      this.cargarProyectos();
    }
    this.modalProyectoAbierto = true;
  }

  abrirModalEvaluadores(): void {
    if (this.evaluadores.length === 0) {
      this.cargarEvaluadores();
    }
    if (!this.proyectoId) {
      this.showError('Primero selecciona un proyecto');
      return;
    }
    this.modalEvaluadorAbierto = true;
  }

  onProyectoSeleccionado(proyectoId: number): void {
    this.proyectoId = proyectoId;
    this.evaluadorId = null;
  }

  onEvaluadorSeleccionado(evaluadorId: number): void {
    this.evaluadorId = evaluadorId;
  }

  // ==========================================================
  // SELECCIÓN MASIVA
  // ==========================================================
  toggleProyectoMasivo(proyectoId: number): void {
    const index = this.proyectosSeleccionados.indexOf(proyectoId);
    if (index > -1) {
      this.proyectosSeleccionados.splice(index, 1);
    } else {
      this.proyectosSeleccionados.push(proyectoId);
    }
  }

  toggleEvaluadorMasivo(evaluadorId: number): void {
    const index = this.evaluadoresSeleccionados.indexOf(evaluadorId);
    if (index > -1) {
      this.evaluadoresSeleccionados.splice(index, 1);
    } else {
      this.evaluadoresSeleccionados.push(evaluadorId);
    }
  }

  estaProyectoSeleccionado(proyectoId: number): boolean {
    return this.proyectosSeleccionados.includes(proyectoId);
  }

  estaEvaluadorSeleccionado(evaluadorId: number): boolean {
    return this.evaluadoresSeleccionados.includes(evaluadorId);
  }

  toggleAllProyectosMasivos(): void {
    const filtrados = this.proyectosFiltradosMasivos;
    const idsFiltrados = filtrados.map(p => p.id);
    const todosSeleccionados = idsFiltrados.every(id => this.proyectosSeleccionados.includes(id));

    if (todosSeleccionados) {
      idsFiltrados.forEach(id => {
        const index = this.proyectosSeleccionados.indexOf(id);
        if (index > -1) {
          this.proyectosSeleccionados.splice(index, 1);
        }
      });
    } else {
      idsFiltrados.forEach(id => {
        if (!this.proyectosSeleccionados.includes(id)) {
          this.proyectosSeleccionados.push(id);
        }
      });
    }
  }

  toggleAllEvaluadoresMasivos(): void {
    const filtrados = this.evaluadoresFiltradosMasivos;
    const idsFiltrados = filtrados.map(e => e.id);
    const todosSeleccionados = idsFiltrados.every(id => this.evaluadoresSeleccionados.includes(id));

    if (todosSeleccionados) {
      idsFiltrados.forEach(id => {
        const index = this.evaluadoresSeleccionados.indexOf(id);
        if (index > -1) {
          this.evaluadoresSeleccionados.splice(index, 1);
        }
      });
    } else {
      idsFiltrados.forEach(id => {
        if (!this.evaluadoresSeleccionados.includes(id)) {
          this.evaluadoresSeleccionados.push(id);
        }
      });
    }
  }

  // ==========================================================
  // ABRIR MODAL DE SELECCIÓN MASIVA
  // ==========================================================
  abrirModalSeleccionMasiva(): void {
    this.modalSeleccionMasivaAbierto = true;
  }

  cerrarModalSeleccionMasiva(): void {
    this.modalSeleccionMasivaAbierto = false;
  }

  // ==========================================================
  // GUARDAR ASIGNACIÓN (INDIVIDUAL)
  // ==========================================================
  guardarIndividual(): void {
    if (!this.proyectoId) {
      this.showError('Por favor, selecciona un proyecto');
      return;
    }

    if (!this.evaluadorId) {
      this.showError('Por favor, selecciona un evaluador');
      return;
    }

    const evaluador = this.evaluadores.find(e => e.id === this.evaluadorId);
    if (!evaluador) {
      this.showError('El evaluador seleccionado no es válido');
      return;
    }

    const proyecto = this.proyectos.find(p => p.id === this.proyectoId);
    if (!proyecto) {
      this.showError('El proyecto seleccionado no es válido');
      return;
    }

    const yaAsignado = this.asignacionesDelProyecto.some(a => {
      const evalId = a.evaluador_id ?? a.evaluadorId ?? a.evaluador?.id;
      return Number(evalId) === Number(this.evaluadorId);
    });

    if (yaAsignado) {
      if (!confirm(`${evaluador.nombre} ya está asignado a este proyecto. ¿Deseas asignarlo de nuevo de todas formas?`)) {
        return;
      }
    }

    this.submitting = true;

    const payload = {
      proyectoId: this.proyectoId,
      evaluadorId: this.evaluadorId
    };

    this.asignacionService.asignar(payload).subscribe({
      next: () => {
        this.submitting = false;
        this.showSuccess('Proyecto asignado correctamente al evaluador');
        this.resetForm();
        setTimeout(() => this.cargarDatos(), 500);
      },
      error: (err: any) => {
        this.submitting = false;
        console.error('Error asignando:', err);
        this.showError(err.error?.mensaje || 'Error al asignar el proyecto');
      }
    });
  }

  // ==========================================================
  // GUARDAR ASIGNACIÓN (MASIVA)
  // ==========================================================
  guardarMasivo(): void {
    if (this.proyectosSeleccionados.length === 0) {
      this.showError('Selecciona al menos un proyecto');
      return;
    }

    if (this.evaluadoresSeleccionados.length === 0) {
      this.showError('Selecciona al menos un evaluador');
      return;
    }

    const totalAsignaciones = this.proyectosSeleccionados.length * this.evaluadoresSeleccionados.length;
    const mensaje = `Se van a crear ${totalAsignaciones} asignaciones (${this.proyectosSeleccionados.length} proyectos × ${this.evaluadoresSeleccionados.length} evaluadores). ¿Continuar?`;

    if (!confirm(mensaje)) {
      return;
    }

    this.submitting = true;

    const payload = {
      proyectosIds: this.proyectosSeleccionados,
      evaluadoresIds: this.evaluadoresSeleccionados,
      fechaLimite: this.fechaLimite || null
    };

    this.asignacionService.asignarMasivo(payload).subscribe({
      next: (res: any) => {
        this.submitting = false;
        const asignadas = res?.data?.asignadas || res?.asignadas || 0;
        this.showSuccess(`${asignadas} asignaciones creadas correctamente`);
        this.resetFormMasivo();
        setTimeout(() => this.cargarDatos(), 500);
      },
      error: (err: any) => {
        this.submitting = false;
        console.error('Error asignación masiva:', err);
        this.showError(err.error?.mensaje || 'Error al realizar las asignaciones');
      }
    });
  }

  // ==========================================================
  // RESET DE FORMULARIOS
  // ==========================================================
  resetForm(): void {
    this.proyectoId = null;
    this.evaluadorId = null;
    this.fechaLimite = null;
  }

  resetFormMasivo(): void {
    this.proyectosSeleccionados = [];
    this.evaluadoresSeleccionados = [];
    this.fechaLimite = null;
  }

  // ==========================================================
  // CALENDARIO
  // ==========================================================
  abrirCalendarioModal(): void {
    this.fechaLimiteTemp = this.fechaLimite;
    this.calendarModalOpen = true;
  }

  confirmarFecha(): void {
    this.fechaLimite = this.fechaLimiteTemp;
    this.calendarModalOpen = false;
  }

  cancelarFecha(): void {
    this.calendarModalOpen = false;
  }

  // ==========================================================
  // MODAL "VER TODAS"
  // ==========================================================
  abrirModalTodas(): void {
    this.busquedaTodas = '';
    this.filtroEstadoTodas = 'todos';
    this.paginaActualTodas = 1;
    this.modalTodasAbierto = true;
  }

  cerrarModalTodas(): void {
    this.modalTodasAbierto = false;
  }

  cambiarPaginaTodas(delta: number): void {
    const nueva = this.paginaActualTodas + delta;
    if (nueva >= 1 && nueva <= this.totalPaginasTodas) {
      this.paginaActualTodas = nueva;
    }
  }

  onFiltroChangeTodas(): void {
    this.paginaActualTodas = 1;
  }

  // ==========================================================
  // QUITAR ASIGNACIÓN
  // ==========================================================
  async quitarAsignacion(a: any): Promise<void> {
    const asignacionId = this.obtenerAsignacionId(a);
    const evaluacionId = this.obtenerEvaluacionId(a);
    const proyectoId = a.proyecto_id || a.proyectoId || a.proyecto?.id || null;
    const evaluadorId = a.evaluador_id || a.evaluadorId || a.evaluador?.id || null;

    if (!asignacionId && proyectoId && evaluadorId) {
      this.asignacionService.listarConFiltros({
        proyecto_id: proyectoId,
        evaluador_id: evaluadorId
      }).subscribe({
        next: (res: any) => {
          const data = res?.data ?? res ?? [];
          if (Array.isArray(data) && data.length > 0) {
            const asignacion = data[0];
            this.confirmarYEliminarAsignacion(
              asignacion.id,
              evaluacionId,
              proyectoId,
              evaluadorId,
              a
            );
          } else {
            this.showError('No se encontró la asignación');
          }
        },
        error: (err: any) => {
          console.error('Error buscando asignación:', err);
          this.showError('Error al buscar la asignación');
        }
      });
      return;
    }

    this.confirmarYEliminarAsignacion(asignacionId, evaluacionId, proyectoId, evaluadorId, a);
  }

  private async confirmarYEliminarAsignacion(
    asignacionId: number | null,
    evaluacionId: number | null,
    proyectoId: number | null,
    evaluadorId: number | null,
    asignacion: any
  ): Promise<void> {
    const nombreEvaluador = this.getNombreEvaluador(asignacion);
    const nombreProyecto = this.getNombreProyecto(asignacion);

    const yaEvaluado = asignacion.estado === 'evaluado'
      || asignacion.status === 'evaluado'
      || asignacion.status === 'completed'
      || asignacion.evaluacion?.estado === 'evaluado';

    const alert = await this.alertController.create({
      header: yaEvaluado ? 'Eliminar asignación evaluada' : 'Eliminar asignación',
      subHeader: `Proyecto: ${nombreProyecto}`,
      message: yaEvaluado
        ? `El evaluador <strong>"${nombreEvaluador}"</strong> ya evaluó este proyecto.<br><br>Eliminar esta asignación <strong>BORRARÁ</strong> también la evaluación y sus respuestas. Continuar?`
        : `Eliminar la asignación de <strong>"${nombreEvaluador}"</strong> para el proyecto "${nombreProyecto}"?`,
      buttons: [
        { text: 'Cancelar', role: 'cancel' },
        {
          text: 'Sí, eliminar todo',
          role: 'destructive',
          handler: () => {
            this.ejecutarQuitarAsignacion(asignacionId, evaluacionId, proyectoId, evaluadorId, nombreEvaluador);
          }
        }
      ]
    });

    await alert.present();
  }

  private ejecutarQuitarAsignacion(
    asignacionId: number | null,
    evaluacionId: number | null,
    proyectoId: number | null,
    evaluadorId: number | null,
    nombreEvaluador: string
  ): void {
    if (evaluacionId) {
      this.evaluacionService.eliminarEvaluacion(evaluacionId).subscribe({
        next: () => {
          console.log('Evaluacion eliminada:', evaluacionId);
          this.eliminarAsignacionDirecta(asignacionId, proyectoId, evaluadorId, nombreEvaluador);
        },
        error: (err: any) => {
          console.error('Error eliminando evaluación:', err);
          this.eliminarAsignacionDirecta(asignacionId, proyectoId, evaluadorId, nombreEvaluador);
        }
      });
    } else {
      this.eliminarAsignacionDirecta(asignacionId, proyectoId, evaluadorId, nombreEvaluador);
    }
  }

  private eliminarAsignacionDirecta(
    asignacionId: number | null,
    proyectoId: number | null,
    evaluadorId: number | null,
    nombreEvaluador: string
  ): void {
    if (asignacionId) {
      this.asignacionService.eliminar(asignacionId).subscribe({
        next: () => {
          this.showSuccess(`Asignación de "${nombreEvaluador}" eliminada correctamente`);
          this.cargarDatos();
        },
        error: (err: any) => {
          console.error('Error eliminando asignación por ID:', err);
          if (proyectoId && evaluadorId) {
            this.eliminarAsignacionPorProyectoEvaluador(proyectoId, evaluadorId, nombreEvaluador);
          } else {
            this.showError(err.error?.mensaje || 'Error al eliminar la asignación');
          }
        }
      });
    } else if (proyectoId && evaluadorId) {
      this.eliminarAsignacionPorProyectoEvaluador(proyectoId, evaluadorId, nombreEvaluador);
    } else {
      this.showError('No se encontró la asignación para eliminar');
    }
  }

  private eliminarAsignacionPorProyectoEvaluador(
    proyectoId: number,
    evaluadorId: number,
    nombreEvaluador: string
  ): void {
    this.asignacionService.listarConFiltros({
      proyecto_id: proyectoId,
      evaluador_id: evaluadorId
    }).subscribe({
      next: (res: any) => {
        const data = res?.data ?? res ?? [];
        if (Array.isArray(data) && data.length > 0) {
          const asignacion = data[0];
          this.asignacionService.eliminar(asignacion.id).subscribe({
            next: () => {
              this.showSuccess(`Asignación de "${nombreEvaluador}" eliminada correctamente`);
              this.cargarDatos();
            },
            error: (err: any) => {
              console.error('Error eliminando asignación:', err);
              this.showError(err.error?.mensaje || 'Error al eliminar la asignación');
            }
          });
        } else {
          this.showError('No se encontró la asignación para eliminar');
        }
      },
      error: (err: any) => {
        console.error('Error buscando asignación:', err);
        this.showError('Error al buscar la asignación');
      }
    });
  }

  // ==========================================================
  // VER DETALLE - ABRE MODAL CON RESPUESTAS
  // ==========================================================
  verDetalleAsignacion(asignacion: any): void {
    const evaluacionId = this.obtenerEvaluacionId(asignacion);
    if (!evaluacionId) {
      this.showError('No se encontró una evaluación asociada a esta asignación');
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

        if (!data.detalles || !Array.isArray(data.detalles) || data.detalles.length === 0) {
          this.errorRespuestas = 'Esta evaluación no tiene respuestas registradas';
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
          proyectoNombre: data.proyectoNombre || 'Proyecto sin nombre',
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
      error: (err: any) => {
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

  // ==========================================================
  // REABRIR EVALUACIÓN
  // ==========================================================
  async reabrirEvaluacion(asignacion: any): Promise<void> {
    const evaluacionId = this.obtenerEvaluacionId(asignacion);
    if (!evaluacionId) {
      this.showError('No se encontró una evaluación asociada a esta asignación');
      return;
    }

    const nombreProyecto = this.getNombreProyecto(asignacion);

    const alert = await this.alertController.create({
      header: 'Reabrir evaluación',
      message: `Reabrir la evaluación del proyecto "<strong>${nombreProyecto}</strong>"? El evaluador podrá modificarla nuevamente.`,
      buttons: [
        { text: 'Cancelar', role: 'cancel' },
        {
          text: 'Reabrir',
          handler: () => {
            this.ejecutarReabrirEvaluacion(evaluacionId, nombreProyecto);
          }
        }
      ]
    });

    await alert.present();
  }

  private ejecutarReabrirEvaluacion(evaluacionId: number, nombreProyecto: string): void {
    this.evaluacionService.reabrirEvaluacion(evaluacionId).subscribe({
      next: () => {
        this.showSuccess(`Evaluación de "${nombreProyecto}" reabierta correctamente`);
        this.cargarDatos();
      },
      error: (err: any) => {
        console.error('Error reabriendo:', err);
        this.showError(err.error?.mensaje || 'Error al reabrir la evaluación');
      }
    });
  }

  // ==========================================================
  // EDITAR EVALUACIÓN ADMIN
  // ==========================================================
  editarEvaluacionAdmin(asignacion: any): void {
    const evaluacionId = this.obtenerEvaluacionId(asignacion);
    if (!evaluacionId) {
      this.showError('No se encontró una evaluación asociada a esta asignación');
      return;
    }
    this.router.navigate(['/admin/evaluaciones/formulario', evaluacionId]);
  }

  // ==========================================================
  // ELIMINAR EVALUACIÓN
  // ==========================================================
  async eliminarEvaluacion(asignacion: any): Promise<void> {
    const evaluacionId = this.obtenerEvaluacionId(asignacion);
    if (!evaluacionId) {
      this.showError('No se encontró una evaluación asociada a esta asignación');
      return;
    }

    const nombreProyecto = this.getNombreProyecto(asignacion);

    const alert = await this.alertController.create({
      header: 'Eliminar evaluación',
      message: `Eliminar la evaluación del proyecto "<strong>${nombreProyecto}</strong>"? Esta acción no se puede deshacer.`,
      buttons: [
        { text: 'Cancelar', role: 'cancel' },
        {
          text: 'Eliminar',
          role: 'destructive',
          handler: () => {
            this.ejecutarEliminarEvaluacion(evaluacionId, nombreProyecto);
          }
        }
      ]
    });

    await alert.present();
  }

  private ejecutarEliminarEvaluacion(evaluacionId: number, nombreProyecto: string): void {
    this.evaluacionService.eliminarEvaluacion(evaluacionId).subscribe({
      next: () => {
        this.showSuccess(`Evaluación de "${nombreProyecto}" eliminada correctamente`);
        this.cargarDatos();
      },
      error: (err: any) => {
        console.error('Error eliminando:', err);
        this.showError(err.error?.mensaje || 'Error al eliminar la evaluación');
      }
    });
  }

  // ==========================================================
  // UTILIDADES
  // ==========================================================
  tiempoRelativo(fecha: string | Date | null | undefined): string {
    if (!fecha) return '';
    const ahora = new Date().getTime();
    const entonces = new Date(fecha).getTime();
    if (isNaN(entonces)) return '';

    const diffMs = ahora - entonces;
    const diffMin = Math.floor(diffMs / 60000);
    const diffHrs = Math.floor(diffMin / 60);
    const diffDias = Math.floor(diffHrs / 24);

    if (diffMin < 1) return 'Justo ahora';
    if (diffMin < 60) return `Hace ${diffMin} min`;
    if (diffHrs < 24) return `Hace ${diffHrs}h`;
    if (diffDias < 7) return `Hace ${diffDias}d`;
    return new Date(fecha).toLocaleDateString('es-EC', { day: '2-digit', month: 'short' });
  }

  getStatusIcon(status: string): string {
    const icons: Record<string, string> = {
      'pending': 'time-outline',
      'pendiente': 'time-outline',
      'asignado': 'time-outline',
      'in-progress': 'refresh-outline',
      'en_progreso': 'refresh-outline',
      'completed': 'checkmark-circle-outline',
      'completado': 'checkmark-circle-outline',
      'rejected': 'close-circle-outline',
      'rechazado': 'close-circle-outline',
      'evaluado': 'checkmark-circle-outline'
    };
    return icons[status] || 'time-outline';
  }

  getStatusText(status: string): string {
    const texts: Record<string, string> = {
      'pending': 'Pendiente',
      'pendiente': 'Pendiente',
      'asignado': 'Asignado',
      'in-progress': 'En progreso',
      'en_progreso': 'En progreso',
      'completed': 'Completado',
      'completado': 'Completado',
      'rejected': 'Rechazado',
      'rechazado': 'Rechazado',
      'evaluado': 'Evaluado'
    };
    return texts[status] || 'Pendiente';
  }

  getStatusClass(status: string): string {
    const classes: Record<string, string> = {
      'pending': 'status-pending',
      'pendiente': 'status-pending',
      'asignado': 'status-pending',
      'in-progress': 'status-progress',
      'en_progreso': 'status-progress',
      'completed': 'status-completed',
      'completado': 'status-completed',
      'evaluado': 'status-completed',
      'rejected': 'status-rejected',
      'rechazado': 'status-rejected'
    };
    return classes[status] || 'status-pending';
  }

  // ==========================================================
  // ALERTAS
  // ==========================================================
  private async showSuccess(message: string): Promise<void> {
    const alert = await this.alertController.create({
      header: 'Exito',
      message: message,
      buttons: ['OK'],
      cssClass: 'alert-success'
    });
    await alert.present();
  }

  private async showError(message: string): Promise<void> {
    const alert = await this.alertController.create({
      header: 'Error',
      message: message,
      buttons: ['OK'],
      cssClass: 'alert-error'
    });
    await alert.present();
  }

  // ==========================================================
// MÉTODOS PARA EL MODO MASIVO - OBTENER NOMBRES POR ID
// ==========================================================
  getNombreProyectoPorId(proyectoId: number): string {
    const proyecto = this.proyectos.find(p => p.id === proyectoId);
    return proyecto?.nombre || 'Proyecto sin nombre';
  }

  getNombreEvaluadorPorId(evaluadorId: number): string {
    const evaluador = this.evaluadores.find(e => e.id === evaluadorId);
    return evaluador?.nombre || 'Evaluador sin nombre';
  }
}