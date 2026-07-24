import { Component, Input, Output, EventEmitter, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import {
  IonModal,
  IonHeader,
  IonToolbar,
  IonTitle,
  IonButtons,
  IonButton,
  IonIcon,
  IonContent,
  IonSearchbar,
  IonSelect,
  IonSelectOption,
  IonItem,
  IonLabel,
  IonChip,
  IonBadge,
  IonAvatar,
  IonSpinner,
  IonSkeletonText,
  IonAlert
} from '@ionic/angular/standalone';
import { AlertController } from '@ionic/angular';
import { addIcons } from 'ionicons';
import {
  closeOutline,
  searchOutline,
  trophyOutline,
  folderOpenOutline,
  peopleOutline,
  personAddOutline,
  personRemoveOutline,
  checkmarkCircleOutline,
  timeOutline,
  alertCircleOutline,
  informationCircleOutline,
  refreshOutline,
  eyeOutline,
  createOutline,
  trashOutline,
  checkmarkDoneOutline,
  closeCircleOutline,
  personOutline
} from 'ionicons/icons';

import { ProyectoService } from '../../../core/services/proyecto.service';
import { AsignacionService } from '../../../core/services/asignacion.service';
import { EvaluacionService } from '../../../core/services/evaluacion.service';
import { ConcursoService } from '../../../core/services/concurso.service';
import { UsuarioService } from '../../../core/services/usuario.service';

@Component({
  selector: 'app-asignacion-modal',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    IonModal,
    IonHeader,
    IonToolbar,
    IonTitle,
    IonButtons,
    IonButton,
    IonIcon,
    IonContent,
    IonSearchbar,
    IonSelect,
    IonSelectOption,
    IonItem,
    IonLabel,
    IonChip,
    IonBadge,
    IonAvatar,
    IonSpinner,
    IonSkeletonText,
    IonAlert
  ],
  templateUrl: './asignacion-modal.component.html',
  styleUrls: ['./asignacion-modal.component.scss']
})
export class AsignacionModalComponent implements OnInit {

  @Input() isOpen = false;
  @Output() isOpenChange = new EventEmitter<boolean>();
  @Output() asignacionCreada = new EventEmitter<any>();

  // ============================================
  // ESTADO
  // ============================================
  cargando = false;
  cargandoProyectos = false;
  cargandoEvaluadores = false;
  cargandoAsignaciones = false;
  submitting = false;

  // ============================================
  // DATOS
  // ============================================
  proyectos: any[] = [];
  proyectosFiltrados: any[] = [];
  evaluadores: any[] = [];
  concursos: any[] = [];
  asignacionesTodas: any[] = [];

  // ============================================
  // FILTROS
  // ============================================
  filtroBusqueda = '';
  filtroConcursoId: number | null = null;

  // ============================================
  // SELECCIÓN
  // ============================================
  proyectoSeleccionadoId: number | null = null;
  evaluadorSeleccionadoId: number | null = null;

  // ============================================
  // GETTERS
  // ============================================
  get proyectoSeleccionado(): any {
    if (!this.proyectoSeleccionadoId) return null;
    return this.proyectos.find(p => p.id === this.proyectoSeleccionadoId) || null;
  }

  get asignacionesDelProyecto(): any[] {
    if (!this.proyectoSeleccionadoId) return [];
    return this.asignacionesTodas.filter(a => {
      const proyectoId = a.proyecto_id ?? a.proyectoId ?? a.proyecto?.id;
      return Number(proyectoId) === Number(this.proyectoSeleccionadoId);
    });
  }

  get totalAsignaciones(): number {
    return this.asignacionesTodas.length;
  }

  get concursoActual(): any {
    if (!this.filtroConcursoId) return null;
    return this.concursos.find(c => c.id === this.filtroConcursoId) || null;
  }

  // ============================================
  // CONSTRUCTOR
  // ============================================
  constructor(
    private proyectoService: ProyectoService,
    private asignacionService: AsignacionService,
    private evaluacionService: EvaluacionService,
    private concursoService: ConcursoService,
    private usuarioService: UsuarioService,
    private alertController: AlertController
  ) {
    addIcons({
      closeOutline,
      searchOutline,
      trophyOutline,
      folderOpenOutline,
      peopleOutline,
      personAddOutline,
      personRemoveOutline,
      checkmarkCircleOutline,
      timeOutline,
      alertCircleOutline,
      informationCircleOutline,
      refreshOutline,
      eyeOutline,
      createOutline,
      trashOutline,
      checkmarkDoneOutline,
      closeCircleOutline,
      personOutline
    });
  }

  // ============================================
  // LIFECYCLE
  // ============================================
  ngOnInit(): void {
    this.cargarDatosIniciales();
  }

  // ============================================
  // CARGA DE DATOS
  // ============================================
  cargarDatosIniciales(): void {
    this.cargando = true;
    this.cargarConcursos();
    this.cargarProyectos();
    this.cargarEvaluadores();
    this.cargarAsignaciones();
  }

  cargarConcursos(): void {
    this.concursoService.listar().subscribe({
      next: (res: any) => {
        this.concursos = res?.data ?? res ?? [];
        console.log('✅ Concursos cargados:', this.concursos.length);
      },
      error: (err) => {
        console.error('❌ Error cargando concursos:', err);
        this.concursos = [];
      }
    });
  }

  cargarProyectos(): void {
    this.cargandoProyectos = true;
    this.proyectoService.listar().subscribe({
      next: (res: any) => {
        this.proyectos = res?.data ?? res?.proyectos ?? res ?? [];
        this.aplicarFiltros();
        this.cargandoProyectos = false;
        console.log('✅ Proyectos cargados:', this.proyectos.length);
      },
      error: (err) => {
        console.error('❌ Error cargando proyectos:', err);
        this.proyectos = [];
        this.proyectosFiltrados = [];
        this.cargandoProyectos = false;
      }
    });
  }

  cargarEvaluadores(): void {
    this.cargandoEvaluadores = true;
    this.usuarioService.getEvaluadores().subscribe({
      next: (res: any) => {
        if (res && res.ok && res.data) {
          this.evaluadores = res.data;
        } else {
          this.evaluadores = res ?? [];
        }
        this.cargandoEvaluadores = false;
        console.log('✅ Evaluadores cargados:', this.evaluadores.length);
      },
      error: (err) => {
        console.error('❌ Error cargando evaluadores:', err);
        this.evaluadores = [];
        this.cargandoEvaluadores = false;
      }
    });
  }

  cargarAsignaciones(): void {
    this.cargandoAsignaciones = true;
    this.asignacionService.listar().subscribe({
      next: (res: any) => {
        this.asignacionesTodas = res?.data ?? res ?? [];
        this.cargandoAsignaciones = false;
        console.log('✅ Asignaciones cargadas:', this.asignacionesTodas.length);
      },
      error: (err) => {
        console.error('❌ Error cargando asignaciones:', err);
        this.asignacionesTodas = [];
        this.cargandoAsignaciones = false;
      }
    });
  }

  recargarDatos(): void {
    this.cargarProyectos();
    this.cargarEvaluadores();
    this.cargarAsignaciones();
  }

  // ============================================
  // FILTROS
  // ============================================
  aplicarFiltros(): void {
    let filtrados = [...this.proyectos];

    if (this.filtroConcursoId) {
      filtrados = filtrados.filter(p => Number(p.concurso_id) === Number(this.filtroConcursoId));
    }

    if (this.filtroBusqueda.trim()) {
      const busqueda = this.filtroBusqueda.toLowerCase().trim();
      filtrados = filtrados.filter(p => {
        const nombre = (p.nombre || '').toLowerCase();
        const area = (p.area || '').toLowerCase();
        const nivel = (p.nivel || '').toLowerCase();
        return nombre.includes(busqueda) || area.includes(busqueda) || nivel.includes(busqueda);
      });
    }

    this.proyectosFiltrados = filtrados;
  }

  limpiarFiltros(): void {
    this.filtroBusqueda = '';
    this.filtroConcursoId = null;
    this.aplicarFiltros();
  }

  // ============================================
  // SELECCIÓN
  // ============================================
  seleccionarProyecto(proyectoId: number): void {
    this.proyectoSeleccionadoId = proyectoId;
    this.evaluadorSeleccionadoId = null;
  }

  // ============================================
  // ASIGNAR PROYECTO
  // ============================================
  async asignarProyecto(): Promise<void> {
    if (!this.proyectoSeleccionadoId) {
      this.showError('Por favor, selecciona un proyecto');
      return;
    }

    if (!this.evaluadorSeleccionadoId) {
      this.showError('Por favor, selecciona un evaluador');
      return;
    }

    const proyecto = this.proyectos.find(p => p.id === this.proyectoSeleccionadoId);
    const evaluador = this.evaluadores.find(e => e.id === this.evaluadorSeleccionadoId);

    if (!proyecto || !evaluador) {
      this.showError('Datos inválidos');
      return;
    }

    // Verificar si ya está asignado
    const yaAsignado = this.asignacionesDelProyecto.some(a => {
      const evalId = a.evaluador_id ?? a.evaluadorId ?? a.evaluador?.id;
      return Number(evalId) === Number(this.evaluadorSeleccionadoId);
    });

    if (yaAsignado) {
      const confirm = await this.alertController.create({
        header: '⚠️ Ya asignado',
        message: `<strong>${evaluador.nombre}</strong> ya está asignado a este proyecto.<br><br>¿Deseas asignarlo de nuevo de todas formas?`,
        buttons: [
          { text: 'Cancelar', role: 'cancel' },
          { text: 'Asignar de nuevo', handler: () => this.ejecutarAsignacion() }
        ]
      });
      await confirm.present();
      return;
    }

    this.ejecutarAsignacion();
  }

  private ejecutarAsignacion(): void {
    this.submitting = true;

    const payload = {
      proyectoId: this.proyectoSeleccionadoId,
      evaluadorId: this.evaluadorSeleccionadoId
    };

    this.asignacionService.asignar(payload).subscribe({
      next: (res) => {
        this.submitting = false;
        this.showSuccess('Proyecto asignado correctamente');
        this.asignacionCreada.emit(res);
        this.cargarAsignaciones();
        this.evaluadorSeleccionadoId = null;
      },
      error: (err) => {
        this.submitting = false;
        console.error('❌ Error asignando:', err);

        let mensaje = err.error?.mensaje || err.error?.error || 'Error al asignar el proyecto';

        if (mensaje.includes('rúbrica') || mensaje.includes('rubrica')) {
          mensaje = 'El proyecto no tiene una rúbrica asociada. Crea una rúbrica primero.';
        } else if (mensaje.includes('secciones')) {
          mensaje = 'La rúbrica no tiene secciones configuradas. Ve a Rúbricas y configura el contenido.';
        }

        this.showError(mensaje);
      }
    });
  }

  // ============================================
  // QUITAR ASIGNACIÓN
  // ============================================
  async quitarAsignacion(asignacion: any): Promise<void> {
    const evaluacionId = asignacion.id || asignacion.evaluacion_id;
    if (!evaluacionId) {
      this.showError('No se encontró el ID de esta asignación');
      return;
    }

    const nombreEvaluador = asignacion.evaluador_nombre || asignacion.evaluador?.nombre || 'este evaluador';
    const nombreProyecto = asignacion.proyecto_nombre || asignacion.proyecto?.nombre || 'este proyecto';

    const yaEvaluado = asignacion.status === 'completed' || asignacion.status === 'completado'
      || asignacion.estado === 'evaluado' || asignacion.yaEvaluado === true;

    const alert = await this.alertController.create({
      header: yaEvaluado ? '⚠️ Eliminar evaluación' : 'Quitar asignación',
      subHeader: `Proyecto: ${nombreProyecto}`,
      message: yaEvaluado
        ? `El evaluador <strong>"${nombreEvaluador}"</strong> YA REGISTRÓ una evaluación.<br><br>Quitar esto <strong>BORRARÁ</strong> sus respuestas guardadas. ¿Continuar?`
        : `¿Quitar la asignación de <strong>"${nombreEvaluador}"</strong> para el proyecto "${nombreProyecto}"?<br><br>Esta asignación no tiene evaluación registrada, es seguro quitarla.`,
      buttons: [
        { text: 'Cancelar', role: 'cancel' },
        {
          text: yaEvaluado ? 'Sí, eliminar todo' : 'Sí, quitar',
          role: 'destructive',
          handler: () => this.ejecutarQuitarAsignacion(evaluacionId, nombreEvaluador)
        }
      ],
      cssClass: yaEvaluado ? 'alert-danger' : 'alert-warning'
    });

    await alert.present();
  }

  private ejecutarQuitarAsignacion(evaluacionId: number, nombreEvaluador: string): void {
    this.evaluacionService.eliminarEvaluacion(evaluacionId).subscribe({
      next: () => {
        this.showSuccess(`Asignación de "${nombreEvaluador}" eliminada`);
        this.cargarAsignaciones();
      },
      error: (err) => {
        console.error('❌ Error quitando asignación:', err);
        this.showError(err.error?.mensaje || 'Error al quitar la asignación');
      }
    });
  }

  // ============================================
  // UTILIDADES
  // ============================================
  getStatusIcon(status: string): string {
    const icons: Record<string, string> = {
      'pending': 'time-outline',
      'pendiente': 'time-outline',
      'asignado': 'time-outline',
      'in-progress': 'refresh-outline',
      'en_progreso': 'refresh-outline',
      'completed': 'checkmark-circle-outline',
      'completado': 'checkmark-circle-outline',
      'evaluado': 'checkmark-circle-outline',
      'rejected': 'close-circle-outline',
      'rechazado': 'close-circle-outline'
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
      'evaluado': 'Evaluado',
      'rejected': 'Rechazado',
      'rechazado': 'Rechazado'
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

  getNombreConcurso(concursoId: number): string {
    if (!concursoId) return 'Sin concurso';
    const concurso = this.concursos.find(c => Number(c.id) === Number(concursoId));
    return concurso?.nombre || `Concurso #${concursoId}`;
  }

  // ============================================
  // ALERTAS
  // ============================================
  private async showSuccess(message: string): Promise<void> {
    const alert = await this.alertController.create({
      header: '✅ Éxito',
      message: message,
      buttons: ['OK'],
      cssClass: 'alert-success'
    });
    await alert.present();
  }

  private async showError(message: string): Promise<void> {
    const alert = await this.alertController.create({
      header: '❌ Error',
      message: message,
      buttons: ['OK'],
      cssClass: 'alert-error'
    });
    await alert.present();
  }

  // ============================================
  // CONTROL DEL MODAL
  // ============================================
  cerrarModal(): void {
    this.isOpen = false;
    this.isOpenChange.emit(false);
    this.proyectoSeleccionadoId = null;
    this.evaluadorSeleccionadoId = null;
    this.limpiarFiltros();
  }

  onDidDismiss(): void {
    this.cerrarModal();
  }
}